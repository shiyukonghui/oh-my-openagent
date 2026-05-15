import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

const BUILTIN_SKILLS: Record<string, string> = {
  responsive: "Use mobile-first responsive design. Start at 375px, add breakpoints at 640px, 768px, 1024px, 1280px. Use relative units (rem, %, vw).",
  accessibility: "Follow WCAG 2.1 AA. Minimum contrast ratio 4.5:1 for normal text, 3:1 for large text. All interactive elements must have visible focus indicators. Use semantic HTML landmarks. Provide alt text for images.",
  typography: "Define a clear type scale. Use 2 typefaces max (one display, one body). H1 2-3x body size, H2 1.5-2x, H3 1.25-1.5x. Body 16px/1rem minimum. Line-height 1.5 for body, 1.2 for headings. Max line width 65-75 chars.",
  color: "Use a restrained palette. 2-4 main colors plus neutrals. Follow 60-30-10 rule. Use oklch or hsl for perceptually uniform gradients. Test contrast ratios.",
  layout: "Use CSS Grid for page-level layout, Flexbox for component-level. Prefer auto-fill/minmax for responsive grids. Use gap consistently from the spacing scale.",
  animation: "Use CSS transitions and keyframes. Keep animations under 300ms for UI, under 500ms for page transitions. Respect prefers-reduced-motion. Use transform and opacity for performant animations.",
  forms: "Use native form elements with custom styling. Label every input visibly. Show validation states (error, success). Group related fields. Use appropriate input types (email, tel, number).",
  dashboard: "Prioritize data density and scannability. Use cards for metric groups. Employ consistent chart colors. Include empty states, loading skeletons, and error states. Support dark mode.",
  landing: "Single-page conversion focus. Hero → Features → Social Proof → CTA. Strong visual hierarchy. One primary action per section. Mobile-optimized with touch-friendly targets.",
  deck: "Slide-based presentation format. Each slide = one idea. Use large type (min 24px body). High contrast for projection. Consistent master layout. Progress indicator.",
  report: "Document-first with structured sections. Executive summary, findings, data, recommendations. Clean typography, restrained color. Print-friendly layout. Table of contents for longer reports.",
}

export function createDesignSkillTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description:
      "Load design method guidance or brand reference. " +
      'Call with name for method skills (e.g. "responsive", "typography", "color"). ' +
      'Call with "brand:<slug>" for reference-only brand DESIGN.md data. ' +
      "Skills are read-only guidance, not files to copy.",
    args: {
      name: tool.schema
        .string()
        .describe(
          'Skill name. For method skills: "responsive", "typography", "color", "layout", "animation", "forms", "dashboard", "landing", "deck", "report". ' +
            'For brand refs: "brand:<slug>".'
        ),
    },
    async execute(args) {
      const name = String(args.name ?? "").trim()
      if (name.length === 0) {
        return "Error: skill name must be non-empty"
      }

      // Brand references: look for .codesign/templates/brand-refs/<slug>/DESIGN.md
      if (name.startsWith("brand:")) {
        const slug = name.slice(6).trim()
        if (slug.length === 0) {
          return 'Error: brand slug required. Use design_skill("brand:<slug>")'
        }
        const brandPath = path.join(
          ctx.directory ?? process.cwd(),
          ".codesign",
          "templates",
          "brand-refs",
          slug,
          "DESIGN.md"
        )
        try {
          if (existsSync(brandPath)) {
            const content = readFileSync(brandPath, "utf-8")
            return `# Brand Reference: ${slug}\n\n${content}\n\n---\nNote: This is reference-only data. Translate adopted choices into workspace DESIGN.md; do not edit the brand ref directly.`
          }
          return `Brand reference "${slug}" not found. Expected at: ${brandPath}\n\nCreate the file or use an available brand slug.`
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          return `Error loading brand reference "${slug}": ${message}`
        }
      }

      // Built-in method skills
      const skill = BUILTIN_SKILLS[name]
      if (skill) {
        return `# Design Skill: ${name}\n\n${skill}\n\n---\nApply this guidance to the current design.`
      }

      // Try loading from .codesign/templates/skills/<name>.md
      const skillPath = path.join(
        ctx.directory ?? process.cwd(),
        ".codesign",
        "templates",
        "skills",
        `${name}.md`
      )
      try {
        if (existsSync(skillPath)) {
          const content = readFileSync(skillPath, "utf-8")
          return `# Design Skill: ${name}\n\n${content}\n\n---\nApply this guidance to the current design.`
        }
      } catch {
        // Fall through to not-found
      }

      const available = Object.keys(BUILTIN_SKILLS).join(", ")
      return `Design skill "${name}" not found.\n\nAvailable built-in skills: ${available}\n\nOr create ${skillPath} for a custom skill.`
    },
  })
}
