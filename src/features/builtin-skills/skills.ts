import type { BuiltinSkill } from "./types"
import type { BrowserAutomationProvider } from "../../config/schema"

import {
  playwrightSkill,
  agentBrowserSkill,
  playwrightCliSkill,
  frontendUiUxSkill,
  gitMasterSkill,
  devBrowserSkill,
  reviewWorkSkill,
  aiSlopRemoverSkill,
  teamModeSkill,
  designSlidesSkill,
  designDashboardSkill,
  designLandingPageSkill,
  designSvgChartsSkill,
  designGlassmorphismSkill,
  designEditorialSkill,
  designHeroSectionSkill,
  designPricingPageSkill,
  designFooterDesignSkill,
  designChatUiSkill,
  designDataTableSkill,
  designCalendarDesignSkill,
} from "./skills/index"

export interface CreateBuiltinSkillsOptions {
  browserProvider?: BrowserAutomationProvider
  disabledSkills?: Set<string>
  teamModeEnabled?: boolean
  currentAgent?: string
}

export function createBuiltinSkills(options: CreateBuiltinSkillsOptions = {}): BuiltinSkill[] {
  const { browserProvider = "playwright", disabledSkills, teamModeEnabled = false, currentAgent } = options

  let browserSkill: BuiltinSkill
	if (browserProvider === "agent-browser") {
		browserSkill = agentBrowserSkill
	} else if (browserProvider === "dev-browser") {
		browserSkill = devBrowserSkill
	} else if (browserProvider === "playwright-cli") {
		browserSkill = playwrightCliSkill
	} else {
		browserSkill = playwrightSkill
	}

	const skills = [
		browserSkill,
		frontendUiUxSkill,
		gitMasterSkill,
		reviewWorkSkill,
		aiSlopRemoverSkill,
		designSlidesSkill,
		designDashboardSkill,
		designLandingPageSkill,
		designSvgChartsSkill,
		designGlassmorphismSkill,
		designEditorialSkill,
		designHeroSectionSkill,
		designPricingPageSkill,
		designFooterDesignSkill,
		designChatUiSkill,
		designDataTableSkill,
		designCalendarDesignSkill,
	]

  if (teamModeEnabled && !disabledSkills?.has("team-mode")) {
    skills.push(teamModeSkill)
  }

  let result = skills

  if (currentAgent) {
    result = result.filter((skill) => !skill.agent || skill.agent === currentAgent)
  }

  if (!disabledSkills) {
    return result
  }

  return result.filter((skill) => !disabledSkills.has(skill.name))
}
