import { mkdir, stat, readdir, copyFile } from "node:fs/promises"
import { join, basename } from "node:path"
import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"

const TEMPLATES_DIR = join(
  import.meta.dir,
  "..",
  "..",
  "..",
  "templateCode",
  "open-codesign",
  "apps",
  "desktop",
  "resources",
  "templates",
)

const SCAFFOLDS_DIR = join(TEMPLATES_DIR, "scaffolds")

const BRAND_REFS_DIR = join(TEMPLATES_DIR, "brand-refs")

interface ScaffoldResult {
  success: boolean
  files: string[]
  error?: string
}

async function copyScaffold(
  srcPath: string,
  templateName: string,
  targetDir: string,
): Promise<string[]> {
  const files: string[] = []

  const srcStat = await stat(srcPath).catch(() => null)
  if (!srcStat) {
    throw new Error(
      `Template "${templateName}" not found. Check the template name matches an available scaffold path.`,
    )
  }

  if (srcStat.isFile()) {
    const filename = basename(srcPath)
    const destPath = join(targetDir, filename)
    await copyFile(srcPath, destPath)
    files.push(filename)
  } else if (srcStat.isDirectory()) {
    await copyDirectoryRecursive(srcPath, targetDir, files)
  }

  return files
}

async function copyDirectoryRecursive(
  srcDir: string,
  targetDir: string,
  files: string[],
): Promise<void> {
  const entries = await readdir(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcEntryPath = join(srcDir, entry.name)
    const destEntryPath = join(targetDir, entry.name)

    if (entry.isFile()) {
      await copyFile(srcEntryPath, destEntryPath)
      files.push(entry.name)
    } else if (entry.isDirectory()) {
      await mkdir(destEntryPath, { recursive: true })
      const nestedFiles: string[] = []
      await copyDirectoryRecursive(srcEntryPath, destEntryPath, nestedFiles)
      for (const nested of nestedFiles) {
        files.push(join(entry.name, nested))
      }
    }
  }
}

export function createCodesignScaffoldTool(_ctx: PluginInput): Record<string, ToolDefinition> {
  const codesign_scaffold: ToolDefinition = tool({
    description: `Copy pre-built scaffold templates from the Open CoDesign template directory to the workspace.
Use this when you need a starting template for a design output (app shell, landing page hero, device frame, browser chrome, background, etc.).

Available scaffold templates (use the path as the 'template' argument):
  app-shells/saas-sidebar.jsx
  backgrounds/animated-gradient.css, backgrounds/aurora-mesh.css, backgrounds/bento-grid.css, backgrounds/dot-grid.css, backgrounds/glassmorphism.css, backgrounds/noise-grain.css
  browser/arc.jsx, browser/chrome.jsx, browser/safari.jsx
  decks/slide-16-9.html
  design-systems/DESIGN.md
  dev-mockups/terminal.html, dev-mockups/vscode.jsx
  device-frames/foldable.jsx, device-frames/iphone-16-pro.jsx, device-frames/macbook-pro-16-2024.jsx, device-frames/vision-pro.jsx
  landing/hero.jsx
  reports/executive-brief.html
  surfaces/neubrutalism.css
  ui-primitives/cmdk-palette.jsx, ui-primitives/drawer.jsx, ui-primitives/empty-states.jsx, ui-primitives/file-tree.jsx, ui-primitives/kanban-board.jsx, ui-primitives/skeleton-set.jsx, ui-primitives/stepper.jsx, ui-primitives/toast.jsx

Available brand references (use 'brand-refs/<slug>' as the 'template' argument):
  AI: brand-refs/mistral, brand-refs/runwayml, brand-refs/elevenlabs
  Consumer: brand-refs/apple, brand-refs/airbnb
  Design Tools: brand-refs/figma, brand-refs/framer
  Dev Tools: brand-refs/vercel, brand-refs/cursor, brand-refs/supabase, brand-refs/posthog
  E-commerce: brand-refs/shopify
  Enterprise: brand-refs/ibm
  Fintech: brand-refs/stripe, brand-refs/coinbase, brand-refs/revolut
  Luxury: brand-refs/ferrari
  Media: brand-refs/spotify
  Productivity: brand-refs/linear, brand-refs/notion, brand-refs/raycast
  Retail: brand-refs/nike, brand-refs/starbucks
  SaaS: brand-refs/cal-com
  Tech: brand-refs/spacex`,
    args: {
      template: tool.schema
        .string()
        .describe(
          "Template path to copy (e.g. 'landing/hero.jsx', 'backgrounds/animated-gradient.css', 'ui-primitives/kanban-board.jsx', 'brand-refs/stripe')",
        ),
      output: tool.schema
        .string()
        .optional()
        .describe(
          "Target directory relative to workspace. Defaults to './' (workspace root). Scaffold files are placed directly in this directory.",
        ),
    },
    execute: async (args, context): Promise<string> => {
      const template = args.template as string
      const outputDir = (args.output as string) || "."
      const workspaceDir = context.directory as string

      if (!template || template.trim() === "") {
        return JSON.stringify({
          success: false,
          files: [],
          error: "Template name is required",
        } satisfies ScaffoldResult)
      }

      try {
        const normalizedTemplate = template.replace(/\\/g, "/")
        const isBrandRef = normalizedTemplate.startsWith("brand-refs/")
        const baseDir = isBrandRef ? BRAND_REFS_DIR : SCAFFOLDS_DIR
        const resolvePath = isBrandRef ? normalizedTemplate.slice("brand-refs/".length) : normalizedTemplate
        const srcPath = join(baseDir, resolvePath)
        const targetDir = join(workspaceDir, outputDir)

        await mkdir(targetDir, { recursive: true })

        const files = await copyScaffold(srcPath, normalizedTemplate, targetDir)

        return JSON.stringify({
          success: true,
          files,
        } satisfies ScaffoldResult)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return JSON.stringify({
          success: false,
          files: [],
          error: message,
        } satisfies ScaffoldResult)
      }
    },
  })

  return { codesign_scaffold }
}
