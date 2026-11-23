import { ChevronDown } from "lucide-react";

import { CONTENT_ICONS } from "@/components/content-icons";
import { INDOOR_HACKS } from "@/lib/content";

/**
 * Uses native `<details>`/`<summary>` so the accordion works with no JavaScript
 * and is announced correctly by every screen reader.
 */
export function IndoorHacks() {
  return (
    <section aria-labelledby="hacks-heading" className="card-lg p-5 sm:p-6">
      <h2 id="hacks-heading" className="text-xl font-bold text-slate-900">
        Indoor air quality hacks
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Practical, low-cost changes that reduce what you breathe at home during
        a smog episode.
      </p>

      <ul className="mt-4 space-y-2">
        {INDOOR_HACKS.map((hack) => {
          const Icon = CONTENT_ICONS[hack.iconKey] ?? CONTENT_ICONS.home;
          return (
            <li key={hack.id}>
              <details className="group rounded-xl border border-slate-200 bg-white transition-colors open:border-emerald-400">
                <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl p-4 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {hack.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">{hack.summary}</p>
                    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span className="font-semibold text-emerald-700">
                        {hack.impact}
                      </span>
                      <span className="text-slate-600">Effort: {hack.effort}</span>
                      <span className="text-slate-600">Cost: {hack.cost}</span>
                    </p>
                  </div>
                  <ChevronDown
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="border-t border-slate-200 px-4 py-3">
                  <p className="text-sm leading-relaxed text-slate-700">
                    {hack.detail}
                  </p>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
