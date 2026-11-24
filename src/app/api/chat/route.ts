import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { classifyAqi, findCity, type CityReading } from "@/lib/air-quality";
import { answerQuestion, MAX_MESSAGE_LENGTH } from "@/lib/assistant";
import { generateLlmReply, readLlmConfig } from "@/lib/llm";
import { createRateLimiter, resolveClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Requests allowed per client key per window. */
const RATE_LIMIT = { limit: 30, windowMs: 60_000 } as const;

const limiter = createRateLimiter(RATE_LIMIT);

const ChatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
    cityId: z.string().min(1).max(64).optional(),
  })
  .strict();

function rateLimitHeaders(remaining: number, limit: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
}

/** Compact grounding string handed to the GenAI provider. */
function buildGrounding(reading: CityReading | undefined): string {
  if (!reading) return "No city selected.";
  const { label } = classifyAqi(reading.aqi);
  return [
    `${reading.city}, ${reading.country}`,
    `AQI ${reading.aqi} (${label})`,
    `PM2.5 ${reading.pm25} µg/m³`,
    `PM10 ${reading.pm10} µg/m³`,
    `NO₂ ${reading.no2} ppb`,
    `O₃ ${reading.o3} ppb`,
    `CO ${reading.co} mg/m³`,
    `${reading.temperatureC}°C, ${reading.humidity}% humidity`,
  ].join("; ");
}

/**
 * POST /api/chat
 *
 * Validates content type, payload shape and request rate before doing any work.
 * Answers come from the configured GenAI provider when available and from the
 * deterministic rule engine otherwise, so the endpoint always responds.
 */
export async function POST(request: NextRequest) {
  const clientKey = resolveClientKey(request.headers);
  const rate = limiter.check(clientKey);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a moment and try again.",
        code: "rate_limited",
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(0, rate.limit),
          "Retry-After": String(rate.retryAfterSeconds),
        },
      },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      {
        error: "Content-Type must be application/json.",
        code: "unsupported_media_type",
      },
      { status: 415 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", code: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = ChatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: `Provide a message between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
        code: "invalid_request",
      },
      { status: 400 },
    );
  }

  const { message, cityId } = parsed.data;
  const reading = findCity(cityId);

  const ruleAnswer = answerQuestion(message, { reading });

  const llmReply = await generateLlmReply(
    { message, context: buildGrounding(reading) },
    readLlmConfig(),
  );

  return NextResponse.json(
    {
      reply: llmReply ?? ruleAnswer.reply,
      intent: ruleAnswer.intent,
      city: reading?.id ?? null,
      source: llmReply ? "genai" : "rules",
    },
    { headers: rateLimitHeaders(rate.remaining, rate.limit) },
  );
}
