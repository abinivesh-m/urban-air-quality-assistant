/**
 * Shared type barrel.
 *
 * Re-exports the domain types so components and tests can import from a single
 * `@/types` path instead of reaching into individual modules.
 */

export type {
  AqiCategory,
  AqiClassification,
  CityReading,
  PollutantKey,
  Recommendation,
  Severity,
} from "@/lib/air-quality";
export type { AssistantContext, IntentId } from "@/lib/assistant";
export type { Effort, IndoorHack, SustainableAlternative } from "@/lib/content";
export type { ImpactBreakdown, ImpactInput, ImpactSavings } from "@/lib/impact";
