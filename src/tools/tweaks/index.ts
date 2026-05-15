import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"

interface TweakBlock {
  file: string
  id: string
  label: string
  type: "color" | "slider" | "toggle" | "select" | "text"
  default?: unknown
  values?: string[]
  min?: number
  max?: number
  step?: number
}

export function createTweaksTool(_ctx: PluginInput): ToolDefinition {
  return tool({
    description:
      "Declare EDITMODE tweak controls for the current design. " +
      "Each block binds to a TWEAK_DEFAULTS key in the design source. " +
      "Call after the first complete design pass. Create 2-5 high-leverage controls " +
      "that materially change the design (colors, spacing, fonts, etc). " +
      "Skip if controls aren't useful for this design.",
    args: {
      blocks: tool.schema
        .array(
          tool.schema.object({
            file: tool.schema.string().describe("Source file containing the TWEAK_DEFAULTS (e.g. 'App.jsx')"),
            id: tool.schema.string().describe("TWEAK_DEFAULTS key name (camelCase)"),
            label: tool.schema.string().describe("Human-readable control label"),
            type: tool.schema.enum(["color", "slider", "toggle", "select", "text"]).describe("Control type"),
            default: tool.schema.any().optional().describe("Default value"),
            values: tool.schema.array(tool.schema.string()).optional().describe("Options for select type"),
            min: tool.schema.number().optional().describe("Minimum value for slider"),
            max: tool.schema.number().optional().describe("Maximum value for slider"),
            step: tool.schema.number().optional().describe("Step increment for slider"),
          })
        )
        .describe("Array of tweakable control blocks"),
    },
    async execute(args) {
      const blocks = (args.blocks as TweakBlock[]) ?? []

      if (!Array.isArray(blocks) || blocks.length === 0) {
        return "No tweak controls declared. Empty blocks is valid when no useful controls exist."
      }

      const errors: string[] = []
      const validTypes = new Set(["color", "slider", "toggle", "select", "text"])

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        if (!block || typeof block !== "object") {
          errors.push(`Block ${i + 1}: invalid — must be an object`)
          continue
        }
        if (!block.file || typeof block.file !== "string" || block.file.trim().length === 0) {
          errors.push(`Block ${i + 1}: missing "file"`)
        }
        if (!block.id || typeof block.id !== "string" || block.id.trim().length === 0) {
          errors.push(`Block ${i + 1}: missing "id"`)
        }
        if (!block.label || typeof block.label !== "string" || block.label.trim().length === 0) {
          errors.push(`Block ${i + 1}: missing "label"`)
        }
        if (!block.type || !validTypes.has(String(block.type))) {
          errors.push(
            `Block ${i + 1}: invalid "type" — must be one of: ${Array.from(validTypes).join(", ")}`
          )
        }
      }

      if (errors.length > 0) {
        return `Tweaks validation errors:\n${errors.map((e) => `- ${e}`).join("\n")}`
      }

      const summary = blocks
        .map(
          (b) =>
            `- ${b.label} (${b.type}) → ${b.file}#${b.id}`
        )
        .join("\n")

      return `Tweaks registered: ${blocks.length} control(s)\n\n${summary}\n\nEach control maps to a CSS custom property (--ocd-tweak-<kebab-key>) on :root. Wire TWEAK_DEFAULTS values to CSS custom properties in your styles.`
    },
  })
}
