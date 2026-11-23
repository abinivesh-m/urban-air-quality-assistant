# Urban Air Quality Assistant

A GenAI-ready assistant that helps urban households navigate severe winter
smog and year-round air pollution. It surfaces air quality guidance, indoor
air hacks, sustainable alternatives with explained impact, and a carbon
footprint model — all grounded in the selected city's reading.

- **Live demo:** https://urban-air-quality-assistant-xi.vercel.app
- **Repository:** https://github.com/abinivesh-m/urban-air-quality-assistant
- **License:** MIT

## Chosen vertical

Winter smog / urban air pollution assistant for families and communities.
The persona is a household member deciding whether to exercise, send a child to
school, open windows, or run an air purifier on a given day.

## Problem

Urban pollution episodes are predictable, but the right response is not obvious.
The same AQI number demands different actions for a runner, a toddler, or a
person with asthma, and the most effective interventions (filtration, sealing,
commute choices) are spread across different apps and sources. Families are left
either over-reacting (locking everyone indoors for a week) or under-reacting
(ignoring a 285 AQI reading).

## Approach and logic

The assistant is built around a small, explicit domain model instead of a
free-form chatbot:

1. **Air quality model** (`src/lib/air-quality.ts`) maps an AQI reading onto
   the EPA bands, classifies each pollutant against its own reference limit,
   and derives a prioritised action list from the *combination* of the headline
   band and the dominant pollutant. A PM2.5 smog episode and a NO₂ traffic peak
   at the same AQI therefore produce different advice.
