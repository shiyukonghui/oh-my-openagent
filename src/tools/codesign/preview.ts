import { readFile, stat } from "node:fs/promises"
import { resolve } from "node:path"
import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"

interface PreviewResult {
  summary: string
  tags: Record<string, number>
  cssTokens: string[]
  lineCount: number
}

function extractTags(html: string): Record<string, number> {
  const tagCounts: Record<string, number> = {}
  const tagRegex = /<\s*\/?\s*(\w[\w-]*)/g
  let match: RegExpExecArray | null
  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    if (tag === "!doctype") continue
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  }
  return tagCounts
}

function extractCssTokens(html: string): string[] {
  const tokens = new Set<string>()

  const classRegex = /class\s*=\s*["']([^"']*?)["']/gi
  let classMatch: RegExpExecArray | null
  while ((classMatch = classRegex.exec(html)) !== null) {
    const classes = classMatch[1].split(/\s+/)
    for (const cls of classes) {
      if (cls) tokens.add("." + cls)
    }
  }

  const idRegex = /id\s*=\s*["']([^"']*?)["']/gi
  let idMatch: RegExpExecArray | null
  while ((idMatch = idRegex.exec(html)) !== null) {
    if (idMatch[1]) tokens.add("#" + idMatch[1])
  }

  const styleBlocks = html.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/gi) || []
  for (const block of styleBlocks) {
    const inner = block.replace(/<style[\s\S]*?>/gi, "").replace(/<\/style>/gi, "")

    const customPropRegex = /(--[\w-]+)/g
    let cpMatch: RegExpExecArray | null
    while ((cpMatch = customPropRegex.exec(inner)) !== null) {
      tokens.add(cpMatch[1])
    }

    const hexRegex = /#[0-9a-fA-F]{3,8}\b/g
    let hexMatch: RegExpExecArray | null
    while ((hexMatch = hexRegex.exec(inner)) !== null) {
      tokens.add(hexMatch[0])
    }
  }

  const inlineStyleRegex = /style\s*=\s*["']([^"']*?)["']/gi
  let isMatch: RegExpExecArray | null
  while ((isMatch = inlineStyleRegex.exec(html)) !== null) {
    const hexRegex = /#[0-9a-fA-F]{3,8}\b/g
    let hm: RegExpExecArray | null
    while ((hm = hexRegex.exec(isMatch[1])) !== null) {
      tokens.add(hm[0])
    }
    const customPropRegex = /(--[\w-]+)/g
    let cp: RegExpExecArray | null
    while ((cp = customPropRegex.exec(isMatch[1])) !== null) {
      tokens.add(cp[1])
    }
  }

  return Array.from(tokens)
}

export function createCodesignPreviewTool(ctx: PluginInput): Record<string, ToolDefinition> {
  const codesign_preview: ToolDefinition = tool({
    description:
      "Preview an HTML file and extract a structural summary including DOM tree overview, " +
      "CSS tokens (class names, custom properties, color hex values), and file metadata. " +
      "Use this to quickly understand the structure of an HTML design artifact.",
    args: {
      path: tool.schema
        .string()
        .describe("Relative path to an HTML file in the workspace"),
    },
    execute: async (args, context): Promise<string> => {
      const workspaceDir = context.directory
      const filePath = resolve(workspaceDir, args.path)

      let content: string
      try {
        content = await readFile(filePath, "utf-8")
      } catch {
        return JSON.stringify({
          summary: `Error: Cannot read file at "${args.path}"`,
          tags: {},
          cssTokens: [],
          lineCount: 0,
        } satisfies PreviewResult)
      }

      const tags = extractTags(content)
      const cssTokens = extractCssTokens(content)
      const lineCount = content.split("\n").length

      let fileSizeBytes: number
      try {
        const fileStat = await stat(filePath)
        fileSizeBytes = fileStat.size
      } catch {
        fileSizeBytes = Buffer.byteLength(content, "utf-8")
      }

      const tagSummary = Object.entries(tags)
        .sort(([, a], [, b]) => b - a)
        .map(([tag, count]) => `${tag}: ${count}`)
        .join(", ")

      const summary = [
        `File: ${args.path}`,
        `Size: ${fileSizeBytes} bytes`,
        `Lines: ${lineCount}`,
        `Tags found: ${Object.keys(tags).length} unique, ${Object.values(tags).reduce((a, b) => a + b, 0)} total`,
        `Tags: ${tagSummary || "none"}`,
        `CSS tokens: ${cssTokens.length}`,
      ].join("\n")

      return JSON.stringify({
        summary,
        tags,
        cssTokens,
        lineCount,
      } satisfies PreviewResult)
    },
  })

  return { codesign_preview }
}
