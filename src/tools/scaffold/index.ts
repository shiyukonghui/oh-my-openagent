import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

interface ScaffoldManifestEntry {
  description: string
  path: string
  license: string
  source: string
  category?: string
}

interface ScaffoldManifest {
  schemaVersion: number
  scaffolds: Record<string, ScaffoldManifestEntry>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseScaffoldManifest(value: unknown): ScaffoldManifest {
  if (!isRecord(value)) {
    throw new Error("manifest must be an object")
  }
  if (value["schemaVersion"] !== 1) {
    throw new Error("manifest.schemaVersion must be 1")
  }
  const scaffolds = value["scaffolds"]
  if (!isRecord(scaffolds)) {
    throw new Error("manifest.scaffolds must be an object")
  }
  const parsed: Record<string, ScaffoldManifestEntry> = {}
  for (const [kind, rawEntry] of Object.entries(scaffolds)) {
    if (!isRecord(rawEntry)) {
      throw new Error(`manifest.scaffolds.${kind} must be an object`)
    }
    const entry: ScaffoldManifestEntry = {
      description: String(rawEntry["description"] ?? ""),
      path: String(rawEntry["path"] ?? ""),
      license: String(rawEntry["license"] ?? ""),
      source: String(rawEntry["source"] ?? ""),
    }
    if (rawEntry["category"] !== undefined && typeof rawEntry["category"] === "string") {
      entry.category = rawEntry["category"]
    }
    parsed[kind] = entry
  }
  return { schemaVersion: 1, scaffolds: parsed }
}

function getScaffoldsRoot(ctx: PluginInput): string {
  return path.join(ctx.directory ?? process.cwd(), ".codesign", "templates", "scaffolds")
}

function safeResolve(root: string, relPath: string): string {
  const absRoot = path.resolve(root)
  const absPath = path.resolve(absRoot, relPath)
  const relative = path.relative(absRoot, absPath)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`path outside root: ${relPath}`)
  }
  return absPath
}

export function createScaffoldTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description:
      "Copy a prebuilt starter template into the current workspace. " +
      "kind: manifest key identifying the template (e.g. landing, dashboard, deck, device-frame). " +
      "destPath: workspace-relative destination path (e.g. 'App.jsx'). " +
      "The tool preserves the source file extension and creates parent directories as needed.",
    args: {
      kind: tool.schema
        .string()
        .describe(
          "Manifest key identifying which prebuilt starter to copy. Check available kinds by listing the scaffold manifest."
        ),
      destPath: tool.schema
        .string()
        .describe(
          'Workspace-relative destination path (e.g. "App.jsx", "frames/iphone.jsx")'
        ),
    },
    async execute(args) {
      const kind = String(args.kind ?? "").trim()
      const destPathStr = String(args.destPath ?? "").trim()

      if (kind.length === 0) {
        return "Error: kind must be non-empty"
      }
      if (destPathStr.length === 0) {
        return "Error: destPath must be non-empty"
      }

      const scaffoldsRoot = getScaffoldsRoot(ctx)
      const manifestPath = path.join(scaffoldsRoot, "manifest.json")

      let manifest: ScaffoldManifest
      try {
        if (!existsSync(manifestPath)) {
          return `Scaffold manifest not found at: ${manifestPath}\n\nCreate ${scaffoldsRoot}/manifest.json with a "scaffolds" key mapping kinds to template files.`
        }
        const raw = readFileSync(manifestPath, "utf-8")
        manifest = parseScaffoldManifest(JSON.parse(raw) as unknown)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return `Error loading scaffold manifest: ${message}`
      }

      const entry = manifest.scaffolds[kind]
      if (!entry) {
        const available = Object.keys(manifest.scaffolds).join(", ")
        return `Unknown scaffold kind: "${kind}".\n\nAvailable kinds: ${available}`
      }

      let sourcePath: string
      try {
        sourcePath = safeResolve(scaffoldsRoot, entry.path)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return `Scaffold source path error: ${message}`
      }

      if (!existsSync(sourcePath)) {
        return `Scaffold source file not found: ${sourcePath} (kind: ${kind})`
      }

      const workspaceRoot = ctx.directory ?? process.cwd()
      let destPath: string
      try {
        // Preserve source extension
        const sourceExt = path.extname(sourcePath)
        const destParsed = path.parse(destPathStr)
        const adjustedDest =
          sourceExt.length > 0 && destParsed.ext.toLowerCase() !== sourceExt.toLowerCase()
            ? path.join(destParsed.dir, `${destParsed.name}${sourceExt}`)
            : destPathStr
        destPath = safeResolve(workspaceRoot, adjustedDest)
      } catch {
        return `Error: destination path outside workspace: ${destPathStr}`
      }

      try {
        const content = readFileSync(sourcePath, "utf-8")
        mkdirSync(path.dirname(destPath), { recursive: true })
        writeFileSync(destPath, content, "utf-8")
        const bytes = Buffer.byteLength(content, "utf-8")
        const licenseNote = entry.license
          ? `\nLicense: ${entry.license} | Source: ${entry.source}`
          : ""
        return (
          `Scaffolded ${kind} → ${destPathStr} (${bytes} bytes)` +
          licenseNote
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return `Error writing scaffold: ${message}`
      }
    },
  })
}
