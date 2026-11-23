import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { buildRecommendations, type CityReading, type Severity } from "@/lib/air-quality";

const DOT_CLASS: Readonly<Record<Severity, string>> = {
  low: "text-emerald-600",
  elevated: "text-amber-600",
  high: "text-red-600",
};

/**
 * Today's actions, derived from the reading rather than hard-coded, so the
 * list changes when the selected city changes.
 */
export function Recommendations({ reading }: { reading: CityReading }) {
  const recommendations = buildRecommendations(reading);

  return (
    <section aria-labelledby="recommendations-heading" className="card p-5">
      <h2
        id="recommendations-heading"
        className="flex items-center gap-2 text-base font-bold text-slate-900"
      >
        <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
        Today&apos;s recommendations
      </h2>
      <p className="mt-1 text-xs text-slate-600">
        Derived from the {reading.city} reading, prioritised by health impact.
      </p>

      <ul className="mt-3 space-y-3">
        {recommendations.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${DOT_CLASS[item.severity]}`}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
