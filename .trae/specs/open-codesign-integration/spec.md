# Open CoDesign 集成 Spec

## Why
将 Open CoDesign（MIT 许可证的本地优先 AI 设计工具）的核心功能集成为一个新的一等公民主 Agent `codesign`，使用户在 oh-my-openagent 中能够直接通过自然语言生成 UI/前端设计原型、HTML 页面等产物。

## What Changes
- 新增 `codesign` primary agent（`src/agents/codesign/`），包含完整的提示词体系
- 新增 `BuiltinAgentName` 类型成员 `"codesign"`
- 新增 2 个设计专用工具：`codesign_scaffold`、`codesign_done`
- 注册 Agent 到 `agentSources`、`agentMetadata`、`AGENT_MODEL_REQUIREMENTS`
- 集成到 `agent-config-handler.ts` 组装顺序
- 注册到 `AGENT_ELIGIBILITY_REGISTRY`（Team Mode 兼容）

## Impact
- Affected specs: Agent 系统、工具系统、Team Mode
- Affected code: `src/agents/codesign/`（新建）、`src/agents/types.ts`、`src/agents/builtin-agents.ts`、`src/agents/index.ts`、`src/tools/codesign/`（新建）、`src/plugin/tool-registry.ts`、`src/plugin-handlers/agent-config-handler.ts`、`src/shared/model-requirements.ts`、`src/features/team-mode/types.ts`

## ADDED Requirements

### Requirement: codesign Agent 定义
系统 SHALL 提供 `codesign` primary agent，具备完整的设计提示词体系和工具权限。

#### Scenario: 用户选择 codesign 进行设计
- **WHEN** 用户在 Agent 选择器中选择 `codesign`
- **THEN** codesign Agent 加载设计专用提示词（identity、creativity、methodology、output-rules、workflow、safety）
- **AND** 具备所有标准 OpenCode 工具权限（edit、skill、todo_write、ls、grep、glob、read 等）
- **AND** 具备 codesign 专属工具（codesign_scaffold、codesign_done）

#### Scenario: codesign 被禁用
- **WHEN** 配置中 `disabled_agents` 包含 `"codesign"`
- **THEN** codesign Agent 不出现在 UI 选择器中
- **AND** 不注册 codesign 专属工具
- **AND** 设计技能（design-*）不会被加载

### Requirement: codesign_scaffold 工具
系统 SHALL 提供 `codesign_scaffold` 工具，将预置模板复制到工作目录。

#### Scenario: 模板复制成功
- **WHEN** Agent 调用 `codesign_scaffold(template="landing-page", output="./")`
- **THEN** 模板文件被复制到当前工作目录
- **AND** 返回复制的文件清单

#### Scenario: 模板不存在
- **WHEN** Agent 调用 `codesign_scaffold` 指定不存在的模板名
- **THEN** 返回错误信息，列出现有可用模板

### Requirement: codesign_done 工具
系统 SHALL 提供 `codesign_done` 工具，验证设计产物的完整性和基本语法正确性。

#### Scenario: HTML 验证通过
- **WHEN** 工作目录包含有效的 HTML/CSS/JS 文件
- **AND** Agent 调用 `codesign_done`
- **THEN** 返回 `{ passed: true, errors: [] }`

#### Scenario: HTML 语法错误
- **WHEN** 工作目录的 HTML 文件存在标签不匹配等问题
- **AND** Agent 调用 `codesign_done`
- **THEN** 返回 `{ passed: false, errors: ["具体错误信息"] }`

### Requirement: Agent 注册与加载
系统 SHALL 正确注册 codesign Agent 到所有相关的注册点和配置。

#### Scenario: Agent 正确出现在组装顺序中
- **WHEN** Sisyphus 启用且 codesign 未被禁用
- **THEN** codesign 出现在 Agent 配置中，组装顺序为：Sisyphus → Hephaestus → Prometheus → Atlas → CoDesign

#### Scenario: Sisyphus 自动发现 codesign
- **WHEN** Sisyphus 的 Delegation Table 构建
- **THEN** codesign 的元数据自动出现在 Delegation Table 中（通过 `AgentPromptMetadata`）

### Requirement: 模型 Fallback 链
系统 SHALL 为 codesign Agent 定义模型 fallback 链。

#### Scenario: Claude Sonnet 可用
- **WHEN** Claude Sonnet 4.6 在可用模型列表中
- **THEN** codesign 使用 Claude Sonnet 4.6

#### Scenario: Claude Sonnet 不可用，GPT-5.5 可用
- **WHEN** Claude Sonnet 4.6 不可用
- **AND** GPT-5.5 在可用模型列表中
- **THEN** codesign 降级使用 GPT-5.5

### Requirement: Team Mode 兼容
系统 SHALL 在 Team Mode 中正确标识 codesign 的资格状态。

#### Scenario: codesign 在 Team Mode 中可被调度
- **WHEN** Team Mode 尝试使用 codesign 作为 team member
- **THEN** eligibility 判定为 `eligible`
- **AND** codesign 可被正确调度参与协作
