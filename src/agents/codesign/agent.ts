import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode } from "../types"
import { isGptModel, isGeminiModel } from "../types"
import { getDefaultCodesignPrompt } from "./default"
import { getGptCodesignPrompt } from "./gpt"
import { getGeminiCodesignPrompt } from "./gemini"

const MODE: AgentMode = "primary"

export function getCodesignPrompt(model: string): string {
  if (isGptModel(model)) return getGptCodesignPrompt()
  if (isGeminiModel(model)) return getGeminiCodesignPrompt()
  return getDefaultCodesignPrompt()
}

export function createCodesignAgent(model: string): AgentConfig {
  return {
    description:
      "AI-powered design agent that transforms natural language prompts into interactive HTML prototypes, slides, and marketing materials with professional design quality",
    mode: MODE,
    model,
    temperature: 0.3,
    thinking: { type: "enabled", budgetTokens: 16000 },
    prompt: getCodesignPrompt(model),
  }
}
createCodesignAgent.mode = MODE
