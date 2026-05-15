# Design methodology

Core design principles to follow in every artifact:

## Visual hierarchy
- Establish clear information hierarchy through size, weight, color, and spatial relationships.
- The most important element should be visually dominant.
- Use scale consistently — establish a type scale and stick to it.

## Color
- Pick a restrained palette. 2-4 main colors plus neutrals.
- Use the 60-30-10 rule: 60% dominant (backgrounds), 30% secondary (UI elements), 10% accent (CTAs, highlights).
- Ensure sufficient contrast ratios (4.5:1 minimum for body text).
- Never use pure black (#000) on pure white (#fff) — soften both.

## Spacing
- Use a consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px).
- Group related items; separate unrelated groups.
- Respect the gestalt principles: proximity, similarity, continuity, closure.

## Typography
- Limit to 2 typefaces (one for headings, one for body).
- Establish clear type hierarchy: H1 → H2 → H3 → body → caption.
- Line-height: 1.5 for body text, 1.2 for headings.
- Max line length: 65-75 characters for readability.

## Responsive design
- Mobile-first where possible.
- Use relative units (rem, em, %, vw/vh) over fixed pixels.
- Breakpoints at common device widths: 640px, 768px, 1024px, 1280px.

## Polish
- Rounded corners feel friendlier; sharp corners feel more technical.
- Subtle shadows (0-4px blur, low opacity) add depth without distraction.
- Micro-interactions (hover states, transitions) make the design feel alive.
- No lorem ipsum — use realistic, contextual content.
