import { describe, expect, it } from "vitest";

import { getCity } from "@/lib/air-quality";
import {
  answerQuestion,
  FALLBACK_REPLY,
  MAX_MESSAGE_LENGTH,
  matchIntent,
  SUGGESTED_PROMPTS,
} from "@/lib/assistant";

describe("matchIntent", () => {
  it.each([
    ["What is PM2.5?", "pm25"],
    ["Which mask should I wear?", "mask"],
    ["Do I need an air purifier?", "purifier"],
    ["How do I improve indoor air?", "indoor"],
    ["Can I go for a run?", "exercise"],
    ["Is it safe for my children?", "children"],
    ["Any tips for cooking fumes?", "cooking"],
    ["Do houseplants help?", "plants"],
    ["Best low-emission commute?", "commute"],
    ["Why is winter smog so bad?", "smog"],
    ["How do I cut my carbon footprint?", "carbon"],
    ["What are good sustainable swaps?", "alternatives"],
    ["hello there", "greeting"],
  ])("maps %j to the %s intent", (message, expected) => {
    expect(matchIntent(message)).toBe(expected);
  });

  it("is case and whitespace insensitive", () => {
    expect(matchIntent("  WHAT   IS   PM2.5  ")).toBe("pm25");
  });

  it("returns null for unrecognised text", () => {
    expect(matchIntent("asdfghjkl")).toBeNull();
    expect(matchIntent("")).toBeNull();
    expect(matchIntent("    ")).toBeNull();
  });

  it("prefers the more specific intent when two match", () => {
    // "air purifier" should win over the generic "air" family.
    expect(matchIntent("should I buy an air purifier")).toBe("purifier");
  });
});

describe("answerQuestion", () => {
  it("returns the fallback for unrecognised messages", () => {
    const result = answerQuestion("asdfghjkl");
    expect(result.intent).toBe("fallback");
    expect(result.reply).toBe(FALLBACK_REPLY);
  });

  it("answers every suggested prompt with a real intent", () => {
    for (const prompt of SUGGESTED_PROMPTS) {
      const result = answerQuestion(prompt);
      expect(result.intent).not.toBe("fallback");
      expect(result.reply.length).toBeGreaterThan(40);
    }
  });

  it("never returns an empty reply for any intent", () => {
    const samples = [
      "pm2.5",
      "mask",
      "purifier",
      "indoor",
      "exercise",
      "children",
      "cooking",
      "plants",
      "commute",
      "smog",
      "carbon",
      "alternatives",
      "hello",
    ];
    for (const sample of samples) {
      const result = answerQuestion(sample);
      expect(result.reply.trim().length).toBeGreaterThan(0);
    }
  });

  it("truncates over-long input instead of throwing", () => {
    const long = "pm2.5 ".repeat(MAX_MESSAGE_LENGTH);
    expect(() => answerQuestion(long)).not.toThrow();
    expect(answerQuestion(long).reply.length).toBeGreaterThan(0);
  });

  it("handles non-string input defensively", () => {
    // @ts-expect-error verifying runtime guard for an untyped caller
    const result = answerQuestion(undefined);
    expect(result.intent).toBe("fallback");
  });
});

describe("context-aware answers", () => {
  const delhi = getCity("delhi")!;
  const mumbai = getCity("mumbai")!;
  const london = getCity("london")!;

  it("advises against outdoor training at very unhealthy AQI", () => {
    const { reply } = answerQuestion("can I run outside", { reading: delhi });
    expect(reply).toContain("New Delhi");
    expect(reply).toContain("285");
    expect(reply).toContain("too high for outdoor training");
  });

  it("advises caution for sensitive groups at moderate-high AQI", () => {
    const { reply } = answerQuestion("can I run outside", { reading: mumbai });
    expect(reply).toContain("sensitive groups");
    expect(reply).toContain("125");
  });

  it("confirms outdoor exercise is safe when air is clean", () => {
    const { reply } = answerQuestion("can I run outside", { reading: london });
    expect(reply).toContain("safe right now");
  });

  it("falls back to generic advice with no reading", () => {
    const { reply } = answerQuestion("can I run outside");
    expect(reply).toContain("Below AQI 100");
  });

  it("quotes the city's PM2.5 value", () => {
    const { reply } = answerQuestion("what is pm2.5", { reading: delhi });
    expect(reply).toContain("142");
    expect(reply).toContain("µg/m³");
  });

  it("tailors child-safety advice to the reading", () => {
    const { reply } = answerQuestion("is it safe for children", { reading: delhi });
    expect(reply).toContain("New Delhi");
    expect(reply).toContain("AQI 285");
  });

  it("recommends an N95 when AQI is high", () => {
    const { reply } = answerQuestion("which mask", { reading: delhi });
    expect(reply).toContain("N95");
    expect(reply).toContain("worth wearing");
  });

  it("does not push a mask when air is clean", () => {
    const { reply } = answerQuestion("which mask", { reading: london });
    expect(reply).toContain("N95");
    expect(reply).not.toContain("worth wearing");
  });
});
