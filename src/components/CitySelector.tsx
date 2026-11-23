import { CITIES, type CityReading } from "@/lib/air-quality";

interface CitySelectorProps {
  readonly cities?: readonly CityReading[];
  readonly value: string;
  readonly onChange: (cityId: string) => void;
}

/** City picker. Labelled explicitly so screen readers announce its purpose. */
export function CitySelector({
  cities = CITIES,
  value,
  onChange,
}: CitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="city-select"
        className="text-xs font-medium text-slate-700"
      >
        City
      </label>
      <select
        id="city-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input h-9 w-auto min-w-36 py-1 text-xs font-medium"
      >
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.city}
          </option>
        ))}
      </select>
    </div>
  );
}
