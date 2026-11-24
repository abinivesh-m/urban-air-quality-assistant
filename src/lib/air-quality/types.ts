/**
 * Domain types for the air quality model.
 *
 * Type declarations only — no runtime values — so this module can be imported
 * from server routes and client components without pulling in data or logic.
 */

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

export interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly severity: Severity;
}
