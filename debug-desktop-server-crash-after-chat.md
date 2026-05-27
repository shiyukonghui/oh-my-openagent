# Debug Session: desktop-server-crash-after-chat

**Status**: [OPEN]
**Created**: 2026-05-27
**Symptom**: OpenCode Desktop 使用 oh-my-openagent 插件后，每次对话结束 local server 崩溃退出
**Reproduction Rate**: 100%

## Hypotheses

### H1: session.deleted 清理操作中的 MCP/LSP/tmux 断开抛出未捕获异常 → process.exit(1)
- Observation Point: event.ts L555-571, 各清理操作是否抛出异常
- Status: **已修复（添加 try-catch），但问题仍然存在，需进一步确认**

### H2: BackgroundManager 的 fire-and-forget 异步操作（如 notifyParentSession）中未捕获的异常
- Observation Point: manager.ts notifyParentSession, tryCompleteTask
- Status: PENDING

### H3: LSP Manager 的 `void managed.client.stop()` 在 cleanup 过程中的未处理 Promise 拒绝
- Observation Point: lsp-server.ts cleanupIdleClients, cleanupTempDirectoryClients
- Status: PENDING

### H4: 插件注册的 `uncaughtException` / `unhandledRejection` 处理器被 OpenCode 自身事件触发
- Observation Point: process-cleanup.ts registerErrorEvent
- Status: PENDING

### H5: openclaw / reply-listener 等后台进程异常导致 server 退出
- Observation Point: openclaw/*.ts 中的 process.exit 调用
- Status: PENDING
