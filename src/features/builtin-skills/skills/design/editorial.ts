import type { BuiltinSkill } from "../../types"

export const designEditorialSkill: BuiltinSkill = {
  name: "design-editorial",
  description: "Editorial typography and magazine-style layouts — dramatic headings, pull quotes, multi-column text, drop caps",
  agent: "codesign",
  template: `# Design Editorial

## When to Use
Creating article pages, blog post templates, magazine-style layouts, newsletters, long-form content, or any reading experience where typography is the star.

## Key Principles
Typography IS the design. Choose a distinctive display typeface for headlines and a highly readable serif or sans-serif for body text. Generous line-height (1.6-1.8) and a comfortable measure (55-75 characters per line) are non-negotiable for readability.

## Layout Structure
- Single-column with generous side padding on mobile; multi-column on wider viewports
- Dramatic hero headline spanning full width, set at 3-5rem
- Drop cap on the opening paragraph (\`initial-letter\` or \`::first-letter\`)
- Pull quotes breaking the column flow: floated left/right or full-width with larger type
- Section dividers: minimal horizontal rules or whitespace, not heavy decorations
- Asymmetric image placement: full-bleed, offset, or text-wrapped

## Color & Typography
- Body text: dark charcoal (#1a1a1a or #222) on off-white (#fafaf8 or #fefefe)—never pure black on pure white
- Accent color used sparingly: links, pull quote marks, section numbers
- Font stack progression: display serif for headlines, readable serif for body, sans-serif for metadata/captions

## Anti-Patterns
- Center-aligned body text (only for short passages like pull quotes)
- Line lengths exceeding 80 characters on desktop
- Insufficient contrast between text and background
- Over-designed section dividers that compete with content
- Tiny caption text that fails accessibility contrast minimums

## CSS Techniques
- \`column-count\` and \`column-gap\` for genuine multi-column text flow
- \`::first-letter\` with \`initial-letter\` for drop caps (progressive enhancement)
- \`text-wrap: pretty\` and \`hyphens: auto\` for balanced ragged edges
- \`max-width: 65ch\` on paragraph containers for optimal reading measure
- \`font-feature-settings: "liga", "kern"\` for professional typographic refinements`,
}
