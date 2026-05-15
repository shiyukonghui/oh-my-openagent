import { describe, test, expect } from "bun:test"
import { createDesignSkillTool } from "./index"

function createMockContext(directory?: string) {
  return {
    directory: directory ?? process.cwd(),
    client: {} as never,
  }
}

describe("design_skill tool", () => {
  describe("#given built-in skill name", () => {
    test("#then returns responsive guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "responsive" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: responsive")
      expect(result).toContain("mobile-first")
      expect(result).toContain("Apply this guidance")
    })

    test("#then returns typography guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "typography" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: typography")
      expect(result).toContain("type scale")
      expect(result.toLowerCase()).toContain("line-height")
    })

    test("#then returns color guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "color" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: color")
      expect(result).toContain("60-30-10")
    })

    test("#then returns layout guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "layout" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: layout")
      expect(result).toContain("CSS Grid")
      expect(result).toContain("Flexbox")
    })

    test("#then returns animation guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "animation" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: animation")
      expect(result).toContain("prefers-reduced-motion")
    })

    test("#then returns forms guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "forms" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: forms")
      expect(result).toContain("validation")
    })

    test("#then returns dashboard guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "dashboard" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: dashboard")
      expect(result).toContain("data density")
    })

    test("#then returns landing guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "landing" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: landing")
      expect(result).toContain("Hero")
    })

    test("#then returns deck guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "deck" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: deck")
      expect(result).toContain("slide")
    })

    test("#then returns report guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "report" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: report")
      expect(result.toLowerCase()).toContain("executive summary")
    })

    test("#then returns accessibility guidance", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "accessibility" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Design Skill: accessibility")
      expect(result).toContain("WCAG")
    })
  })

  describe("#given unknown skill name", () => {
    test("#then returns not-found error with available skills list", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "nonexistent-skill" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("not found")
      expect(result).toContain("Available built-in skills")
      expect(result).toContain("responsive")
      expect(result).toContain("typography")
    })
  })

  describe("#given empty skill name", () => {
    test("#then returns error", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Error")
      expect(result).toContain("non-empty")
    })
  })

  describe("#given brand: prefix", () => {
    test("#then returns error when slug is empty", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "brand:" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("Error")
      expect(result).toContain("slug required")
    })

    test("#then returns not-found for non-existent brand", async () => {
      // given
      const tool = createDesignSkillTool(createMockContext())
      const args = { name: "brand:nonexistent-brand" }

      // when
      const result = await tool.execute(args)

      // then
      expect(result).toContain("not found")
      expect(result).toContain("brand-refs")
    })
  })
})
