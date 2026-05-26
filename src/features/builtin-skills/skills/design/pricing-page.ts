import type { BuiltinSkill } from "../../types"

export const designPricingPageSkill: BuiltinSkill = {
  name: "design-pricing-page",
  description: "Pricing page design: comparison tables, tier cards, feature matrices, FAQ sections, enterprise callouts",
  agent: "codesign",
  template: `# Design Pricing Page

## When to Use
Creating SaaS pricing pages, subscription plan comparisons, or any tiered product offering page where users compare options and make purchase decisions.

## Key Principles
Make comparison effortless. Users should instantly understand what's different between tiers. Highlight one recommended plan with visual emphasis (larger card, accent border, "Popular" badge). Remove friction—pricing pages die on confusion.

## Layout Structure
1. **Toggle**: Monthly/Annual billing switcher prominently placed above tiers
2. **Tier Cards**: 3-4 cards side-by-side on desktop, stacked on mobile; recommended tier visually elevated
3. **Feature Matrix**: Detailed comparison table below the cards for power users who want granular comparison
4. **FAQ**: Accordion section addressing pricing anxiety ("Can I cancel?", "Do you offer refunds?")
5. **Enterprise CTA**: "Need something custom?" with a contact sales link for high-touch prospects

## Color & Typography
- Recommended tier: prominent border color, slight scale-up (1.02-1.05x), or distinct background
- Price: largest text on the card, bold weight; period label ("/mo") in smaller, lighter type
- Feature checks/crosses: green checkmarks, muted crosses (never red—too aggressive)
- Strike-through pricing for discounts clearly differentiated from actual price

## Anti-Patterns
- Too many tiers (4 max for quick comprehension)
- Hidden fees or unclear pricing triggers ("Contact us" for every tier)
- Feature names that are marketing-speak instead of clear descriptions
- Missing CTA on each tier card
- Inconsistent feature listing order across tiers

## CSS Techniques
- CSS Grid with equal-height cards using \`grid-template-rows: auto 1fr auto auto\` row pattern
- \`transform: scale(1.03)\` with \`transition\` for subtle recommended-tier emphasis
- \`accent-color\` for the billing toggle switch
- \`@container\` queries to switch from horizontal cards to stacked layout
- Sticky header with CTA for long pricing pages with extensive feature matrices`,
}
