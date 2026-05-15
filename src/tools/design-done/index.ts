import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

interface DoneError {
  message: string
  lineno?: number
}

interface DoneResult {
  status: "ok" | "errors"
  path: string
  errors: DoneError[]
}

function checkAppJsx(content: string): DoneError[] {
  const errors: DoneError[] = []

  // Check for required ReactDOM.createRoot ending
  if (!/ReactDOM\.createRoot/.test(content)) {
    errors.push({
      message: "Missing ReactDOM.createRoot(document.getElementById('root')).render(<App />)",
    })
  }

  // Check for HTML boilerplate that shouldn't be in App.jsx
  if (/<!doctype/i.test(content)) {
    errors.push({ message: "App.jsx contains <!doctype> — remove HTML boilerplate" })
  }
  if (/<html/i.test(content)) {
    errors.push({ message: "App.jsx contains <html> tag — remove document shell" })
  }
  if (/<head>/i.test(content)) {
    errors.push({ message: "App.jsx contains <head> — the host runtime supplies this" })
  }
  if (/<body/i.test(content)) {
    errors.push({ message: "App.jsx contains <body> tag — remove document shell" })
  }
  if (/type="text\/babel"/i.test(content)) {
    errors.push({
      message: "App.jsx contains type=\"text/babel\" — remove Babel CDN reference",
    })
  }

  // Check for common CDN imports
  if (/cdnjs\.cloudflare\.com/.test(content) && !/exact-version/.test(content)) {
    errors.push({
      message: "External CDN scripts should use exact version URLs",
    })
  }

  // Check for lorem ipsum
  if (/lorem ipsum/i.test(content)) {
    errors.push({ message: "Contains lorem ipsum placeholder text — replace with real content" })
  }

  // Check for empty body (no meaningful content)
  const strippedContent = content.replace(/\s+/g, "")
  if (strippedContent.length < 50) {
    errors.push({ message: "File appears to be nearly empty — add design content" })
  }

  return errors
}

function checkHtml(content: string): DoneError[] {
  const errors: DoneError[] = []

  // Basic HTML structure checks
  if (!/<title>/i.test(content)) {
    errors.push({ message: "Missing <title> tag" })
  }
  if (/lorem ipsum/i.test(content)) {
    errors.push({ message: "Contains lorem ipsum placeholder text — replace with real content" })
  }

  return errors
}

export function createDesignDoneTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description:
      "Self-check and finalize the design. Call as the last step after preview. " +
      "Verifies the source file at `path` for common issues, checks DESIGN.md if present, " +
      "and returns a structured pass/fail report. Call `preview` before this.",
    args: {
      path: tool.schema
        .string()
        .describe(
          "Workspace-relative path to the primary artifact to check (e.g. 'App.jsx', 'index.html')"
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

      // Run checks based on file type
      const ext = path.extname(filePath).toLowerCase()
      let errors: DoneError[]
      if (ext === ".jsx" || ext === ".tsx") {
        errors = checkAppJsx(content)
      } else if (ext === ".html" || ext === ".htm") {
        errors = checkHtml(content)
      } else {
        // For other files (markdown, etc.), just check not-empty
        errors = []
        if (content.trim().length === 0) {
          errors.push({ message: "File is empty" })
        }
      }

      // Check for DESIGN.md alongside
      const designMdPath = path.join(workspaceRoot, "DESIGN.md")
      const hasDesignMd = existsSync(designMdPath)

      const result: DoneResult = {
        status: errors.length === 0 ? "ok" : "errors",
        path: filePath,
        errors,
      }

      const lines = [
        errors.length === 0
          ? `design_done ok: ${filePath} passes validation.${hasDesignMd ? " DESIGN.md present." : ""}`
          : `design_done has ${errors.length} error(s) in ${filePath}:`,
        ...errors.map(
          (e) => `- ${e.message}${e.lineno !== undefined ? ` (line ${e.lineno})` : ""}`
        ),
      ]

      if (!hasDesignMd && errors.length === 0) {
        lines.push(
          "\nNo DESIGN.md found in workspace. Consider creating one if this design has stable tokens or spans multiple screens."
        )
      }

      return lines.join("\n")
    },
  })
}
