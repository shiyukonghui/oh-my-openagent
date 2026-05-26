import type { BuiltinSkill } from "../../types"

export const designSvgChartsSkill: BuiltinSkill = {
  name: "design-svg-charts",
  description: "Inline SVG chart and data visualization patterns — bar charts, line charts, pie charts, area charts using pure SVG",
  agent: "codesign",
  template: `# Design SVG Charts

## When to Use
Building lightweight, dependency-free data visualizations with pure SVG. Use when you need charts that are stylable via CSS, animatable, responsive, and don't warrant a heavy charting library.

## Key Principles
SVG charts are DOM elements—treat them as such. Use CSS variables for colors and dimensions. Leverage \`viewBox\` for natural responsiveness. Keep the data-to-visual mapping explicit and debuggable.

## Chart Types & SVG Patterns
- **Bar Chart**: \`<rect>\` elements with \`x\`, \`y\`, \`width\`, \`height\`; grouped bars use \`<g transform="translate(...)">\`
- **Line Chart**: \`<polyline>\` or \`<path>\` with \`d="M x y L x y ..."\`; add \`<circle>\` for data points
- **Area Chart**: \`<path>\` with fill and the same points as a line chart, closed at the baseline
- **Pie/Donut Chart**: \`<circle>\` with \`stroke-dasharray\` and \`stroke-dashoffset\` for segments; or \`<path>\` with arc commands
- **Sparkline**: Minimal line chart with no axes, just the trend line

## Color & Typography
- Use CSS \`currentColor\` for chart elements that should inherit text color
- Categorical color palettes via CSS custom properties
- Axis labels in a neutral sans-serif at 11-12px
- Grid lines at very low opacity (5-10%) to avoid visual noise

## Anti-Patterns
- Hardcoded pixel dimensions that break responsiveness
- Missing \`viewBox\` on the root \`<svg>\` element
- Unlabeled axes or missing data context
- Overly complex single-path definitions that are impossible to debug

## CSS Techniques
- \`viewBox="0 0 {width} {height}"\` with \`width: 100%\` for responsive scaling
- \`stroke-linecap: round\` and \`stroke-linejoin: round\` for polished line ends
- CSS transitions on \`stroke-dashoffset\` for animated chart reveals
- \`<foreignObject>\` for HTML-styled labels inside SVG when needed
- \`preserveAspectRatio="xMidYMid meet"\` for controlled scaling behavior`,
}
