# Tasks

- [x] Task 1: 实现 codesign_preview 工具
  - [x] 创建 `src/tools/codesign/preview.ts` — 读取 HTML 文件，返回结构摘要（DOM 标签层级 + CSS 样式关键词）
  - [x] 更新 `src/tools/codesign/index.ts` 导出
  - [x] 在 `src/plugin/tool-registry.ts` 中注册 `codesign_preview`

- [x] Task 2: 实现 codesign_ask 工具
  - [x] 创建 `src/tools/codesign/ask.ts` — 结构化设计确认问答工具（支持 question / options 格式）
  - [x] 更新 `src/tools/codesign/index.ts` 导出
  - [x] 在 `src/plugin/tool-registry.ts` 中注册 `codesign_ask`

- [x] Task 3: 实现 codesign_tweaks 工具
  - [x] 创建 `src/tools/codesign/tweaks.ts` — 解析文件中 `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` JSON 块
  - [x] 更新 `src/tools/codesign/index.ts` 导出
  - [x] 在 `src/plugin/tool-registry.ts` 中注册 `codesign_tweaks`

- [x] Task 4: 实现 codesign_image 工具
  - [x] 创建 `src/tools/codesign/generate-image.ts` — AI 图像生成工具（占位桩，引导使用 CSS/SVG 替代）
  - [x] 更新 `src/tools/codesign/index.ts` 导出
  - [x] 在 `src/plugin/tool-registry.ts` 中注册 `codesign_image`

- [x] Task 5: 增强 codesign Agent 提示词
  - [x] 在 `src/agents/codesign/default.ts` 中添加 tweaks-protocol 和 editmode-protocol 片段
  - [x] 新增 `src/agents/codesign/gpt.ts` — GPT 模型变体提示词
  - [x] 新增 `src/agents/codesign/gemini.ts` — Gemini 模型变体提示词
  - [x] 更新 `src/agents/codesign/agent.ts` 工厂函数，根据模型类型选择对应提示词变体

- [x] Task 6: 实现 Skill 按 Agent 过滤
  - [x] 修改 `src/features/builtin-skills/skills.ts` 的 `createBuiltinSkills`，支持按当前 Agent 过滤技能
  - [x] 确保 `BuiltinSkill.agent` 字段生效（通过 `currentAgent` 参数实现）

- [x] Task 7: 迁移 12 个设计技能
  - [x] 创建 `src/features/builtin-skills/skills/design/` 目录，迁移 12 个设计技能为 `BuiltinSkill`
  - [x] 12 个技能：slides、dashboard、landing-page、svg-charts、glassmorphism、editorial、hero-section、pricing-page、footer-design、chat-ui、data-table、calendar-design
  - [x] 每个技能声明 `agent: "codesign"`
  - [x] 在 `createBuiltinSkills` 中注册全部 12 个设计技能

- [x] Task 8: 迁移品牌参考数据与增强 frontend-ui-ux
  - [x] 更新 `codesign_scaffold` 工具支持 `brand-refs/` 前缀，25 个品牌 DESIGN.md 可按需复制
  - [x] 增强 `frontend-ui-ux` 技能模板，融入 open-codesign 设计方法论摘要

- [x] Task 9: 验证与测试
  - [x] 确保 TypeScript 编译通过（全部 14 个涉及文件零诊断错误）
  - [x] 确保 lint 检查通过
  - [x] 新增工具的基本功能验证

# Task Dependencies
- Task 1-4 互相独立，可并行
- Task 5 独立，可与其他任务并行
- Task 6 独立，可与其他任务并行
- Task 7 依赖 Task 6（需要 Skill 按 Agent 过滤生效后才能验证）
- Task 8 可与 Task 7 并行
- Task 9 依赖所有前置任务
