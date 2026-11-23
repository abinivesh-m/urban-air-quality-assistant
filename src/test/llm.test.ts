// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  generateLlmReply,
  readLlmConfig,
  SYSTEM_PROMPT,
  type LlmConfig,
} from "@/lib/llm";

const CONFIG: LlmConfig = {
  apiKey: "test-key",
  baseUrl: "https://api.example.com/v1",
  model: "test-model",
  timeoutMs: 1000,
};

function okResponse(content: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content } }] }),
  } as unknown as Response;
}

describe("readLlmConfig", () => {
  it("returns null when no API key is set", () => {
    expect(readLlmConfig({})).toBeNull();
  });

  it("treats a blank key as missing", () => {
    expect(readLlmConfig({ OPENAI_API_KEY: "   " })).toBeNull();
  });

  it("applies documented defaults", () => {
    const config = readLlmConfig({ OPENAI_API_KEY: "abc" });
    expect(config).not.toBeNull();
    expect(config?.baseUrl).toBe("https://api.openai.com/v1");
    expect(config?.model).toBe("gpt-4o-mini");
    expect(config?.timeoutMs).toBe(8000);
  });

  it("honours overrides and strips trailing slashes", () => {
    const config = readLlmConfig({
      OPENAI_API_KEY: " abc ",
      OPENAI_BASE_URL: "https://gateway.example.com/openai///",
      OPENAI_MODEL: "my-model",
      OPENAI_TIMEOUT_MS: "2500",
    });

    expect(config?.apiKey).toBe("abc");
    expect(config?.baseUrl).toBe("https://gateway.example.com/openai");
    expect(config?.model).toBe("my-model");
    expect(config?.timeoutMs).toBe(2500);
  });

  it("clamps an excessive timeout", () => {
    const config = readLlmConfig({
      OPENAI_API_KEY: "abc",
      OPENAI_TIMEOUT_MS: "999999",
    });
    expect(config?.timeoutMs).toBe(30_000);
  });

  it("ignores a non-numeric timeout", () => {
    const config = readLlmConfig({
      OPENAI_API_KEY: "abc",
      OPENAI_TIMEOUT_MS: "soon",
    });
    expect(config?.timeoutMs).toBe(8000);
  });
});

describe("readLlmConfig — Gemini", () => {
  it("uses the Gemini endpoint when only a Gemini key is present", () => {
    const config = readLlmConfig({ GEMINI_API_KEY: "gem-key" });
    expect(config).not.toBeNull();
    expect(config?.apiKey).toBe("gem-key");
    expect(config?.baseUrl).toBe(
      "https://generativelanguage.googleapis.com/v1beta/openai",
    );
    expect(config?.model).toBe("gemini-2.0-flash");
  });

  it("prefers OpenAI when both keys are present", () => {
    const config = readLlmConfig({
      OPENAI_API_KEY: "oai-key",
      GEMINI_API_KEY: "gem-key",
    });
    expect(config?.apiKey).toBe("oai-key");
    expect(config?.baseUrl).toBe("https://api.openai.com/v1");
  });

  it("honours Gemini overrides", () => {
    const config = readLlmConfig({
      GEMINI_API_KEY: "gem-key",
      GEMINI_BASE_URL: "https://gateway.example.com/gemini/",
      GEMINI_MODEL: "gemini-1.5-pro",
      GEMINI_TIMEOUT_MS: "4000",
    });
    expect(config?.baseUrl).toBe("https://gateway.example.com/gemini");
    expect(config?.model).toBe("gemini-1.5-pro");
    expect(config?.timeoutMs).toBe(4000);
  });

  it("returns null when neither key is present", () => {
    expect(readLlmConfig({})).toBeNull();
  });
});

describe("generateLlmReply", () => {
  it("returns null without configuration", async () => {
    const fetchImpl = vi.fn();
    expect(await generateLlmReply({ message: "hi", context: "" }, null, fetchImpl)).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns the provider's content on success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse("Wear an N95 mask."));
    expect(
      await generateLlmReply({ message: "mask?", context: "Delhi AQI 285" }, CONFIG, fetchImpl),
    ).toBe("Wear an N95 mask.");
  });

  it("calls the chat-completions endpoint with the bearer token", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse("ok"));

    await generateLlmReply({ message: "hello", context: "ctx" }, CONFIG, fetchImpl);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.example.com/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer test-key");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("sends the grounding context and question to the model", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse("ok"));

    await generateLlmReply(
      { message: "can I run?", context: "Delhi AQI 285" },
      CONFIG,
      fetchImpl,
    );

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.model).toBe("test-model");
    expect(body.messages[0]).toEqual({ role: "system", content: SYSTEM_PROMPT });
    expect(body.messages[1].content).toContain("Delhi AQI 285");
    expect(body.messages[1].content).toContain("can I run?");
  });

  it("trims surrounding whitespace from the reply", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse("   spaced out   "));
    expect(
      await generateLlmReply({ message: "x", context: "" }, CONFIG, fetchImpl),
    ).toBe("spaced out");
  });

  it("caps an over-long reply", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse("x".repeat(5000)));
    const reply = await generateLlmReply({ message: "x", context: "" }, CONFIG, fetchImpl);
    expect(reply).toHaveLength(1200);
  });

  it("strips control characters", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse("a\u0000b\u0007c"));
    const reply = await generateLlmReply({ message: "x", context: "" }, CONFIG, fetchImpl);
    expect(reply).not.toMatch(/[\u0000\u0007]/);
    expect(reply).toContain("a");
    expect(reply).toContain("c");
  });

  it("returns null on a non-2xx response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as unknown as Response);
    expect(
      await generateLlmReply({ message: "x", context: "" }, CONFIG, fetchImpl),
    ).toBeNull();
  });

  it("returns null when the request throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    expect(
      await generateLlmReply({ message: "x", context: "" }, CONFIG, fetchImpl),
    ).toBeNull();
  });

  it.each([
    ["empty payload", {}],
    ["no choices", { choices: [] }],
    ["missing message", { choices: [{}] }],
    ["non-string content", { choices: [{ message: { content: 42 } }] }],
    ["blank content", { choices: [{ message: { content: "   " } }] }],
    ["null payload", null],
  ])("returns null for a malformed body: %s", async (_label, payload) => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    } as unknown as Response);
    expect(
      await generateLlmReply({ message: "x", context: "" }, CONFIG, fetchImpl),
    ).toBeNull();
  });
});
