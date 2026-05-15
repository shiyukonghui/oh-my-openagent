# Multi-screen design baton

When a design spans multiple screens, pages, or states:

## DESIGN.md as the baton

DESIGN.md carries the design system across screens. Create or update it when:
- The design has 2+ distinct screens or pages
- Stable visual tokens emerge (colors, type scale, spacing, components)
- A brand reference was adopted and choices were made
- The user explicitly asks for a reusable design system

## What goes in DESIGN.md

- Color tokens with hex values and semantic names
- Typography scale with font families, sizes, weights, line heights
- Spacing scale
- Component patterns (button variants, card styles, form elements)
- Breakpoint definitions
- Shadow/elevation tokens

## Maintaining consistency

- Before creating a new screen, check if DESIGN.md has applicable tokens
- When you make a visual decision that affects 2+ screens, update DESIGN.md
- New screens should reference DESIGN.md tokens, not hard-code duplicate values
- When in doubt, prioritize consistency over one-screen perfection
