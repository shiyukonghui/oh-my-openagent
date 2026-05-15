import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { createScaffoldTool } from "./index"

const TEST_DIR = join(process.cwd(), ".test-scaffold")
const SCAFFOLD_DIR = join(TEST_DIR, ".codesign", "templates", "scaffolds")

function createMockContext(directory?: string) {
  return {
    directory: directory ?? TEST_DIR,
    client: {} as never,
  }
}

function createManifest(scaffolds: Record<string, { description: string; path: string; license?: string; source?: string }>) {
  mkdirSync(SCAFFOLD_DIR, { recursive: true })
  writeFileSync(
    join(SCAFFOLD_DIR, "manifest.json"),
    JSON.stringify({ schemaVersion: 1, scaffolds }, null, 2)
  )
}

function createTemplate(relPath: string, content: string) {
  const fullPath = join(SCAFFOLD_DIR, relPath)
  mkdirSync(join(fullPath, ".."), { recursive: true })
  writeFileSync(fullPath, content)
}

describe("scaffold tool", () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true })
    }
    mkdirSync(TEST_DIR, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true })
    }
  })

  describe("#given no manifest exists", () => {
    test("#then returns manifest not found error", async () => {
      // given
      mkdirSync(SCAFFOLD_DIR, { recursive: true })
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "App.jsx" })

      // then
      expect(result).toContain("not found")
      expect(result).toContain("manifest.json")
    })
  })

  describe("#given empty kind", () => {
    test("#then returns error", async () => {
      // given
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "", destPath: "App.jsx" })

      // then
      expect(result).toContain("Error")
      expect(result).toContain("non-empty")
    })
  })

  describe("#given empty destPath", () => {
    test("#then returns error", async () => {
      // given
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "" })

      // then
      expect(result).toContain("Error")
      expect(result).toContain("non-empty")
    })
  })

  describe("#given valid manifest with template", () => {
    test("#then copies template to destination", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page template",
          path: "templates/landing.jsx",
          license: "MIT",
          source: "open-codesign",
        },
      })
      createTemplate(
        "templates/landing.jsx",
        "export default function Landing() { return <div>Hero Section</div> }"
      )
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "App.jsx" })

      // then
      expect(result).toContain("Scaffolded")
      expect(result).toContain("landing")
      expect(result).toContain("App.jsx")
      // Verify file was actually written
      expect(existsSync(join(TEST_DIR, "App.jsx"))).toBe(true)
    })

    test("#then includes license info when present", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page template",
          path: "templates/landing.jsx",
          license: "MIT",
          source: "open-codesign",
        },
      })
      createTemplate(
        "templates/landing.jsx",
        "export default function Landing() { return <div>Hero</div> }"
      )
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "App.jsx" })

      // then
      expect(result).toContain("License: MIT")
      expect(result).toContain("Source: open-codesign")
    })

    test("#then preserves source file extension", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page template",
          path: "templates/landing.jsx",
        },
      })
      createTemplate(
        "templates/landing.jsx",
        "export default function Landing() { return <div>Hero</div> }"
      )
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "App" })

      // then
      // File is written with .jsx extension even though destPath didn't specify it
      expect(existsSync(join(TEST_DIR, "App.jsx"))).toBe(true)
      // Result message uses original destPath string (without extension), not the adjusted path
      expect(result).toContain("Scaffolded landing")
    })

    test("#then creates parent directories for destination", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page template",
          path: "templates/landing.jsx",
        },
      })
      createTemplate(
        "templates/landing.jsx",
        "export default function Landing() { return <div>Hero</div> }"
      )
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "nested/deep/App.jsx" })

      // then
      expect(result).toContain("Scaffolded")
      expect(existsSync(join(TEST_DIR, "nested", "deep", "App.jsx"))).toBe(true)
    })

    test("#then shows bytes written", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page",
          path: "templates/landing.jsx",
        },
      })
      const content = "const Landing = () => <div>Hero</div>"
      createTemplate("templates/landing.jsx", content)
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "App.jsx" })

      // then
      expect(result).toContain("bytes")
    })
  })

  describe("#given unknown scaffold kind", () => {
    test("#then returns unknown kind error with available kinds", async () => {
      // given
      createManifest({
        dashboard: {
          description: "Dashboard template",
          path: "templates/dashboard.jsx",
        },
        landing: {
          description: "Landing page template",
          path: "templates/landing.jsx",
        },
      })
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "nonexistent", destPath: "App.jsx" })

      // then
      expect(result).toContain("Unknown scaffold kind")
      expect(result).toContain("Available kinds")
      expect(result).toContain("dashboard")
      expect(result).toContain("landing")
    })
  })

  describe("#given source file does not exist", () => {
    test("#then returns source-not-found error", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page",
          path: "templates/landing.jsx",
        },
      })
      // Don't create the source file
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "App.jsx" })

      // then
      expect(result).toContain("not found")
      expect(result).toContain("landing")
    })
  })

  describe("#given destination outside workspace", () => {
    test("#then returns path-outside-workspace error", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page",
          path: "templates/landing.jsx",
        },
      })
      createTemplate("templates/landing.jsx", "// content")
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "landing", destPath: "../../outside/App.jsx" })

      // then
      expect(result).toContain("outside workspace")
    })
  })

  describe("#given source path outside scaffold root", () => {
    test("#then returns path error", async () => {
      // given
      createManifest({
        dangerous: {
          description: "Dangerous template",
          path: "../../../etc/passwd",
        },
      })
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "dangerous", destPath: "App.jsx" })

      // then
      expect(result).toContain("outside root")
    })
  })

  describe("#given multiple scaffold types", () => {
    test("#then supports different template kinds", async () => {
      // given
      createManifest({
        landing: {
          description: "Landing page template",
          path: "templates/landing.jsx",
        },
        dashboard: {
          description: "Dashboard template",
          path: "templates/dashboard.jsx",
        },
        deck: {
          description: "Presentation deck",
          path: "templates/deck.jsx",
        },
      })
      createTemplate("templates/landing.jsx", "// landing")
      createTemplate("templates/dashboard.jsx", "// dashboard")
      createTemplate("templates/deck.jsx", "// deck")
      const tool = createScaffoldTool(createMockContext())

      // when
      const result = await tool.execute({ kind: "dashboard", destPath: "Dashboard.jsx" })

      // then
      expect(result).toContain("dashboard")
      const destContent = require("fs").readFileSync(
        join(TEST_DIR, "Dashboard.jsx"),
        "utf-8"
      )
      expect(destContent).toContain("// dashboard")
    })
  })
})
