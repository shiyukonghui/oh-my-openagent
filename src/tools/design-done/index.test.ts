import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { createDesignDoneTool } from "./index"

const TEST_DIR = join(process.cwd(), ".test-design-done")
const TEST_FILE = join(TEST_DIR, "App.jsx")
const TEST_HTML_FILE = join(TEST_DIR, "index.html")

function createMockContext(directory?: string) {
  return {
    directory: directory ?? TEST_DIR,
    client: {} as never,
  }
}

describe("design_done tool", () => {
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
    test("#then returns ok when file passes validation", async () => {
      // given
      const jsxContent = `
const App = () => {
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>This is a real application with meaningful content for the user interface.</p>
    </div>
  )
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
`
      writeFileSync(TEST_FILE, jsxContent)
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("design_done ok")
      expect(result).toContain("App.jsx passes validation")
    })
  })

  describe("#given empty path", () => {
    test("#then returns error", async () => {
      // given
      const tool = createDesignDoneTool(createMockContext())

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
      const tool = createDesignDoneTool(createMockContext())

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
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "../outside/App.jsx" })

      // then
      expect(result).toContain("Error")
      expect(result).toContain("outside workspace")
    })
  })

  describe("#given JSX file with HTML boilerplate", () => {
    test("#then detects <!doctype>", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        '<!doctype html><script>ReactDOM.createRoot(document.getElementById("root")).render(<App />)</script>'
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("error")
      expect(result).toContain("<!doctype>")
    })

    test("#then detects <html> tag", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        '<html><body><script>ReactDOM.createRoot(document.getElementById("root")).render(<App />)</script></body></html>'
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("<html>")
    })

    test("#then detects <head> tag", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        '<head></head><script>ReactDOM.createRoot(document.getElementById("root")).render(<App />)</script>'
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("<head>")
    })

    test("#then detects <body> tag", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        '<body><script>ReactDOM.createRoot(document.getElementById("root")).render(<App />)</script></body>'
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("<body>")
    })
  })

  describe("#given JSX missing ReactDOM.createRoot", () => {
    test("#then detects missing createRoot", async () => {
      // given
      writeFileSync(TEST_FILE, "const App = () => <div>Hello</div>")
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("ReactDOM.createRoot")
    })
  })

  describe("#given JSX file with lorem ipsum", () => {
    test("#then detects lorem ipsum placeholder", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        "const App = () => <div>Lorem ipsum dolor sit amet</div>\nReactDOM.createRoot(document.getElementById('root')).render(<App />)"
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("lorem ipsum")
    })
  })

  describe("#given JSX file with Babel CDN reference", () => {
    test("#then detects type=text/babel", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        'const App = () => <div>Content</div>\n<script type="text/babel">ReactDOM.createRoot(document.getElementById("root")).render(<App />)</script>'
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("text/babel")
    })
  })

  describe("#given nearly empty file", () => {
    test("#then detects sparse content", async () => {
      // given
      writeFileSync(TEST_FILE, "<div/>")
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("empty")
    })
  })

  describe("#given valid HTML file", () => {
    test("#then returns ok when HTML passes validation", async () => {
      // given
      writeFileSync(
        TEST_HTML_FILE,
        "<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Real content for the page</h1></body></html>"
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "index.html" })

      // then
      expect(result).toContain("design_done ok")
    })

    test("#then detects missing title in HTML", async () => {
      // given
      writeFileSync(
        TEST_HTML_FILE,
        "<!DOCTYPE html><html><head></head><body><h1>Real content for the page</h1></body></html>"
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "index.html" })

      // then
      expect(result).toContain("<title>")
    })

    test("#then detects lorem ipsum in HTML", async () => {
      // given
      writeFileSync(
        TEST_HTML_FILE,
        "<!DOCTYPE html><html><head><title>Test</title></head><body>Lorem ipsum dolor sit amet</body></html>"
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "index.html" })

      // then
      expect(result).toContain("lorem ipsum")
    })
  })

  describe("#given unrecognized file type", () => {
    test("#then checks only for empty content", async () => {
      // given
      const mdFile = join(TEST_DIR, "README.md")
      writeFileSync(mdFile, "# Design System\n\nThis is a design document.")
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "README.md" })

      // then
      expect(result).toContain("design_done ok")
    })

    test("#then detects empty file for unrecognized type", async () => {
      // given
      const mdFile = join(TEST_DIR, "README.md")
      writeFileSync(mdFile, "")
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "README.md" })

      // then
      expect(result).toContain("empty")
    })
  })

  describe("#given CDN scripts", () => {
    test("#then warns on cloudflare CDN without exact version", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        'import { something } from "https://cdnjs.cloudflare.com/ajax/libs/react/18.0.0/umd/react.production.min.js"\nconst App = () => <div>Content with enough meaningful text for the component to pass basic validation checks</div>\nReactDOM.createRoot(document.getElementById(\'root\')).render(<App />)'
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("CDN scripts")
    })
  })

  describe("#given multiple errors", () => {
    test("#then reports all errors", async () => {
      // given
      writeFileSync(
        TEST_FILE,
        "<!doctype html>\n<head><title>Test</title></head>\n<body>\nLorem ipsum dolor sit amet\n</body>"
      )
      const tool = createDesignDoneTool(createMockContext())

      // when
      const result = await tool.execute({ path: "App.jsx" })

      // then
      expect(result).toContain("error(s)")
      // Should have at least: doctype, head, body, lorem ipsum
      const lines = result.split("\n").filter((l) => l.startsWith("-"))
      expect(lines.length).toBeGreaterThanOrEqual(4)
    })
  })
})
