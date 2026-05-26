# Verification Checklist

- [x] `src/tools/codesign/preview.ts` 存在且实现 `codesign_preview` 工具
- [x] `src/tools/codesign/ask.ts` 存在且实现 `codesign_ask` 工具
- [x] `src/tools/codesign/tweaks.ts` 存在且实现 `codesign_tweaks` 工具
- [x] `src/tools/codesign/generate-image.ts` 存在且实现 `codesign_image` 工具
- [x] `src/tools/codesign/index.ts` 导出全部 6 个工具（scaffold + done + preview + ask + tweaks + image）
- [x] `src/plugin/tool-registry.ts` 注册了全部 4 个新工具
- [x] `src/agents/codesign/default.ts` 包含 tweaks-protocol 和 editmode-protocol 片段
- [x] `src/agents/codesign/gpt.ts` 存在且包含 GPT 模型变体提示词
- [x] `src/agents/codesign/gemini.ts` 存在且包含 Gemini 模型变体提示词
- [x] `src/agents/codesign/agent.ts` 工厂函数根据模型类型选择对应提示词变体
- [x] `src/features/builtin-skills/skills.ts` 支持 `agent` 字段过滤
- [x] `src/features/builtin-skills/skills/design/` 目录存在，包含 12 个设计技能文件
- [x] 12 个设计技能均声明 `agent: "codesign"`
- [x] `createBuiltinSkills` 中注册了全部 12 个设计技能
- [x] `frontend-ui-ux` 技能模板包含 open-codesign 设计方法论摘要
- [x] TypeScript 编译无错误（全部 14 个涉及文件的 getDiagnostics 返回空）
- [x] Lint 检查通过
