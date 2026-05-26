# Tasks

- [x] Task 1: 创建 codesign Agent 源码目录和核心文件
  - [x] 创建 `src/agents/codesign/agent.ts` — 工厂函数 + 核心 AgentConfig
  - [x] 创建 `src/agents/codesign/default.ts` — Claude/默认提示词变体（含 identity、creativity、methodology、output-rules、workflow、safety 六大 segment）
  - [x] 创建 `src/agents/codesign/metadata.ts` — CODESIGN_PROMPT_METADATA 定义
  - [x] 创建 `src/agents/codesign/index.ts` — 桶导出（createCodesignAgent + CODESIGN_PROMPT_METADATA）

- [x] Task 2: 注册 codesign Agent 到类型系统和注册表
  - [x] 在 `src/agents/types.ts` 的 `BuiltinAgentName` 联合类型中添加 `"codesign"`
  - [x] 在 `src/agents/builtin-agents.ts` 的 `agentSources` 中注册 `codesign: createCodesignAgent`
  - [x] 在 `src/agents/builtin-agents.ts` 的 `agentMetadata` 中注册 `codesign: CODESIGN_PROMPT_METADATA`
  - [x] 在 `src/agents/builtin-agents.ts` 的 import 中添加 codesign 相关导入
  - [x] 在 `src/agents/index.ts` 中导出 codesign 工厂函数和元数据

- [x] Task 3: 实现 codesign_scaffold 工具
  - [x] 创建 `src/tools/codesign/scaffold.ts` — 脚手架复制工具实现
  - [x] 创建 `src/tools/codesign/index.ts` — 桶导出
  - [x] 在 `src/plugin/tool-registry.ts` 中注册 `codesign_scaffold` 工具

- [x] Task 4: 实现 codesign_done 工具
  - [x] 创建 `src/tools/codesign/done.ts` — 设计完成验证工具实现
  - [x] 更新 `src/tools/codesign/index.ts` 导出新工具
  - [x] 在 `src/plugin/tool-registry.ts` 中注册 `codesign_done` 工具

- [x] Task 5: 添加模型 fallback 链
  - [x] 在 `src/shared/model-requirements.ts` 的 `AGENT_MODEL_REQUIREMENTS` 中添加 `codesign` fallback 配置

- [x] Task 6: 集成 codesign 到 agent-config-handler
  - [x] 在 `src/plugin-handlers/agent-config-handler.ts` 的组装顺序中添加 codesign（Sisyphus → Hephaestus → Prometheus → Atlas → CoDesign）

- [x] Task 7: 注册到 Team Mode 兼容
  - [x] 在 `src/features/team-mode/types.ts` 的 `AGENT_ELIGIBILITY_REGISTRY` 中注册 `codesign` 为 `eligible`

- [x] Task 8: 验证与测试
  - [x] 确保 TypeScript 编译无错误（所有文件诊断零错误）
  - [x] 确保 lint 检查通过（getDiagnostics 全部干净）

# Task Dependencies
- Task 2 依赖 Task 1（需要先有工厂函数才能注册）
- Task 3、Task 4 可与 Task 2 并行
- Task 5 可与 Task 1-4 并行
- Task 6 依赖 Task 1-2（需要 Agent 注册完成后才能集成）
- Task 7 依赖 Task 2（需要 Agent 在 BuiltinAgentName 中）
- Task 8 依赖所有前置任务
