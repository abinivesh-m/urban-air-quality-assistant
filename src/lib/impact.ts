/**
 * Carbon footprint maths.
 *
 * Pure functions with explicit, documented emission factors so the numbers in
 * the UI can be checked and tested rather than trusted.
 */

export interface ImpactInput {
  /** Kilometres driven per day in a petrol car. */
  readonly carKmPerDay: number;
  /** Meat-containing meals eaten per week. */
  readonly meatMealsPerWeek: number;
  /** Single-use plastic bags used per week. */
  readonly plasticBagsPerWeek: number;
}

export interface ImpactBreakdown {
  readonly carKg: number;
  readonly meatKg: number;
  readonly plasticKg: number;
  readonly totalKg: number;
  readonly treesToOffset: number;
}

export interface ImpactSavings {
  readonly carKg: number;
  readonly meatKg: number;
  readonly plasticKg: number;
  readonly totalKg: number;
  readonly percentReduction: number;
}

/**
 * Emission factors, all in kilograms of CO₂ equivalent.
 *
 * - `carKgPerKm` follows the UK DEFRA average for a medium petrol car.
 * - `meatMealKg` is a mid-range figure for a beef-heavy meal; plant-based
 *   meals are roughly an order of magnitude lower.
 * - `plasticBagKg` covers a single HDPE carrier bag.
 * - `treeKgPerYear` is the widely used 21 kg/year sequestration estimate for a
 *   mature tree.
 */
export const EMISSION_FACTORS = {
  carKgPerKm: 0.21,
  meatMealKg: 2.5,
  plasticBagKg: 0.006,
  treeKgPerYear: 21,
  weeksPerYear: 52,
  daysPerYear: 365,
} as const;

/**
 * Reduction a household can realistically achieve by switching habits:
 * 60% of car kilometres replaced by transit or an EV, half of meat meals
 * swapped for plant-based, and three quarters of single-use bags removed.
 */
export const ACHIEVABLE_REDUCTIONS = {
  car: 0.6,
  meat: 0.5,
  plastic: 0.75,
} as const;

const LIMITS = {
  carKmPerDay: { min: 0, max: 300 },
  meatMealsPerWeek: { min: 0, max: 21 },
  plasticBagsPerWeek: { min: 0, max: 100 },
} as const;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Sanitise untrusted slider input into a known-safe range. */
export function normaliseImpactInput(input: ImpactInput): ImpactInput {
  return {
    carKmPerDay: clamp(
      input.carKmPerDay,
      LIMITS.carKmPerDay.min,
      LIMITS.carKmPerDay.max,
    ),
    meatMealsPerWeek: clamp(
      input.meatMealsPerWeek,
      LIMITS.meatMealsPerWeek.min,
      LIMITS.meatMealsPerWeek.max,
    ),
    plasticBagsPerWeek: clamp(
      input.plasticBagsPerWeek,
      LIMITS.plasticBagsPerWeek.min,
      LIMITS.plasticBagsPerWeek.max,
    ),
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Total annual footprint for the given habits. */
export function calculateFootprint(input: ImpactInput): ImpactBreakdown {
  const safe = normaliseImpactInput(input);

  const carKg =
    safe.carKmPerDay * EMISSION_FACTORS.carKgPerKm * EMISSION_FACTORS.daysPerYear;
  const meatKg =
    safe.meatMealsPerWeek * EMISSION_FACTORS.meatMealKg * EMISSION_FACTORS.weeksPerYear;
  const plasticKg =
    safe.plasticBagsPerWeek *
    EMISSION_FACTORS.plasticBagKg *
    EMISSION_FACTORS.weeksPerYear;

  const totalKg = carKg + meatKg + plasticKg;

  return {
    carKg: round(carKg),
    meatKg: round(meatKg),
    plasticKg: round(plasticKg),
    totalKg: round(totalKg),
    treesToOffset: Math.ceil(totalKg / EMISSION_FACTORS.treeKgPerYear),
  };
}

/** Annual emissions avoided if the household adopts the achievable swaps. */
export function calculateSavings(input: ImpactInput): ImpactSavings {
  const footprint = calculateFootprint(input);

  const carKg = footprint.carKg * ACHIEVABLE_REDUCTIONS.car;
  const meatKg = footprint.meatKg * ACHIEVABLE_REDUCTIONS.meat;
  const plasticKg = footprint.plasticKg * ACHIEVABLE_REDUCTIONS.plastic;
  const totalKg = carKg + meatKg + plasticKg;

  return {
    carKg: round(carKg),
    meatKg: round(meatKg),
    plasticKg: round(plasticKg),
    totalKg: round(totalKg),
    percentReduction:
      footprint.totalKg === 0
        ? 0
        : Math.round((totalKg / footprint.totalKg) * 100),
  };
}
