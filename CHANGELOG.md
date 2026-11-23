# Changelog

All notable changes to this project are documented here.

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
