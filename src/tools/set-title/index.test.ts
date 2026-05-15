import { describe, test, expect } from "bun:test"
import { createSetTitleTool } from "./index"

function createMockContext(directory?: string) {
  return {
    directory: directory ?? process.cwd(),
    client: {} as never,
  }
}

describe("set_title tool", () => {
  describe("#given a valid title", () => {
    test("#then returns confirmation with title", async () => {
      // given
      const tool = createSetTitleTool(createMockContext())
      const args = { title: "My Design" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Title set:")
      expect(result).toContain("My Design")
    })

    test("#then handles multi-word title", async () => {
      // given
      const tool = createSetTitleTool(createMockContext())
      const args = { title: "Dashboard Redesign v2" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Dashboard Redesign v2")
    })
  })

  describe("#given empty title", () => {
    test("#then returns error message", async () => {
      // given
      const tool = createSetTitleTool(createMockContext())
      const args = { title: "" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Error")
      expect(result).toContain("non-empty")
    })

    test("#then returns error for whitespace-only title", async () => {
      // given
      const tool = createSetTitleTool(createMockContext())
      const args = { title: "   " }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Error")
    })
  })

  describe("#given title with special characters", () => {
    test("#then accepts special characters", async () => {
      // given
      const tool = createSetTitleTool(createMockContext())
      const args = { title: "Design #2: Final (Approved)" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).not.toContain("Error")
      expect(result).toContain("Design #2: Final (Approved)")
    })
  })
})
