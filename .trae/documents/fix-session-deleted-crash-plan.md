# 修复 OpenCode Desktop 对话结束后 Server 崩溃问题

## 问题概述

OpenCode Desktop 使用本插件后，每次对话一结束，local server 就会崩溃退出。

## 根本原因

`session.deleted` 事件处理中的清理操作缺少异常保护，当这些操作失败时会触发全局 `unhandledRejection` 处理器，导致进程强制退出。

**问题链条：**
1. 对话结束触发 `session.deleted` 事件
2. event handler 执行清理操作（MCP 断开、LSP 清理、tmux 会话关闭）
3. 清理操作抛出异常（例如连接关闭失败）
4. 异常未被捕获，触发 `unhandledRejection`
5. `process-cleanup.ts` 中的全局处理器被调用
6. `scheduleForcedExit` 设置 `process.exitCode = 1` 并调用 `process.exit(1)`
7. 整个 server 进程崩溃退出

## 修复方案

采用方案一：为 `session.deleted` 清理操作添加 try-catch 保护。

## 实施步骤

### Step 1: 修改 event.ts 中 session.deleted 事件处理

**文件**: `src/plugin/event.ts`
**位置**: 第 555-561 行

**修改内容**:
将以下代码：
```typescript
await managers.skillMcpManager.disconnectSession(sessionID);
await lspManager.cleanupTempDirectoryClients();
if (tmuxIntegrationEnabled) {
  await managers.tmuxSessionManager.onSessionDeleted({
    sessionID,
  });
}
```

修改为：
```typescript
try {
  await managers.skillMcpManager.disconnectSession(sessionID);
} catch (error) {
  log("[event] skillMcpManager.disconnectSession error:", { sessionID, error });
}

try {
  await lspManager.cleanupTempDirectoryClients();
} catch (error) {
  log("[event] lspManager.cleanupTempDirectoryClients error:", { sessionID, error });
}

if (tmuxIntegrationEnabled) {
  try {
    await managers.tmuxSessionManager.onSessionDeleted({
      sessionID,
    });
  } catch (error) {
    log("[event] tmuxSessionManager.onSessionDeleted error:", { sessionID, error });
  }
}
```

### Step 2: 验证修复

1. 运行单元测试确保修改不影响现有功能
2. 检查 TypeScript 类型是否正确
3. 构建项目确保没有编译错误

### Step 3: 测试验证

1. 在 OpenCode Desktop 中启动一个对话
2. 结束对话后观察 server 进程是否还在运行
3. 检查日志文件确认清理操作是否正常执行

## 预期结果

- 对话结束后 server 进程不再崩溃
- 清理操作的错误会被记录到日志中，但不会导致进程退出
- 用户可以继续使用 OpenCode Desktop 进行新的对话

## 风险评估

- **风险等级**: 低
- **影响范围**: 仅影响 `session.deleted` 事件处理
- **回退方案**: 如果出现问题，可以快速回退到原始代码

## 相关文件

- `src/plugin/event.ts` - 主要修改文件
- `src/features/skill-mcp-manager/cleanup.ts` - disconnectSession 实现
- `src/tools/lsp/lsp-manager-temp-directory-cleanup.ts` - cleanupTempDirectoryClients 实现
- `src/features/tmux-subagent/manager.ts` - onSessionDeleted 实现
- `src/features/background-agent/process-cleanup.ts` - 全局错误处理器