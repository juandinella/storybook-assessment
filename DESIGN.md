# Assistant UI Design

## Design Intent

The assistant should feel like a quiet extension of the report. Answers are the primary content; prompts, sources, and recovery actions support reading without competing for attention.

The visual tone should be calm, professional, and restrained. Keep it approachable through readable typography, clear language, and muted colors. Avoid playful styling, decorative illustrations, whimsical copy, bouncy animations, and gamified elements. Every visual choice should support focus and clarity in clinical work.

Keep the interface predictable: actions stay in place, drafting remains available during generation, and stopping or retrying never discards unrelated work.

## Visual Hierarchy

### Surfaces and Typography

Use the existing semantic palettes without changing their colors. Neutral surfaces carry the conversation, sage distinguishes suggestions, and red is reserved for failure feedback. Maintain the same hierarchy in light and dark rather than introducing theme-specific visual treatments.

Keep Source Sans 3 with the existing system fallback. Response text has generous line height; sender labels and supporting information are smaller and quieter. Use the supplied radii and spacing scale for a consistent relationship with the surrounding interface.

### Header and Layout

The header provides compact report context. Show the report title without adding a redundant `Sample` badge or repeating information already visible in the title.

Keep the header and composer stationary while the conversation scrolls between them. On narrow screens, text and source titles wrap without horizontal overflow. Comfortable density is the default; compact density reduces spacing without shrinking text or making actions harder to target.

### Empty State

Place a short welcome close to the suggestions so the next action is immediately apparent. Avoid a large decorative introduction or excessive empty space.

Suggestions are stacked secondary buttons with a restrained sage background, visible border, and rounded corners. Full-sentence prompts wrap naturally. They should read as actionable buttons, not plain text rows or truncated pills.

### Conversation

User messages sit in quiet, content-sized bubbles aligned to the right, with a maximum width of 90%. Short questions should not stretch across the conversation.

Assistant answers remain open on the main surface. This asymmetry distinguishes a request from the longer response and avoids boxing in reading content. Sender labels make authorship explicit rather than relying on placement or color alone.

## Composer

Treat the input and its actions as one visual unit, with a 12px gap between the text area and action row.

When the text area has visible keyboard focus, show one ring around the outer composer boundary, not two competing outlines. Send and Stop retain their own focus indicator when reached by keyboard.

Send and Stop occupy the same 36 x 36px button footprint with stable position and active styling. Only the icon and action name change. This prevents layout shifts as generation starts or ends. Each action has an explicit accessible name and a native title hint to compensate for the lack of visible button text.

## Interaction Behavior

### Send

- Clicking Send or pressing Enter submits the current draft once.
- Empty or whitespace-only drafts cannot be sent.
- Shift+Enter inserts a line break. Enter used to confirm IME composition does not submit.
- After submission, the question appears in the conversation and the composer clears for the next draft.
- The assistant turn first shows `Preparing`, then replaces that feedback with the arriving text.

### Generation and Completion

- Keep the text area editable while an answer arrives. The user can prepare the next question without interrupting the current response.
- Replace Send with Stop. Enter cannot send during generation, and suggestions or Retry cannot start a concurrent response.
- Do not add a `Writing` label beside the assistant name: the growing text already communicates progress.
- When the answer finishes, restore Send in the same position and preserve any new draft.

### Stop

- Stop immediately freezes the arriving answer and preserves all text already shown.
- Show an interruption label so a partial response cannot be mistaken for a completed answer.
- If stopped before the first character, replace `Preparing` with the interruption feedback.
- Restore Send without clearing the draft or adding another conversation turn.
- Stopping is not a failure and does not receive red error styling.

### Error and Retry

Keep the failure attached to its assistant turn. Use a red icon and concise explanatory text without a tinted container; the error should be noticeable without overwhelming the conversation. Retry uses a neutral appearance and subtle hover feedback.

- A failed response leaves the composer usable. Do not present the draft itself as invalid.
- Retry restarts the failed answer in place, replacing its failure feedback with generation feedback.
- Do not repeat the user's question, append a duplicate turn, or change the current draft.
- Retry is unavailable while another response is being generated.

### Suggestions

Choosing a suggestion sends that exact prompt immediately; it does not merely populate the composer. The prompt becomes a user message and follows the same response flow as Send. Any existing draft clears when the suggestion is submitted.

## Sources

Display sources directly beneath the answer under a compact count such as `Sources (3)`. Keep the list visible: collapsing it would add an unnecessary step before inspection.

Each row combines a document, section, or note icon with the full wrapping title. Avoid a separate visual type label that repeats information and increases row height. Preserve the type in the accessible name, for example `Document: Referral letter`.

In the demo, selecting a source produces a visible textual confirmation identifying it, without opening a viewer or navigating elsewhere. This makes the interaction observable; it does not define the final product's source-inspection experience. Use buttons for these demo actions rather than links that imply a destination.

## Accessibility and Focus

- Give the panel, draft field, and conversation turns meaningful accessible names. A placeholder is not the field's only label.
- Keep keyboard order aligned with the visual reading order. Suggestions, sources, Retry, and Send/Stop are keyboard-operable controls with visible focus.
- Communicate authorship, failure, and interruption through text or accessible names, not color alone.
- Announce meaningful changes such as preparing, completion, interruption, and failure. Do not announce every streamed character or repeatedly reread the conversation.
- Do not move focus into an arriving answer. Preserve a predictable focus position when an action changes state so keyboard users do not lose their place.
- Keep source names complete for assistive technology even when their visual presentation is compact.

## Scrolling and Motion

Follow new output only while the user remains near the bottom of the conversation. If they scroll upward to read earlier content, preserve that position rather than pulling them back to the latest answer.

Use immediate scroll adjustments, not smooth auto-scroll. Avoid entrance choreography and decorative motion; feedback should come from small, stable text and icon changes. Reduced-motion preferences must not remove any information or make state changes harder to understand.
