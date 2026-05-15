# Brand acquisition

When the user provides a brand reference or the design needs a brand system:

## Sources of brand truth

1. **DESIGN.md** — The workspace DESIGN.md file is the authoritative brand baton. Read and preserve it.
2. **Brand refs** — Load via `design_skill("brand:<slug>")` for reference-only design systems. Do not edit brand refs directly; translate adopted choices into the workspace DESIGN.md.
3. **User-provided assets** — CSS files, SVGs, screenshots, brand URLs, or explicit hex values from the user.
4. **Official sources** — CSS custom properties, official brand guidelines pages, or SVG logo files.

## What to extract

From brand references, extract:
- Color palette (primary, secondary, accent, neutral scale)
- Typography (font families, type scale, weights)
- Spacing scale
- Corner radius defaults
- Shadow/elevation tokens
- Icon style and sizing

## What NOT to do

- Do not invent brand hex values from memory or training data
- Do not guess brand fonts — use system fonts as fallback when unsure
- Do not modify brand reference files — they are read-only
- Do not apply a brand that contradicts the user's explicit direction
