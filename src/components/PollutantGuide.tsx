import { POLLUTANT_META, type PollutantKey } from "@/lib/air-quality";

const ORDER: readonly PollutantKey[] = ["pm25", "pm10", "no2", "o3", "co"];

/** Short reference glossary for the dashboard sidebar. */
export function PollutantGuide() {
  return (
    <section aria-labelledby="pollutant-guide-heading" className="card p-5">
      <h2
        id="pollutant-guide-heading"
        className="text-base font-bold text-slate-900"
      >
        What am I breathing?
      </h2>
      <dl className="mt-3 space-y-2.5">
        {ORDER.map((key) => (
          <div key={key}>
            <dt className="text-xs font-semibold text-slate-900">
              {POLLUTANT_META[key].label}{" "}
              <span className="font-normal text-slate-600">
                ({POLLUTANT_META[key].unit})
              </span>
            </dt>
            <dd className="text-xs leading-relaxed text-slate-600">
              {POLLUTANT_META[key].blurb}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
