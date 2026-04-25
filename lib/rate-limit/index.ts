/**
 * Rate Limiting Strategy
 * ─────────────────────
 * Uses Upstash Redis with a sliding window algorithm. When UPSTASH_REDIS_REST_URL
 * is not configured (e.g. CI / local without .env.local) the module falls back to
 * a no-op stub so the rest of the application keeps working.
 *
 * Usage in a Server Action or Route Handler:
 * ```ts
 * import { checkRateLimit } from "@/lib/rate-limit";
 *
 * const { success, remaining } = await checkRateLimit("chat:send", clientIp);
 * if (!success) return new Response("Rate limit exceeded", { status: 429 });
 * ```
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Upstash client ────────────────────────────────────────────────────────────

const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const isConfigured = url.startsWith("https://") && token !== "" && token !== "your-upstash-token";

const redis = isConfigured ? new Redis({ url, token }) : null;

// ─── Limiters ─────────────────────────────────────────────────────────────────

function makeRatelimit(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) });
}

const limiters = {
  /** Vinyl creation — 10 per minute */
  "vinyls:create": makeRatelimit(10, "1 m"),
  /** Vinyl reads — 100 per minute */
  "vinyls:read": makeRatelimit(100, "1 m"),
  /** AI career chat — 5 per minute per IP */
  "chat:send": makeRatelimit(5, "1 m"),
} as const;

type LimiterKey = keyof typeof limiters;

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
}

/**
 * Check the rate limit for a given key and identifier (usually an IP address).
 * When Upstash is not configured the function always returns success so the
 * rest of the application keeps working in local / CI environments.
 */
export async function checkRateLimit(
  key: LimiterKey,
  identifier = "global",
): Promise<RateLimitResult> {
  const limiter = limiters[key];

  if (!limiter) {
    // Upstash not configured — no-op fallback
    return { success: true, remaining: 999, limit: 999, reset: 0 };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    limit: result.limit,
    reset: result.reset,
  };
}
