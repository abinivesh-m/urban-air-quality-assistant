/**
 * Derives a prioritised action list from a city reading.
 */

import { classifyAqi } from "./categories";
import { pollutantSeverity } from "./pollutants";
import type { CityReading, Recommendation, Severity } from "./types";

function recommendation(
  id: string,
  title: string,
  detail: string,
  severity: Severity,
): Recommendation {
  return { id, title, detail, severity };
}

/**
 * The rules combine the headline AQI band with the dominant pollutant, which is
 * what makes the advice differ between a PM2.5 smog episode and a NO₂ traffic
 * peak at the same AQI.
 */
export function buildRecommendations(
  reading: CityReading,
): readonly Recommendation[] {
  const { category } = classifyAqi(reading.aqi);
  const items: Recommendation[] = [];

  if (category === "hazardous" || category === "very-unhealthy") {
    items.push(
      recommendation(
        "stay-indoors",
        "Stay indoors and seal gaps",
        "At this level, outdoor exertion is the main exposure risk. Close windows and doors and run filtration continuously.",
        "high",
      ),
    );
  } else if (category === "unhealthy") {
    items.push(
      recommendation(
        "limit-exertion",
        "Move workouts indoors",
        "Everyone should cut outdoor exertion. Shift runs and cycling to an indoor session or reschedule to a cleaner day.",
        "high",
      ),
    );
  } else if (category === "unhealthy-sensitive") {
    items.push(
      recommendation(
        "protect-sensitive",
        "Shield sensitive groups",
        "Children, older adults and anyone with asthma or heart conditions should keep outdoor time short.",
        "elevated",
      ),
    );
  } else {
    items.push(
      recommendation(
        "ventilate",
        "Ventilate while air is clean",
        "Conditions are favourable — open windows to flush indoor air and air out cooking and cleaning fumes.",
        "low",
      ),
    );
  }

  if (pollutantSeverity("pm25", reading.pm25) === "high") {
    items.push(
      recommendation(
        "filtration",
        "Run HEPA filtration in the bedroom",
        "PM2.5 is the dominant risk right now. Run a HEPA purifier sized for the room, or build a Corsi-Rosenthal box for a low-cost equivalent.",
        "high",
      ),
    );
  } else if (pollutantSeverity("pm25", reading.pm25) === "elevated") {
    items.push(
      recommendation(
        "filtration-light",
        "Keep filtration running overnight",
        "Elevated PM2.5 builds up while you sleep. A purifier on low overnight measurably lowers morning exposure.",
        "elevated",
      ),
    );
  }

  if (pollutantSeverity("no2", reading.no2) === "high") {
    items.push(
      recommendation(
        "avoid-roadside",
        "Avoid walking beside traffic",
        "NO₂ is elevated, which points to vehicle exhaust. Choose back-street routes and keep away from junctions at peak hours.",
        "elevated",
      ),
    );
  }

  if (pollutantSeverity("o3", reading.o3) === "elevated") {
    items.push(
      recommendation(
        "avoid-afternoon",
        "Avoid afternoon outdoor activity",
        "Ozone peaks in sunny afternoons. Schedule errands and exercise for early morning when levels are lower.",
        "elevated",
      ),
    );
  }

  if (reading.humidity > 75) {
    items.push(
      recommendation(
        "humidity",
        "Manage indoor humidity",
        "High outdoor humidity plus closed windows encourages damp and mould. Vent bathrooms and kitchens and keep indoor humidity under 60%.",
        "low",
      ),
    );
  }

  return items.slice(0, 4);
}
