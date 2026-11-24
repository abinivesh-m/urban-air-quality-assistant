import { describe, expect, it } from "vitest";

import { FALLBACK_REPLY, INTENTS, SUGGESTED_PROMPTS } from "@/lib/intents";

describe("intent catalogue", () => {
  it("uses a unique id for every intent", () => {
    const ids = INTENTS.map((intent) => intent.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every intent at least one non-empty keyword", () => {
    for (const intent of INTENTS) {
      expect(intent.keywords.length).toBeGreaterThan(0);
      for (const keyword of intent.keywords) {
        expect(keyword.trim()).toBe(keyword);
        expect(keyword.length).toBeGreaterThan(0);
      }
    }
  });

  it("does not let two intents claim the same keyword", () => {
    const seen = new Map<string, string>();

    for (const intent of INTENTS) {
      for (const keyword of intent.keywords) {
        expect(seen.get(keyword)).toBeUndefined();
        seen.set(keyword, intent.id);
      }
    }
  });

  it("does not list an inflection the matcher already covers", () => {
    // "plant" matches "plants", so listing both would be redundant data.
    for (const intent of INTENTS) {
      for (const keyword of intent.keywords) {
        const longerForms = intent.keywords.filter(
          (other) => other !== keyword && other.startsWith(keyword),
        );
        expect(longerForms).toEqual([]);
      }
    }
  });

  it("answers every intent with non-empty prose when no city is selected", () => {
    for (const intent of INTENTS) {
      expect(intent.answer({}).trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps the fallback reply and suggested prompts non-empty", () => {
    expect(FALLBACK_REPLY.trim()).not.toBe("");
    expect(SUGGESTED_PROMPTS.length).toBeGreaterThan(0);

    for (const prompt of SUGGESTED_PROMPTS) {
      expect(prompt.trim()).not.toBe("");
    }
  });
});
