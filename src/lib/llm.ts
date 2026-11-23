/**
 * Optional GenAI provider layer.
 *
 * The assistant talks to any OpenAI-compatible chat-completions endpoint when
 * credentials are configured, and degrades to the deterministic rule engine in
 * `lib/assistant.ts` when they are not. Every failure mode returns `null` so the
 * caller can fall back without the request ever failing.
 */

export interface LlmConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
}

export interface LlmInput {
  readonly message: string;
  /** Grounding text describing the selected city's air quality. */
  readonly context: string;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_REPLY_LENGTH = 1200;

export const SYSTEM_PROMPT = [
  "You are an urban air quality assistant embedded in a web app.",
  "Answer in at most 90 words, plain prose, no markdown headings.",
  "Be concrete and actionable: what to do, when, and why.",
  "Ground advice in the supplied city reading when it is present.",
  "The readings are representative sample data, so never claim they are live,",
  "and tell the user to check their national monitoring agency for real-time figures.",
  "Never diagnose a medical condition; recommend a clinician for symptoms.",
  "If the question is unrelated to air quality, sustainability, or health,",
  "say briefly that you can only help with those topics.",
].join(" ");

/** Minimal environment shape, so tests can pass plain objects. */
export type EnvLike = Readonly<Record<string, string | undefined>>;

/**
 * Read provider configuration from the environment.
 *
 * OpenAI takes precedence. When only a Gemini key is present the Gemini
 * OpenAI-compatible endpoint is used, so the same client code serves both
 * providers (and any other OpenAI-compatible gateway such as Antigravity).
 *
 * Returns `null` when no API key is present, which is the signal to use the
 * rule engine. Only explicitly supported variables are read; nothing is
 * inferred from unrelated env names.
 */
export function readLlmConfig(env: EnvLike = process.env): LlmConfig | null {
  const openAiKey = env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    const configuredTimeout = Number(env.OPENAI_TIMEOUT_MS);
    const timeoutMs =
      Number.isFinite(configuredTimeout) && configuredTimeout > 0
        ? Math.min(configuredTimeout, 30_000)
        : DEFAULT_TIMEOUT_MS;

    return {
      apiKey: openAiKey,
      baseUrl: (env.OPENAI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ""),
      model: env.OPENAI_MODEL?.trim() || DEFAULT_MODEL,
      timeoutMs,
    };
  }

  const geminiKey = env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    const configuredTimeout = Number(env.GEMINI_TIMEOUT_MS);
    const timeoutMs =
      Number.isFinite(configuredTimeout) && configuredTimeout > 0
        ? Math.min(configuredTimeout, 30_000)
        : DEFAULT_TIMEOUT_MS;

    return {
      apiKey: geminiKey,
      baseUrl:
        (env.GEMINI_BASE_URL?.trim() ||
          "https://generativelanguage.googleapis.com/v1beta/openai").replace(
          /\/+$/,
          "",
        ),
      model: env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
      timeoutMs,
    };
  }

  return null;
}

function extractContent(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;

  const first = choices[0];
  if (typeof first !== "object" || first === null) return null;

  const message = (first as { message?: unknown }).message;
  if (typeof message !== "object" || message === null) return null;

  const content = (message as { content?: unknown }).content;
  if (typeof content !== "string") return null;

  // Normalise whitespace and strip control characters before display.
  // eslint-disable-next-line no-control-regex
  const cleaned = content.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ").trim();

  if (!cleaned) return null;
  return cleaned.slice(0, MAX_REPLY_LENGTH);
}

/**
 * Request a completion from the configured provider.
 *
 * Returns `null` for every failure path — missing config, network error,
 * timeout, non-2xx status, or a malformed body — so callers never need a
 * try/catch of their own.
 */
export async function generateLlmReply(
  input: LlmInput,
  config: LlmConfig | null,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  if (!config) return null;

  const timeoutSignal =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(config.timeoutMs)
      : undefined;

  try {
    const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        max_tokens: 320,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Air quality context: ${input.context}\n\nQuestion: ${input.message}`,
          },
        ],
      }),
      signal: timeoutSignal,
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    return extractContent(payload);
  } catch {
    return null;
  }
}
