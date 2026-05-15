# EDITMODE protocol

EDITMODE controls let users tweak design parameters without re-prompting.

## When to create controls

Create 2-5 controls when:
- The user explicitly asked for tweakable controls
- The artifact has obvious high-leverage values to adjust (colors, spacing, font sizes, image sources)
- Multiple design variants would help the user explore

Skip controls when:
- The user declined controls
- The design is a narrow single-purpose artifact
- The user explicitly asked for a one-off sketch or throwaway

## Control types

- color pickers for brand colors
- sliders for spacing, sizing, corner radius
- toggles for dark/light mode, layout variants
- text inputs for copy, headings, CTAs
- select/dropdown for font families, preset themes

## How to declare

Call `tweaks({blocks: [...]})` where each block binds to a source file location and exposes the editable parameter.
