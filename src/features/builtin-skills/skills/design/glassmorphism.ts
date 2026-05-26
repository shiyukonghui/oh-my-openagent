import type { BuiltinSkill } from "../../types"

export const designGlassmorphismSkill: BuiltinSkill = {
  name: "design-glassmorphism",
  description: "Glassmorphism design technique: frosted glass overlays, backdrop blur, layered translucency for modern UI",
  agent: "codesign",
  template: `# Design Glassmorphism

## When to Use
Creating modern, depth-rich interface overlays: cards on gradient backgrounds, navigation bars, modals, tooltips, and widget containers. Best suited for designs with vibrant, colorful backgrounds behind the glass elements.

## Key Principles
The glass effect relies on three layers: a colorful background, a semi-transparent surface, and a subtle border. The magic is in \`backdrop-filter: blur()\`—without a vibrant background underneath, glass looks like gray fog. Always test on varied backgrounds.

## Core CSS Recipe
\`\`\`css
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
\`\`\`

## Color & Transparency
- Light glass: white at 10-20% opacity on dark/vibrant backgrounds
- Dark glass: black at 20-40% opacity on light backgrounds
- Border: white at 15-30% opacity to define the glass edge
- Text on glass needs higher contrast than usual—consider \`text-shadow\` for readability

## Anti-Patterns
- Using glass on plain white or solid backgrounds (no blur effect visible)
- Too many nested glass layers causing visual muddiness
- Text without sufficient contrast on translucent surfaces
- Forgetting the \`-webkit-backdrop-filter\` prefix for Safari

## CSS Techniques
- Layer multiple glass elements with varying blur amounts for depth hierarchy
- Combine with \`mix-blend-mode\` for creative color interactions
- Use \`isolation: isolate\` on glass containers to prevent unwanted blending
- Animate \`backdrop-filter\` sparingly—it is GPU-intensive
- Pair with subtle border gradients using \`border-image\` or pseudo-element overlays`,
}