2. **Conversational layer** (`src/lib/assistant.ts`) scores each message against
   a curated intent table, weighting longer keyword matches more heavily so a
   specific phrase such as "air purifier" outranks a generic one such as "air".
   When a city reading is available, answers are grounded in it ("New Delhi is
   at AQI 285 — that is too high for outdoor training…").
3. **Impact model** (`src/lib/impact.ts`) converts daily habits into an annual
   CO₂ total using documented emission factors, and computes the saving from a
   set of achievable swaps, so the user sees the consequence of a choice rather
   than a vague score.
4. **GenAI provider** (`src/lib/llm.ts`) calls any OpenAI-compatible
   chat-completions endpoint when `OPENAI_API_KEY` is configured, and silently
   falls back to the rule engine otherwise. The endpoint always responds, which
   keeps the app usable in development and in CI without credentials.

## How the solution works

```
Browser ──► Next.js App Router
  ├── / (static)        renders the dashboard, tabs, calculator
  └── /api/chat (node)  ──► rate limiter (30 req / min / client)
                          ──► Zod validation (content type, shape, length)
                          ──► GenAI provider (optional) ──► fall back to
                          ──► deterministic rule engine
                          ──► JSON { reply, intent, city, source }
```

- The dashboard tab shows the selected city's AQI, a six-pollutant breakdown,
  pollutant status, health guidance and a prioritised action list.
- The assistant tab is a chat whose answers are grounded in the selected city.
- The indoor tab lists low-cost hacks (Corsi-Rosenthal box, gap sealing,
  wet mopping, a clean-air room, cooking control, plants) as accessible
  disclosures.
- The sustainable tab filters swaps by category and totals the achievable
  annual CO₂ saving.
- The impact tab is a live carbon calculator with an accessible live region.

State lives in a single client component (`page.tsx`) holding the selected city
and active tab. All other components are presentational and receive data via
props, which is what makes them unit-testable.

## Project structure

```
src/
├── app/
│   ├── api/chat/route.ts      # chat endpoint (validation, rate limit, GenAI/rules)
│   ├── globals.css            # design tokens, components, reduced-motion support
│   ├── layout.tsx             # metadata, viewport
│   └── page.tsx               # composition root
├── components/
│   ├── AirQualityPanel.tsx
│   ├── AssistantChat.tsx
│   ├── CitySelector.tsx
│   ├── Footer.tsx
│   ├── IndoorHacks.tsx
│   ├── ImpactCalculator.tsx
│   ├── PollutantGuide.tsx
│   ├── Recommendations.tsx
│   ├── SustainableAlternatives.tsx
│   ├── TabNav.tsx             # WAI-ARIA tabs with full keyboard support
│   └── content-icons.tsx      # icon-key to lucide mapping
├── lib/
│   ├── air-quality.ts         # domain model + recommendation rules
│   ├── assistant.ts           # intent scoring + contextual answers
│   ├── content.ts             # indoor hacks + sustainable alternatives
│   ├── impact.ts              # carbon maths
│   ├── llm.ts                 # optional GenAI provider layer
│   └── rate-limit.ts          # fixed-window limiter
└── test/
    ├── air-quality.test.ts
    ├── assistant.test.ts
    ├── api-chat.test.ts
    ├── components.test.tsx
    ├── impact.test.ts
    ├── llm.test.ts
    ├── rate-limit.test.ts
    └── setup.ts
```

## Tech stack

- Next.js 14 (App Router) · React 18 · TypeScript (strict)
- Tailwind CSS
- Zod for request validation
- Vitest + React Testing Library + jsdom
- lucide-react for icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run lint    # ESLint (next/core-web-vitals)
npm test        # Vitest, 157 tests
```

### GenAI configuration (optional)

Set these environment variables to route answers through a GenAI provider:

```bash
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1   # optional, any compatible gateway
OPENAI_MODEL=gpt-4o-mini                    # optional
OPENAI_TIMEOUT_MS=8000                      # optional, clamped to 30s
```

Without a key the assistant uses the deterministic rule engine, so the app
works offline and in CI.

## Assumptions and limitations

- The air quality readings are **representative sample data**, not a live feed.
  The UI labels them as such. Plugging in a real provider (e.g. OpenAQ) means
  replacing `CITIES` in `src/lib/air-quality.ts`; nothing else changes.
- The assistant is **not a medical device** and does not diagnose.
- Rate limiting is in-memory and per serverless instance; a high-traffic
  deployment should put an edge or WAF layer in front of `/api/chat`.
- The carbon factors are mid-range literature values (UK DEFRA-style) and are
  rounded for readability; they are indicative, not audited.
- Houseplants are described honestly as a supplement, not a substitute for
  filtration, because the NASA chamber results do not transfer to real rooms.

## Accessibility (WCAG 2.2 AA)

- Skip link, semantic landmarks, labelled form controls.
- WAI-ARIA tabs with roving tabindex and full keyboard support (arrows,
  Home, End).
- Category filters use `aria-pressed`; disclosures use native `<details>`.
- All text/background pairs clear 4.5:1 (verified per component).
- `aria-live` regions for the chat log and the calculator output.
- `prefers-reduced-motion` disables animations and smooth scrolling.
- Visible focus rings on every interactive element.

## Security

- Zod validation with `.strict()` rejects unknown fields.
- Content-type check, body size cap via the 500-character message limit.
- Fixed-window rate limiter keyed on the forwarded client IP.
- Security headers: Content-Security-Policy, X-Frame-Options, nosniff,
  Referrer-Policy, Permissions-Policy, HSTS, COOP.
- `poweredByHeader` disabled; no `dangerouslySetInnerHTML`.
- The API never echoes user input back in error messages.

## Efficiency

- Static prerendering of the main route; the chat route is server-rendered on
  demand.
- First Load JS 100 kB; the chat component is only hydrated with the page.
- Pure, dependency-free domain modules so the client bundle stays small.

## Testing

157 tests across seven files:

| File | Covers |
|---|---|
| `air-quality.test.ts` | AQI classification boundaries, clamping, pollutants, city lookup, recommendations |
| `assistant.test.ts` | intent mapping, fallback, contextual grounding, truncation |
| `impact.test.ts` | emission maths, clamping, savings, monotonicity |
| `rate-limit.test.ts` | windows, reset, per-key isolation, header parsing |
| `llm.test.ts` | config parsing, request shape, success/failure/malformed |
| `api-chat.test.ts` | validation, rate limiting, GenAI path and fallback |
| `components.test.tsx` | rendering, tabs, filters, calculator, chat, home page |

## Evaluation criteria mapping

| Criterion | Where it is addressed |
|---|---|
| Code Quality | Split into focused, typed modules with single responsibilities; 157 tests |
| Security | Validation, rate limiting, security headers, no input reflection |
| Efficiency | Static render, 100 kB First Load JS, pure domain modules |
| Testing | 157 tests covering units, routes, components and accessibility hooks |
| Accessibility | WCAG 2.2 AA measures listed above |
| Problem Alignment | Air quality dashboard, indoor hacks, sustainable swaps, impact calculator, contextual assistant |

## GenAI services utilised

- **OpenAI-compatible chat completions** (`src/lib/llm.ts`) — used to answer
  open-ended questions in the assistant tab, grounded in the selected city's
  reading. Optional via `OPENAI_API_KEY`; the deterministic rule engine
  (`src/lib/assistant.ts`) is the fallback, so the app works without credentials.
