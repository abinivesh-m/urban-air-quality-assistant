# Changelog

All notable changes to this project are documented here.

## [1.3.0] - 2026-11-24

### Changed
- Split `src/lib/air-quality.ts` into a focused `src/lib/air-quality/` package
  (types, categories, pollutants, cities, recommendations, format) behind a
  stable `index.ts` barrel, so no consumer import changed.
- Split the intent catalogue out of `src/lib/assistant.ts` into
  `src/lib/intents.ts`, leaving the assistant as a pure scoring engine.
- Deduplicated provider resolution in `src/lib/llm.ts` behind a provider table
  with shared timeout and base-URL helpers.
- Derived the displayed CO₂ saving from `co2SavedKg` via `formatAnnualCo2`,
  removing a second source of truth.
- Extracted a `TabPanel` component and a shared focus-ring class in `page.tsx`
  instead of repeating five near-identical panels.
- Renamed `content-icons.tsx` to `ContentIcons.tsx` for component naming
  consistency.
- Reused `AQI_SCALE_MAX` and `MAX_MESSAGE_LENGTH` instead of duplicated
  magic numbers.
- Added `findCity()` so an untrusted id resolves to its reading in one step,
  replacing the check-then-lookup pair in the route and the page.
- Exported the default city as the record itself, so reordering `CITIES` cannot
  desync it from `DEFAULT_CITY_ID`.
- Shared the kilogram-to-tonne formatting between the per-swap label and the
  tab summary instead of converting in two places.
- Labelled observed timestamps as UTC, since the sample readings carry different
  local offsets.
- Limited intent keywords to the shortest form the matcher extends, with a test
  enforcing the convention.

### Removed
- Unused `create-next-app` SVG assets from `public/`.
- Dead `eslint.config.mjs` flat config (ESLint 8 reads `.eslintrc.json`).
- The unused `src/types` barrel: nothing imported it, and it duplicated every
  domain type.

### Added
- Tests for the content catalogue, CO₂ formatting and intent-data invariants.
- `typecheck` and `test:e2e` npm scripts, used by CI and the README.

## [1.2.0] - 2026-11-23

### Added
- Google Gemini provider support (OpenAI-compatible endpoint) alongside OpenAI.
- GitHub Actions CI workflow (lint, typecheck, tests, build).
- Playwright end-to-end smoke test suite (7 specs).
- Route-level error boundary and 404 page.
- Shared type barrel (`src/types`).
- `CONTRIBUTING.md`.

### Changed
- Tightened TypeScript config (`noUnusedLocals`, `noUnusedParameters`, etc.).
- Hardened security headers (DNS prefetch, permitted cross-domain, CORP).
- Renamed `cosCO2SavedKg` to `co2SavedKg`.

### Fixed
- Removed committed `AGENTS.md` auto-generated file.
- Removed corrupted README content.

## [1.1.0] - 2026-11-23

### Added
- Modular component and library architecture.
- 157 unit and component tests.
- Optional GenAI provider layer with deterministic fallback.
- Carbon impact calculator, indoor hacks, sustainable alternatives.
- WAI-ARIA tabs with full keyboard support.

## [1.0.0] - 2026-11-22

### Added
- Initial Urban Air Quality Assistant.
