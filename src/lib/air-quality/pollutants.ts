/**
 * Per-pollutant reference limits and display metadata.
 */

import type { PollutantKey, Severity } from "./types";

/**
 * `elevated` marks the level above which a pollutant is worth calling out;
 * `high` marks the level that drives the strongest behavioural advice.
 */
export const POLLUTANT_LIMITS: Readonly<
  Record<PollutantKey, { readonly elevated: number; readonly high: number }>
> = {
  pm25: { elevated: 35, high: 55 },
  pm10: { elevated: 50, high: 150 },
  no2: { elevated: 40, high: 100 },
  o3: { elevated: 100, high: 160 },
  co: { elevated: 4, high: 9 },
};

export const POLLUTANT_META: Readonly<
  Record<
    PollutantKey,
    { readonly label: string; readonly unit: string; readonly blurb: string }
  >
> = {
  pm25: {
    label: "PM2.5",
    unit: "µg/m³",
    blurb: "Fine particles that reach deep into the lungs and bloodstream.",
  },
  pm10: {
    label: "PM10",
    unit: "µg/m³",
    blurb: "Coarse dust and smoke that irritate the upper airways.",
  },
  no2: {
    label: "NO₂",
    unit: "ppb",
    blurb: "Traffic and combustion emissions; an airway irritant.",
  },
  o3: {
    label: "O₃",
    unit: "ppb",
    blurb: "Ground-level ozone, usually worst on hot sunny afternoons.",
  },
  co: {
    label: "CO",
    unit: "mg/m³",
    blurb: "Carbon monoxide from incomplete combustion.",
  },
};

/** Classify a single pollutant reading against its reference limits. */
export function pollutantSeverity(
  key: PollutantKey,
  value: number,
): Severity {
  const limit = POLLUTANT_LIMITS[key];
  if (value > limit.high) return "high";
  if (value > limit.elevated) return "elevated";
  return "low";
}

/**
 * Display order for the pollutant breakdown, most health-relevant first.
 * Shared so the dashboard and the glossary can never disagree.
 */
export const POLLUTANT_ORDER: readonly PollutantKey[] = [
  "pm25",
  "pm10",
  "no2",
  "o3",
  "co",
];
