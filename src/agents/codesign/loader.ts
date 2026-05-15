/**
 * Loads codesign prompt section text from co-located `sections/*.md` files.
 *
 * Each section lives as its own `.md` file so PR diffs and git blame read
 * cleanly. Content is inlined at build time via Bun's text import attribute
 * (`with { type: "text" }`) — zero runtime filesystem dependency and zero
 * filesystem churn in production builds.
 *
 * At dev time (`bun` / `bun test` direct execution), Bun resolves the
 * imports from disk automatically.
 *
 * This loader follows the same section naming convention used by
 * open-codesign's prompt section loader, enabling direct file sync
 * when upstream updates.
 */
import identity from "./sections/identity.md" with { type: "text" }
import workflow from "./sections/workflow.md" with { type: "text" }
import outputRules from "./sections/output-rules.md" with { type: "text" }
import designMethodology from "./sections/design-methodology.md" with { type: "text" }
import preFlight from "./sections/pre-flight.md" with { type: "text" }
import editmodeProtocol from "./sections/editmode-protocol.md" with { type: "text" }
import tweaksProtocol from "./sections/tweaks-protocol.md" with { type: "text" }
import antiSlopDigest from "./sections/anti-slop-digest.md" with { type: "text" }
import safety from "./sections/safety.md" with { type: "text" }
import brandAcquisition from "./sections/brand-acquisition.md" with { type: "text" }
import multiScreenBaton from "./sections/multi-screen-baton.md" with { type: "text" }
import browserPreview from "./sections/browser-preview.md" with { type: "text" }

function stripTrailingNewline(raw: string): string {
  return raw.endsWith("\n") ? raw.slice(0, -1) : raw
}

export const IDENTITY = stripTrailingNewline(identity)
export const WORKFLOW = stripTrailingNewline(workflow)
export const OUTPUT_RULES = stripTrailingNewline(outputRules)
export const DESIGN_METHODOLOGY = stripTrailingNewline(designMethodology)
export const PRE_FLIGHT = stripTrailingNewline(preFlight)
export const EDITMODE_PROTOCOL = stripTrailingNewline(editmodeProtocol)
export const TWEAKS_PROTOCOL = stripTrailingNewline(tweaksProtocol)
export const ANTI_SLOP_DIGEST = stripTrailingNewline(antiSlopDigest)
export const SAFETY = stripTrailingNewline(safety)
export const BRAND_ACQUISITION = stripTrailingNewline(brandAcquisition)
export const MULTI_SCREEN_BATON = stripTrailingNewline(multiScreenBaton)
export const BROWSER_PREVIEW = stripTrailingNewline(browserPreview)

export const PROMPT_SECTIONS: Record<string, string> = {
  identity: IDENTITY,
  workflow: WORKFLOW,
  outputRules: OUTPUT_RULES,
  designMethodology: DESIGN_METHODOLOGY,
  preFlight: PRE_FLIGHT,
  editmodeProtocol: EDITMODE_PROTOCOL,
  tweaksProtocol: TWEAKS_PROTOCOL,
  antiSlopDigest: ANTI_SLOP_DIGEST,
  safety: SAFETY,
  brandAcquisition: BRAND_ACQUISITION,
  multiScreenBaton: MULTI_SCREEN_BATON,
  browserPreview: BROWSER_PREVIEW,
}

export const PROMPT_SECTION_FILES: Record<keyof typeof PROMPT_SECTIONS, string> = {
  identity: "sections/identity.md",
  workflow: "sections/workflow.md",
  outputRules: "sections/output-rules.md",
  designMethodology: "sections/design-methodology.md",
  preFlight: "sections/pre-flight.md",
  editmodeProtocol: "sections/editmode-protocol.md",
  tweaksProtocol: "sections/tweaks-protocol.md",
  antiSlopDigest: "sections/anti-slop-digest.md",
  safety: "sections/safety.md",
  brandAcquisition: "sections/brand-acquisition.md",
  multiScreenBaton: "sections/multi-screen-baton.md",
  browserPreview: "sections/browser-preview.md",
}
