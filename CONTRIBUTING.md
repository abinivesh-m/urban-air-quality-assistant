# Contributing

Thanks for your interest in the Urban Air Quality Assistant.

## Development setup

```bash
npm install
npm run dev
```

## Quality gates

All of these must pass before a pull request is merged:

```bash
npm run lint        # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit, strict TypeScript
npm test            # 181 unit and component tests
npm run build       # production build
npm run test:e2e    # end-to-end smoke tests
```

The same checks run in CI (`.github/workflows/ci.yml`).

## Project conventions

- **TypeScript strict mode** is on. Avoid `any`; prefer narrow types and `readonly`.
- **Pure domain logic** lives in `src/lib/*` and must stay framework-free so it
  can be unit-tested directly.
- **Components** are presentational and receive data via props.
- **Accessibility**: every interactive element needs a visible focus ring,
  a text label, and keyboard support. Aim for WCAG 2.2 AA.
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `docs:`, …).

## Adding a city

Add an entry to `CITIES` in `src/lib/air-quality/cities.ts`. The dashboard,
recommendations and assistant pick it up automatically.

## Adding a chat intent

Add an entry to `INTENTS` in `src/lib/intents.ts` with keywords and an answer
function, then add a test in `src/test/assistant.test.ts`. List each keyword in
its shortest usable form — the matcher also accepts longer words that start with
it.
