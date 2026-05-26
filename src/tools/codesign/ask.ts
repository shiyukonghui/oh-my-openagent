import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"

interface Question {
  id: string
  question: string
  options?: string[]
  allowFreeform?: boolean
}

interface AskResult {
  questions: Question[]
  error?: string
}

export function createCodesignAskTool(_ctx: PluginInput): Record<string, ToolDefinition> {
  const codesign_ask: ToolDefinition = tool({
    description:
      "Present structured questions to the user and return their configuration. " +
      "Each question has an id, question text, optional options array for multiple choice, " +
      "and an optional allowFreeform flag. Use this to gather design requirements or " +
      "configuration preferences from the user before generating code.",
    args: {
      questions: tool.schema
        .array(
          tool.schema.object({
            id: tool.schema.string().describe("Unique identifier for this question"),
            question: tool.schema.string().describe("The question text to present"),
            options: tool.schema
              .array(tool.schema.string())
              .optional()
              .describe("Optional list of predefined answer choices"),
            allowFreeform: tool.schema
              .boolean()
              .optional()
              .describe("Allow freeform text answer in addition to options"),
          }),
        )
        .describe("Array of questions to present to the user"),
    },
    execute: async (args): Promise<string> => {
      const questions = args.questions as Question[]

      if (!questions || questions.length === 0) {
        return JSON.stringify({
          questions: [],
          error: "At least one question is required",
        } satisfies AskResult)
      }

      for (const q of questions) {
        if (!q.id || typeof q.id !== "string" || q.id.trim() === "") {
          return JSON.stringify({
            questions: [],
            error: "Each question must have a non-empty 'id' field",
          } satisfies AskResult)
        }
        if (!q.question || typeof q.question !== "string" || q.question.trim() === "") {
          return JSON.stringify({
            questions: [],
            error: `Question "${q.id}" must have a non-empty 'question' field`,
          } satisfies AskResult)
        }
      }

      return JSON.stringify({
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          ...(q.options ? { options: q.options } : {}),
          ...(q.allowFreeform !== undefined ? { allowFreeform: q.allowFreeform } : {}),
        })),
      } satisfies AskResult)
    },
  })

  return { codesign_ask }
}
