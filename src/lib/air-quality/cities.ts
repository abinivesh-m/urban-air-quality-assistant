/**
 * The city dataset the app ships with, plus safe lookups.
 *
 * These are representative reference readings used for demonstration and for
 * deterministic testing; the UI labels them as simulated so nobody mistakes
 * them for a live feed.
 */

import type { CityReading } from "./types";

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
