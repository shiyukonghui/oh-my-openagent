# Open CoDesign 增强 Spec — Phase 2~4

## Why
Phase 1 完成了 `codesign` Agent 的最小可用版本（Agent 定义、注册、2 个工具、模型 fallback）。本 spec 覆盖剩余增强：4 个新工具、12 个设计技能、品牌参考数据、模型变体提示词、技能按 Agent 过滤等。

## What Changes
- 新增 4 个 codesign 专属工具：`codesign_preview`、`codesign_tweaks`、`codesign_ask`、`codesign_image`
- 新增 12 个内置设计技能（`design-*`），仅 codesign Agent 可用
- 新增 25 个品牌参考数据（brand-refs），供脚手架工具引用
- 增强 `codesign` Agent 提示词（添加 tweaks-protocol、editmode-protocol、multi-screen-baton 片段）
- 新增 GPT 和 Gemini 模型变体提示词文件
- 实现 `BuiltinSkill.agent` 字段的过滤逻辑（仅所属 Agent 可见对应技能）
- 增强 `frontend-ui-ux` 技能，融入 open-codesign 设计方法论

## Impact
- Affected specs: `open-codesign-integration`
- Affected code: `src/agents/codesign/`（增强）、`src/tools/codesign/`（新增 4 文件）、`src/features/builtin-skills/skills/`（新增 12 文件）、`src/features/builtin-skills/skills.ts`（注册）、`src/agents/builtin-agents/available-skills.ts`（agent 过滤）、`src/plugin/tool-registry.ts`（注册新工具）、`src/features/builtin-skills/skills/frontend-ui-ux.ts`（增强）

## ADDED Requirements

### Requirement: codesign_preview 工具
系统 SHALL 提供 `codesign_preview` 工具，对工作目录中的 HTML 文件生成预览反馈。

#### Scenario: 预览 HTML 文件
- **WHEN** Agent 调用 `codesign_preview(path="./index.html")`
- **THEN** 读取 HTML 文件内容
- **AND** 返回 HTML 结构摘要（DOM 树概览 + 样式关键词），供 Agent 自我评估设计效果

#### Scenario: 文件不存在
- **WHEN** Agent 调用 `codesign_preview(path="./nonexistent.html")`
- **THEN** 返回错误信息：文件不存在

### Requirement: codesign_tweaks 工具
系统 SHALL 提供 `codesign_tweaks` 工具，从设计文件中解析并暴露可调参数。

#### Scenario: 解析 EDITMODE 块
- **WHEN** Agent 调用 `codesign_tweaks(path="./App.jsx")`
- **AND** 文件中包含 `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` JSON 块
- **THEN** 解析并返回可调参数的键值对列表

#### Scenario: 无 EDITMODE 块
- **WHEN** Agent 调用 `codesign_tweaks(path="./App.jsx")`
- **AND** 文件中不存在 EDITMODE 块
- **THEN** 返回空参数列表，提示 Agent 可添加 EDITMODE 块

### Requirement: codesign_ask 工具
系统 SHALL 提供 `codesign_ask` 工具，向用户提出结构化设计确认问题。

#### Scenario: 向用户提问
- **WHEN** Agent 调用 `codesign_ask(questions=[{id:"style", question:"选择视觉风格", options:["极简","大胆","专业"]}])`
- **THEN** 工具返回可交互的问题列表
- **AND** 用户回答后 Agent 继续工作

#### Scenario: 问题参数为空
- **WHEN** Agent 调用 `codesign_ask` 但不提供任何问题
- **THEN** 返回错误：至少需要一个问题

### Requirement: codesign_image 工具
系统 SHALL 提供 `codesign_image` 工具，生成 AI 位图资源。

#### Scenario: 生成设计素材图片
- **WHEN** Agent 调用 `codesign_image(prompt="modern SaaS dashboard header illustration", style="minimal")`
- **THEN** 返回生成的图片 URL 或 base64 数据
- **AND** Agent 可将其嵌入 HTML 设计中

#### Scenario: 无可用图像生成服务
- **WHEN** Agent 调用 `codesign_image` 但无可用图像生成后端
- **THEN** 返回错误信息，提示使用 CSS/SVG 占位替代

### Requirement: 设计技能注册（12 个）
系统 SHALL 注册 12 个以 `design-` 为前缀的内置技能，仅 codesign Agent 可见。

#### Scenario: codesign Agent 加载设计技能
- **WHEN** codesign Agent 被激活
- **THEN** 12 个 `design-*` 技能出现在其 `skill` 工具可选项中

#### Scenario: 非 codesign Agent 不加载设计技能
- **WHEN** 非 codesign Agent（如 sisyphus、hephaestus）被激活
- **THEN** 12 个 `design-*` 技能不出现在其 `skill` 工具可选项中

### Requirement: 品牌参考数据
系统 SHALL 提供 25 个品牌设计参考数据，通过 `codesign_scaffold` 按需加载。

#### Scenario: 加载品牌参考
- **WHEN** Agent 调用 `codesign_scaffold(template="brand-refs/stripe", output="./")`
- **THEN** Stripe 品牌的 DESIGN.md 被复制到工作目录

### Requirement: Agent 提示词增强
系统 SHALL 在 codesign Agent 提示词中新增 tweaks-protocol、editmode-protocol 片段。

#### Scenario: codesign Agent 包含完整协议
- **WHEN** codesign Agent 激活
- **THEN** prompt 包含 tweaks-protocol 和 editmode-protocol 指南

### Requirement: 模型变体提示词
系统 SHALL 为 GPT 和 Gemini 模型族提供专属提示词变体。

#### Scenario: GPT 模型使用 GPT 变体
- **WHEN** codesign 被分配到 GPT 模型
- **THEN** 使用 `gpt.ts` 中定义的 Markdown 格式提示词

#### Scenario: Gemini 模型使用 Gemini 变体
- **WHEN** codesign 被分配到 Gemini 模型
- **THEN** 使用 `gemini.ts` 中定义的提示词

## MODIFIED Requirements

### Requirement: Skill 按 Agent 过滤
系统的技能加载机制 SHALL 支持按 `agent` 字段过滤技能。

#### Scenario: 技能声明了 agent 字段
- **WHEN** `BuiltinSkill` 的 `agent` 字段设置为 `"codesign"`
- **AND** 当前激活的 Agent 不是 codesign
- **THEN** 该技能不出现在可用技能列表中

#### Scenario: 技能未声明 agent 字段（全局可用）
- **WHEN** `BuiltinSkill` 未设置 `agent` 字段
- **THEN** 该技能对所有 Agent 可见（保持向后兼容）

### Requirement: frontend-ui-ux 技能增强
现有 `frontend-ui-ux` 技能 SHALL 融入 open-codesign 的设计方法论。

#### Scenario: 技能内容增强
- **WHEN** `frontend-ui-ux` 技能被加载
- **THEN** 技能模板包含设计方法论摘要（从上下文出发、方向选择、设计令牌管理）
