import { describe, test, expect, mock } from "bun:test"
import { composeSystemPrompt } from "./system-prompt"

describe("composeSystemPrompt", () => {
  test("returns non-empty string", () => {
    // when
    const prompt = composeSystemPrompt()

    // then
    expect(prompt).not.toBe("")
    expect(prompt.length).toBeGreaterThan(100)
  })

  test("contains identity section content", () => {
    // when
    const prompt = composeSystemPrompt()

    // then
    expect(prompt).toContain("open-codesign")
  })

  test("contains workflow section", () => {
    // when
    const prompt = composeSystemPrompt()

    // then
    expect(prompt).toContain("workflow")
  })

  test("contains output rules", () => {
    // when
    const prompt = composeSystemPrompt()

    // then
    expect(prompt).toContain("output")
  })

  test("contains design methodology guidance", () => {
    // when
    const prompt = composeSystemPrompt()

    // then
    expect(prompt.length).toBeGreaterThan(500)
  })

  test("prompt sections are separated by double newlines", () => {
    // when
    const prompt = composeSystemPrompt()

    // then
    expect(prompt).toContain("\n\n")
  })
})

describe("composeSystemPrompt section loading", () => {
  test("loader exports all 12 sections", async () => {
    // when
    const loader = await import("./loader")

    // then
    expect(loader.IDENTITY).toBeDefined()
    expect(loader.IDENTITY).not.toBe("")

    expect(loader.WORKFLOW).toBeDefined()
    expect(loader.WORKFLOW).not.toBe("")

    expect(loader.OUTPUT_RULES).toBeDefined()
    expect(loader.OUTPUT_RULES).not.toBe("")

    expect(loader.DESIGN_METHODOLOGY).toBeDefined()
    expect(loader.DESIGN_METHODOLOGY).not.toBe("")

    expect(loader.PRE_FLIGHT).toBeDefined()
    expect(loader.PRE_FLIGHT).not.toBe("")

    expect(loader.EDITMODE_PROTOCOL).toBeDefined()
    expect(loader.EDITMODE_PROTOCOL).not.toBe("")

    expect(loader.ANTI_SLOP_DIGEST).toBeDefined()
    expect(loader.ANTI_SLOP_DIGEST).not.toBe("")

    expect(loader.SAFETY).toBeDefined()
    expect(loader.SAFETY).not.toBe("")

    expect(loader.BRAND_ACQUISITION).toBeDefined()
    expect(loader.BRAND_ACQUISITION).not.toBe("")

    expect(loader.MULTI_SCREEN_BATON).toBeDefined()
    expect(loader.MULTI_SCREEN_BATON).not.toBe("")

    expect(loader.BROWSER_PREVIEW).toBeDefined()
    expect(loader.BROWSER_PREVIEW).not.toBe("")
  })

  test("PROMPT_SECTIONS contains all section names", async () => {
    // when
    const loader = await import("./loader")

    // then
    const expectedKeys = [
      "identity",
      "workflow",
      "outputRules",
      "designMethodology",
      "preFlight",
      "editmodeProtocol",
      "tweaksProtocol",
      "antiSlopDigest",
      "safety",
      "brandAcquisition",
      "multiScreenBaton",
      "browserPreview",
    ]

    for (const key of expectedKeys) {
      expect(loader.PROMPT_SECTIONS).toHaveProperty(key)
      expect(loader.PROMPT_SECTIONS[key]).not.toBe("")
    }
  })
})
