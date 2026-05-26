# Open CoDesign 集成规划文档

## 将 open-codesign 作为主 Agent 集成到 oh-my-openagent

**版本**: v0.1.0 (初稿)
**日期**: 2026-05-21
**状态**: 规划阶段

---

## 目录

1. [概述](#1-概述)
2. [open-codesign 功能总览](#2-open-codesign-功能总览)
3. [功能映射分析](#3-功能映射分析)
4. [Agent 设计方案](#4-agent-设计方案)
5. [技能系统集成](#5-技能系统集成)
6. [提示词体系设计](#6-提示词体系设计)
7. [注册与加载流程](#7-注册与加载流程)
8. [配置开关设计](#8-配置开关设计)
9. [Sisyphus 编排集成](#9-sisyphus-编排集成)
10. [实施阶段规划](#10-实施阶段规划)
11. [技术考量与风险](#11-技术考量与风险)
12. [验收标准](#12-验收标准)
13. [回滚与降级策略](#13-回滚与降级策略)
14. [测试策略](#14-测试策略)

---

## 1. 概述

### 1.1 目标

将 [Open CoDesign](https://github.com/OpenCoworkAI/open-codesign)（一个 MIT 许可证的本地优先 AI 设计工具）的核心功能集成为一个 **新的一等公民主 Agent**，命名为 **`codesign`**，使其在 oh-my-openagent 的 Agent 生态中能够直接处理 UI/前端设计任务，支持从自然语言提示词到可交互 HTML 原型、幻灯片、营销素材等内容的全流程生成。

### 1.2 价值主张

| 维度 | 当前状态 | 集成后 |
|------|---------|--------|
| **设计能力** | `frontend-ui-ux` 技能仅提供纯文本设计指导 | 拥有完整的 AI 驱动设计生成工具链 |
| **工具支持** | 无设计专用工具 | Scaffold、Skill、Preview、Tweaks、Gen Image 等 11 个设计工具 |
| **模板资源** | 无 | 25 个品牌参考 + 12 个设计技能 |
| **协作流程** | `visual-engineering` 类别通过文本描述委派 | 支持完整的"设计即会话"工作流 |
| **输出产物** | 依赖通用写文件 | 结构化多文件产物（HTML/CSS/JS）+ 5 种格式导出 |

### 1.3 许可证兼容性

open-codesign 使用 **MIT 许可证**（已验证 [`templateCode/open-codesign/package.json`](file:///d:/Agent/oh-my-openagent/templateCode/open-codesign/package.json) `"license": "MIT"`），符合 oh-my-openagent 的宽松依赖要求。注意仅引入纯文本提示词/模板/Markdown 逻辑描述，不引入任何 npm 依赖包，因此其 `package.json` 中的第三方依赖不构成许可证冲突风险。

---

## 2. open-codesign 功能总览

### 2.1 核心生成引擎

open-codesign 的核心是 `packages/core/src/agent.ts`（~1636 行），通过 `@mariozechner/pi-agent-core` 的 `Agent` 类实现：

```
用户 Prompt → 系统提示词组装 → Agent Loop → 虚拟 FS（App.jsx） → 沙箱预览
```

关键组件：
- **系统提示词**：11 个分隔的 Markdown 片段（identity, design-methodology, output-rules, anti-slop-digest, editmode-protocol, tweaks-protocol, multi-screen-baton, brand-acquisition, pre-flight, safety, workflow）
- **11 个 Agent 工具**：set_title, set_todos, skill, scaffold, str_replace_edit, done, preview, generate_image_asset, inspect_workspace, tweaks, ask
- **虚拟文件系统 + 磁盘同步**：`TextEditorFsCallbacks` 接口

### 2.2 设计工具清单（含复用映射）

| open-codesign 工具 | 说明 | 本项目处理 |
|-------------------|------|-----------|
| `set_title` | 自动命名设计 | → **复用 `todo_write`**（OpenCode 标准机制） |
| `set_todos` | 声明任务清单 | → **复用 `todo_write`**，无需新建 |
| `skill` | 加载 12 个设计技能 | → **复用已有 `skill` 工具** |
| `scaffold` | 从模板复制脚手架 | → **需新建** `codesign_scaffold` 工具（P1） |
| `str_replace_edit` | 虚拟 FS 编辑 | → **复用已有 `edit` 工具** |
| `done` | 完成自检（lint + 运行时验证） | → **需新建** `codesign_done` 工具（P1） |
| `preview` | 渲染预览 + 截图 | → **需新建** `codesign_preview`（P2），可探索复用 `playwright` skill |
| `generate_image_asset` | AI 图像生成 | → **需新建** `codesign_image`（P2：统一标记为"需新建"，与 2.2 一致） |
| `inspect_workspace` | 工作区文件清单 | → **复用 `ls` + `grep` + `glob` + `read`** |
| `tweaks` | 可调参数暴露 | → **需新建** `codesign_tweaks`（P2） |
| `ask` | 结构化问答 | → **需新建** `codesign_ask`（P2） |

**总结**：11 个 open-codesign 工具中，**5 个直接复用已有能力**（skill, edit, todo_write, ls/grep/glob/read），**6 个需要新建**（codesign_scaffold, codesign_done, codesign_preview, codesign_image, codesign_tweaks, codesign_ask）。

### 2.3 设计技能（12 个）

幻灯片、仪表盘、落地页、SVG 图表、玻璃拟态、编辑风排版、Hero 区块、价格页、页脚、聊天界面、数据表格、日历

### 2.4 品牌参考（25 个）

> **已验证**: 源码 `apps/desktop/resources/templates/brand-refs/` 目录下实际含 25 个品牌子目录（+1 个 manifest.json）。
> 品牌列表: Apple, Airbnb, Cal.com, Coinbase, Cursor, ElevenLabs, Ferrari, Figma, Framer, IBM, Linear, Mistral, Nike, Notion, PostHog, Raycast, Revolut, RunwayML, Shopify, SpaceX, Spotify, Starbucks, Stripe, Supabase, Vercel

### 2.5 导出系统

HTML（inline CSS）、PDF（puppeteer-core）、PPTX（pptxgenjs）、ZIP、Markdown 五种格式

---

## 3. 功能映射分析

### 3.1 架构适配策略

open-codesign 的核心 Agent Loop 基于 `@mariozechner/pi-agent-core`，而 oh-my-openagent 基于 `@opencode-ai/sdk`。两者的 Agent 机制不同，因此 **不能直接移植 pi-agent 的 Agent 类**。

适配策略：
- **保留设计提示词体系** → 迁移到 oh-my-openagent 的 AgentConfig 提示词模板
- **重建设计工具** → 用 oh-my-openagent 的工具注册机制重新实现
- **复用模板资源** → 作为内置技能数据引入
- **丢弃 pi-agent 运行时** → 不引入 `@mariozechner/pi-*` 系列依赖

### 3.2 功能映射表

| open-codesign 功能 | oh-my-openagent 等价物 | 适配方式 |
|-------------------|----------------------|---------|
| Agent Loop (`agent.prompt`) | Sisyphus 编排 + AgentConfig | 直接使用现有 Agent 运行机制 |
| 系统提示词（11 sections） | AgentConfig.prompt | 合并为 codesign Agent 的 prompt |
| `skill(name)` 工具 | 已有 `skill` 工具 | 复用，无需新增 |
| `scaffold` 工具 | **需新建** | 新增 `codesign_scaffold` 工具 |
| `str_replace_edit` 工具 | 已有 `edit` 工具 | 复用 `edit` |
| `set_title` / `set_todos` 工具 | 已有 `todo_write` 工具 | **复用 `todo_write`**，无需新建 |
| `done` 工具 | **需新建** | 新增 `codesign_done` 工具 |
| `preview` 工具 | **需新建**（依赖 iframe/浏览器） | 新建 `codesign_preview` 工具，可探索复用 `playwright` skill |
| `generate_image_asset` | 已有 `look_at` 部分重叠 | 新增 `codesign_image` 工具 |
| `inspect_workspace` | 已有 `ls` + `grep` + `glob` + `read` | **复用**，无需新建 |
| `tweaks` / `ask` | **需新建** | 新建交互工具 |
| 虚拟 FS | 已有磁盘文件系统 | 直接使用真实文件系统 |
| 沙箱预览（vendored React） | 无等价物 | **Phase 2**：可选 |
| 导出 | 无等价物 | **Phase 2**：按需引入 |

### 3.3 技能映射

| open-codesign 设计技能 | oh-my-openagent 对应 | 动作 |
|------------------------|---------------------|------|
| 12 个设计技能（slides, dashboard, landing...） | 当前无 | 新增为内置设计技能模块 |
| `frontend-ui-ux` 技能 | 已存在 | **增强**：与 open-codesign 的设计方法论融合 |
| 品牌参考（25 个 DESIGN.md） | 当前无 | 新增为品牌设计参考数据 |
| 脚手架模板 | 当前无 | 新增为设计脚手架模板资源 |

---

## 4. Agent 设计方案

### 4.1 基本信息

| 属性 | 值 |
|------|-----|
| **Agent 名称** | `codesign` |
| **模式 (Mode)** | `primary` |
| **Agent 类别 (Category)** | `specialist` |
| **成本级别 (Cost)** | `EXPENSIVE` |
| **默认模型** | `claude-sonnet-4-6`（视觉设计需要良好的视觉理解能力） |
| **温度** | `0.3` — 默认偏保守（比 Atlas 的 0.1 高 3 倍，已有足够采样多样性） |
| **创造性策略** | 通过 prompt 引导（非温度值），Agent 根据用户措辞自动判断：<br>• "大胆" / "有创意" / "experimental" → 极简/极繁/实验性风格<br>• 默认 → 专业、一致、生产级输出<br>> 温度值固定 `0.3`，风格多样性由 prompt 方向决定 |
| **推理** | 启用 extended thinking（`budgetTokens: 16000`） |

### 4.2 选择 `primary` 而非 `subagent` 的原因

1. **设计是面向用户的高质量前端工作**，需要用户直接交互和实时迭代反馈，而非仅作为后台子任务运行
2. **primary Agent 直接接收用户 UI 模型选择**，允许用户根据设计需求切换视觉能力更强的模型
3. **符合现有 primary agent 惯例**（Hephaestus 作为"自主深度工作者"也是 primary），codesign 作为设计工作者同理——它在自己的领域内是自主执行者，不需要 Sisyphus 代理编排。当 Sisyphus 需要设计产出时，通过 `task(category="visual-engineering")` 等方式委托

### 4.3 文件组织结构

```
src/agents/codesign/
├── agent.ts                    # 工厂函数 + 核心 AgentConfig
├── default.ts                  # Claude/默认提示词变体
├── gpt.ts                      # GPT 模型提示词变体
├── gemini.ts                   # Gemini 模型提示词变体
├── index.ts                    # 桶导出
├── prompts/                    # 提示词片段（从 open-codesign 迁移）
│   ├── identity.md             # Agent 身份定义
│   ├── design-methodology.md   # 设计方法论
│   ├── output-rules.md         # 输出规则
│   ├── anti-slop-digest.md     # 反低保真指南
│   ├── editmode-protocol.md    # EditMode 协议
│   ├── tweaks-protocol.md      # Tweaks 协议
│   ├── multi-screen-baton.md   # 多屏设计 baton
│   ├── brand-acquisition.md    # 品牌获取指南
│   ├── pre-flight.md           # 预检规则
│   ├── safety.md               # 安全规则
│   └── workflow.md             # 工作流指南
└── metadata.ts                 # AgentPromptMetadata 定义
```

### 4.4 工具权限与命名

codesign 是 `primary` agent，遵循 **Hephaestus 模型**（全能力自主工作者），不做主动的工具拒绝。

**新建工具命名策略**：所有 codesign 专属工具统一使用 `codesign_` 前缀，防止与现有/未来 OpenCode 工具冲突：

| 工具名 | 用途 |
|--------|------|
| `codesign_scaffold` | 脚手架复制 |
| `codesign_done` | 设计完成验证 |
| `codesign_preview` | 渲染预览 |
| `codesign_tweaks` | 可调参数暴露 |
| `codesign_ask` | 结构化问答 |
| `codesign_image` | AI 图像生成 |

```typescript
// 不设置工具拒绝 — 遵循 Hephaestus 模型，全能力开放
const CODESIGN_TOOL_RESTRICTIONS = {} // 无限制
```

### 4.5 工厂函数框架

```typescript
import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "../types"
import { createAgentToolRestrictions } from "../../shared/permission-compat"

const MODE: AgentMode = "primary"

export const CODESIGN_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "EXPENSIVE",
  promptAlias: "CoDesign",
  keyTrigger: "Design/UI/HTML prototype needed → fire `codesign`",
  triggers: [
    { domain: "UI/UX Design", trigger: "Visual design, HTML prototypes, slides, marketing pages" },
    { domain: "Frontend Prototyping", trigger: "Interactive HTML/CSS/JS prototypes from requirements" },
    { domain: "Design Systems", trigger: "Brand tokens, design language, component libraries" },
  ],
  useWhen: [
    "Building UI prototypes or marketing pages",
    "Creating presentation slides",
    "Design system or brand identity work",
    "Interactive HTML/CSS/JS components",
    "Design iteration with visual feedback",
  ],
  avoidWhen: [
    "Backend logic or API development",
    "Database schema design",
    "DevOps or infrastructure work",
    "Pure documentation writing",
  ],
}

export function createCodesignAgent(model: string): AgentConfig {
  return {
    description: "AI-powered design agent that transforms natural language prompts into interactive HTML prototypes, slides, and marketing materials with professional design quality",
    mode: MODE,
    model,
    temperature: 0.3,
    thinking: { type: "enabled", budgetTokens: 16000 },
    // 不设置工具拒绝 — 遵循 Hephaestus 模型，全能力开放
    prompt: buildCodesignPrompt(),
  }
}
createCodesignAgent.mode = MODE
```

---

## 5. 技能系统集成

### 5.1 新建设计技能

将 open-codesign 的 12 个设计技能迁移为 oh-my-openagent 的 `BuiltinSkill`：

#### 5.1.1 文件结构

```
src/features/builtin-skills/skills/design/
├── slides.ts              # 幻灯片设计技能
├── dashboard.ts           # 仪表盘设计技能
├── landing-page.ts        # 落地页设计技能
├── svg-charts.ts          # SVG 图表技能
├── glassmorphism.ts       # 玻璃拟态设计技能
├── editorial.ts           # 编辑风排版技能
├── hero-section.ts        # Hero 区块技能
├── pricing-page.ts        # 价格页技能
├── footer-design.ts       # 页脚设计技能
├── chat-ui.ts             # 聊天界面技能
├── data-table.ts          # 数据表格技能
├── calendar-design.ts     # 日历设计技能
└── index.ts               # 桶导出
```

#### 5.1.2 技能定义示例

```typescript
// src/features/builtin-skills/skills/design/landing-page.ts
import type { BuiltinSkill } from "../../types"

export const landingPageSkill: BuiltinSkill = {
  name: "design-landing-page",
  description: "Professional landing page design patterns, hero sections, CTA layouts, and conversion-optimized structure",
  template: `# Landing Page Design Skill
...
(迁移自 open-codesign packages/core/src/design-skills/)`,
  agent: "codesign",  // 仅 codesign Agent 可用
}
```

#### 5.1.3 注册到 createBuiltinSkills

在 `src/features/builtin-skills/skills.ts` 的 `createBuiltinSkills()` 中注册。设计技能在 `agent` 字段声明为 `agent: "codesign"` 后，会被现有的 `buildAvailableSkills()` → `resolveAgentSkills()` 管道自动按 Agent 过滤——仅当 `codesign` Agent 存在时才注入，无需额外 `codesignEnabled` 开关。

```typescript
// design-* 技能通过 agent 字段声明所属，无需条件变量
export const landingPageSkill: BuiltinSkill = {
  name: "design-landing-page",
  // ...
  agent: "codesign",
}
```

### 5.2 品牌参考集成

将 25 个品牌 `DESIGN.md` 迁移为内置参考数据：

```
src/features/builtin-skills/brand-refs/
├── apple.md
├── stripe.md
├── shopify.md
├── ...（共 25 个）
└── index.ts          # 品牌参考加载器
```

### 5.3 增强现有 frontend-ui-ux 技能

现有 `frontend-ui-ux` 技能与 open-codesign 的设计方法论互补 —— 前者侧重风格化美学，后者侧重结构化设计流程。建议：

- `frontend-ui-ux` 保持为通用技能，所有 Agent 可用
- 新增 `design-methodology` 技能，专门为 codesign Agent 注入设计流程

---

## 6. 提示词体系设计

### 6.1 核心提示词融合

将 open-codesign 的 11 个提示词片段与 oh-my-openagent 的 Agent 提示词惯例融合：

```
┌──────────────────────────────────────────────────┐
│              codesign Agent Prompt               │
├──────────────────────────────────────────────────┤
│ 1. IDENTITY     — 设计 Agent 身份声明            │
│ 2. CREATIVITY   — 创造性模式选择指南              │
│ 3. METHODOLOGY  — 设计方法论（从 open-codesign）  │
│ 4. BRAND        — 品牌获取指南                    │
│ 5. WORKFLOW     — 工作流（todo_write → skill →       │
│                   codesign_scaffold → edit → codesign_done）   │
│ 6. OUTPUT RULES — 输出规则 + 反 slop 指南        │
│ 7. TOOLS        — 设计工具使用说明                │
│ 8. SAFETY       — 安全约束                       │
│ 9. EDITMODE     — EditMode 协议（可选）          │
│10. TWEAKS       — Tweaks 协议（可选）            │
└──────────────────────────────────────────────────┘
```

> **CREATIVITY 片段内容**（关键设计决策——见 §4.1 温度策略）：

```markdown
## CREATIVITY MODE

You are a design agent. Match your creative intensity to the user's intent:

### Default mode (professional, consistent)
Apply when the user does NOT explicitly ask for creativity, experimentation, 
or bold design. Use balanced, production-grade aesthetics. Prefer established 
patterns over radical departures.

### Creative mode
Activate when the user says any of: "大胆" / "有创意" / "别太保守" / "独特" /
"unique" / "experimental" / "playful" / "bold" / "unconventional" / "artistic".

In creative mode:
- Commit to ONE extreme aesthetic: brutally minimal OR maximalist chaos
- Use unexpected typography, unconventional spatial composition
- Prioritize memorability over convention
- Match implementation complexity to the aesthetic (elaborate code for maximalist)
```

### 6.2 动态提示词构建

参考 Atlas Agent 的 `buildDynamicOrchestratorPrompt()` 模式（见 [atlas/agent.ts](src/agents/atlas/agent.ts)），codesign 的提示词在工厂函数内 **构建时内联拼接**（build-time string concatenation），不依赖运行时文件系统读取。提示词片段以 TypeScript 字符串常量形式嵌入 `default.ts`/`gpt.ts`/`gemini.ts` 各变体文件中：

```typescript
// src/agents/codesign/agent.ts
import { getDefaultCodesignPrompt } from "./default"
import { getGptCodesignPrompt } from "./gpt"
// ...

function buildCodesignPrompt(model: string): string {
  if (isGptModel(model)) return getGptCodesignPrompt()
  if (isGeminiModel(model)) return getGeminiCodesignPrompt()
  return getDefaultCodesignPrompt()
}
```

各变体文件以常量拼接 11 个片段，按需组合。此模式与 `atlas/agent.ts` 的 prompt routing 完全一致。

### 6.3 模型特定变体

| 模型族 | 提示词变体 | 说明 |
|--------|----------|------|
| Claude (Opus/Sonnet) | `default.ts` | 使用 XML 标签结构 + extended thinking |
| GPT (gpt-5.x) | `gpt.ts` | 使用 Markdown 格式 + reasoning effort |
| Gemini | `gemini.ts` | 适配 Gemini 提示词风格 |

---

## 7. 注册与加载流程

### 7.1 步骤概览

```
Step 1: 创建 Agent 源码目录
Step 2: 定义 AgentPromptMetadata
Step 3: 在 BuiltinAgentName 中添加 "codesign"
Step 4: 在 agentSources 中注册工厂函数
Step 5: 创建特殊处理逻辑（如需要）
Step 6: 定义模型 fallback 链
Step 7: 注册新建设计工具
Step 8: 注册新建设计技能
```

### 7.2 详细步骤

#### Step 1: 创建目录结构

```bash
mkdir -p src/agents/codesign/prompts
```

#### Step 2: 定义元数据 (`src/agents/codesign/metadata.ts`)

```typescript
// 参见 4.5 节中的 CODESIGN_PROMPT_METADATA
```

#### Step 3: 更新类型定义 (`src/agents/types.ts`)

```typescript
export type BuiltinAgentName =
  | "sisyphus"
  | "hephaestus"
  | "oracle"
  | "librarian"
  | "explore"
  | "multimodal-looker"
  | "metis"
  | "momus"
  | "atlas"
  | "sisyphus-junior"
  | "codesign";  // ← 新增
```

#### Step 4: 注册到 agentSources (`src/agents/builtin-agents.ts`)

```typescript
const agentSources: Record<BuiltinAgentName, AgentSource> = {
  // ... 现有 10 个
  codesign: createCodesignAgent,
}
```

同时更新 `AGENT_PROMPT_METADATA` 映射：

```typescript
const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  // ... 现有
  codesign: CODESIGN_PROMPT_METADATA,
}
```

#### Step 5: 添加到 agent-config-handler

在 `src/plugin-handlers/agent-config-handler.ts` 中，将 `codesign` 加入 primary agent 组装顺序（Phase 2）：

```typescript
// 组装顺序扩展为: Sisyphus → Hephaestus → Prometheus → Atlas → CoDesign
if (builtinAgents.codesign) {
  agentConfig["codesign"] = builtinAgents.codesign
}
```

#### Step 6: 定义模型 fallback 链 (`src/shared/model-requirements.ts`)

> **已验证**: 模型 ID 格式遵循项目现有的 `AGENT_MODEL_REQUIREMENTS` 约定（`providers[]` + `model` + 可选 `variant`），非虚构 ID。

```typescript
export const AGENT_MODEL_REQUIREMENTS: Record<string, ModelRequirement> = {
  // ... 现有
  codesign: {
    fallbackChain: [
      { providers: ["anthropic", "github-copilot", "opencode"], model: "claude-sonnet-4-6" },
      { providers: ["openai", "github-copilot", "opencode"], model: "gpt-5.5", variant: "medium" },
      { providers: ["anthropic", "github-copilot"], model: "claude-opus-4-7", variant: "max" },
      { providers: ["google", "github-copilot"], model: "gemini-3.1-pro" },
      { providers: ["zai-coding-plan", "opencode"], model: "glm-5.1" },
    ],
  },
}
```

#### Step 7: 注册设计工具（仅新建的，复用的无需注册）

```
src/tools/codesign/
├── scaffold.ts            # codesign_scaffold — 脚手架复制
├── done.ts                # codesign_done — 设计完成验证
├── preview.ts             # codesign_preview — 预览（可探索复用 playwright skill）
├── tweaks.ts              # codesign_tweaks — 可调参数
├── ask.ts                 # codesign_ask — 结构化问答
├── generate-image.ts      # codesign_image — 图像生成
└── index.ts               # 桶导出
```

> **不复用的已有能力**：`edit`、`skill`、`todo_write`、`ls`、`grep`、`glob`、`read` 均为 OpenCode 标准工具，无需额外注册。

在 `src/plugin/tool-registry.ts` 中注册。工具注册无需条件判断（与 §8 配置开关一致：Agent 被禁用时 `createBuiltinAgents()` 会跳过 codesign，工具自然不会暴露给任何 Agent）：

```typescript
// 工具无条件注册，由 Agent 可用性决定实际生效范围
const codesignTools = {
  codesign_scaffold: createScaffoldTool(ctx),
  codesign_done: createCodesignDoneTool(ctx),
  codesign_preview: createPreviewTool(ctx),
  codesign_tweaks: createTweaksTool(ctx),
  codesign_ask: createCodesignAskTool(ctx),
  codesign_image: createGenerateImageTool(ctx),
}
```

### 7.3 新建工具设计要点

#### 7.3.1 `codesign_scaffold`

- **输入**: `template` (模板名称)、`output` (目标目录)
- **实现**: 从 `src/tools/codesign/templates/` 复制文件到当前工作目录
- **模板选择**: Agent prompt 中指定可用模板列表，由 LLM 根据任务选择

#### 7.3.2 `codesign_done`

- **输入**: 无（检查当前工作目录下的 HTML/CSS/JS 文件）
- **验证规则**:
  1. HTML 文件存在且非空
  2. HTML 标签平衡（基本语法检查）
  3. CSS/JS 引用路径有效
- **输出**: `{ passed: boolean, errors: string[] }`

#### 7.3.3 `codesign_preview`

- **降级方案（M8 补充）**: 优先尝试获取模型截图（vision-capable 模型直接描述渲染效果）；无 vision 能力时返回 HTML 结构概要（DOM 树摘要 + 样式关键词）。Phase 2 可探索复用 `playwright` skill 启动 headless browser 截图

---

## 8. 配置开关设计

`codesign` Agent 通过现有 `disabledAgents` 机制控制，无需新增专属开关：

```toml
# 全局配置
[agent]
disabled = ["codesign"]    # 禁用 codesign

# 项目级配置（覆盖全局）
[agent.project]
disabled = []              # 项目级不禁用
```

配置优先级: `project > global > opencode-project > agent-definitions > opencode-config`

禁用后效应：
- Agent 不出现在 UI 选择器
- 6 个 `codesign_*` 工具不注册
- 12 个 `design-*` 技能不注入（因 `agent: "codesign"` 过滤生效）

---

## 9. Sisyphus 编排集成

### 9.1 委托模式

当 Sisyphus 需要处理设计任务时，将使用以下委托模式：

```
用户: "帮我设计一个电商产品展示页"
       │
       ▼
Sisyphus（判断：这是设计任务）
       │
       ├─→ 调用 skill("design-landing-page")  # 加载技能
       │
       ├─→ 调用 task(                         # 委托给 codesign
       │      category="visual-engineering",
       │      subagent_type="codesign",
       │      load_skills=["frontend-ui-ux", "design-landing-page"],
       │      prompt="设计一个电商产品展示页..."
       │    )
       │
       ▼
CoDesign Agent:
  codesign_scaffold → edit → codesign_preview → codesign_tweaks → codesign_done
       │
       ▼
Sisyphus 聚合结果
```

### 9.2 动态提示词表更新

Sisyphus 的提示词中会自动包含 codesign 的信息，因为 AgentPromptMetadata 会被 `dynamic-agent-prompt-builder.ts` 自动拾取：

- **Delegation Table**：自动添加 "UI/UX Design → fire `codesign`"
- **Tool Selection Table**：自动添加 codesign 的 cost 级别
- **Category + Skills Guide**：codesign 归入 `specialist` 类别

### 9.3 Team Mode 兼容

| 属性 | 值 | 说明 |
|------|-----|------|
| **资格判定** | `eligible` | codesign 是 primary agent，可参与 Team Mode |
| **Teammate 权限** | `"allow"` | 需要开放 teammate 权限 |
| **团队角色** | Designer / Frontend Prototyper | 专门负责视觉和交互设计 |

需在 [`src/features/team-mode/types.ts`](src/features/team-mode/types.ts) 的 `AGENT_ELIGIBILITY_REGISTRY` 中注册：

```typescript
// src/features/team-mode/types.ts
export const AGENT_ELIGIBILITY_REGISTRY: Record<string, AgentEligibility> = {
  // ... 现有
  codesign: {
    verdict: "eligible",
    teammate: "allow",
    description: "Designer / Frontend Prototyper — visual and interaction design",
  },
}
```

---

## 10. 实施阶段规划

### Phase 1: 核心 Agent（最小可用） ⏱ 目标：用户可通过 codesign 直接生成 HTML 原型

| 任务 | 产出 |
|------|------|
| 1.1 创建 Agent 源码 + 提示词 | `src/agents/codesign/` 完整目录 |
| 1.2 注册 Agent 到 `BuiltinAgentName` + `agentSources` | 类型更新 + 注册 |
| 1.3 迁移核心提示词（identity, methodology, output-rules, workflow, safety） | 5 个基础 prompt section |
| 1.4 实现 `codesign_scaffold` 工具 | 脚手架复制到工作目录 |
| 1.5 实现 `codesign_done` 工具 | 基本完成验证 |
| 1.6 确认已有工具兼容（`edit`、`skill`、`todo_write`、`ls`/`grep`/`glob`） | 设计工作流所需的通用工具就绪 |
| 1.7 集成到 `agent-config-handler` | 正确出现在 Agent 列表 |
| 1.8 添加模型 fallback 链（基于真实模型 ID） | model-requirements 更新 |
| 1.9 Token 预算评估 — 测量合并后 prompt 总 token 数 | 确保不超出模型上下文窗口 |
| 1.10 烟雾测试 | 基本 prompt → HTML 流程 |

### Phase 2: 设计工具增强 ⏱ 产出可交互的设计工作流

| 任务 | 产出 |
|------|------|
| 2.1 实现 `codesign_preview` 工具 | 本地预览生成结果 |
| 2.2 实现 `codesign_tweaks` 工具 | 参数化设计调整 |
| 2.3 实现 `codesign_ask` 工具 | 结构化设计确认 |
| 2.4 实现 `codesign_image` 工具 | AI 位图生成 |
| 2.5 迁移 12 个设计技能 | `design-*` 技能注册 |
| 2.6 迁移品牌参考数据 | 25 个品牌 DESIGN.md |
| 2.7 迁移脚手架模板 | 模板资源集成 |
| 2.8 迁移 tweaks 协议提示词 | prompt section 补充 |
| 2.9 迁移 editmode-protocol 提示词 | prompt section 补充 |

### Phase 3: 编排与生态集成 ⏱ 产出与 Sisyphus 协作的完整工作流

| 任务 | 产出 |
|------|------|
| 3.1 Sisyphus 委托提示词集成 | codesign 出现在 Delegation Table |
| 3.2 Team Mode 资格注册 | `eligible` 判定 + permission |
| 3.3 与 `frontend-ui-ux` 技能增强 | 深度融合设计方法论 |
| 3.4 动态技能解析 | codesign 可用技能自动注入 |
| 3.5 导出功能集成（可选） | HTML/PDF 导出（如需要） |
| 3.6 沙箱预览集成（可选） | iframe 运行时预览 |

### Phase 4: 模型适配与优化 ⏱ 多模型适配

| 任务 | 产出 |
|------|------|
| 4.1 GPT 变体提示词 | `gpt.ts` |
| 4.2 Gemini 变体提示词 | `gemini.ts` |
| 4.3 模型能力检测适配 | 不同模型的输出格式适配 |
| 4.4 性能调优 | 提示词精简 + 缓存策略 |
| 4.5 🚧 多温度变体（远期） | 当前温度为固定 `0.3`，创造性由 prompt 引导；如有需求可参照 atlas 的 `default/gpt/gemini` 模式，增加 `creative.ts` 变体（temperature=0.7），通过配置开关启用 |

---

## 11. 技术考量与风险

### 11.1 依赖管理

| 依赖 | 处理方式 |
|------|---------|
| `@mariozechner/pi-ai` | **不引入** — 用 `@opencode-ai/sdk` 替代 |
| `@mariozechner/pi-agent-core` | **不引入** — 用 oh-my-openagent 自身 Agent 运行机制 |
| `@mariozechner/pi-coding-agent` | **不引入** — 用现有 `edit` 工具替代 |
| React/Babel (vendored) | **Phase 2 按需评估** — 如果需要本地预览渲染 |
| `pptxgenjs` (PPTX 导出) | **可选** — Phase 2+ 评估是否需要 |
| `puppeteer-core` (PDF) | **可选** — 可考虑复用现有导出机制 |

### 11.2 关键风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| **提示词质量退化** | open-codesign 的提示词针对 pi-agent 体系优化，迁移到 opencode 体系可能效果下降 | 保留原文结构，只做最小适配 |
| **工具语义不匹配** | `edit` 工具的行为可能与 `str_replace_edit` 不同 | Phase 1 充分测试文件编辑流程 |
| **模型兼容性** | 不同模型对设计指令的理解能力不同 | 提供模型特定变体提示词 |
| **技能加载复杂性** | 12 个设计技能可能导致 token 消耗过高 | 实现按需懒加载，一次最多注入 3 个技能 |
| **preview 工具实现** | 无浏览器环境直接渲染 HTML | Phase 1 跳过，Phase 2 评估 headless browser 方案 |
| **提示词上下文溢出** | 11 个提示词片段合并后总 token 数可能超出模型上下文窗口 | Phase 1.9 进行 token 预算评估，按任务类型按需加载片段 |
| **虚拟 FS → 真实 FS 适配** | open-codesign 的撤销/重做、事务性滚动修改依赖虚拟 FS | Phase 1 使用真实 FS + 规范化的文件组织结构，Agent prompt 中要求每次修改后验证 |

### 11.3 不引入的 open-codesign 组件

以下组件 **明确不引入**，以保持项目精简：

- **Electron 桌面应用壳** (`apps/desktop/`) — oh-my-openagent 是 Opencode 插件，非独立应用
- **Settings UI** — 使用 oh-my-openagent 自身的配置系统
- **i18n 包** (`packages/i18n/`) — 复用现有国际化机制或省略
- **OAuth/Codex Provider** — 使用 oh-my-openagent 的 provider 系统
- **Snapshot DB (SQLite)** — 使用 oh-my-openagent 的 session 系统
- **artifacts 流式解析器** — 无需 XML artifact 标签

---

## 12. 验收标准

### 12.1 Phase 1 验收

- [ ] `codesign` 出现在 Opencode 的 Agent 选择器中
- [ ] 选择 codesign + 输入设计描述 → 产出有效的 HTML/CSS/JS 文件
- [ ] `codesign_scaffold` 工具能正确复制模板到工作目录
- [ ] `codesign_done` 工具能执行基本的完成验证
- [ ] Agent 在 Opencode UI 中正确显示（名称、描述、颜色）
- [ ] 所有 OpenCode 标准工具（`edit`、`skill`、`todo_write`、`ls`、`grep`、`glob`、`read`）正常工作

### 12.2 Phase 2 验收

- [ ] 12 个设计技能可通过 `skill(name)` 工具按需加载
- [ ] 品牌参考数据可通过配置选择使用
- [ ] `preview` 工具能提供基本的视觉反馈
- [ ] 设计产出具有一致的视觉质量

### 12.3 Phase 3 验收

- [ ] Sisyphus 能在设计任务场景下自动委托给 codesign
- [ ] Sisyphus 的 Delegation Table 正确显示 codesign
- [ ] codesign 在 Team Mode 中可被正确调度

---

## 13. 回滚与降级策略

### 13.1 禁用 codesign Agent

当集成出现问题或用户不需要设计功能时，通过配置开关禁用：

```toml
# ~/.config/opencode/config.toml
[agent]
disabled = ["codesign"]
```

禁用后 Agent 从 UI 选择器中移除，不注册任何工具，12 个设计技能不会被加载。

### 13.2 渐进降级路径

| 场景 | 降级方式 |
|------|---------|
| 模型不支持长上下文 → 提示词截断 | 仅加载核心 5 个 prompt section（跳过 editmode/tweaks/multi-screen），约节省 40% token |
| preview 工具不可用 | 降级为静态 HTML 描述 + 提示用户手动打开文件 |
| scaffold 模板缺失 | 降级为从零创建文件（由 Agent 直接 write），不依赖模板 |
| generate_image 不可用 | 提示词中跳过图像生成指令，仅使用 CSS 占位符 |
| 整个 codesign Agent 故障 | 用户可回退到 Hephaestus + `frontend-ui-ux` skill 的组合 |

### 13.3 故障排查提示

Phase 1 中新增诊断输出，Agent 初始化失败时记录具体原因（模型不可用/技能缺失/配置错误）到 `electron-log`。

---

## 14. 测试策略

### 14.1 测试范围

| 测试层级 | 覆盖内容 | 目标 |
|---------|---------|------|
| **单元测试** | `createCodesignAgent()` 输出结构、`AgentPromptMetadata` 字段完整性、工具 Schema 合法性 | 覆盖 100% 工厂函数和元数据 |
| **集成测试** | prompt 组装 → Agent 调用 → 文件产出端到端流程（使用 mock 模型） | 验证工作流正确性 |
| **E2E 测试** | 在真实 Opencode 环境中选择 codesign → 输入设计提示词 → 产出可渲染 HTML | Phase 1 后至少 1 条 E2E |

### 14.2 测试位置

```
src/agents/codesign/agent.test.ts          # 工厂函数 + 提示词结构测试
src/agents/codesign/metadata.test.ts       # AgentPromptMetadata 完整性
src/tools/codesign/*.test.ts               # 各工具单元测试
src/agents/codesign/integration.test.ts    # 端到端工作流测试
```

### 14.3 关键测试用例

- 提示词总 token 数 < Claude Sonnet 上下文窗口的 50%（实际可用约 100K）
- `scaffold` 工具复制文件后工作目录包含预期结构
- `done` 工具在 HTML 语法错误时返回不通过
- codesign 在禁用后不出现于 Agent 列表、不注册工具

---

## 附录 A: open-codesign 核心文件索引

| 文件（相对于 `templateCode/open-codesign/`） | 用途 |
|------|------|
| [`packages/core/src/agent.ts`](templateCode/open-codesign/packages/core/src/agent.ts) | 核心 Agent 运行时（~1636行） |
| [`packages/core/src/tools/`](templateCode/open-codesign/packages/core/src/tools/) | 11 个 Agent 工具实现 |
| [`packages/core/src/prompts/sections/`](templateCode/open-codesign/packages/core/src/prompts/sections/) | 11 个系统提示词片段 |
| [`packages/core/src/design-skills/`](templateCode/open-codesign/packages/core/src/design-skills/) | 12 个设计技能加载器 |
| [`packages/core/src/brand/`](templateCode/open-codesign/packages/core/src/brand/) | 品牌设计系统提取 |
| [`apps/desktop/resources/templates/`](templateCode/open-codesign/apps/desktop/resources/templates/) | 模板资源（品牌参考、脚手架、框架） |

## 附录 B: 参考现有 Agent 实现

新建 `codesign` Agent 时应参考以下现有实现：

- `src/agents/oracle.ts` — 简单的 subagent 单文件实现（参考结构）
- `src/agents/atlas/` — primary agent + 多模型变体（参考文件组织）
- `src/agents/hephaestus/` — primary agent + 复杂工具（参考工具集成）
- `src/features/builtin-skills/skills/frontend-ui-ux.ts` — 现有的 UI/UX 技能（参考技能定义）
