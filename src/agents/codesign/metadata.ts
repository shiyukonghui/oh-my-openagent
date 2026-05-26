import type { AgentPromptMetadata } from "../types"

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
