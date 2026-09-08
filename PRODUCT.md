# Product

## Register

product

## Context

Clinicians use the assistant alongside a clinical report to ask about findings, refine wording, and inspect supporting sources. This repository demonstrates that workflow in Storybook with sample fixtures and simulated streaming, not a clinical AI service or real patient information.

## Product Intent

Help clinicians read and refine a report without leaving their writing context or losing work. For assessment reviewers, the deliverable is a reusable component system with clear APIs and observable interactions.

## Principles

- **Keep the report primary.** Prioritize readable answers and a clear next action over decorative UI or extra controls.
- **Preserve work and control.** Keep drafts editable during generation, preserve partial answers on Stop, and retry the affected turn without discarding unrelated text. Preserve reading position by default; optional submission scrolling follows the policy in `DESIGN.md`.
- **Make state and sources clear.** Distinguish preparation, completion, failure, and interruption. Expose full source titles and selection callbacks without implying a working viewer.
- **Make interaction predictable.** Preserve keyboard access and focus through state changes. Announce transitions, not every streamed character. Support narrow widths, both themes, and reduced motion; density must not compromise readability or action targets.

## Voice

Calm, professional, and direct. The assistant is a quiet extension of the report, not a marketing surface or playful companion. Avoid promotional copy, ornamental motion, and claims of clinical certainty from fixture-backed responses.

## References

- [README.md](README.md): assessment contract, deliverables, and scope boundaries. This context adds no requirements.
- [DESIGN.md](DESIGN.md): agreed visual and interaction decisions; these take precedence over generic design-skill advice.
- [DISCLOSURE.md](DISCLOSURE.md): human decisions, AI contributions, tools, and future product ideas, not a verification log.
- The supplied screenshot and earlier AI-generated draft informed visual exploration; neither overrides the assessment contract.
