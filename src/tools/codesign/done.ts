import { readdir, readFile, stat } from "node:fs/promises"
import { extname, join, resolve, dirname } from "node:path"
import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"

interface VerifyResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

interface HtmlRef {
  tag: string
  attr: string
  value: string
}

async function findHtmlFiles(dir: string): Promise<string[]> {
  const htmlFiles: string[] = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      const nested = await findHtmlFiles(fullPath)
      htmlFiles.push(...nested)
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".html") {
      htmlFiles.push(fullPath)
    }
  }
  return htmlFiles
}

function extractRefs(html: string): HtmlRef[] {
  const refs: HtmlRef[] = []

  const linkRegex = /<link\s[^>]*?href\s*=\s*["']([^"']+)["'][^>]*?>/gi
  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(html)) !== null) {
    const value = match[1]
    if (value && !value.startsWith("http://") && !value.startsWith("https://") && !value.startsWith("//") && !value.startsWith("data:")) {
      refs.push({ tag: "link", attr: "href", value })
    }
  }

  const scriptRegex = /<script\s[^>]*?src\s*=\s*["']([^"']+)["'][^>]*?>/gi
  while ((match = scriptRegex.exec(html)) !== null) {
    const value = match[1]
    if (value && !value.startsWith("http://") && !value.startsWith("https://") && !value.startsWith("//")) {
      refs.push({ tag: "script", attr: "src", value })
    }
  }

  return refs
}

function checkTagBalance(html: string): string | null {
  const stripped = html.replace(/<!--[\s\S]*?-->/g, "")
  const openCount = (stripped.match(/</g) || []).length
  const closeCount = (stripped.match(/>/g) || []).length

  if (openCount !== closeCount) {
    return `HTML tag imbalance: found ${openCount} '<' vs ${closeCount} '>' characters`
  }

  const unclosed = checkUnclosedTags(stripped)
  if (unclosed) {
    return unclosed
  }

  return null
}

function checkUnclosedTags(html: string): string | null {
  const blockTags = ["div", "section", "article", "header", "footer", "nav", "main", "aside", "ul", "ol", "table", "form", "fieldset"]
  const openTagRegex = /<\s*(\w+)[\s>]/g
  const closeTagRegex = /<\s*\/\s*(\w+)\s*>/g

  const tagCounts = new Map<string, number>()

  let match: RegExpExecArray | null
  while ((match = openTagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    if (blockTags.includes(tag)) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }

  while ((match = closeTagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    if (blockTags.includes(tag)) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) - 1)
    }
  }

  for (const [tag, count] of tagCounts) {
    if (count > 0) {
      return `Unclosed <${tag}> tag detected (${count} more opening than closing)`
    }
  }

  return null
}

function checkWarnings(html: string): string[] {
  const warnings: string[] = []

  if (/<img\s[^>]*?(?<!\balt\s*=)[^>]*?>/gi.test(html) && !/<img\s[^>]*?\balt\s*=\s*["']/gi.test(html)) {
    warnings.push("Some <img> tags may be missing alt attributes")
  }

  const headingMatches = html.match(/<h[1-6]\s*>/gi)
  if (headingMatches) {
    for (const h of headingMatches) {
      const closeTag = "</" + h.slice(1)
      const idx = html.indexOf(h)
      if (idx !== -1) {
        const after = html.slice(idx + h.length)
        const closeIdx = after.indexOf(closeTag)
        if (closeIdx !== -1) {
          const content = after.slice(0, closeIdx).trim()
          if (content.length === 0) {
            const level = h.match(/[1-6]/)?.[0]
            warnings.push(`Empty <h${level}> heading detected`)
          }
        }
      }
    }
  }

  return warnings
}

async function verifyHtmlFile(
  filePath: string,
  baseDir: string
): Promise<VerifyResult> {
  const result: VerifyResult = { passed: true, errors: [], warnings: [] }

  let content: string
  try {
    content = await readFile(filePath, "utf-8")
  } catch (e) {
    result.passed = false
    result.errors.push(`Cannot read file: ${filePath}`)
    return result
  }

  if (content.trim().length === 0) {
    result.passed = false
    result.errors.push(`Empty HTML file: ${filePath}`)
  }

  const tagError = checkTagBalance(content)
  if (tagError) {
    result.passed = false
    result.errors.push(`${filePath}: ${tagError}`)
  }

  const refs = extractRefs(content)
  const fileDir = dirname(filePath)
  for (const ref of refs) {
    const refPath = resolve(fileDir, ref.value)
    try {
      await stat(refPath)
    } catch {
      const relativeToBase = resolve(baseDir, ref.value)
      try {
        await stat(relativeToBase)
      } catch {
        result.passed = false
        result.errors.push(`${filePath}: referenced file not found - ${ref.value} (from <${ref.tag} ${ref.attr}>)`)
      }
    }
  }

  const warnings = checkWarnings(content)
  result.warnings.push(...warnings)

  return result
}

export function createCodesignDoneTool(ctx: PluginInput): Record<string, ToolDefinition> {
  const codesign_done: ToolDefinition = tool({
    description:
      "Completes design artifact verification in the workspace. " +
      "Checks HTML files for basic structural issues: file existence and non-empty, " +
      "balanced HTML tags, and valid CSS/JS file references. " +
      "Returns a passed/failed result with specific error messages.",
    args: {
      path: tool.schema
        .string()
        .optional()
        .describe(
          "Specific file to verify. If omitted, scans the workspace directory for HTML files."
        ),
    },
    execute: async (args, context) => {
      const runtimeCtx = context as Record<string, unknown>
      const dir = typeof runtimeCtx.directory === "string" ? runtimeCtx.directory : ctx.directory

      try {
        let htmlFiles: string[]

        if (args.path && typeof args.path === "string") {
          const targetPath = resolve(dir, args.path)
          try {
            const fileStat = await stat(targetPath)
            if (fileStat.isFile() && extname(targetPath).toLowerCase() === ".html") {
              htmlFiles = [targetPath]
            } else if (fileStat.isFile()) {
              return JSON.stringify({
                passed: false,
                errors: [`File is not an HTML file: ${args.path}`],
              })
            } else {
              htmlFiles = await findHtmlFiles(targetPath)
            }
          } catch {
            return JSON.stringify({
              passed: false,
              errors: [`Path not found: ${args.path}`],
            })
          }
        } else {
          htmlFiles = await findHtmlFiles(dir)
        }

        if (htmlFiles.length === 0) {
          return JSON.stringify({
            passed: false,
            errors: ["No HTML files found in the workspace"],
          })
        }

        const allErrors: string[] = []
        const allWarnings: string[] = []

        for (const file of htmlFiles) {
          const result = await verifyHtmlFile(file, dir)
          allErrors.push(...result.errors)
          allWarnings.push(...result.warnings)
        }

        const response: { passed: boolean; errors: string[]; warnings?: string[] } = {
          passed: allErrors.length === 0,
          errors: allErrors,
        }

        if (allWarnings.length > 0) {
          response.warnings = allWarnings
        }

        return JSON.stringify(response)
      } catch (e) {
        return JSON.stringify({
          passed: false,
          errors: [`Verification error: ${e instanceof Error ? e.message : String(e)}`],
        })
      }
    },
  })

  return { codesign_done }
}
