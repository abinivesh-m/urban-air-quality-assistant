"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { CONTENT_ICONS } from "@/components/content-icons";
import {
  ALTERNATIVE_CATEGORIES,
  SUSTAINABLE_ALTERNATIVES,
} from "@/lib/content";

/**
 * Category filters are toggle buttons (`aria-pressed`) rather than ARIA tabs,
 * because they filter one list in place instead of swapping panels.
 */
export function SustainableAlternatives() {
  const [category, setCategory] = useState("All");

  const visible = useMemo(
    () =>
      category === "All"
        ? SUSTAINABLE_ALTERNATIVES
        : SUSTAINABLE_ALTERNATIVES.filter((item) => item.category === category),
    [category],
  );

  const totalSavedKg = useMemo(
    () => visible.reduce((sum, item) => sum + item.cosCO2SavedKg, 0),
    [visible],
  );

  return (
    <section aria-labelledby="alternatives-heading" className="card-lg p-5 sm:p-6">
      <h2 id="alternatives-heading" className="text-xl font-bold text-slate-900">
        Sustainable alternatives
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Swap high-emission habits for lower-impact ones, with the annual CO₂
        saving for each.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filter alternatives by category">
        {ALTERNATIVE_CATEGORIES.map((option) => {
          const isActive = option === category;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => setCategory(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${
                isActive
                  ? "bg-emerald-700 text-white"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-600" aria-live="polite">
        Showing {visible.length} swap{visible.length === 1 ? "" : "s"} · up to{" "}
        <strong className="font-semibold text-emerald-800">
          {(totalSavedKg / 1000).toFixed(1)} t CO₂
        </strong>{" "}
        avoided per year if all are adopted.
      </p>

      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {visible.map((item) => {
          const Icon = CONTENT_ICONS[item.iconKey] ?? CONTENT_ICONS.leaf;
          return (
            <li key={item.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {item.category}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  {item.co2Saved}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-600 line-through decoration-red-400">
                  {item.conventional}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-500" aria-hidden="true" />
                <span className="font-semibold text-slate-900">
                  {item.sustainable}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600">{item.costNote}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
