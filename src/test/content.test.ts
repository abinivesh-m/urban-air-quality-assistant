import { describe, expect, it } from "vitest";

import {
  ALTERNATIVE_CATEGORIES,
  formatAnnualCo2,
  formatTonnes,
  INDOOR_HACKS,
  SUSTAINABLE_ALTERNATIVES,
} from "@/lib/content";

describe("formatAnnualCo2", () => {
  it("formats kilograms as tonnes with one decimal", () => {
    expect(formatAnnualCo2(4600)).toBe("≈4.6 t/year");
    expect(formatAnnualCo2(500)).toBe("≈0.5 t/year");
    expect(formatAnnualCo2(1200)).toBe("≈1.2 t/year");
  });

  it("renders zero without throwing", () => {
    expect(formatAnnualCo2(0)).toBe("≈0.0 t/year");
  });
});

describe("formatTonnes", () => {
  it("converts kilograms to one-decimal tonnes", () => {
    expect(formatTonnes(4600)).toBe("4.6");
    expect(formatTonnes(11600)).toBe("11.6");
    expect(formatTonnes(0)).toBe("0.0");
  });

  it("sums to the figure the tab summary displays", () => {
    const total = SUSTAINABLE_ALTERNATIVES.reduce(
      (sum, item) => sum + item.co2SavedKg,
      0,
    );
    expect(formatTonnes(total)).toBe("11.6");
  });
});

describe("content data integrity", () => {
  it("gives every indoor hack a unique id", () => {
    const ids = INDOOR_HACKS.map((hack) => hack.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every sustainable alternative a unique id", () => {
    const ids = SUSTAINABLE_ALTERNATIVES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every alternative saving positive", () => {
    for (const item of SUSTAINABLE_ALTERNATIVES) {
      expect(item.co2SavedKg).toBeGreaterThan(0);
    }
  });

  it("derives filter categories from the dataset, with All first", () => {
    const categories = new Set(
      SUSTAINABLE_ALTERNATIVES.map((item) => item.category),
    );

    expect(ALTERNATIVE_CATEGORIES[0]).toBe("All");
    expect(ALTERNATIVE_CATEGORIES).toHaveLength(categories.size + 1);
    for (const category of categories) {
      expect(ALTERNATIVE_CATEGORIES).toContain(category);
    }
  });

  it("gives every item a non-empty icon key, title and summary", () => {
    for (const hack of INDOOR_HACKS) {
      expect(hack.iconKey.trim()).not.toBe("");
      expect(hack.title.trim()).not.toBe("");
      expect(hack.summary.trim()).not.toBe("");
    }

    for (const item of SUSTAINABLE_ALTERNATIVES) {
      expect(item.iconKey.trim()).not.toBe("");
      expect(item.sustainable.trim()).not.toBe("");
      expect(item.costNote.trim()).not.toBe("");
    }
  });
});
