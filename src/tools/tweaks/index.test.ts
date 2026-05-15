import { describe, test, expect } from "bun:test"
import { createTweaksTool } from "./index"

function createMockContext(directory?: string) {
  return {
    directory: directory ?? process.cwd(),
    client: {} as never,
  }
}

describe("tweaks tool", () => {
  describe("#given valid tweak blocks", () => {
    test("#then registers color tweak", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          {
            file: "App.jsx",
            id: "primaryColor",
            label: "Primary Color",
            type: "color",
            default: "#3b82f6",
          },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Tweaks registered: 1 control")
      expect(result).toContain("Primary Color")
      expect(result).toContain("color")
      expect(result).toContain("App.jsx#primaryColor")
    })

    test("#then registers slider tweak", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          {
            file: "App.jsx",
            id: "fontSize",
            label: "Font Size",
            type: "slider",
            min: 12,
            max: 32,
            step: 1,
            default: 16,
          },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("slider")
    })

    test("#then registers toggle tweak", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          {
            file: "App.jsx",
            id: "darkMode",
            label: "Dark Mode",
            type: "toggle",
            default: false,
          },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("toggle")
    })

    test("#then registers select tweak", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          {
            file: "App.jsx",
            id: "fontFamily",
            label: "Font Family",
            type: "select",
            values: ["Inter", "Roboto", "system-ui"],
            default: "Inter",
          },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("select")
    })

    test("#then registers text tweak", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          {
            file: "App.jsx",
            id: "heading",
            label: "Heading Text",
            type: "text",
            default: "Welcome",
          },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("text")
    })

    test("#then registers multiple tweaks", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          { file: "App.jsx", id: "primaryColor", label: "Primary Color", type: "color" },
          { file: "App.jsx", id: "fontSize", label: "Font Size", type: "slider" },
          { file: "App.jsx", id: "darkMode", label: "Dark Mode", type: "toggle" },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Tweaks registered: 3 control")
      expect(result).toContain("CSS")
    })

    test("#then output mentions CSS custom property pattern", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          { file: "App.jsx", id: "primaryColor", label: "Primary Color", type: "color" },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("--ocd-tweak")
      expect(result).toContain("TWEAK_DEFAULTS")
    })
  })

  describe("#given empty blocks array", () => {
    test("#then returns valid message (empty is valid)", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = { blocks: [] }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("No tweak controls")
    })
  })

  describe("#given missing required fields", () => {
    test("#then validates missing file", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [{ file: "", id: "test", label: "Test", type: "color" }],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("validation errors")
      expect(result).toContain("file")
    })

    test("#then validates missing id", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [{ file: "App.jsx", id: "", label: "Test", type: "color" }],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("validation errors")
      expect(result).toContain("id")
    })

    test("#then validates missing label", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [{ file: "App.jsx", id: "test", label: "", type: "color" }],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("validation errors")
      expect(result).toContain("label")
    })

    test("#then validates invalid type", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          {
            file: "App.jsx",
            id: "test",
            label: "Test",
            type: "invalid-type",
          } as never,
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("validation errors")
      expect(result).toContain("type")
    })

    test("#then validates non-object blocks", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = { blocks: [null] as never }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("validation errors")
    })

    test("#then validates multiple invalid blocks together", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          { file: "", id: "", label: "", type: "" } as never,
          { file: "ok.jsx", id: "", label: "Has label", type: "color" } as never,
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("validation errors")
    })
  })

  describe("#given valid type values", () => {
    test("#then accepts all five valid types", async () => {
      // given
      const tool = createTweaksTool(createMockContext())
      const args = {
        blocks: [
          { file: "A.jsx", id: "c", label: "Color", type: "color" },
          { file: "A.jsx", id: "s", label: "Slider", type: "slider" },
          { file: "A.jsx", id: "t", label: "Toggle", type: "toggle" },
          { file: "A.jsx", id: "sel", label: "Select", type: "select" },
          { file: "A.jsx", id: "txt", label: "Text", type: "text" },
        ],
      }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Tweaks registered: 5 control")
    })
  })
})
