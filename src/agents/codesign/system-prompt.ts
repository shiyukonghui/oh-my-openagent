/**
 * Composes the codesign agent system prompt by stitching together
 * the loaded prompt sections from `sections/*.md` files.
 *
 * The section order mirrors open-codesign's composeFull() for "create" mode.
 */
import {
  IDENTITY,
  WORKFLOW,
  OUTPUT_RULES,
  DESIGN_METHODOLOGY,
  PRE_FLIGHT,
  EDITMODE_PROTOCOL,
  ANTI_SLOP_DIGEST,
  SAFETY,
  BRAND_ACQUISITION,
  MULTI_SCREEN_BATON,
  BROWSER_PREVIEW,
} from "./loader"

export function composeSystemPrompt(): string {
  const sections: string[] = [
    IDENTITY,
    WORKFLOW,
    BROWSER_PREVIEW,
    OUTPUT_RULES,
    DESIGN_METHODOLOGY,
    PRE_FLIGHT,
    EDITMODE_PROTOCOL,
    ANTI_SLOP_DIGEST,
    BRAND_ACQUISITION,
    MULTI_SCREEN_BATON,
    SAFETY,
  ]

  return sections.filter((s) => s.length > 0).join("\n\n")
}
