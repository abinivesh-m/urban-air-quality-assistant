/**
 * Derives a prioritised action list from a city reading.
 */

import { classifyAqi } from "./categories";
import { pollutantSeverity } from "./pollutants";
import type { CityReading, Recommendation } from "./types";

/**
 * The rules combine the headline AQI band with the dominant pollutant, which is
 * what makes the advice differ between a PM2.5 smog episode and a NO₂ traffic
 * peak at the same AQI.
 */
export function buildRecommendations(
  reading: CityReading,
): readonly Recommendation[] {
  const { category } = classifyAqi(reading.aqi);
  const pm25 = pollutantSeverity("pm25", reading.pm25);
  const items: Recommendation[] = [];

  if (category === "hazardous" || category === "very-unhealthy") {
    items.push({
      id: "stay-indoors",
      title: "Stay indoors and seal gaps",
      detail:
        "At this level, outdoor exertion is the main exposure risk. Close windows and doors and run filtration continuously.",
      severity: "high",
    });
  } else if (category === "unhealthy") {
    items.push({
      id: "limit-exertion",
      title: "Move workouts indoors",
      detail:
        "Everyone should cut outdoor exertion. Shift runs and cycling to an indoor session or reschedule to a cleaner day.",
      severity: "high",
    });
  } else if (category === "unhealthy-sensitive") {
    items.push({
      id: "protect-sensitive",
      title: "Shield sensitive groups",
      detail:
        "Children, older adults and anyone with asthma or heart conditions should keep outdoor time short.",
      severity: "elevated",
    });
  } else {
    items.push({
      id: "ventilate",
      title: "Ventilate while air is clean",
      detail:
        "Conditions are favourable — open windows to flush indoor air and air out cooking and cleaning fumes.",
      severity: "low",
    });
  }

  if (pm25 === "high") {
    items.push({
      id: "filtration",
      title: "Run HEPA filtration in the bedroom",
      detail:
        "PM2.5 is the dominant risk right now. Run a HEPA purifier sized for the room, or build a Corsi-Rosenthal box for a low-cost equivalent.",
      severity: "high",
    });
  } else if (pm25 === "elevated") {
    items.push({
      id: "filtration-light",
      title: "Keep filtration running overnight",
      detail:
        "Elevated PM2.5 builds up while you sleep. A purifier on low overnight measurably lowers morning exposure.",
      severity: "elevated",
    });
  }

  if (pollutantSeverity("no2", reading.no2) === "high") {
    items.push({
      id: "avoid-roadside",
      title: "Avoid walking beside traffic",
      detail:
        "NO₂ is elevated, which points to vehicle exhaust. Choose back-street routes and keep away from junctions at peak hours.",
      severity: "elevated",
    });
  }

  if (pollutantSeverity("o3", reading.o3) === "elevated") {
    items.push({
      id: "avoid-afternoon",
      title: "Avoid afternoon outdoor activity",
      detail:
        "Ozone peaks in sunny afternoons. Schedule errands and exercise for early morning when levels are lower.",
      severity: "elevated",
    });
  }

  if (reading.humidity > 75) {
    items.push({
      id: "humidity",
      title: "Manage indoor humidity",
      detail:
        "High outdoor humidity plus closed windows encourages damp and mould. Vent bathrooms and kitchens and keep indoor humidity under 60%.",
      severity: "low",
    });
  }

  return items.slice(0, 4);
}
