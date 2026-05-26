import type { BuiltinSkill } from "../../types"

export const designChatUiSkill: BuiltinSkill = {
  name: "design-chat-ui",
  description: "Chat interface patterns: message bubbles, typing indicators, input bars, sidebar conversations, avatars",
  agent: "codesign",
  template: `# Design Chat UI

## When to Use
Building messaging interfaces, AI chat UIs, customer support widgets, comment threads, or any real-time conversational experience.

## Key Principles
Conversation flow is paramount—scrolling must feel natural and never lose the user's place. Message alignment (sent vs. received) must be instantly distinguishable. The input area should always be accessible without scrolling.

## Layout Structure
- **Sidebar** (optional): Conversation list with avatars, last message preview, timestamps, and search
- **Message Area**: Scrollable message list that auto-scrolls to bottom on new messages; loads older messages on scroll-up
- **Input Bar**: Fixed at bottom, containing text input, send button, and optional attachment/emoji buttons
- **Typing Indicator**: Animated dots below the last received message

## Message Bubble Patterns
- Sent messages: right-aligned, brand color or darker shade, rounded corners with bottom-right sharp
- Received messages: left-aligned, light gray or neutral shade, rounded corners with bottom-left sharp
- System messages: centered, muted style, smaller text
- Message groups: consecutive messages from same sender merge visually (no repeated avatar, tighter spacing)

## Color & Typography
- Sent bubble: brand primary or user-specific color
- Received bubble: subtle gray (#f0f0f0 or similar) with dark text
- Timestamps: small, muted, appearing on hover or between message groups
- Input area: distinct background to separate from message area

## Anti-Patterns
- Messages that look identical regardless of sender
- Input bar that scrolls away when messages fill the viewport
- Missing scroll-to-bottom button when user scrolls up to read history
- No loading/empty states for the message list

## CSS Techniques
- \`flex-direction: column-reverse\` or scroll anchoring for natural bottom-aligned message flow
- \`overflow-anchor: auto\` on the scroll container for stable scroll position
- \`<form>\` element for the input bar to support native Enter-to-send
- \`@keyframes\` bouncing dots for typing indicator animation
- \`scroll-behavior: smooth\` for programmatic scroll-to-bottom`,
}
