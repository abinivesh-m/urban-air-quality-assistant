import { describe, expect, it } from "vitest";

import {
  ACHIEVABLE_REDUCTIONS,
  calculateFootprint,
  calculateSavings,
  EMISSION_FACTORS,
  normaliseImpactInput,
} from "@/lib/impact";

const ZERO = { carKmPerDay: 0, meatMealsPerWeek: 0, plasticBagsPerWeek: 0 };

describe("normaliseImpactInput", () => {
  it("clamps negatives to zero", () => {
    const result = normaliseImpactInput({
      carKmPerDay: -10,
      meatMealsPerWeek: -1,
      plasticBagsPerWeek: -3,
    });
    expect(result).toEqual({
      carKmPerDay: 0,
      meatMealsPerWeek: 0,
      plasticBagsPerWeek: 0,
    });
  });

  it("clamps above the maximum", () => {
    const result = normaliseImpactInput({
      carKmPerDay: 9999,
      meatMealsPerWeek: 999,
      plasticBagsPerWeek: 999,
    });
    expect(result.carKmPerDay).toBe(300);
    expect(result.meatMealsPerWeek).toBe(21);
    expect(result.plasticBagsPerWeek).toBe(100);
  });

  it("replaces non-finite values with the minimum", () => {
    const result = normaliseImpactInput({
      carKmPerDay: Number.NaN,
      meatMealsPerWeek: Number.POSITIVE_INFINITY,
      plasticBagsPerWeek: 5,
    });
    expect(result.carKmPerDay).toBe(0);
    expect(result.meatMealsPerWeek).toBe(0);
    expect(result.plasticBagsPerWeek).toBe(5);
  });
});

describe("calculateFootprint", () => {
  it("returns zeros for a zero-carbon household", () => {
    expect(calculateFootprint(ZERO)).toEqual({
      carKg: 0,
      meatKg: 0,
      plasticKg: 0,
      totalKg: 0,
      treesToOffset: 0,
    });
  });

  it("computes car emissions from the documented factor", () => {
    const result = calculateFootprint({ ...ZERO, carKmPerDay: 10 });
    const expected = 10 * EMISSION_FACTORS.carKgPerKm * EMISSION_FACTORS.daysPerYear;
    expect(result.carKg).toBeCloseTo(expected, 1);
    expect(result.totalKg).toBeCloseTo(expected, 1);
  });

  it("computes meat emissions from the documented factor", () => {
    const result = calculateFootprint({ ...ZERO, meatMealsPerWeek: 10 });
    const expected = 10 * EMISSION_FACTORS.meatMealKg * EMISSION_FACTORS.weeksPerYear;
    expect(result.meatKg).toBeCloseTo(expected, 1);
  });

  it("computes plastic emissions from the documented factor", () => {
    const result = calculateFootprint({ ...ZERO, plasticBagsPerWeek: 5 });
    const expected = 5 * EMISSION_FACTORS.plasticBagKg * EMISSION_FACTORS.weeksPerYear;
    expect(result.plasticKg).toBeCloseTo(expected, 1);
  });

  it("sums the components into the total", () => {
    const result = calculateFootprint({
      carKmPerDay: 20,
      meatMealsPerWeek: 10,
      plasticBagsPerWeek: 5,
    });
    expect(result.totalKg).toBeCloseTo(
      result.carKg + result.meatKg + result.plasticKg,
      0,
    );
    expect(result.totalKg).toBeGreaterThan(2000);
  });

  it("derives tree offsets by rounding up", () => {
    const result = calculateFootprint({ ...ZERO, meatMealsPerWeek: 1 });
    const expectedTrees = Math.ceil(result.totalKg / EMISSION_FACTORS.treeKgPerYear);
    expect(result.treesToOffset).toBe(expectedTrees);
  });

  it("is monotonic: more driving never lowers the total", () => {
    let previous = -1;
    for (const km of [0, 5, 10, 20, 50, 100]) {
      const { totalKg } = calculateFootprint({ ...ZERO, carKmPerDay: km });
      expect(totalKg).toBeGreaterThanOrEqual(previous);
      previous = totalKg;
    }
  });

  it("rounds to one decimal place", () => {
    const { carKg } = calculateFootprint({ ...ZERO, carKmPerDay: 7 });
    expect(Number.isInteger(carKg * 10)).toBe(true);
  });
});

describe("calculateSavings", () => {
  it("returns zero savings for a zero-carbon household", () => {
    const result = calculateSavings(ZERO);
    expect(result.totalKg).toBe(0);
    expect(result.percentReduction).toBe(0);
  });

  it("applies the documented reduction rates", () => {
    const input = { carKmPerDay: 20, meatMealsPerWeek: 10, plasticBagsPerWeek: 5 };
    const footprint = calculateFootprint(input);
    const savings = calculateSavings(input);

    expect(savings.carKg).toBeCloseTo(
      footprint.carKg * ACHIEVABLE_REDUCTIONS.car,
      0,
    );
    expect(savings.meatKg).toBeCloseTo(
      footprint.meatKg * ACHIEVABLE_REDUCTIONS.meat,
      0,
    );
    expect(savings.plasticKg).toBeCloseTo(
      footprint.plasticKg * ACHIEVABLE_REDUCTIONS.plastic,
      0,
    );
  });

  it("reports a percentage between zero and one hundred", () => {
    const savings = calculateSavings({
      carKmPerDay: 20,
      meatMealsPerWeek: 10,
      plasticBagsPerWeek: 5,
    });
    expect(savings.percentReduction).toBeGreaterThan(0);
    expect(savings.percentReduction).toBeLessThanOrEqual(100);
  });

  it("never claims savings larger than the footprint", () => {
    for (const input of [
      { carKmPerDay: 0, meatMealsPerWeek: 21, plasticBagsPerWeek: 0 },
      { carKmPerDay: 100, meatMealsPerWeek: 0, plasticBagsPerWeek: 20 },
    ]) {
      const footprint = calculateFootprint(input);
      const savings = calculateSavings(input);
      expect(savings.totalKg).toBeLessThanOrEqual(footprint.totalKg + 0.1);
    }
  });
});
