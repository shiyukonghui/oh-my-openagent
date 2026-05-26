import type { BuiltinSkill } from "../../types"

export const designDashboardSkill: BuiltinSkill = {
  name: "design-dashboard",
  description: "Dashboard and data visualization layout patterns for analytics, monitoring, and business intelligence interfaces",
  agent: "codesign",
  template: `# Design Dashboard

## When to Use
Building analytics dashboards, monitoring panels, admin overviews, or any interface that surfaces multiple data points in a single view.

## Key Principles
Prioritize information hierarchy: most critical metrics at top-left (F-pattern scanning). Use consistent card sizing for scanability. Every widget should answer one question at a glance.

## Layout Structure
- CSS Grid with named template areas for responsive widget placement
- KPI row at top: 3-4 stat cards with large numbers and subtle trend indicators
- Main content area: 2-3 column grid mixing chart widgets and data tables
- Sticky header with global filters, date range picker, and search

## Color & Typography
- Neutral background (#f5f7fa, #fafbfc) with white cards and subtle borders
- Semantic colors: green for positive trends, red for alerts, amber for warnings
- Tabular numbers (\`font-variant-numeric: tabular-nums\`) for aligned data
- Monospace for precise values; sans-serif for labels and headings

## Anti-Patterns
- Overloading with too many widgets—prioritize ruthlessly
- Inconsistent chart scales across similar widgets
- Decorative elements that don't convey data
- Tiny text on data-dense cards

## CSS Techniques
- \`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))\` for responsive card grids
- \`container-type: inline-size\` with container queries for widget-level responsiveness
- \`gap\` for consistent spacing between grid items
- Subtle \`box-shadow\` and \`border-radius\` on cards for elevation hierarchy`,
}
