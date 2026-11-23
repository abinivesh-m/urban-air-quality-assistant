import { describe, expect, it } from "vitest";

import { createRateLimiter, resolveClientKey } from "@/lib/rate-limit";

function createClock(start = 1_000_000) {
  let current = start;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe("createRateLimiter", () => {
  it("allows exactly `limit` requests inside the window", () => {
    const clock = createClock();
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 }, clock.now);

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const clock = createClock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 }, clock.now);

    limiter.check("a");
    limiter.check("a");
    const blocked = limiter.check("a");

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts down the remaining allowance", () => {
    const clock = createClock();
    const limiter = createRateLimiter({ limit: 5, windowMs: 1000 }, clock.now);

    expect(limiter.check("a").remaining).toBe(4);
    expect(limiter.check("a").remaining).toBe(3);
    expect(limiter.check("a").remaining).toBe(2);
  });

  it("resets once the window elapses", () => {
    const clock = createClock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 }, clock.now);

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);

    clock.advance(1001);
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("keeps separate keys independent", () => {
    const clock = createClock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 }, clock.now);

    expect(limiter.check("alice").allowed).toBe(true);
    expect(limiter.check("bob").allowed).toBe(true);
    expect(limiter.check("alice").allowed).toBe(false);
  });

  it("reports the window reset time", () => {
    const clock = createClock(5000);
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 }, clock.now);

    const first = limiter.check("a");
    expect(first.resetAt).toBe(65_000);
  });

  it("clears all state on reset", () => {
    const clock = createClock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 }, clock.now);

    limiter.check("a");
    expect(limiter.check("a").allowed).toBe(false);

    limiter.reset();
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("never returns a negative remaining count", () => {
    const clock = createClock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 }, clock.now);

    limiter.check("a");
    for (let i = 0; i < 5; i += 1) {
      expect(limiter.check("a").remaining).toBe(0);
    }
  });
});

describe("resolveClientKey", () => {
  it("uses the first address in x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178",
    });
    expect(resolveClientKey(headers)).toBe("203.0.113.7");
  });

  it("trims surrounding whitespace", () => {
    const headers = new Headers({ "x-forwarded-for": "  203.0.113.7  " });
    expect(resolveClientKey(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.4" });
    expect(resolveClientKey(headers)).toBe("198.51.100.4");
  });

  it("prefers x-forwarded-for when both are present", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.7",
      "x-real-ip": "198.51.100.4",
    });
    expect(resolveClientKey(headers)).toBe("203.0.113.7");
  });

  it("degrades to a shared bucket when no headers exist", () => {
    expect(resolveClientKey(new Headers())).toBe("anonymous");
  });
});
