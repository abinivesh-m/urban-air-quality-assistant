// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/chat/route";

const ENDPOINT = "http://localhost:3000/api/chat";

// Ensure no ambient provider credentials leak into the deterministic tests.
beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

let ipCounter = 0;
function nextIp(): string {
  ipCounter += 1;
  return `10.0.0.${ipCounter}`;
}

interface RequestOptions {
  readonly ip?: string;
  readonly contentType?: string;
  readonly rawBody?: string;
}

function buildRequest(body: unknown, options: RequestOptions = {}) {
  return new NextRequest(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": options.contentType ?? "application/json",
      "x-forwarded-for": options.ip ?? nextIp(),
    },
    body: options.rawBody ?? JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  it("answers a recognised question", async () => {
    const response = await POST(buildRequest({ message: "What is PM2.5?" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.intent).toBe("pm25");
    expect(body.reply).toContain("PM2.5");
    expect(body.city).toBeNull();
  });

  it("grounds the answer in the selected city", async () => {
    const response = await POST(
      buildRequest({ message: "Can I run outside today?", cityId: "delhi" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.intent).toBe("exercise");
    expect(body.city).toBe("delhi");
    expect(body.reply).toContain("New Delhi");
    expect(body.reply).toContain("285");
  });

  it("ignores an unknown city id rather than failing", async () => {
    const response = await POST(
      buildRequest({ message: "Which mask?", cityId: "atlantis" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.city).toBeNull();
  });

  it("exposes rate limit headers on success", async () => {
    const response = await POST(buildRequest({ message: "hello" }));

    expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
    expect(Number(response.headers.get("X-RateLimit-Remaining"))).toBeGreaterThanOrEqual(0);
  });

  it("returns a helpful fallback for an unknown topic", async () => {
    const response = await POST(buildRequest({ message: "asdfghjkl" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.intent).toBe("fallback");
    expect(body.reply).toContain("PM2.5");
  });

  it("rejects a non-JSON content type", async () => {
    const response = await POST(
      buildRequest(
        { message: "hello" },
        { contentType: "text/plain" },
      ),
    );

    expect(response.status).toBe(415);
    expect((await response.json()).code).toBe("unsupported_media_type");
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(buildRequest(null, { rawBody: "{not json" }));

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("invalid_json");
  });

  it("rejects an empty message", async () => {
    const response = await POST(buildRequest({ message: "" }));
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("invalid_request");
  });

  it("rejects a whitespace-only message", async () => {
    const response = await POST(buildRequest({ message: "     " }));
    expect(response.status).toBe(400);
  });

  it("rejects a message over 500 characters", async () => {
    const response = await POST(buildRequest({ message: "a".repeat(501) }));
    expect(response.status).toBe(400);
  });

  it("accepts a message of exactly 500 characters", async () => {
    const response = await POST(buildRequest({ message: `${"a".repeat(495)}hello` }));
    expect(response.status).toBe(200);
  });

  it("rejects a payload with unknown fields", async () => {
    const response = await POST(
      buildRequest({ message: "hello", admin: true }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects a missing message field", async () => {
    const response = await POST(buildRequest({ cityId: "delhi" }));
    expect(response.status).toBe(400);
  });

  it("rejects a non-string message", async () => {
    const response = await POST(buildRequest({ message: 42 }));
    expect(response.status).toBe(400);
  });

  it("does not echo user input back in the error body", async () => {
    const secret = "<script>alert(1)</script>";
    const response = await POST(buildRequest({ message: secret, bogus: 1 }));
    const text = await response.text();

    expect(text).not.toContain("<script>");
  });

  it("rate limits a client that exceeds 30 requests per minute", async () => {
    const ip = nextIp();

    for (let i = 0; i < 30; i += 1) {
      const response = await POST(buildRequest({ message: "hello" }, { ip }));
      expect(response.status).toBe(200);
    }

    const blocked = await POST(buildRequest({ message: "hello" }, { ip }));
    const body = await blocked.json();

    expect(blocked.status).toBe(429);
    expect(body.code).toBe("rate_limited");
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("isolates rate limits per client", async () => {
    const alice = nextIp();
    const bob = nextIp();

    for (let i = 0; i < 30; i += 1) {
      await POST(buildRequest({ message: "hello" }, { ip: alice }));
    }

    expect((await POST(buildRequest({ message: "hello" }, { ip: alice }))).status).toBe(429);
    expect((await POST(buildRequest({ message: "hello" }, { ip: bob }))).status).toBe(200);
  });
});

describe("POST /api/chat — GenAI provider", () => {
  it("reports the rule engine as the source when no key is configured", async () => {
    const response = await POST(buildRequest({ message: "What is PM2.5?" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("rules");
    expect(body.reply).toContain("PM2.5");
  });

  it("uses the configured provider when a key is present", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: "Model-authored answer." } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      buildRequest({ message: "Can I run outside?", cityId: "delhi" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("genai");
    expect(body.reply).toBe("Model-authored answer.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("includes the selected city's readings in the grounding context", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "ok" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await POST(buildRequest({ message: "Can I run outside?", cityId: "delhi" }));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[1].content).toContain("New Delhi");
    expect(body.messages[1].content).toContain("285");
    expect(body.messages[1].content).toContain("PM2.5 142");
  });

  it("falls back to the rule engine when the provider fails", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("upstream down")));

    const response = await POST(
      buildRequest({ message: "Which mask?", cityId: "delhi" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("rules");
    expect(body.reply).toContain("N95");
  });

  it("never exposes the API key in the response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "super-secret-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));

    const response = await POST(buildRequest({ message: "hello" }));
    const text = await response.text();

    expect(text).not.toContain("super-secret-key");
  });
});
