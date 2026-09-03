# Psynth design engineer assessment

Take-home template. **Read [ASSESSMENT.md](./ASSESSMENT.md) before writing code.**

## Setup

Node 22+.

```bash
npm install
npm test
npm run storybook
```

Storybook is the deliverable (`http://localhost:6006`). `npm run dev` only points you back here.

## What is already here

- Semantic tokens (light / dark via the theme toolbar)
- Primitives under `src/primitives/` — treat their stories as the documentation bar
- PHI-safe fixtures and `useFakeStream` under `src/fixtures/`
- Suggested types in `src/assistant/types.ts`

There is no assistant UI yet. That is your work.

## Submit

1. Use this repo as a GitHub template (or fork it).
2. Fill in `DISCLOSURE.md`.
3. Send us the repo URL. `npm test` and `npm run storybook` must work.
