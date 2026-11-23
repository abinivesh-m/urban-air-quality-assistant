import { describe, expect, it } from "vitest";

import {
  aqiPercent,
  buildRecommendations,
  CITIES,
  CITY_IDS,
  clampAqi,
  classifyAqi,
  DEFAULT_CITY_ID,
  formatObservedAt,
  getCity,
  isKnownCity,
  pollutantSeverity,
} from "@/lib/air-quality";

describe("clampAqi", () => {
  it("rounds to the nearest integer", () => {
    expect(clampAqi(42.4)).toBe(42);
    expect(clampAqi(42.6)).toBe(43);
  });

  it("clamps below zero", () => {
    expect(clampAqi(-30)).toBe(0);
  });

  it("clamps above the scale maximum", () => {
    expect(clampAqi(900)).toBe(500);
  });

  it("treats non-finite input as zero", () => {
    expect(clampAqi(Number.NaN)).toBe(0);
    expect(clampAqi(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("classifyAqi", () => {
  it.each([
    [0, "good", "Good"],
    [50, "good", "Good"],
    [51, "moderate", "Moderate"],
    [100, "moderate", "Moderate"],
    [101, "unhealthy-sensitive", "Unhealthy for Sensitive Groups"],
    [150, "unhealthy-sensitive", "Unhealthy for Sensitive Groups"],
    [151, "unhealthy", "Unhealthy"],
    [200, "unhealthy", "Unhealthy"],
    [201, "very-unhealthy", "Very Unhealthy"],
    [300, "very-unhealthy", "Very Unhealthy"],
    [301, "hazardous", "Hazardous"],
    [500, "hazardous", "Hazardous"],
  ])("classifies AQI %i as %s", (aqi, category, label) => {
    const result = classifyAqi(aqi);
    expect(result.category).toBe(category);
    expect(result.label).toBe(label);
    expect(result.advice.length).toBeGreaterThan(20);
    expect(result.badgeClass).toMatch(/^badge-/);
  });

  it("treats out-of-range values using the clamped value", () => {
    expect(classifyAqi(9999).category).toBe("hazardous");
    expect(classifyAqi(-5).category).toBe("good");
  });
});

describe("aqiPercent", () => {
  it("maps the scale endpoints", () => {
    expect(aqiPercent(0)).toBe(0);
    expect(aqiPercent(250)).toBe(50);
    expect(aqiPercent(500)).toBe(100);
  });

  it("never exceeds the 0-100 range", () => {
    expect(aqiPercent(800)).toBe(100);
    expect(aqiPercent(-10)).toBe(0);
  });
});

describe("pollutantSeverity", () => {
  it("treats values at or below the elevated limit as low", () => {
    expect(pollutantSeverity("pm25", 35)).toBe("low");
    expect(pollutantSeverity("pm25", 10)).toBe("low");
  });

  it("flags values above the elevated limit", () => {
    expect(pollutantSeverity("pm25", 36)).toBe("elevated");
  });

  it("flags values above the high limit", () => {
    expect(pollutantSeverity("pm25", 56)).toBe("high");
  });

  it("uses per-pollutant limits", () => {
    expect(pollutantSeverity("pm10", 60)).toBe("elevated");
    expect(pollutantSeverity("pm10", 200)).toBe("high");
    expect(pollutantSeverity("co", 0.4)).toBe("low");
  });
});

describe("city dataset", () => {
  it("exposes a stable id for every city", () => {
    expect(CITY_IDS).toHaveLength(CITIES.length);
    expect(new Set(CITY_IDS).size).toBe(CITY_IDS.length);
  });

  it("contains the default city", () => {
    expect(CITY_IDS).toContain(DEFAULT_CITY_ID);
    expect(getCity(DEFAULT_CITY_ID)).toBeDefined();
  });

  it("returns undefined for an unknown id", () => {
    expect(getCity("atlantis")).toBeUndefined();
  });

  it("only accepts known ids", () => {
    expect(isKnownCity("delhi")).toBe(true);
    expect(isKnownCity("atlantis")).toBe(false);
    expect(isKnownCity(null)).toBe(false);
    expect(isKnownCity(42)).toBe(false);
  });
});

describe("buildRecommendations", () => {
  const delhi = getCity("delhi")!;
  const london = getCity("london")!;
  const chennai = getCity("chennai")!;

  it("tells people to stay indoors during a very unhealthy episode", () => {
    const ids = buildRecommendations(delhi).map((item) => item.id);
    expect(ids).toContain("stay-indoors");
    expect(ids).toContain("filtration");
  });

  it("recommends ventilation when air is clean", () => {
    const ids = buildRecommendations(london).map((item) => item.id);
    expect(ids).toContain("ventilate");
    expect(ids).not.toContain("stay-indoors");
  });

  it("adds a humidity action in humid conditions", () => {
    const ids = buildRecommendations(chennai).map((item) => item.id);
    expect(ids).toContain("humidity");
  });

  it("returns at most four prioritised actions", () => {
    for (const city of CITIES) {
      const items = buildRecommendations(city);
      expect(items.length).toBeGreaterThan(0);
      expect(items.length).toBeLessThanOrEqual(4);
    }
  });

  it("gives every recommendation a unique id and readable copy", () => {
    for (const city of CITIES) {
      const items = buildRecommendations(city);
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
      for (const item of items) {
        expect(item.title.length).toBeGreaterThan(5);
        expect(item.detail.length).toBeGreaterThan(20);
        expect(["low", "elevated", "high"]).toContain(item.severity);
      }
    }
  });
});

describe("formatObservedAt", () => {
  it("formats a valid ISO timestamp", () => {
    expect(formatObservedAt("2026-11-22T08:30:00Z")).toContain("2026");
  });

  it("degrades gracefully on invalid input", () => {
    expect(formatObservedAt("not-a-date")).toBe("Unknown");
  });
});
