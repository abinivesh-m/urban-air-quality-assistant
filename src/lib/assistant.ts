/**
 * Rule-based conversational assistant.
 *
 * The assistant is deliberately deterministic: it scores the user's message
 * against the curated catalogue in `intents.ts` and then answers using the
 * *current city reading* where that makes the advice actionable. No network
 * call, no API key, and every answer is unit-testable.
 */

import {
  FALLBACK_REPLY,
  INTENTS,
  type AssistantContext,
  type IntentDefinition,
  type IntentId,
} from "./intents";

export { FALLBACK_REPLY, SUGGESTED_PROMPTS } from "./intents";
export type { AssistantContext, IntentId } from "./intents";

export const MAX_MESSAGE_LENGTH = 500;

export interface AssistantAnswer {
  readonly reply: string;
  readonly intent: IntentId | "fallback";
}

/** Lowercase and collapse whitespace so keyword matching is predictable. */
function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Compile a keyword into a weighted matcher.
 *
 * A keyword matches at the start of a word, so "swap" still matches "swaps"
 * and "run" still matches "running" without listing every inflection. Keywords
 * of one or two characters also need a trailing boundary, otherwise a fragment
 * such as "hi" or "ev" would match inside ordinary words like "this" or "every".
 *
 * Patterns are built once at module load rather than per message.
 */
function compileKeyword(keyword: string): KeywordMatcher {
  const rightBoundary = keyword.length <= 2 ? "(?![\\p{L}\\p{N}])" : "";

  return {
    weight: keyword.length,
    pattern: new RegExp(
      `(?:^|[^\\p{L}\\p{N}])${escapeRegExp(keyword)}${rightBoundary}`,
      "u",
    ),
  };
}

interface KeywordMatcher {
  readonly weight: number;
  readonly pattern: RegExp;
}

interface CompiledIntent {
  readonly definition: IntentDefinition;
  readonly matchers: readonly KeywordMatcher[];
}

const COMPILED_INTENTS: readonly CompiledIntent[] = INTENTS.map((definition) => ({
  definition,
  matchers: definition.keywords.map(compileKeyword),
}));

/**
 * Score intents by the total length of the keywords they match.
 *
 * Weighting by keyword length means a specific phrase such as "air purifier"
 * outranks a generic one such as "air", which keeps ambiguous messages
 * resolving to the more useful answer.
 */
function findIntent(message: string): IntentDefinition | null {
  const text = normalise(message);
  if (!text) return null;

  let best: IntentDefinition | null = null;
  let bestScore = 0;

  for (const { definition, matchers } of COMPILED_INTENTS) {
    let score = 0;

    for (const matcher of matchers) {
      if (matcher.pattern.test(text)) score += matcher.weight;
    }

    if (score > bestScore) {
      bestScore = score;
      best = definition;
    }
  }

  return best;
}

/** Identify the intent a message maps to, or `null` when nothing matches. */
export function matchIntent(message: string): IntentId | null {
  return findIntent(message)?.id ?? null;
}

/** Answer a user message, optionally grounded in the current city reading. */
export function answerQuestion(
  message: string,
  context: AssistantContext = {},
): AssistantAnswer {
  const safeMessage =
    typeof message === "string" ? message.slice(0, MAX_MESSAGE_LENGTH) : "";
  const intent = findIntent(safeMessage);

  if (!intent) return { reply: FALLBACK_REPLY, intent: "fallback" };

  return { reply: intent.answer(context), intent: intent.id };
}
