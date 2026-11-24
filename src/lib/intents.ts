/**
 * Curated intent catalogue for the rule-based assistant.
 *
 * Pure data plus answer builders, kept separate from the matching engine in
 * `assistant.ts` so the catalogue can be reviewed, extended and tested on its
 * own without touching scoring logic.
 *
 * Keyword convention: list each word in its shortest usable form, because the
 * matcher also accepts longer words that start with it ("plant" covers
 * "plants", "swap" covers "swaps"). Irregular forms that are not a prefix
 * ("cycle" / "cycling") must be listed explicitly.
 */

import { classifyAqi, type CityReading } from "./air-quality";

export type IntentId =
  | "greeting"
  | "pm25"
  | "mask"
  | "purifier"
  | "indoor"
  | "exercise"
  | "children"
  | "cooking"
  | "plants"
  | "commute"
  | "smog"
  | "carbon"
  | "alternatives";

export interface AssistantContext {
  readonly reading?: CityReading;
}

export interface IntentDefinition {
  readonly id: IntentId;
  readonly keywords: readonly string[];
  readonly answer: (context: AssistantContext) => string;
}

export const SUGGESTED_PROMPTS: readonly string[] = [
  "Can I run outside today?",
  "Which mask should I wear?",
  "How do I clean my indoor air?",
  "Why is winter smog worse?",
  "How can I cut my carbon footprint?",
];

export const FALLBACK_REPLY =
  "I can help with PM2.5 and AQI basics, masks, air purifiers, indoor air quality, exercising in pollution, protecting children, cooking fumes, houseplants, low-emission commutes, winter smog, and carbon footprint. Try one of the suggested questions below.";

/** Short factual summary of a reading, reused by answers that cite it. */
export function describeReading(reading: CityReading): string {
  const { label } = classifyAqi(reading.aqi);
  return `${reading.city} is at AQI ${reading.aqi} (${label})`;
}

