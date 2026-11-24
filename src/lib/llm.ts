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
const MAX_TIMEOUT_MS = 30_000;
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

interface ProviderSpec {
  /** Environment variable holding the API key. Also orders precedence. */
  readonly keyVar: string;
  readonly baseUrlVar: string;
  readonly modelVar: string;
  readonly timeoutVar: string;
  readonly defaultBaseUrl: string;
  readonly defaultModel: string;
}

/**
 * Supported OpenAI-compatible providers, in precedence order.
 *
 * Gemini exposes an OpenAI-compatible endpoint, so the same client code serves
 * both it and any other compatible gateway such as Antigravity.
 */
const PROVIDERS: readonly ProviderSpec[] = [
  {
    keyVar: "OPENAI_API_KEY",
    baseUrlVar: "OPENAI_BASE_URL",
    modelVar: "OPENAI_MODEL",
    timeoutVar: "OPENAI_TIMEOUT_MS",
    defaultBaseUrl: DEFAULT_BASE_URL,
    defaultModel: DEFAULT_MODEL,
  },
  {
    keyVar: "GEMINI_API_KEY",
    baseUrlVar: "GEMINI_BASE_URL",
    modelVar: "GEMINI_MODEL",
    timeoutVar: "GEMINI_TIMEOUT_MS",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.0-flash",
  },
];

/** Parse a timeout override, clamped to a safe ceiling. */
function resolveTimeout(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TIMEOUT_MS;
  return Math.min(parsed, MAX_TIMEOUT_MS);
}

/** Normalise a base URL: fall back to the default and trim trailing slashes. */
function resolveBaseUrl(raw: string | undefined, fallback: string): string {
  return (raw?.trim() || fallback).replace(/\/+$/, "");
}

function configFor(
  spec: ProviderSpec,
  apiKey: string,
  env: EnvLike,
): LlmConfig {
  return {
    apiKey,
    baseUrl: resolveBaseUrl(env[spec.baseUrlVar], spec.defaultBaseUrl),
    model: env[spec.modelVar]?.trim() || spec.defaultModel,
    timeoutMs: resolveTimeout(env[spec.timeoutVar]),
  };
}

/**
 * Read provider configuration from the environment.
 *
 * Returns `null` when no API key is present, which is the signal to use the
 * rule engine. Only explicitly supported variables are read; nothing is
 * inferred from unrelated env names.
 */
export function readLlmConfig(env: EnvLike = process.env): LlmConfig | null {
  for (const spec of PROVIDERS) {
    const apiKey = env[spec.keyVar]?.trim();
    if (apiKey) return configFor(spec, apiKey, env);
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
