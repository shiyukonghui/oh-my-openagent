# Tweaks protocol

When tweak controls are requested or appropriate:

1. Identify 2-5 high-leverage parameters that materially change the design.
2. Bind each to a specific location in the source files.
3. Use meaningful labels and sensible defaults.
4. Group related controls logically.
5. Call `tweaks()` before `design_done()`.

Good tweak candidates:
- Primary brand color → changes accent throughout
- Heading font size → adjusts visual hierarchy
- Card corner radius → changes feel from technical to friendly
- Hero image source → swap imagery without code
- CTA button text → test different calls to action
