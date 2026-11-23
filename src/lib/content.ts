/**
 * Editorial content for the indoor-hacks and sustainable-alternatives tabs.
 *
 * Kept as plain data (no JSX) so it can be asserted in tests and reused by any
 * renderer. Icons are referenced by a stable key and resolved in the component.
 */

export type Effort = "Low" | "Medium" | "High";

export interface IndoorHack {
  readonly id: string;
  readonly iconKey: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
  readonly impact: string;
  readonly effort: Effort;
  readonly cost: string;
}

export const INDOOR_HACKS: readonly IndoorHack[] = [
  {
    id: "corsi-rosenthal",
    iconKey: "fan",
    title: "Build a Corsi-Rosenthal box",
    summary: "A box fan plus MERV-13 filters, for a fraction of a purifier's price.",
    detail:
      "Tape four MERV-13 furnace filters into a cube with the fan on top, pulling air through the filters. Clean air delivery is comparable to a commercial HEPA unit at roughly a fifth of the cost. Replace the filters when they turn grey.",
    impact: "Cuts indoor PM2.5 by 60–80%",
    effort: "Medium",
    cost: "₹4,000–6,000",
  },
  {
    id: "seal-gaps",
    iconKey: "home",
    title: "Seal window and door gaps",
    summary: "Foam weatherstripping stops outdoor air leaking in.",
    detail:
      "Run self-adhesive foam or brush strip around window frames, balcony doors and the gap under the main door. This is the cheapest single intervention and it also improves cooling efficiency.",
    impact: "Blocks 40–60% of infiltration",
    effort: "Low",
    cost: "₹400–1,200",
  },
  {
    id: "wet-mop",
    iconKey: "droplets",
    title: "Wet-mop instead of dry sweeping",
    summary: "Dry sweeping puts settled dust back into the air you breathe.",
    detail:
      "A damp mop or damp cloth traps particles instead of lifting them. Do floors and ledges once a day during a smog episode, and avoid dry dusting altogether.",
    impact: "Reduces airborne dust by ~70%",
    effort: "Low",
    cost: "No cost",
  },
  {
    id: "clean-air-room",
    iconKey: "shield",
    title: "Create one clean-air room",
    summary: "A single sealed, filtered bedroom you sleep and work in.",
    detail:
      "Pick the smallest bedroom, seal its gaps, keep the door shut, and run filtration continuously. Concentrating filtration in one room is far more effective than spreading it thinly across a whole home.",
    impact: "Reduces personal exposure by 50–70%",
    effort: "Medium",
    cost: "₹8,000–25,000",
  },
  {
    id: "cooking-fumes",
    iconKey: "thermometer",
    title: "Control cooking fumes",
    summary: "The kitchen is usually the largest indoor PM2.5 source.",
    detail:
      "Always run the exhaust fan or crack a window while cooking, use lids to contain steam and smoke, and prefer simmering or baking over high-heat frying on heavy smog days.",
    impact: "Cuts cooking PM by 50–60%",
    effort: "Low",
    cost: "No cost",
  },
  {
    id: "houseplants",
    iconKey: "tree",
    title: "Use houseplants as a supplement",
    summary: "Helpful for VOCs, marginal for particles.",
    detail:
      "Spider plant, peace lily and snake plant do take up some volatile organic compounds, but the NASA chamber results assume sealed conditions no real room reproduces. Keep plants for wellbeing, not as your filtration strategy.",
    impact: "Small, real VOC reduction",
    effort: "Low",
    cost: "₹300–800 per plant",
  },
];

export interface SustainableAlternative {
  readonly id: string;
  readonly iconKey: string;
  readonly category: string;
  readonly conventional: string;
  readonly sustainable: string;
  readonly co2Saved: string;
  readonly cosCO2SavedKg: number;
  readonly costNote: string;
}

export const SUSTAINABLE_ALTERNATIVES: readonly SustainableAlternative[] = [
  {
    id: "car-to-transit",
    iconKey: "car",
    category: "Transport",
    conventional: "Solo petrol car commute",
    sustainable: "Metro, bus, or an EV",
    co2Saved: "≈4.6 t/year",
    cosCO2SavedKg: 4600,
    costNote: "Transit usually cheaper per month than running a car",
  },
  {
    id: "short-trips",
    iconKey: "bike",
    category: "Transport",
    conventional: "Car trips under 3 km",
    sustainable: "Walk, cycle, or e-scooter",
    co2Saved: "≈0.5 t/year",
    cosCO2SavedKg: 500,
    costNote: "Free, plus health benefits",
  },
  {
    id: "rooftop-solar",
    iconKey: "sun",
    category: "Energy",
    conventional: "Coal-heavy grid electricity",
    sustainable: "Rooftop solar with net metering",
    co2Saved: "≈3.5 t/year",
    cosCO2SavedKg: 3500,
    costNote: "Typical payback 5–7 years",
  },
  {
    id: "solar-water",
    iconKey: "thermometer",
    category: "Energy",
    conventional: "Gas or electric water heater",
    sustainable: "Solar water heater",
    co2Saved: "≈1.2 t/year",
    cosCO2SavedKg: 1200,
    costNote: "2–3 year payback",
  },
  {
    id: "plant-based",
    iconKey: "leaf",
    category: "Food",
    conventional: "Meat-heavy diet",
    sustainable: "More plant-based meals",
    co2Saved: "≈1.5 t/year",
    cosCO2SavedKg: 1500,
    costNote: "Often cheaper per meal",
  },
  {
    id: "reusables",
    iconKey: "recycle",
    category: "Waste",
    conventional: "Single-use bags and bottles",
    sustainable: "Reusable bags and bottles",
    co2Saved: "≈0.3 t/year",
    cosCO2SavedKg: 300,
    costNote: "One-time ₹1,500–4,000 outlay",
  },
];

export const ALTERNATIVE_CATEGORIES: readonly string[] = [
  "All",
  ...Array.from(new Set(SUSTAINABLE_ALTERNATIVES.map((item) => item.category))),
];
