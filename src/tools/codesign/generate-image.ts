import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"

interface ImageResult {
  imageUrl: null
  message: string
}

export function createCodesignImageTool(_ctx: PluginInput): Record<string, ToolDefinition> {
  const codesign_image: ToolDefinition = tool({
    description:
      "Placeholder for image generation. Currently returns guidance on using inline SVG, CSS gradients, or data URIs as alternatives. " +
      "An image generation backend may be integrated later.",
    args: {
      prompt: tool.schema
        .string()
        .describe("Description of the image to generate."),
      style: tool.schema
        .string()
        .optional()
        .describe("Aesthetic style hint for the image (e.g. 'minimalist', 'dark mode', 'gradient')."),
    },
    execute: async (args) => {
      const prompt = (args.prompt as string) || ""
      const style = (args.style as string) || ""

      const styleSuffix = style ? ` in a "${style}" style` : ""

      return JSON.stringify({
        imageUrl: null,
        message:
          `Image generation is not yet available. Instead, consider using inline SVG, CSS gradients, or data URIs to achieve the desired visual for "${prompt}"${styleSuffix}. ` +
          "For SVG illustrations: use <svg> tags directly in your HTML/JSX. " +
          "For gradients and patterns: use CSS background properties. " +
          "For icons and small images: use data URIs or inline <img> tags with base64-encoded content.",
      } satisfies ImageResult)
    },
  })

  return { codesign_image }
}
