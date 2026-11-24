import {
  AQI_SCALE_MAX,
  aqiPercent,
  classifyAqi,
  formatObservedAt,
  POLLUTANT_META,
  POLLUTANT_ORDER,
  pollutantSeverity,
  type CityReading,
  type Severity,
} from "@/lib/air-quality";

const SEVERITY_TEXT: Readonly<Record<Severity, string>> = {
  low: "text-emerald-700",
  elevated: "text-amber-700",
  high: "text-red-700",
};

const SEVERITY_LABEL: Readonly<Record<Severity, string>> = {
  low: "Within reference",
  elevated: "Elevated",
  high: "High",
};

/** Renders the selected city's AQI, pollutant breakdown and health guidance. */
export function AirQualityPanel({ reading }: { reading: CityReading }) {
  const classification = classifyAqi(reading.aqi);
  const percent = aqiPercent(reading.aqi);

  return (
    <section
      aria-labelledby="current-conditions-heading"
      className="card-lg p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="current-conditions-heading" className="text-xl font-bold text-slate-900">
            {reading.city}
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            {reading.country} · observed {formatObservedAt(reading.observedAt)}
          </p>
        </div>
        <span className={`badge ${classification.badgeClass}`}>
          {classification.label}
        </span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Air quality index
          </p>
          <p className="mt-1 flex items-baseline gap-2" aria-live="polite" aria-atomic="true">
            <span className={`text-5xl font-black leading-none ${classification.textClass}`}>
              {reading.aqi}
            </span>
            <span className="text-sm font-medium text-slate-600">AQI</span>
          </p>
          <div
            role="meter"
            aria-valuenow={reading.aqi}
            aria-valuemin={0}
            aria-valuemax={AQI_SCALE_MAX}
            aria-valuetext={`${reading.aqi} out of ${AQI_SCALE_MAX} — ${classification.label}`}
            aria-label={`Air quality index on a 0 to ${AQI_SCALE_MAX} scale`}
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className={`h-full rounded-full ${classification.accentClass}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <dt className="text-xs text-slate-600">Temperature</dt>
            <dd className="font-semibold text-slate-900">{reading.temperatureC}°C</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-600">Humidity</dt>
            <dd className="font-semibold text-slate-900">{reading.humidity}%</dd>
          </div>
        </dl>
      </div>

      <h3 className="mt-6 text-sm font-semibold text-slate-900">Pollutant breakdown</h3>
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {POLLUTANT_ORDER.map((key) => {
          const value = reading[key];
          const severity = pollutantSeverity(key, value);
          const meta = POLLUTANT_META[key];
          return (
            <li
              key={key}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-xs font-semibold text-slate-700">{meta.label}</p>
              <p className={`mt-0.5 text-lg font-bold ${SEVERITY_TEXT[severity]}`}>
                {value}
                <span className="ml-1 text-[10px] font-medium text-slate-600">
                  {meta.unit}
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                {SEVERITY_LABEL[severity]}
              </p>
            </li>
          );
        })}
      </ul>

      <p
        role="note"
        className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
      >
        <strong className="font-semibold">Health guidance: </strong>
        {classification.advice}
      </p>
    </section>
  );
}
