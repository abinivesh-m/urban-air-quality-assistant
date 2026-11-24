/**
 * The city dataset the app ships with, plus safe lookups.
 *
 * These are representative reference readings used for demonstration and for
 * deterministic testing; the UI labels them as simulated so nobody mistakes
 * them for a live feed.
 */

import type { CityReading } from "./types";

const DELHI: CityReading = {
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
};

const MUMBAI: CityReading = {
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
};

const BENGALURU: CityReading = {
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
};

const CHENNAI: CityReading = {
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
};

const LONDON: CityReading = {
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
};

const BEIJING: CityReading = {
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
};

export const CITIES: readonly CityReading[] = [
  DELHI,
  MUMBAI,
  BENGALURU,
  CHENNAI,
  LONDON,
  BEIJING,
];

/**
 * The reading shown on first load. Exported as the record itself rather than an
 * index into `CITIES`, so a reorder of the array cannot silently change it.
 */
export const DEFAULT_CITY = BENGALURU;

export const DEFAULT_CITY_ID = DEFAULT_CITY.id;

/** Look up a city by id, returning `undefined` for unknown ids. */
export function getCity(id: string): CityReading | undefined {
  return CITIES.find((entry) => entry.id === id);
}

/**
 * Resolve an untrusted id — a form value, a request field — in one step.
 *
 * Returning the record rather than a boolean means callers cannot check an id
 * and then accidentally look up a different one.
 */
export function findCity(id: unknown): CityReading | undefined {
  return typeof id === "string" ? getCity(id) : undefined;
}

/** Narrow an untrusted value to a known city id. */
export function isKnownCity(id: unknown): id is string {
  return findCity(id) !== undefined;
}
