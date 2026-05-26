import type { BuiltinSkill } from "../../types"

export const designFooterDesignSkill: BuiltinSkill = {
  name: "design-footer-design",
  description: "Footer design patterns: multi-column site maps, newsletter signups, social links, legal disclaimers",
  agent: "codesign",
  template: `# Design Footer

## When to Use
Designing website footers that serve as the terminal navigation hub—the last place users look when they can't find what they need.

## Key Principles
The footer is a utility, not a hero. Organize links into clear categories. Users scan footers when lost—make navigation obvious, not clever. A well-designed footer signals trust and completeness.

## Layout Structure
- **Top Row**: 3-5 column layout—Logo/brand + description, Product links, Company links, Resources, Legal
- **Middle Row** (optional): Newsletter signup form inline with social media icons
- **Bottom Row**: Copyright, legal links (Privacy, Terms, Cookies), language/region selector
- On mobile: single column with collapsible accordion sections for each link group

## Color & Typography
- Darker than the page background to visually anchor the page bottom
- Heading labels in uppercase, small size (11-12px), medium weight, letter-spacing
- Link color: slightly muted compared to body links; clear hover state
- Copyright text: smallest type on page, but still meeting accessibility minimums

## Anti-Patterns
- Dumping every page link into the footer—curate to essential navigation
- Tiny, unreadable link text buried in dense columns
- Missing hover/focus states on links
- Social icons without accessible labels
- Newsletter form without clear privacy reassurance

## CSS Techniques
- CSS Grid with \`grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))\` for responsive columns
- \`<details>\` / \`<summary>\` elements for mobile accordion sections (no JS needed)
- \`gap\` for consistent spacing between columns and sections
- Subtle top border (\`border-top: 1px solid\`) to separate footer from page content
- \`aria-label\` on social icon links and navigation \`<nav>\` elements`,
}
