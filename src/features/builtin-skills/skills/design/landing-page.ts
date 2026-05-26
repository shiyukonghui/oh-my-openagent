import type { BuiltinSkill } from "../../types"

export const designLandingPageSkill: BuiltinSkill = {
  name: "design-landing-page",
  description: "High-conversion landing page design including hero sections, feature grids, testimonials, and CTA optimization",
  agent: "codesign",
  template: `# Design Landing Page

## When to Use
Creating marketing landing pages, product launches, SaaS signup pages, or any conversion-focused single-page site.

## Key Principles
Every section should drive toward a single conversion goal. Above-the-fold content must communicate the value proposition in under 5 seconds. Use progressive disclosure: reveal details as users scroll.

## Layout Structure
1. **Hero**: Bold headline, subheadline, primary CTA, hero visual (illustration/screenshot/video)
2. **Social Proof**: Logo bar of trusted brands or user count with avatars
3. **Features**: 3-6 feature cards in a grid, each with icon + headline + one-sentence description
4. **How It Works**: 3-step numbered flow, horizontally on desktop, stacked on mobile
5. **Testimonials**: Quote cards with photo, name, role, and company
6. **Pricing**: Simplified tier cards (3 tiers max, highlight the recommended one)
7. **FAQ**: Accordion pattern for common objections
8. **Footer CTA**: Final conversion opportunity before footer

## Color & Typography
- Bold brand primary color for CTAs; use sparingly to maximize impact
- High contrast for headlines; slightly muted for body text
- Consistent CTA color across all sections—never change button colors mid-page

## Anti-Patterns
- Competing CTAs that dilute the primary conversion goal
- Walls of text in hero sections
- Generic stock photography without brand context
- Missing mobile optimization for the primary CTA

## CSS Techniques
- \`position: sticky\` for persistent nav with CTA
- \`scroll-behavior: smooth\` for anchor navigation
- \`@media (prefers-reduced-motion)\` to disable parallax and animations
- \`isolation: isolate\` on sections with \`z-index\` stacking`,
}
