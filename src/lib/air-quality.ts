/**
 * Air quality domain model.
 *
 * Everything in this module is pure and framework-free so it can be unit
 * tested directly and shared by both server routes and client components.
 */

export const AQI_SCALE_MAX = 500;

export type AqiCategory =
  | "good"
  | "moderate"
  | "unhealthy-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous";

export type PollutantKey = "pm25" | "pm10" | "no2" | "o3" | "co";

export type Severity = "low" | "elevated" | "high";

export interface CityReading {
  readonly id: string;
  readonly city: string;
  readonly country: string;
  readonly aqi: number;
  readonly pm25: number;
  readonly pm10: number;
  readonly no2: number;
  readonly o3: number;
  readonly co: number;
  readonly temperatureC: number;
  readonly humidity: number;
  readonly observedAt: string;
}

export interface AqiClassification {
  readonly category: AqiCategory;
  readonly label: string;
  readonly advice: string;
  readonly badgeClass: string;
  readonly textClass: string;
  readonly accentClass: string;
}

interface CategoryRule extends AqiClassification {
  readonly max: number;
}

/**
 * US EPA AQI breakpoints. Ordered ascending; the first rule whose `max` is not
 * exceeded wins. Every band exposes both a human label and its Tailwind tokens
 * so presentation never has to re-derive colour from a number.
 */
const CATEGORY_RULES: readonly CategoryRule[] = [
  {
    max: 50,
    category: "good",
    label: "Good",
    advice:
      "Air quality is satisfactory. Outdoor activity is safe for everyone.",
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

/**
 * Per-pollutant reference limits. `elevated` marks the level above which a
 * pollutant is worth calling out; `high` marks the level that drives the
 * strongest behavioural advice.
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
 * The city dataset the app ships with.
 *
 * These are representative reference readings used for demonstration and for
 * deterministic testing; the UI labels them as simulated so nobody mistakes
 * them for a live feed.
 */
export const CITIES: readonly CityReading[] = [
  {
    id: "delhi",
    city: "New Delhi",
    country: "India",
    aqi: 285,
    pm25: 142,
    pm10: 210,
    no2: 68,
    o3: 45,
    co: 1.2,
    temperatureC: 18,
    humidity: 65,
    observedAt: "2026-11-22T08:30:00+05:30",
  },
  {
    id: "mumbai",
    city: "Mumbai",
    country: "India",
    aqi: 125,
    pm25: 58,
    pm10: 95,
    no2: 42,
    o3: 38,
    co: 0.8,
    temperatureC: 28,
    humidity: 72,
    observedAt: "2026-11-22T08:30:00+05:30",
  },
  {
    id: "bengaluru",
    city: "Bengaluru",
    country: "India",
    aqi: 78,
    pm25: 32,
    pm10: 55,
    no2: 28,
    o3: 42,
    co: 0.5,
    temperatureC: 24,
    humidity: 58,
    observedAt: "2026-11-22T08:30:00+05:30",
  },
  {
    id: "chennai",
    city: "Chennai",
    country: "India",
    aqi: 92,
    pm25: 41,
    pm10: 68,
    no2: 35,
    o3: 48,
    co: 0.6,
    temperatureC: 30,
    humidity: 78,
    observedAt: "2026-11-22T08:30:00+05:30",
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    aqi: 42,
    pm25: 12,
    pm10: 22,
    no2: 25,
    o3: 35,
    co: 0.3,
    temperatureC: 8,
    humidity: 82,
    observedAt: "2026-11-22T08:30:00Z",
  },
  {
    id: "beijing",
    city: "Beijing",
    country: "China",
    aqi: 198,
    pm25: 98,
    pm10: 165,
    no2: 55,
    o3: 52,
    co: 1.5,
    temperatureC: 5,
    humidity: 45,
    observedAt: "2026-11-22T08:30:00+08:00",
  },
];

export const CITY_IDS: readonly string[] = CITIES.map((entry) => entry.id);

export const DEFAULT_CITY_ID = "bengaluru";

/** Look up a city by id, returning `undefined` for unknown ids. */
export function getCity(id: string): CityReading | undefined {
  return CITIES.find((entry) => entry.id === id);
}

/** Validate an untrusted id before it is used to index the dataset. */
export function isKnownCity(id: unknown): id is string {
  return typeof id === "string" && CITY_IDS.includes(id);
}

export interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly severity: Severity;
}

/**
 * Derive a small, prioritised action list from a reading.
 *
 * The rules combine the headline AQI band with the dominant pollutant, which is
 * what makes the advice differ between a PM2.5 smog episode and a NO₂ traffic
 * peak at the same AQI.
 */
export function buildRecommendations(
  reading: CityReading,
): readonly Recommendation[] {
  const { category } = classifyAqi(reading.aqi);
  const items: Recommendation[] = [];

  if (category === "hazardous" || category === "very-unhealthy") {
    items.push({
      id: "stay-indoors",
      title: "Stay indoors and seal gaps",
      detail:
        "At this level, outdoor exertion is the main exposure risk. Close windows and doors and run filtration continuously.",
      severity: "high",
    });
  } else if (category === "unhealthy") {
    items.push({
      id: "limit-exertion",
      title: "Move workouts indoors",
      detail:
        "Everyone should cut outdoor exertion. Shift runs and cycling to an indoor session or reschedule to a cleaner day.",
      severity: "high",
    });
  } else if (category === "unhealthy-sensitive") {
    items.push({
      id: "protect-sensitive",
      title: "Shield sensitive groups",
      detail:
        "Children, older adults and anyone with asthma or heart conditions should keep outdoor time short.",
      severity: "elevated",
    });
  } else {
    items.push({
      id: "ventilate",
      title: "Ventilate while air is clean",
      detail:
        "Conditions are favourable — open windows to flush indoor air and air out cooking and cleaning fumes.",
      severity: "low",
    });
  }

  if (pollutantSeverity("pm25", reading.pm25) === "high") {
    items.push({
      id: "filtration",
      title: "Run HEPA filtration in the bedroom",
      detail:
        "PM2.5 is the dominant risk right now. Run a HEPA purifier sized for the room, or build a Corsi-Rosenthal box for a low-cost equivalent.",
      severity: "high",
    });
  } else if (pollutantSeverity("pm25", reading.pm25) === "elevated") {
    items.push({
      id: "filtration-light",
      title: "Keep filtration running overnight",
      detail:
        "Elevated PM2.5 builds up while you sleep. A purifier on low overnight measurably lowers morning exposure.",
      severity: "elevated",
    });
  }

  if (pollutantSeverity("no2", reading.no2) === "high") {
    items.push({
      id: "avoid-roadside",
      title: "Avoid walking beside traffic",
      detail:
        "NO₂ is elevated, which points to vehicle exhaust. Choose back-street routes and keep away from junctions at peak hours.",
      severity: "elevated",
    });
  }

  if (pollutantSeverity("o3", reading.o3) === "elevated") {
    items.push({
      id: "avoid-afternoon",
      title: "Avoid afternoon outdoor activity",
      detail:
        "Ozone peaks in sunny afternoons. Schedule errands and exercise for early morning when levels are lower.",
      severity: "elevated",
    });
  }

  if (reading.humidity > 75) {
    items.push({
      id: "humidity",
      title: "Manage indoor humidity",
      detail:
        "High outdoor humidity plus closed windows encourages damp and mould. Vent bathrooms and kitchens and keep indoor humidity under 60%.",
      severity: "low",
    });
  }

  return items.slice(0, 4);
}

/** Format an ISO timestamp for display in the UI. */
export function formatObservedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}
