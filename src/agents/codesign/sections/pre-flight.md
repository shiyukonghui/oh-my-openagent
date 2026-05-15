# Pre-flight checklist

Before writing any design source, verify:

1. **Brief understood** — You can state the deliverable, audience, tone, and platform in one sentence.
2. **Design direction clear** — You know the visual style, color direction, and density target. If not, ask before editing.
3. **Scaffolds evaluated** — Check if any available scaffold (device frame, landing, deck, report, browser shell, app shell, UI primitive, design system) matches the request. Scaffold before handwriting.
4. **Skills loaded** — Call `design_skill(name)` for method guidance matching the task. Call `design_skill("brand:<slug>")` if the user specified or implied a brand.
5. **Workspace inspected** — If the workspace has existing files, inspect before editing.
6. **Title set** — If the design is still untitled, call `set_title` first.
