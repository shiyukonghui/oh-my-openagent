import type { BuiltinSkill } from "../../types"

export const designSlidesSkill: BuiltinSkill = {
  name: "design-slides",
  description: "Professional slide deck design patterns for presentations, pitch decks, and keynote-style layouts",
  agent: "codesign",
  template: `# Design Slides

## When to Use
Building presentation-style web pages, pitch decks, keynote-inspired landing pages, or any single-page scrollable "slide" experience.

## Key Principles
Each "slide" should occupy the full viewport with a clear focal point. Use dramatic scale contrast between headings and body text. Limit each slide to one core message—don't overcrowd.

## Layout Structure
- Full viewport sections (100vh / 100dvh) with snap-scrolling
- Asymmetric two-column layouts: text-heavy left, visual-heavy right (or vice versa)
- Large typography as the primary visual element—headings at 4-8rem
- Minimal UI chrome; let content breathe with generous whitespace

## Color & Typography
- Dark backgrounds (deep navy, charcoal, pure black) with high-contrast accent colors
- One standout display typeface for headlines; a clean sans-serif for body
- Gradient overlays sparingly; prefer solid bold colors for impact

## Anti-Patterns
- Too much text per slide—audiences can't read paragraphs in presentation mode
- Low contrast text on busy backgrounds
- Inconsistent vertical rhythm between slides
- Stock-photo backgrounds that overpower text

## CSS Techniques
- \`scroll-snap-type: y mandatory\` on container, \`scroll-snap-align: start\` on slides
- \`aspect-ratio\` for consistent image/video containers
- \`backdrop-filter\` for overlay effects on slide backgrounds
- CSS \`counter()\` for slide numbering
- \`@keyframes\` for entrance animations triggered by scroll position`,
}
