/**
 * Fixed-window rate limiter.
 *
 * Small enough to live in memory on a single serverless instance and simple
 * enough to test deterministically by injecting a clock. It is a defence
 * against casual abuse of the public chat endpoint, not a substitute for an
 * edge/WAF layer in front of a high-traffic deployment.
 */

export interface RateLimitOptions {
  /** Maximum requests permitted per key per window. */
  readonly limit: number;
  /** Window length in milliseconds. */
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly limit: number;
  /** Epoch milliseconds at which the current window resets. */
  readonly resetAt: number;
  /** Whole seconds a caller should wait before retrying. */
  readonly retryAfterSeconds: number;
}

export interface RateLimiter {
  /** Record and evaluate a request for the given key. */
  check(key: string): RateLimitResult;
  /** Clear all tracked windows. Intended for tests. */
  reset(): void;
}

interface Window {
  count: number;
  resetAt: number;
}

export function createRateLimiter(
  options: RateLimitOptions,
  now: () => number = Date.now,
): RateLimiter {
  const { limit, windowMs } = options;
  const windows = new Map<string, Window>();

  function prune(currentTime: number): void {
    for (const [key, window] of windows) {
      if (window.resetAt <= currentTime) windows.delete(key);
    }
  }

  return {
    check(key: string): RateLimitResult {
      const currentTime = now();

      // Opportunistic cleanup keeps the map from growing without bound when
      // many distinct clients are seen.
      if (windows.size > 1000) prune(currentTime);

      const existing = windows.get(key);

      if (!existing || existing.resetAt <= currentTime) {
        const resetAt = currentTime + windowMs;
        windows.set(key, { count: 1, resetAt });
        return {
          allowed: true,
          remaining: limit - 1,
          limit,
          resetAt,
          retryAfterSeconds: 0,
        };
      }

      if (existing.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          limit,
          resetAt: existing.resetAt,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((existing.resetAt - currentTime) / 1000),
          ),
        };
      }

      existing.count += 1;
      return {
        allowed: true,
        remaining: limit - existing.count,
        limit,
        resetAt: existing.resetAt,
        retryAfterSeconds: 0,
      };
    },

    reset(): void {
      windows.clear();
    },
  };
}

/**
 * Derive a stable rate-limit key from proxy headers.
 *
 * Falls back to a shared bucket when no forwarding header is present so that a
 * missing header degrades to a stricter shared limit rather than no limit.
 */
export function resolveClientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "anonymous";
}
