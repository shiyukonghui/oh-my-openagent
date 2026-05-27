# OpenCode Desktop 对话结束后 Server 崩溃问题排查经验

## 症状

OpenCode Desktop 使用 oh-my-openagent 插件后，**每次对话一结束**，local server 就会崩溃退出。OpenCode Desktop UI 显示"重新连接中"，需要重启应用。

> 注意：此问题**仅出现在桌面版**（Node.js/Electron 运行时），CLI 版（Bun 运行时）不受影响。

## 排查路径

### Step 1: 静态代码分析

初步怀疑 `session.deleted` 事件处理中的 MCP/LSP/tmux 清理操作抛出未捕获异常，触发了 `process-cleanup.ts` 中的全局 `unhandledRejection` 处理器 → `process.exit(1)`。

**修复尝试**：为 [event.ts](file:///d:/Agent/oh-my-openagent/src/plugin/event.ts#L555-L571) 中三个清理操作添加 try-catch 保护。

```typescript
// ❌ 修改前：无异常保护
await managers.skillMcpManager.disconnectSession(sessionID);
await lspManager.cleanupTempDirectoryClients();

// ✅ 修改后：各自 try-catch
try {
  await managers.skillMcpManager.disconnectSession(sessionID);
} catch (error) {
  log("[event] skillMcpManager.disconnectSession error:", { sessionID, error });
}
```

**结果**：修复后仍然崩溃，说明根因不在此处。

### Step 2: 添加进程级崩溃监控（仪器化）

需要精确回答三个问题：
1. 崩溃以什么形式发生？（JS 异常？`process.exit`？外部 kill？）
2. 崩溃发生在哪个阶段？
3. 具体的错误信息是什么？

**仪器化方案**：在 `src/index.ts` 入口处添加 `process.prependListener`（确保在其他监听器之前捕获）：

```typescript
import { appendFileSync } from "node:fs"
import { tmpdir } from "node:os"

const CRASH_LOG = join(tmpdir(), "omo-crash-debug.log")
function crashLog(msg: string) {
  try { appendFileSync(CRASH_LOG, `${new Date().toISOString()} ${msg}\n`) } catch {}
}

// 用 prependListener 确保在 process-cleanup.ts 拦截之前记录
process.prependListener("uncaughtException", (error) => {
  crashLog(`UNCAUGHT_EXCEPTION name=${error?.name} message=${error?.message} ...`)
})

process.prependListener("unhandledRejection", (reason) => {
  crashLog(`UNHANDLED_REJECTION reason=${String(reason).slice(0, 600)}`)
})

process.on("exit", (code) => {
  crashLog(`PROCESS_EXIT code=${code}`)
})
```

> **关键技巧**：使用 `appendFileSync` 而非异步 `log()`，因为 `process.exit()` 可能在异步日志刷新前终止进程。使用 `prependListener` 而非 `on`，确保日志在其他 handler 之前写入。

同时在 [event.ts](file:///d:/Agent/oh-my-openagent/src/plugin/event.ts) 事件处理器入口/出口添加追踪：

```typescript
crashLog(`EVENT_START type=${input.event.type}`)
// ... 事件处理逻辑 ...
crashLog(`EVENT_END type=${input.event.type}`)
```

### Step 3: 复现并分析崩溃日志

**崩溃日志**（`%TEMP%/omo-crash-debug.log`）：

```
2026-05-27T07:34:40.299Z EVENT_START type=session.diff      ← 事件开始
2026-05-27T07:34:40.300Z EVENT_END type=session.diff        ← 事件正常结束
2026-05-27T07:34:40.319Z EVENT_END type=session.idle         ← session.idle 正常结束
2026-05-27T07:34:41.825Z UNHANDLED_REJECTION                 ← 1.5秒后崩溃！
  reason=TypeError: ctx.$ is not a function
2026-05-27T07:34:41.827Z PROCESS_EXIT code=1
```

**关键证据**：

| 时间 | 事件 | 分析 |
|------|------|------|
| `07:34:40.319` | `EVENT_END type=session.idle` | 事件处理器正常完成 |
| `07:34:41.825` | `UNHANDLED_REJECTION` | **1.506 秒后**崩溃 |
| `07:34:41.827` | `PROCESS_EXIT code=1` | 2ms 后进程退出 |

**1.5 秒的延迟**是关键的线索：正好等于 [session-notification-scheduler.ts](file:///d:/Agent/oh-my-openagent/src/hooks/session-notification-scheduler.ts#L165) 中默认的 `idleConfirmationDelay: 1500`。

### Step 4: 追踪调用链

```
session.idle 事件触发
  → session-notification.ts: scheduler.scheduleIdleNotification(sessionID)
    → setTimeout(idleConfirmationDelay = 1500ms)          ← 延迟 1.5s
      → executeNotification()                             ← 1.5s 后执行
        → sendSessionNotification(ctx, platform, title, message)
          → session-notification-sender.ts:
            ctx.$`${powershellPath} -Command ${toastScript}`  ← 💥
            TypeError: ctx.$ is not a function
```

**根因**：[session-notification-sender.ts](file:///d:/Agent/oh-my-openagent/src/hooks/session-notification-sender.ts) 使用 `ctx.$`（Bun Shell tagged template function）来执行系统通知命令。`ctx.$` 是 `PluginInput` 上的 Bun Shell 接口，在 Node.js/Electron（OpenCode Desktop 运行时）中不可用。

## 修复

在 [session-notification-sender.ts](file:///d:/Agent/oh-my-openagent/src/hooks/session-notification-sender.ts) 的两个函数入口添加 `ctx.$` 可用性检查：

```typescript
// ✅ sendSessionNotification (L57)
export async function sendSessionNotification(
  ctx: PluginInput, platform: Platform, title: string, message: string
): Promise<void> {
  if (typeof ctx.$ !== "function") return  // ← 防御检查
  switch (platform) { ... }
}

// ✅ playSessionNotificationSound (L117)
export async function playSessionNotificationSound(
  ctx: PluginInput, platform: Platform, soundPath: string
): Promise<void> {
  if (typeof ctx.$ !== "function") return  // ← 防御检查
  switch (platform) { ... }
}
```

当 `ctx.$` 不可用时，静默跳过通知发送。这意味着在 OpenCode Desktop 中不会弹出系统通知，但也不会崩溃。

## 经验教训

### 1. `setTimeout` 回调中的错误是常见的 unhandledRejection 来源

```
session.idle → setTimeout(1500ms) → callback throws → unhandledRejection
```

`setTimeout` 中的异步回调不在当前 async 函数的 try-catch 范围内，其错误会直接触发 `unhandledRejection`。

### 2. `process.exit` 会截断异步日志

本次排查中，`oh-my-opencode.log` 末尾没有任何错误日志，因为 `process-cleanup.ts` 的 `scheduleForcedExit` 在 6 秒内就调用了 `process.exit()`，而异步 `log()` 写入尚未完成。

**排查技巧**：对于崩溃类问题，应使用 `fs.appendFileSync` 同步写入崩溃日志。

### 3. `prependListener` vs `on` 的差异

`process.on('unhandledRejection', ...)` 按注册顺序调用监听器。如果 `process-cleanup.ts` 的监听器先于我们的监听器注册，它会先调用 `process.exit()`，导致我们的日志无法写入。

使用 `process.prependListener` 确保崩溃监控日志始终在其他处理器之前写入。

### 4. Bun 专用 API 在 Node.js/Electron 中的兼容性（续）

这是继 `import.meta.dir` 问题后的又一个 Bun API 兼容性问题：

| API | Bun | Node.js/Electron | 使用位置 |
|-----|-----|------------------|---------|
| `import.meta.dir` | ✅ | ❌ | `scaffold.ts` |
| `ctx.$` (Bun Shell) | ✅ | ❌ | `session-notification-sender.ts` |

> 历史文档参考：[opencode-desktop-plugin-not-loading.md](./opencode-desktop-plugin-not-loading.md)

**建议**：对所有使用 Bun 专用 API 的模块添加运行时特性检测（`typeof ctx.$ === "function"`），在不可用时优雅降级。

## 排查工具速查

| 工具 | 路径 / 命令 | 用途 |
|------|-----------|------|
| oh-my-openagent 运行时日志 | `%TEMP%/oh-my-opencode.log` | 查看插件运行时日志 |
| 崩溃追踪日志（本次新增） | `%TEMP%/omo-crash-debug.log` | 精确定位未捕获异常/unhandled rejection |
| OpenCode Desktop 日志 | `%APPDATA%/ai.opencode.desktop/logs/` | 查看桌面端插件加载错误 |
| Node.js 直接加载 | `node -e "import('file:///path/to/dist/index.js')"` | 精确定位模块加载崩溃行 |
| 进程检查 | `tasklist \| findstr OpenCode` | 验证 server 是否存活 |

## 故障时间线

| 步骤 | 做法 | 结果 |
|------|------|------|
| 1 | 假设 `session.deleted` 清理异常 → 添加 try-catch | ❌ 仍然崩溃 |
| 2 | 静态分析无法定位 → 添加 `prependListener` 仪器化 | 获得崩溃日志 |
| 3 | 分析日志发现 `TypeError: ctx.$ is not a function` + 1.5s 延迟 | 定位到 notification scheduler |
| 4 | 在 `session-notification-sender.ts` 添加 `ctx.$` 防御检查 | ✅ 修复 |
