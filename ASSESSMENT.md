# Assessment brief

Timebox: **6–8 hours**. Stop at 8. Three solid required stories beat eight half-finished ones. A note in the README that you stopped at 8 hours is not penalized for work outside this contract.

## Product

You are designing the **assistant panel** for a clinical reporting app. A clinician is inside a report (for example a neuropsychological evaluation) and talks to an assistant to ask questions, request a rewrite of a section, or inspect sources for the case.

The panel sits beside the editor: **about 420px wide**, viewport height.

> As a clinician, I want to ask the assistant to clarify a finding or rewrite a section, watch the answer arrive, and retry if it fails — without leaving the report.

Do not reproduce a production screenshot. There isn't one in this repo. Propose the look and the API inside the tokens and primitives we shipped.

## What to build

Export these from `src/assistant/index.ts`:

| Component | Role |
| --- | --- |
| `AssistantPanel` | Shell: header + thread + composer. **Controlled** props only. |
| `AssistantMessage` | One turn: user vs assistant, streaming, error, citations. |
| `Composer` | Input + send / stop. Disabled state matches status. |
| `SuggestionChips` | Empty-state prompts; choosing one is a submit path. |

You may add helpers (`CitationList`, `RetryBanner`, …). Reviewers only require the four.

Suggested types live in `src/assistant/types.ts`. You may extend them. Do not drop `user` / `assistant` or the status values.

`AssistantPanel` is controlled. Equivalent prop names are fine if the behavior matches:

- `messages`
- `status` (`idle` | `streaming` | `error`)
- `value` / `onValueChange`
- `onSubmit` / `onStop`
- `onRetry(messageId)`
- `onSuggestionSelect(prompt)`
- `onCitationClick(citation)`

No global store. Mock streaming with `useFakeStream` from `src/fixtures` or your own equivalent.

## Required Storybook stories

Titles are fixed so we can compare submissions:

| Title | Shows |
| --- | --- |
| `Assistant/Panel/Empty` | Welcome + suggestion chips, no history |
| `Assistant/Panel/Streaming` | Assistant text growing; composer in stop / disabled |
| `Assistant/Panel/Error` | Failed turn + retry; composer usable |
| `Assistant/Panel/WithCitations` | Answer with clickable sources (`document` / `section` / `note`) |
| `Assistant/Panel/DenseThread` | 8–12 messages, scroll, layout holds |

Each story: autodocs, a short “when to use this”, and at least one useful control. Stories for Message / Composer / Chips are expected; their titles are not locked.

Use the primitives’ stories as the documentation bar.

## Tests you must add

`npm test` must stay green. Add tests under `src/assistant/` that cover:

1. **Composer** — submit via click and via Enter; while `status="streaming"`, show stop and do not submit.
2. **SuggestionChips** — activating a chip calls `onSuggestionSelect` with that prompt.
3. **Error retry** — retry calls `onRetry` with the failed message id.
4. **Role** — assistant vs user is exposed to assistive tech (accessible name / role, not color alone).

Reuse `src/fixtures`. Do not invent real patient data.

We do not require Storybook play functions, Chromatic, or E2E.

## Constraints

- Tokens and primitives from this template. Compose them. Do not install another design system.
- PHI-safe: only sample fixtures. Copy and `aria` must not pretend to be a real patient.
- Keyboard, visible focus, `prefers-reduced-motion`.
- Light and dark (theme toolbar).
- AI tools are allowed. Fill `DISCLOSURE.md`.

## Out of scope

Backend, auth, persistence, microphone, a markdown editor, apply-to-document, prompt library. Extra features do not score above the required stories and tests.

## How we look at it

We run `npm test`, then the five stories, then `DISCLOSURE.md` and `src/assistant/index.ts`. About 20–30 minutes.
