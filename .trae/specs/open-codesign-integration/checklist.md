# Verification Checklist

- [x] `src/agents/codesign/agent.ts` 存在且导出 `createCodesignAgent` 工厂函数（带静态 `.mode = "primary"` 属性）
- [x] `src/agents/codesign/default.ts` 存在且包含完整的 prompt（identity、creativity、methodology、output-rules、workflow、safety）
- [x] `src/agents/codesign/metadata.ts` 存在且导出 `CODESIGN_PROMPT_METADATA`（category: "specialist", cost: "EXPENSIVE"）
- [x] `src/agents/codesign/index.ts` 存在且正确导出
- [x] `src/agents/types.ts` 中 `BuiltinAgentName` 包含 `"codesign"`
- [x] `src/agents/builtin-agents.ts` 中 `agentSources` 包含 `codesign: createCodesignAgent`
- [x] `src/agents/builtin-agents.ts` 中 `agentMetadata` 包含 `codesign: CODESIGN_PROMPT_METADATA`
- [x] `src/agents/index.ts` 导出 codesign 相关符号
- [x] `src/tools/codesign/scaffold.ts` 存在且实现 `codesign_scaffold` 工具
- [x] `src/tools/codesign/done.ts` 存在且实现 `codesign_done` 工具
- [x] `src/tools/codesign/index.ts` 存在且正确导出
- [x] `src/plugin/tool-registry.ts` 注册了 `codesign_scaffold` 和 `codesign_done` 工具
- [x] `src/shared/model-requirements.ts` 中 `AGENT_MODEL_REQUIREMENTS` 包含 `codesign` fallback 链
- [x] `src/plugin-handlers/agent-config-handler.ts` 组装顺序包含 codesign（Sisyphus → Hephaestus → Prometheus → Atlas → CoDesign）
- [x] `src/features/team-mode/types.ts` 中 `AGENT_ELIGIBILITY_REGISTRY` 包含 `codesign`（verdict: "eligible"）
- [x] TypeScript 编译无错误（所有文件 getDiagnostics 返回空）
- [x] Lint 检查通过
