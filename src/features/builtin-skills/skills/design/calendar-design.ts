import type { BuiltinSkill } from "../../types"

export const designCalendarDesignSkill: BuiltinSkill = {
  name: "design-calendar-design",
  description: "Calendar and scheduling UI: month/week/day views, event cards, time grids, availability indicators",
  agent: "codesign",
  template: `# Design Calendar

## When to Use
Building calendar interfaces, scheduling tools, booking systems, event planners, or any date/time selection and visualization UI.

## Key Principles
Calendar UI must balance density (showing enough information) with clarity (not overwhelming users). The grid structure should be instantly recognizable. Today's date must always be visually distinct. Event cards should be scannable by title and time.

## View Types
- **Month View**: Traditional grid, 7 columns (Mon-Sun or Sun-Sat), 5-6 rows. Each cell shows date number and up to 3 event dots/indicators. Overflow indicated with "+N more".
- **Week View**: 7-column horizontal layout with time grid rows (typically 30-min intervals). Events positioned absolutely within time slots.
- **Day View**: Single-column time grid from early morning to late night. Events displayed as cards spanning their time range.
- **Agenda/List View**: Chronological list of upcoming events with date headers. Best for mobile and dense schedules.

## Event Card Design
- Color-coded by calendar/category with a left border accent
- Title in bold, time range below, location (if any) at bottom
- Minimum height proportional to duration (in time-grid views)
- Truncate long titles; show full on hover or click
- Drag handles for resizable/reschedulable events

## Color & Typography
- Today's date: prominent background circle or accent color
- Selected date: distinct highlight different from today
- Weekend columns: subtly different background shade
- Event colors: 6-8 distinguishable palette colors, with accessible text contrast
- Time labels: monospace or tabular numbers, muted color, 11-12px

## Anti-Patterns
- Overlapping events that become unreadable or unclickable
- Month-view cells too small to show any event information
- Missing "Today" button to quickly return to current date
- Timezone ambiguity—always indicate the timezone context
- No keyboard navigation for date selection

## CSS Techniques
- CSS Grid with \`grid-template-columns: repeat(7, 1fr)\` for month/week headers
- \`position: relative\` on time-grid rows with \`position: absolute\` on event cards
- \`scroll-behavior: smooth\` for month/week navigation transitions
- \`::after\` pseudo-elements for event dot indicators in month view
- \`aria-selected\`, \`aria-current="date"\` for accessible date states`,
}
