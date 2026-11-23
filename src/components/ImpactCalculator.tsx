"use client";

import { useId, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import {
  ACHIEVABLE_REDUCTIONS,
  calculateFootprint,
  calculateSavings,
  type ImpactInput,
} from "@/lib/impact";

interface SliderConfig {
  readonly key: keyof ImpactInput;
  readonly label: string;
  readonly hint: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit: string;
}

const SLIDERS: readonly SliderConfig[] = [
  {
    key: "carKmPerDay",
    label: "Car travel per day",
    hint: "Kilometres driven alone in a petrol car.",
    min: 0,
    max: 100,
    step: 1,
    unit: "km",
  },
  {
    key: "meatMealsPerWeek",
    label: "Meat meals per week",
    hint: "Meals containing beef, lamb, or other red meat.",
    min: 0,
    max: 21,
    step: 1,
    unit: "meals",
  },
  {
    key: "plasticBagsPerWeek",
    label: "Single-use plastic bags per week",
    hint: "Carrier bags taken from shops.",
    min: 0,
    max: 20,
    step: 1,
    unit: "bags",
  },
];

const DEFAULTS: ImpactInput = {
  carKmPerDay: 20,
  meatMealsPerWeek: 10,
  plasticBagsPerWeek: 5,
};

/** Live carbon footprint calculator with accessible output. */
export function ImpactCalculator() {
  const [input, setInput] = useState<ImpactInput>(DEFAULTS);
  const groupId = useId();

  const footprint = useMemo(() => calculateFootprint(input), [input]);
  const savings = useMemo(() => calculateSavings(input), [input]);

  const rows = [
    { label: "Car travel", value: footprint.carKg },
    { label: "Meat meals", value: footprint.meatKg },
    { label: "Plastic bags", value: footprint.plasticKg },
  ];

  return (
    <section aria-labelledby="impact-heading" className="card-lg p-5 sm:p-6">
      <h2 id="impact-heading" className="text-xl font-bold text-slate-900">
        Carbon impact calculator
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Model the annual CO₂ from three everyday habits, then see what switching
        would save.
      </p>

      <div className="mt-5 space-y-4">
        {SLIDERS.map((slider) => {
          const value = input[slider.key];
          const fieldId = `${groupId}-${slider.key}`;
          const hintId = `${fieldId}-hint`;
          return (
            <div key={slider.key}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={fieldId} className="text-sm font-semibold text-slate-900">
                  {slider.label}
                </label>
                <output
                  htmlFor={fieldId}
                  className="text-sm font-bold tabular-nums text-emerald-800"
                >
                  {value} {slider.unit}
                </output>
              </div>
              <p id={hintId} className="mt-0.5 text-xs text-slate-600">
                {slider.hint}
              </p>
              <input
                id={fieldId}
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={value}
                aria-describedby={hintId}
                aria-valuetext={`${value} ${slider.unit}`}
                onChange={(event) =>
                  setInput((previous) => ({
                    ...previous,
                    [slider.key]: Number(event.target.value),
                  }))
                }
                className="range mt-1.5"
              />
            </div>
          );
        })}
      </div>

      <div
        className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-center">
          <span className="block text-3xl font-black tabular-nums text-emerald-900">
            {Math.round(footprint.totalKg).toLocaleString()} kg
          </span>
          <span className="text-xs font-medium text-emerald-800">
            estimated CO₂ per year
          </span>
        </p>

        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-[11px] text-slate-600">{row.label}</dt>
              <dd className="text-sm font-bold tabular-nums text-slate-900">
                {Math.round(row.value).toLocaleString()} kg
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 space-y-1 border-t border-emerald-200 pt-3 text-center text-sm">
          <p className="font-semibold text-emerald-900">
            ~{footprint.treesToOffset.toLocaleString()} mature trees would offset
            this yearly
          </p>
          <p className="text-xs text-emerald-800">
            Adopting the swaps below saves ≈{Math.round(savings.totalKg).toLocaleString()} kg
            ({savings.percentReduction}%): car −{Math.round(ACHIEVABLE_REDUCTIONS.car * 100)}%,
            meat −{Math.round(ACHIEVABLE_REDUCTIONS.meat * 100)}%, bags −
            {Math.round(ACHIEVABLE_REDUCTIONS.plastic * 100)}%.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setInput(DEFAULTS)}
        className="btn-secondary mt-4 inline-flex items-center gap-1.5 text-xs"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Reset to typical household
      </button>
    </section>
  );
}