export const INTENTS: readonly IntentDefinition[] = [
  {
    id: "greeting",
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "thanks"],
    answer: () =>
      "Hello. Ask me about today's air quality, masks, purifiers, indoor air, exercising safely, or cutting your carbon footprint.",
  },
  {
    id: "exercise",
    keywords: [
      "run",
      "jog",
      "exercise",
      "workout",
      "gym",
      "cycle",
      "cycling",
      "walk",
      "outside",
    ],
    answer: ({ reading }) => {
      if (!reading) {
        return "Below AQI 100 outdoor exercise is fine. Between 100 and 150, keep hard sessions short. Above 150, move the session indoors with filtration running.";
      }
      if (reading.aqi > 150) {
        return `${describeReading(reading)} — that is too high for outdoor training. Move your session indoors, keep windows closed, and run a purifier. If you must go out, keep it under 20 minutes and wear an N95.`;
      }
      if (reading.aqi > 100) {
        return `${describeReading(reading)} — sensitive groups should shorten or move workouts indoors. If you are healthy, train early morning and keep the intensity moderate.`;
      }
      return `${describeReading(reading)} — outdoor exercise is safe right now. Early morning is still the cleanest window because ozone and traffic emissions build through the day.`;
    },
  },
  {
    id: "mask",
    keywords: ["mask", "n95", "kn95", "respirator", "face cover"],
    answer: ({ reading }) => {
      const base =
        "Use a well-fitted N95 or KN95. They filter at least 95% of particles down to 0.3 microns, while cloth and surgical masks leak around the edges and capture far less PM2.5.";
      if (reading && reading.aqi > 150) {
        return `${describeReading(reading)}, so a fitted N95 is worth wearing for any outdoor time. ${base} Replace it once it becomes damp or soiled.`;
      }
      return base;
    },
  },
  {
    id: "pm25",
    keywords: ["pm2.5", "pm 2.5", "pm25", "fine particle", "particulate", "aqi"],
    answer: ({ reading }) => {
      const base =
        "PM2.5 is particulate matter under 2.5 microns. It bypasses the body's usual filters and reaches the deepest airways and bloodstream, which is why it drives most of the health impact of smog.";
      if (reading) {
        return `${base} ${describeReading(reading)} with PM2.5 at ${reading.pm25} µg/m³. The WHO 24-hour guideline is 15 µg/m³.`;
      }
      return base;
    },
  },
  {
    id: "purifier",
    keywords: ["purifier", "hepa", "filter", "air cleaner", "corsi"],
    answer: () =>
      "A HEPA purifier removes 99.97% of particles at 0.3 microns. Size it to the room's floor area and run it on high before sleep. On a budget, a Corsi-Rosenthal box — a box fan plus MERV-13 filters — delivers comparable clean air delivery for roughly a fifth of the price.",
  },
  {
    id: "indoor",
    keywords: [
      "indoor",
      "inside",
      "home",
      "house",
      "room",
      "seal",
      "window",
      "door",
    ],
    answer: () =>
      "Four changes give most of the benefit: seal window and door gaps with weatherstripping, wet-mop instead of dry sweeping so dust is trapped rather than resuspended, run the kitchen exhaust fan whenever you cook, and designate one bedroom as a clean-air room with sealed gaps and a running purifier.",
  },
  {
    id: "children",
    keywords: ["child", "kid", "baby", "school", "toddler"],
    answer: ({ reading }) => {
      const base =
        "Children breathe more air per kilogram of body weight and their lungs are still developing, so they take on a higher dose than adults at the same AQI.";
      if (reading && reading.aqi > 100) {
        return `${describeReading(reading)}. Keep outdoor play short and low-intensity, and prefer indoor activities until the evening. ${base}`;
      }
      return `${base} Keep outdoor play to cleaner windows of the day and watch for coughing or eye irritation.`;
    },
  },
  {
    id: "cooking",
    keywords: ["cook", "kitchen", "stove", "fry"],
    answer: () =>
      "Cooking is often the largest indoor PM2.5 source. Always run the exhaust fan or open a window while cooking, use lids to keep steam and smoke contained, and prefer simmering or baking over high-heat frying on heavy smog days.",
  },
  {
    id: "plants",
    keywords: ["plant", "houseplant"],
    answer: () =>
      "Houseplants remove some volatile organic compounds but their real-world impact on PM2.5 is small — the NASA chamber study used sealed conditions no home reproduces. Treat plants as a pleasant extra, not a substitute for filtration or ventilation.",
  },
  {
    id: "commute",
    keywords: [
      "commute",
      "transport",
      "bus",
      "metro",
      "train",
      "cycle to work",
      "carpool",
      "electric vehicle",
      "ev",
    ],
    answer: () =>
      "For short trips under 3 km, walking or cycling usually wins on both emissions and exposure time. For longer trips, metro or bus beats a solo car by an order of magnitude per passenger-km. If you drive, an EV charged on a cleaner grid cuts lifetime emissions substantially, and carpooling halves the per-person share immediately.",
  },
  {
    id: "smog",
    keywords: ["smog", "haze", "fog", "winter", "inversion", "stubble"],
    answer: () =>
      "Winter smog is a temperature-inversion problem. Cold air sits under a warmer layer, so pollutants trap near the ground instead of dispersing. Add crop-residue burning, traffic, and construction dust, and concentrations climb for days. That is why the same emissions are far more dangerous in December than in June.",
  },
  {
    id: "carbon",
    keywords: ["carbon", "co2", "footprint", "emissions"],
    answer: () =>
      "The three biggest household levers are car travel (about 0.21 kg CO₂ per km), meat-heavy meals (about 2.5 kg CO₂ each), and home energy. Use the Impact tab to model your own numbers — it shows the annual total and how much the achievable swaps would cut.",
  },
  {
    id: "alternatives",
    keywords: ["alternative", "sustainable", "swap", "eco", "green", "solar"],
    answer: () =>
      "The highest-leverage swaps are replacing solo car trips with transit or an EV (around 4.6 tonnes CO₂ a year), moving a gas water heater to solar (around 1.2 tonnes), and shifting meat-heavy meals toward plant-based (around 1.5 tonnes). The Sustainable tab lists each swap with its saving and payback.",
  },
];
