# Assistant UI Design

The assistant supports reading and refining a report within a narrow side panel. Prioritize readable answers, stable actions, and access to supporting sources. Preserve the clinician’s draft and reading position as responses arrive or change state.

## Visual hierarchy

Use the supplied semantic tokens and Source Sans 3 typography. Neutral surfaces carry the conversation, sage identifies suggestions, and red signals failed responses. Preserve the same hierarchy in light and dark themes.

Keep report context and the composer stationary while the conversation scrolls. Show the report title without a redundant `Sample` badge. Text and source titles wrap on narrow screens. Compact density reduces spacing while preserving text sizes and action targets.

Center the welcome and suggestions together to give an empty conversation a clear starting point. On short screens, allow the content to scroll from the top. Suggestions use a sage fill and visible border to read as actions; stacked, full-width buttons accommodate complete prompts without truncation.

User messages use content-sized bubbles aligned right. Assistant answers remain open on the main surface, giving longer responses more reading space. Sender labels identify authorship independently of alignment and color.

## Composer and response states

Treat the textarea and actions as one unit, with space between writing and sending. A single outer ring indicates textarea focus; Send and Stop have their own keyboard-focus indicator.

Send and Stop share a fixed button footprint, position, and active styling. Swapping only the icon avoids a layout shift when generation starts. Icon-only controls save space but lose visible labels, so provide explicit accessible names and hover hints.

- **Send:** submit the draft once and clear it for the next question. Enter sends, Shift+Enter adds a line, and IME confirmation does not submit. Suggestions send their exact prompt immediately.
- **Generation:** allow drafting while limiting generation to one response at a time. Show preparation feedback until text arrives, then let the growing answer communicate progress.
- **Stop:** retain the partial answer and any new draft. Mark the response as interrupted so it is not mistaken for a complete answer.
- **Error:** keep failure feedback attached to the affected turn. Red text and an icon make it noticeable without a large tinted surface. Neutral Retry styling keeps recovery distinct from the error itself. Retry replaces the failed response without duplicating the question or clearing the draft.

## Sources

Keep the three sample sources visible beneath the answer, with a count, type icon, and full title. This uses more space than a collapsed list but supports inspection without an additional action. Include the source type in its accessible name while avoiding a repeated visual label.

The demo exposes source selection through a callback. Its buttons demonstrate the interaction; the final product’s source viewer is outside this exercise.

## Reading position and motion

Follow incoming text while the reader remains near the bottom. Scrolling upward suspends following, including after submission by default. A down-arrow button provides an explicit return to the latest response.

The optional `autoScrollOnSubmit` setting returns to the latest turn when a new user message arrives. Editing the draft, retrying, or receiving assistant text alone does not trigger that return. Smooth return can be interrupted and becomes immediate with reduced motion.

Keep other motion limited to subtle color feedback. State changes and icon swaps are immediate.

## Accessibility

Provide meaningful labels, predictable keyboard order, and visible focus in both themes and forced-colors mode. Keep focus stable through state changes and avoid moving it into arriving answers. Announce meaningful response transitions without announcing every character. Reduced motion must preserve all information and actions.
