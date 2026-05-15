/**
 * Type declaration for importing .md files as text strings.
 * Supported by Bun's bundler (`with { type: "text" }` import attribute)
 * and inlines content at build time — no runtime filesystem dependency.
 */
declare module "*.md" {
  const content: string
  export default content
}
