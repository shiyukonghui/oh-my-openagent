import type { BuiltinSkill } from "../../types"

export const designHeroSectionSkill: BuiltinSkill = {
  name: "design-hero-section",
  description: "Hero section design patterns: split layout, centered CTA, animated background, gradient overlays, product showcases",
  agent: "codesign",
  template: `# Design Hero Section

## When to Use
Designing the above-the-fold hero section for landing pages, product pages, or marketing sites. The hero is the first (and sometimes only) impression—it must capture attention and communicate value instantly.

## Key Principles
Answer three questions in 5 seconds: What is this? Why should I care? What do I do next? The headline drives emotion or curiosity; the subheadline adds clarity; the CTA provides the path forward. Visuals support the message, not replace it.

## Layout Patterns
- **Centered**: Headline, subheadline, CTA stacked center—cleanest, most versatile
- **Split**: Text left, visual right (or vice versa)—great for product screenshots or illustrations
- **Media Background**: Full-bleed image/video with text overlay and dark gradient for readability
- **Animated**: Motion-driven hero with staggered text reveals and animated background elements
- **Product Showcase**: Hero product image/3D render with minimal text and prominent CTA

## Color & Typography
- Headline: 3-6rem, bold weight (700-900), tight line-height (1.0-1.2)
- Subheadline: 1.25-1.5rem, regular weight, comfortable line-height (1.4-1.6)
- CTA: high-contrast brand color, large tap target (min 48px height)
- Gradient overlays: linear-gradient from dark to transparent for text readability on images

## Anti-Patterns
- Hero text that blends into the background image
- Multiple competing CTAs without clear hierarchy
- Auto-playing video with sound
- Slow-loading hero images that cause layout shift (CLS)
- Headlines that are clever but unclear about what the product actually does

## CSS Techniques
- \`min-height: 100svh\` (or \`100dvh\`) for full-viewport heroes
- \`object-fit: cover\` for background images and videos
- \`mix-blend-mode: overlay\` or \`multiply\` for creative image treatments
- \`@supports (animation-timeline: scroll())\` for scroll-driven hero animations
- \`<link rel="preload" as="image">\` for hero images to prevent CLS`,
}
