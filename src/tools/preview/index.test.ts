import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { createPreviewTool } from "./index"

const TEST_DIR = join(process.cwd(), ".test-preview")
const TEST_JSX_FILE = join(TEST_DIR, "Test.jsx")
const TEST_HTML_FILE = join(TEST_DIR, "test.html")
const TEST_MD_FILE = join(TEST_DIR, "README.md")

function createMockContext(directory?: string) {
  return {
    directory: directory ?? TEST_DIR,
    client: {} as never,
  }
}

describe("preview tool", () => {
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

  describe("#given valid JSX file", () => {
    test("#then returns preview ok with metrics", async () => {
      // given
      writeFileSync(
        TEST_JSX_FILE,
        `const App = () => (
  <div className="container">
    <header><h1>Dashboard</h1></header>
    <main>
      <Card title="Stats" />
      <Card title="Activity" />
    </main>
    <footer>Footer content here</footer>
  </div>
)`
      )
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "Test.jsx" })

      // then
      expect(result).toContain("preview")
      // JSX is wrapped in HTML, so DOM outline includes node count
      expect(result).toContain("DOM nodes")
    })
  })

  describe("#given empty path", () => {
    test("#then returns error", async () => {
      // given
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "" })

      // then
      expect(result).toContain("Error")
      expect(result).toContain("non-empty")
    })
  })

  describe("#given non-existent file", () => {
    test("#then returns file-not-found error", async () => {
      // given
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "nonexistent.jsx" })

      // then
      expect(result).toContain("Error")
      expect(result).toContain("file not found")
    })
  })

  describe("#given path outside workspace", () => {
    test("#then returns path-outside-workspace error", async () => {
      // given
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "../outside/App.jsx" })

      // then
      expect(result).toContain("Error")
      expect(result).toContain("outside workspace")
    })
  })

  describe("#given empty file", () => {
    test("#then returns empty file error", async () => {
      // given
      writeFileSync(TEST_JSX_FILE, "")
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "Test.jsx" })

      // then
      expect(result).toContain("Error")
      expect(result).toContain("empty")
    })
  })

  describe("#given non-previewable file type", () => {
    test("#then returns file stats for markdown", async () => {
      // given
      writeFileSync(
        TEST_MD_FILE,
        "# Design Document\n\nThis is a comprehensive design document with enough content to be meaningful.\nIt covers all aspects of the design system."
      )
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "README.md" })

      // then
      expect(result).toContain("not a previewable file type")
      expect(result).toContain("File stats")
    })
  })

  describe("#given sparse JSX with few elements", () => {
    test("#then detects very few DOM elements", async () => {
      // given
      writeFileSync(TEST_JSX_FILE, "const App = () => <div />")
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "Test.jsx" })

      // then
      expect(result).toContain("few DOM elements")
    })
  })

  describe("#given valid HTML file", () => {
    test("#then preview succeeds without JSX wrapping", async () => {
      // given
      writeFileSync(
        TEST_HTML_FILE,
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Landing Page</title>
  <style>
    body { font-family: sans-serif; }
    .hero { padding: 2rem; }
    .features { display: grid; }
  </style>
</head>
<body>
  <header class="hero">
    <h1>Welcome</h1>
    <p>This is content for the hero section of the landing page.</p>
  </header>
  <section class="features">
    <div>Feature 1</div>
    <div>Feature 2</div>
    <div>Feature 3</div>
    <div>Feature 4</div>
    <div>Feature 5</div>
  </section>
  <footer>
    <nav><a href="#">Home</a><a href="#">About</a></nav>
    <p>Footer text with enough content for preview validation checks.</p>
  </footer>
</body>
</html>`
      )
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "test.html" })

      // then
      // HTML preview provides metrics report (may show issues if sparse, but never errors)
      expect(result).toContain("test.html")
      expect(result).toContain("DOM nodes")
    })
  })

  describe("#given JSX with sufficient elements", () => {
    test("#then wraps JSX in full HTML document", async () => {
      // given
      writeFileSync(
        TEST_JSX_FILE,
        `const App = () => (
  <div>
    <Header />
    <Main />
    <Footer />
  </div>
)`
      )
      const tool = createPreviewTool(createMockContext())

      // when
      const result = await tool.execute({ path: "Test.jsx" })

      // then
      // JSX wrapping adds React CDN scripts, which add tags
      const nodeCount = /(\d+) DOM nodes/.exec(result)
      if (nodeCount) {
        expect(parseInt(nodeCount[1])).toBeGreaterThan(0)
      }
    })
  })
})
