# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build (emits a single inlined HTML file via `vite-plugin-singlefile`)
- `npm run preview` — preview the built bundle

No test runner, linter, or formatter is configured. Type checking happens implicitly via `tsc` in the IDE; strict mode is on (`noUnusedLocals`, `noUnusedParameters`).

## Architecture

This is a hackathon mockup of **PetHealth** — a health-tracking app where a virtual pet mirrors the user's habits (food / sleep / water / movement / calm). The design thesis (see [planning.txt](planning.txt)) is "mirror, not judge": the pet's appearance reflects the user's state rather than scoring or shaming them.

**The entire app lives in [src/App.tsx](src/App.tsx).** That file contains:
- Type definitions (`Species`, `Mood`, `Scores`, `PetData`, `Friend`)
- Scoring logic: `overallScore` (weighted: food 35%, sleep 25%, water 20%, move 15%, calm 5%) → `getMood` thresholds → `moodMeta` colors/phrases
- The `Pet` component — an inline SVG whose visuals are driven by scores (eye openness ← sleep, bounce animation speed ← move, cracks ← low water, desaturation ← low food)
- The `App` component — onboarding flow (3 steps), main dashboard, check-in sheet, friends strip, toast. State is held in two `useState` hooks (`pet`, `onboarded`) and persisted to `localStorage` under key `pethealth:v1`.

When adding features, extend this single file unless the component genuinely needs to be shared. Don't introduce routing, state libraries, or backend calls — this is a static single-page mockup.

## Build output constraint

`vite.config.ts` uses `viteSingleFile()`, so **the production build must inline everything into one HTML file**. Avoid patterns that break inlining: dynamic imports, public-folder asset references, code splitting, or external fetches at runtime. Fonts are loaded from Google Fonts via `<link>` in [index.html](index.html) — that's fine since it's a network request, not a bundled asset.

## Conventions

- Path alias `@/*` → `src/*` (configured in both [tsconfig.json](tsconfig.json) and [vite.config.ts](vite.config.ts))
- Styling: Tailwind v4 (via `@tailwindcss/vite`, imported in [src/index.css](src/index.css)). Use the `cn()` helper in [src/utils/cn.ts](src/utils/cn.ts) when conditionally composing classes.
- Typography: `Fraunces` for display (via the `.fraunces` class defined inline in App.tsx), `Outfit` for body.
- Emojis are used intentionally as pet/UI iconography — this is a product choice, not a style slip.
