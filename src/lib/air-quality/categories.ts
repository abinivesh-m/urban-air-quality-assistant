/**
 * AQI banding.
 *
 * Maps a raw index value onto the US EPA category, its human label and the
 * Tailwind tokens the UI renders — so presentation never re-derives colour
 * from a number.
 */

import type { AqiClassification } from "./types";

export const AQI_SCALE_MAX = 500;

interface CategoryRule extends AqiClassification {
  /** Inclusive upper bound of the band on the AQI scale. */
  readonly max: number;
}

/**
 * Ordered ascending; the first rule whose `max` is not exceeded wins.
 */
const CATEGORY_RULES: readonly CategoryRule[] = [
  {
    max: 50,
    category: "good",
    label: "Good",
    advice: "Air quality is satisfactory. Outdoor activity is safe for everyone.",
    badgeClass: "badge-good",
    textClass: "text-emerald-700",
    accentClass: "bg-emerald-600",
  },
  {
    max: 100,
    category: "moderate",
    label: "Moderate",
    advice:
      "Air quality is acceptable. Unusually sensitive people should consider limiting long outdoor exertion.",
    badgeClass: "badge-moderate",
    textClass: "text-amber-700",
    accentClass: "bg-amber-500",
  },
  {
    max: 150,
    category: "unhealthy-sensitive",
    label: "Unhealthy for Sensitive Groups",
    advice:
      "Sensitive groups (children, older adults, asthma, heart conditions) should reduce prolonged outdoor exertion.",
    badgeClass: "badge-unhealthy",
    textClass: "text-orange-800",
    accentClass: "bg-orange-500",
  },
  {
    max: 200,
    category: "unhealthy",
    label: "Unhealthy",
    advice:
      "Everyone may begin to feel effects. Sensitive groups should avoid outdoor exertion; others should limit it.",
    badgeClass: "badge-very-unhealthy",
    textClass: "text-red-700",
    accentClass: "bg-red-600",
  },
  {
    max: 300,
    category: "very-unhealthy",
    label: "Very Unhealthy",
    advice:
      "Health alert. Everyone should avoid outdoor exertion and keep windows closed with filtration running.",
    badgeClass: "badge-very-unhealthy",
    textClass: "text-red-800",
    accentClass: "bg-red-700",
  },
  {
    max: AQI_SCALE_MAX,
    category: "hazardous",
    label: "Hazardous",
    advice:
      "Emergency conditions. Remain indoors, seal gaps, run an air purifier, and avoid all outdoor exertion.",
    badgeClass: "badge-very-unhealthy",
    textClass: "text-purple-800",
    accentClass: "bg-purple-700",
  },
];

const FALLBACK_CLASSIFICATION = CATEGORY_RULES[CATEGORY_RULES.length - 1];

/** Clamp an arbitrary number into the reportable AQI range. */
export function clampAqi(aqi: number): number {
  if (!Number.isFinite(aqi)) return 0;
  return Math.min(AQI_SCALE_MAX, Math.max(0, Math.round(aqi)));
}

/** Map a raw AQI value onto its band, label and presentation tokens. */
export function classifyAqi(aqi: number): AqiClassification {
  const value = clampAqi(aqi);
  const rule = CATEGORY_RULES.find((candidate) => value <= candidate.max);
  const resolved = rule ?? FALLBACK_CLASSIFICATION;

  return {
    category: resolved.category,
    label: resolved.label,
    advice: resolved.advice,
    badgeClass: resolved.badgeClass,
    textClass: resolved.textClass,
    accentClass: resolved.accentClass,
  };
}

/** AQI expressed as a 0-100 share of the scale, for progress indicators. */
export function aqiPercent(aqi: number): number {
  return Math.round((clampAqi(aqi) / AQI_SCALE_MAX) * 100);
}
