/**
 * Display formatting for air quality values.
 */

/** Format an ISO timestamp for display in the UI. */
export function formatObservedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";

  // Render in UTC so the server-rendered markup and the hydrated client always
  // agree, whatever timezone the viewer is in. The suffix makes that explicit,
  // since the sample readings carry different local offsets.
  const formatted = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);

  return `${formatted} UTC`;
}
