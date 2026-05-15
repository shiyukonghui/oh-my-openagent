import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "../types"
import { createAgentToolRestrictions } from "../../shared/permission-compat"
import { composeSystemPrompt } from "./system-prompt"

const MODE: AgentMode = "subagent"

export const CODESIGN_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "EXPENSIVE",
  promptAlias: "Codesign",
  keyTrigger: "Visual artifact / design request → delegate to codesign",
  triggers: [
    {
      domain: "Visual/UI Design",
      trigger:
        "UI mockups, prototypes, design artifacts, landing pages, dashboards",
    },
    {
      domain: "Brand Systems",
      trigger:
        "Design tokens, DESIGN.md creation or maintenance, style guides, brand colors",
    },
    {
      domain: "Layout & Composition",
      trigger:
        "Page layouts, responsive designs, wireframes, grid systems",
    },
  ],
  useWhen: [
    "User requests visual design artifacts (HTML/JSX/TSX)",
    "DESIGN.md creation or maintenance for design system work",
    "Scaffold/template-based prototyping (device frames, landing pages, decks)",
    "Previewable design output needed with screenshot verification",
    "Multi-screen design work requiring visual consistency",
  ],
  avoidWhen: [
    "Pure code implementation without visual output",
    "Backend API / database / logic-only tasks",
    "Simple text formatting or documentation (use regular tools)",
    "Code refactoring or bug fixing (use hephaestus or sisyphus-junior)",
  ],
  dedicatedSection: `## Codesign Agent (Design Specialist)

Codesign is a design-specialist subagent that turns prompts into visual artifacts.
It works with a workspace filesystem, writes design source files (HTML/JSX/TSX/CSS),
previews artifacts using browser automation (Kimi WebBridge + built-in preview tool),
and produces DESIGN.md design-system artifacts.

**Available Design Tools:**
- scaffold(kind, path) — copy prebuilt starter templates (device frames, landings, etc.)
- preview(path) — static structural validation of JSX/HTML/TsX
- design_skill(name) — load method guidance or brand reference DESIGN.md
- set_title(name) — set the design title
- tweaks(blocks) — declare EDITMODE controls for user iteration
- design_done(path) — self-check and finalize

**Browser Preview (Kimi WebBridge):**
- Load via skill("kimi-webbridge") for real browser rendering
- Navigate, screenshot, snapshot, click, fill forms in the user's actual Chrome
- If extension_connected: false, tell user: "请安装 Kimi WebBridge 浏览器扩展。参考 docs/webbridge.md 安装步骤：在 chrome://extensions 开启开发者模式，加载未打包的扩展程序。"

**When to delegate to codesign:**
- The user asks for a visual design, mockup, landing page, or prototype
- DESIGN.md creation or brand system work is requested
- A previewable HTML/JSX artifact is the expected output`,
}

export function createCodesignAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "task",
    "call_omo_agent",
  ])

  const systemPrompt = composeSystemPrompt()

  return {
    description:
      "Design-specialist subagent that turns prompts into visual artifacts. Works with workspace files, previews through browser automation, produces DESIGN.md artifacts. Delegated when user needs visual design output. (Codesign - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: systemPrompt,
  }
}
createCodesignAgent.mode = MODE
