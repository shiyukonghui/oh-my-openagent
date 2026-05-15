import { describe, test, expect } from "bun:test"
import { createCodesignAgent, CODESIGN_PROMPT_METADATA } from "./index"

describe("createCodesignAgent", () => {
  describe("#given a model string", () => {
    test("#then returns AgentConfig with mode subagent", () => {
      // given
      const model = "google/gemini-3.1-pro"

      // when
      const config = createCodesignAgent(model)

      // then
      expect(config.mode).toBe("subagent")
    })

    test("#then passes model through", () => {
      // given
      const model = "anthropic/claude-sonnet-4-6"

      // when
      const config = createCodesignAgent(model)

      // then
      expect(config.model).toBe(model)
    })

    test("#then sets temperature to 0.1", () => {
      // given
      const model = "google/gemini-3.1-pro"

      // when
      const config = createCodesignAgent(model)

      // then
      expect(config.temperature).toBe(0.1)
    })

    test("#then produces a non-empty system prompt", () => {
      // given
      const model = "google/gemini-3.1-pro"

      // when
      const config = createCodesignAgent(model)

      // then
      expect(config.prompt).toBeDefined()
      expect(config.prompt).not.toBe("")
      // System prompt should contain core sections
      expect(config.prompt).toContain("open-codesign")
    })
  })

  describe("#given factory mode property", () => {
    test("#then is set to subagent", () => {
      expect(createCodesignAgent.mode).toBe("subagent")
    })
  })

  describe("#given tool restrictions", () => {
    test("#then denies task tool via permission deny", () => {
      // given
      const model = "google/gemini-3.1-pro"

      // when
      const config = createCodesignAgent(model)

      // then
      expect(config.permission).toHaveProperty("task", "deny")
    })

    test("#then denies call_omo_agent tool via permission deny", () => {
      // given
      const model = "google/gemini-3.1-pro"

      // when
      const config = createCodesignAgent(model)

      // then
      expect(config.permission).toHaveProperty("call_omo_agent", "deny")
    })
  })

  describe("#given agent description", () => {
    test("#then includes codesign description", () => {
      // given
      const model = "google/gemini-3.1-pro"

      // when
      const config = createCodesignAgent(model)

      // then
      expect(config.description).toBeDefined()
      expect(config.description).toContain("Design-specialist")
      expect(config.description).toContain("Codesign")
    })
  })
})

describe("CODESIGN_PROMPT_METADATA", () => {
  test("has correct category", () => {
    expect(CODESIGN_PROMPT_METADATA.category).toBe("specialist")
  })

  test("has correct cost level", () => {
    expect(CODESIGN_PROMPT_METADATA.cost).toBe("EXPENSIVE")
  })

  test("has correct prompt alias", () => {
    expect(CODESIGN_PROMPT_METADATA.promptAlias).toBe("Codesign")
  })

  test("has three trigger domains", () => {
    expect(CODESIGN_PROMPT_METADATA.triggers).toHaveLength(3)
    const domains = CODESIGN_PROMPT_METADATA.triggers.map((t) => t.domain)
    expect(domains).toContain("Visual/UI Design")
    expect(domains).toContain("Brand Systems")
    expect(domains).toContain("Layout & Composition")
  })

  test("has useWhen entries covering visual design scenarios", () => {
    expect(CODESIGN_PROMPT_METADATA.useWhen.length).toBeGreaterThanOrEqual(4)
    const hasVisualArtifacts = CODESIGN_PROMPT_METADATA.useWhen.some((u) =>
      u.includes("visual")
    )
    const hasDesignMd = CODESIGN_PROMPT_METADATA.useWhen.some((u) =>
      u.includes("DESIGN.md")
    )
    const hasScaffold = CODESIGN_PROMPT_METADATA.useWhen.some((u) =>
      u.includes("Scaffold")
    )
    expect(hasVisualArtifacts).toBe(true)
    expect(hasDesignMd).toBe(true)
    expect(hasScaffold).toBe(true)
  })

  test("has avoidWhen entries excluding non-visual work", () => {
    expect(CODESIGN_PROMPT_METADATA.avoidWhen.length).toBeGreaterThanOrEqual(3)
    const hasBackend = CODESIGN_PROMPT_METADATA.avoidWhen.some((a) =>
      a.toLowerCase().includes("backend")
    )
    const hasRefactoring = CODESIGN_PROMPT_METADATA.avoidWhen.some((a) =>
      a.toLowerCase().includes("refactoring")
    )
    expect(hasBackend).toBe(true)
    expect(hasRefactoring).toBe(true)
  })

  test("has dedicatedSection with design tool and browser preview descriptions", () => {
    const section = CODESIGN_PROMPT_METADATA.dedicatedSection
    expect(section).toContain("scaffold")
    expect(section).toContain("preview")
    expect(section).toContain("design_skill")
    expect(section).toContain("design_done")
    expect(section).toContain("Kimi WebBridge")
    expect(section).toContain("webbridge.md")
  })
})
