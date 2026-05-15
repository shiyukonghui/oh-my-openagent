import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { parseDesignMd, validateDesignMd, type DesignMdFinding } from "./design-md"

/**
 * Brand reference system — discover, load, and validate brand DESIGN.md
 * files stored in .codesign/templates/brand-refs/<slug>/DESIGN.md.
 *
 * Brand refs are reference-only design systems. They are loaded via
 * design_skill("brand:<slug>") and must not be edited directly.
 * Adopted choices should be translated into the workspace DESIGN.md.
 */

export interface BrandRefMeta {
  slug: string
  path: string
  name: string
  description: string
  findings: DesignMdFinding[]
  valid: boolean
}

export interface BrandRefContent {
  meta: BrandRefMeta
  raw: string
  formatted: string
}

function getBrandRefsRoot(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".codesign", "templates", "brand-refs")
}

/**
 * Discover all brand references in the templates directory.
 * Returns metadata for each found brand ref (slug, name, validity).
 */
export function discoverBrandRefs(workspaceRoot: string): BrandRefMeta[] {
  const root = getBrandRefsRoot(workspaceRoot)
  if (!existsSync(root)) return []

  const refs: BrandRefMeta[] = []
  try {
    const entries = readdirSync(root)
    for (const entry of entries) {
      const entryPath = path.join(root, entry)
      if (!statSync(entryPath).isDirectory()) continue

      const designMdPath = path.join(entryPath, "DESIGN.md")
      if (!existsSync(designMdPath)) continue

      try {
        const raw = readFileSync(designMdPath, "utf-8")
        const doc = parseDesignMd(raw)
        const name =
          (typeof doc.frontmatter["name"] === "string"
            ? doc.frontmatter["name"]
            : undefined) ?? entry
        const description =
          typeof doc.frontmatter["description"] === "string"
            ? doc.frontmatter["description"]
            : ""
        const findings = validateDesignMd(raw)
        refs.push({
          slug: entry,
          path: designMdPath,
          name,
          description,
          findings,
          valid: findings.filter((f) => f.severity === "error").length === 0,
        })
      } catch {
        refs.push({
          slug: entry,
          path: designMdPath,
          name: entry,
          description: "",
          findings: [
            { severity: "error", path: "frontmatter", message: "Failed to parse DESIGN.md" },
          ],
          valid: false,
        })
      }
    }
  } catch {
    // Directory listing failed — return empty
  }

  refs.sort((a, b) => a.slug.localeCompare(b.slug))
  return refs
}

/**
 * Load a specific brand reference by slug.
 * Returns the full content ready for prompt injection, or null if not found.
 */
export function loadBrandRef(
  workspaceRoot: string,
  slug: string
): BrandRefContent | null {
  const root = getBrandRefsRoot(workspaceRoot)
  const designMdPath = path.join(root, slug, "DESIGN.md")

  if (!existsSync(designMdPath)) return null

  try {
    const raw = readFileSync(designMdPath, "utf-8")
    const doc = parseDesignMd(raw)
    const name =
      (typeof doc.frontmatter["name"] === "string"
        ? doc.frontmatter["name"]
        : undefined) ?? slug
    const description =
      typeof doc.frontmatter["description"] === "string"
        ? doc.frontmatter["description"]
        : ""
    const findings = validateDesignMd(raw)

    const meta: BrandRefMeta = {
      slug,
      path: designMdPath,
      name,
      description,
      findings,
      valid: findings.filter((f) => f.severity === "error").length === 0,
    }

    // Format for prompt injection
    const formatted = [
      `# Brand Reference: ${name}`,
      `Slug: ${slug}`,
      description ? `Description: ${description}` : "",
      "",
      raw,
      "",
      "---",
      'Note: This is reference-only data. Translate adopted choices into workspace DESIGN.md.',
      "Do not edit the brand ref directly.",
    ]
      .filter((l) => l !== "")
      .join("\n")

    return { meta, raw, formatted }
  } catch {
    return null
  }
}

/**
 * List available brand slugs for display.
 */
export function listBrandSlugs(workspaceRoot: string): string[] {
  const refs = discoverBrandRefs(workspaceRoot)
  return refs.map((r) => r.slug)
}

/**
 * Format a brand ref listing for the resource manifest (prompt context).
 */
export function formatBrandRefManifest(
  workspaceRoot: string
): string {
  const refs = discoverBrandRefs(workspaceRoot)
  if (refs.length === 0) return ""

  const lines = [
    "## Available Brand References",
    "",
    "Load with `design_skill(\"brand:<slug>\")`:",
    "",
  ]

  for (const ref of refs) {
    const status = ref.valid ? "" : " (has validation issues)"
    lines.push(
      `- **${ref.slug}** — ${ref.name || ref.slug}${status}`
    )
    if (ref.description) {
      lines.push(`  ${ref.description}`)
    }
  }

  return lines.join("\n")
}
