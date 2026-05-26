import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"

interface TweaksResult {
  params: Record<string, unknown> | null
  hint?: string
  error?: string
}

function extractEditmodeBlock(content: string): string | null {
  const beginMarker = "/*EDITMODE-BEGIN*/"
  const endMarker = "/*EDITMODE-END*/"

  const beginIdx = content.indexOf(beginMarker)
  if (beginIdx === -1) return null

  const afterBegin = beginIdx + beginMarker.length
  const endIdx = content.indexOf(endMarker, afterBegin)
  if (endIdx === -1) return null

  return content.slice(afterBegin, endIdx).trim()
}

export function createCodesignTweaksTool(ctx: PluginInput): Record<string, ToolDefinition> {
  const codesign_tweaks: ToolDefinition = tool({
    description:
      "Reads a file in the workspace and extracts key-value tweaks from an EDITMODE block. " +
      "The file should contain a /*EDITMODE-BEGIN*/{...}/*EDITMODE-END*/ block with valid JSON. " +
      "Returns the parsed params for the agent to apply as design tweaks.",
    args: {
      path: tool.schema
        .string()
        .describe(
          "Relative path to a file in the workspace (typically .jsx, .html, or .js) to read EDITMODE tweaks from.",
        ),
    },
    execute: async (args, context) => {
      const runtimeCtx = context as Record<string, unknown>
      const dir = typeof runtimeCtx.directory === "string" ? runtimeCtx.directory : ctx.directory
      const filePath = args.path as string

      if (!filePath || filePath.trim() === "") {
        return JSON.stringify({
          params: null,
          error: "Path argument is required",
        } satisfies TweaksResult)
      }

      try {
        const resolvedPath = resolve(dir, filePath)
        const content = await readFile(resolvedPath, "utf-8")

        const jsonBlock = extractEditmodeBlock(content)

        if (!jsonBlock) {
          return JSON.stringify({
            params: null,
            hint: "No EDITMODE block found. You can add a /*EDITMODE-BEGIN*/{...}/*EDITMODE-END*/ block with JSON tweaks to this file.",
          } satisfies TweaksResult)
        }

        if (jsonBlock.length === 0) {
          return JSON.stringify({
            params: {},
          } satisfies TweaksResult)
        }

        try {
          const parsed = JSON.parse(jsonBlock)
          if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return JSON.stringify({
              params: null,
              error: "EDITMODE block must contain a JSON object (key-value pairs).",
            } satisfies TweaksResult)
          }
          return JSON.stringify({
            params: parsed as Record<string, unknown>,
          } satisfies TweaksResult)
        } catch (parseErr) {
          return JSON.stringify({
            params: null,
            error: `Failed to parse EDITMODE JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
          } satisfies TweaksResult)
        }
      } catch (e) {
        return JSON.stringify({
          params: null,
          error: `Cannot read file: ${e instanceof Error ? e.message : String(e)}`,
        } satisfies TweaksResult)
      }
    },
  })

  return { codesign_tweaks }
}
