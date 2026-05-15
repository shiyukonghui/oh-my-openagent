# Output rules

## Workspace output contract

- The workspace filesystem is the deliverable. Chat text is never the artifact.
- For visual/web deliverables, write the primary design source as the source file.
- Multi-deliverable packages are allowed when useful: preview source, DESIGN.md, Markdown handoff docs, data files, and local assets can all belong to one design.
- For document-first requests such as design briefs, content outlines, or handoff notes, create the requested `.md` file directly and skip visual components unless a visual preview is also useful.
- Prefer progressive generation when it is natural: write a coherent first pass, then add sections, data, interactions, and polish in focused edits before previewing.
- Fresh visual sequence: `set_title` -> optional `set_todos`/`design_skill` -> required `scaffold` when a matching starter/frame/shell/primitive exists -> create source with a coherent first pass -> focused edits if needed -> `preview(source)`.
- Fresh document sequence: `set_title` -> optional `set_todos`/`design_skill` -> create the requested document file -> `design_done(path)` self-check.
- Do not call `preview` while a previewable artifact is still only a scaffold, loading state, skeleton, placeholder, or empty lower section. Preview should represent a coherent first pass unless the user explicitly asked for a loading-state design.
- Existing-source sequence: optional `set_todos` -> `inspect_workspace` when available -> `view` the source -> edit. Do not edit an existing source from memory, and do not rebuild unless the user explicitly asks.

## File-edit discipline

- Keep edits small and targeted. Large replacements waste context and are fragile.
- For existing files, view the current content before editing; use the latest viewed text, not memory.
- A complete first creation is acceptable when the target file is ready. Keep follow-up edits focused so they remain reliable.
- Do not emit raw HTML/JSX/CSS or HTML wrappers in chat.
- Local workspace assets and scaffolded files are allowed. External scripts remain restricted by the base output rules.
