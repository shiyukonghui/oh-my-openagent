import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

interface PreviewResult {
  ok: boolean
  path: string
  screenshot?: string
  domOutline?: string
  consoleErrors: Array<{ level: string; message: string }>
  assetErrors: Array<{ url: string; status: number }>
  metrics: {
    nodes: number
    height: number
    width: number
    loadMs: number
  }
  reason?: string
}

function wrapAsHtml(content: string, filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === ".html" || ext === ".htm") {
    return content
  }

  // Wrap JSX/TSX in a full HTML document for preview
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
${content}
  </script>
</body>
</html>`
}

function staticCheck(content: string): string[] {
  const errors: string[] = []

  // Count approximate DOM nodes (JSX elements)
  const elementMatches = content.match(/<[A-Z][a-zA-Z]*[\s/>]/g)
  const nodeCount = elementMatches ? elementMatches.length : 0

  if (nodeCount < 3) {
    errors.push("Static check: very few DOM elements detected. Design may be too sparse.")
  }

  return errors
}

export function createPreviewTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description:
      "Render a workspace artifact and return a structured preview report. " +
      "When a browser automation provider is configured, returns a screenshot for vision models. " +
      "Always returns console errors, DOM outline, and rendering metrics. " +
      "Call AFTER the artifact can stand on its own — not on scaffolds, loading states, or empty sections. " +
      "Call BEFORE design_done to self-check.",
    args: {
      path: tool.schema
        .string()
        .describe(
          'Workspace-relative path to the artifact to preview (e.g. "App.jsx", "index.html")'
        ),
    },
    async execute(args) {
      const filePath = String(args.path ?? "").trim()
      if (filePath.length === 0) {
        return "Error: path must be non-empty"
      }

      const workspaceRoot = ctx.directory ?? process.cwd()
      const fullPath = path.resolve(workspaceRoot, filePath)

      // Verify within workspace
      const relative = path.relative(path.resolve(workspaceRoot), fullPath)
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        return `Error: path outside workspace: ${filePath}`
      }

      if (!existsSync(fullPath)) {
        return `Error: file not found: ${filePath}`
      }

      let content: string
      try {
        content = readFileSync(fullPath, "utf-8")
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return `Error reading ${filePath}: ${message}`
      }

      if (content.trim().length === 0) {
        return `Error: ${filePath} is empty`
      }

      // Static analysis
      const staticErrors = staticCheck(content)
      const ext = path.extname(filePath).toLowerCase()
      const isHtml = ext === ".html" || ext === ".htm"
      const isJsx = ext === ".jsx" || ext === ".tsx"

      if (!isHtml && !isJsx) {
        // Non-previewable file types
        const lines = content.split("\n").length
        return (
          `preview: ${filePath} is not a previewable file type (${ext}).\n` +
          `File stats: ${content.length} chars, ${lines} lines.\n` +
          (staticErrors.length > 0
            ? `\nStatic checks:\n${staticErrors.map((e) => `- ${e}`).join("\n")}`
            : "")
        )
      }

      // Build preview HTML
      const html = isHtml ? content : wrapAsHtml(content, filePath)
      const htmlLines = html.split("\n").length

      // Count elements as a rough DOM metric
      const tagMatches = html.match(/<\/?[a-zA-Z][a-zA-Z0-9-]*/g) ?? []
      const uniqueTags = new Set(tagMatches.map((t) => t.replace(/[<\/>]/g, "").toLowerCase()))
      const nodeCount = tagMatches.length

      const result: PreviewResult = {
        ok: staticErrors.length === 0,
        path: filePath,
        domOutline: `Document: ${html.length} chars, ${htmlLines} lines, ~${nodeCount} tags, ${uniqueTags.size} unique elements`,
        consoleErrors: staticErrors.map((e) => ({ level: "error", message: e })),
        assetErrors: [],
        metrics: {
          nodes: nodeCount,
          height: 0, // Can't determine without actual rendering
          width: 0,
          loadMs: 0,
        },
        reason:
          staticErrors.length > 0
            ? "Static analysis found issues. Browser preview not available — review and fix before done."
            : "Static analysis passed. For full browser preview with screenshot, configure a browser automation provider.",
      }

      const lines = [
        result.ok ? `preview ok: ${filePath}` : `preview: issues found in ${filePath}`,
        result.domOutline,
        `Metrics: ~${result.metrics.nodes} DOM nodes`,
      ]

      if (result.consoleErrors.length > 0) {
        lines.push(
          `\nStatic issues:\n${result.consoleErrors.map((e) => `- [${e.level}] ${e.message}`).join("\n")}`
        )
      }

      if (result.reason) {
        lines.push(`\n${result.reason}`)
      }

      return lines.join("\n")
    },
  })
}
