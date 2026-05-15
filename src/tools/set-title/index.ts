import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"

export function createSetTitleTool(_ctx: PluginInput): ToolDefinition {
  return tool({
    description:
      "Set the design title. Call once at the start of a fresh design " +
      "with a 2-5 word title that describes what is being designed. " +
      "Do not call for continuation or existing-source turns unless " +
      "the user explicitly asks to rename.",
    args: {
      title: tool.schema
        .string()
        .describe("Design title (2-5 words describing the artifact)"),
    },
    async execute(args) {
      const title = String(args.title ?? "").trim()
      if (title.length === 0) {
        return "Error: title must be non-empty"
      }
      return `Title set: ${title}`
    },
  })
}
