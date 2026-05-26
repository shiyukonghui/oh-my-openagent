import type { BuiltinSkill } from "../../types"

export const designDataTableSkill: BuiltinSkill = {
  name: "design-data-table",
  description: "Data table design: sortable columns, pagination, row selection, inline editing, responsive card fallback",
  agent: "codesign",
  template: `# Design Data Table

## When to Use
Designing tables for data-heavy interfaces: admin panels, user management, transaction lists, report tables, or any interface where users need to scan, sort, filter, and compare rows of structured data.

## Key Principles
Tables are for scanning—not reading. Optimize for horizontal and vertical scanning with clear column headers, aligned data, and consistent row heights. Every column should earn its place: if it doesn't help users make decisions, remove it.

## Layout Structure
- **Toolbar** (above table): Search input, filter dropdowns, column visibility toggle, export button, row count
- **Table Header**: Sticky header row with sort indicators (arrows), column resize handles
- **Table Body**: Alternating row backgrounds or horizontal dividers; hover state for row tracking
- **Pagination** (below table): Page numbers, previous/next, rows-per-page selector, total count

## Column Design
- Text columns: left-aligned
- Numeric/monetary columns: right-aligned with tabular numerals
- Status columns: colored badges or indicators
- Actions column: icon buttons aligned right
- Truncation: \`text-overflow: ellipsis\` with tooltip on hover for long content

## Responsive Strategy
- On narrow viewports, collapse the table into a card list where each row becomes a labeled card
- Alternatively, enable horizontal scroll with a sticky first column (identifier column)
- Never just shrink the table—it becomes unreadable

## Anti-Patterns
- Center-aligning numeric data (destroys scanability)
- Missing column headers or ambiguous header labels
- Pagination controls that are hard to click on mobile
- No visual feedback for sortable columns (direction indicator)
- Hiding critical columns behind horizontal scroll on desktop

## CSS Techniques
- \`position: sticky; top: 0\` on \`<thead>\` for persistent column headers
- \`table-layout: fixed\` with explicit column widths for consistent rendering
- \`font-variant-numeric: tabular-nums\` for aligned number columns
- \`tr:nth-child(even)\` for subtle zebra striping (optional, preference-dependent)
- \`<caption>\` element for accessible table descriptions`,
}
