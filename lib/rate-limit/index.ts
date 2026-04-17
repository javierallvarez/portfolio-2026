/**
 * Rate Limiting Strategy
 * ─────────────────────
 * Implementation uses Upstash Redis with a sliding window algorithm via the
 * `@upstash/ratelimit` package (add with: npm i @upstash/ratelimit @upstash/redis).
 *
 * This file provides a factory function to create rate limiters with different
 * configurations per route (e.g., more permissive for reads, strict for writes).
 *
 * Usage in a Server Action or Route Handler:
 * ```ts
 * import { checkRateLimit } from "@/lib/rate-limit";
 *
 * export async function createMovieAction(data: CreateMovieInput) {
 *   await checkRateLimit("movies:create");
 *   // ... rest of the action
 * }
 * ```
 *
 * TODO (JAG-002): Install @upstash/ratelimit and uncomment the implementation below
 *                 once UPSTASH_REDIS_REST_URL and TOKEN are configured.
 */

// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// const limiters = {
//   "movies:create": new Ratelimit({
//     redis,
//     limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 creates per minute
//   }),
//   "movies:read": new Ratelimit({
//     redis,
//     limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 reads per minute
//   }),
// } as const;

// type LimiterKey = keyof typeof limiters;

// export async function checkRateLimit(key: LimiterKey, identifier?: string) {
//   const id = identifier ?? "global";
//   const { success, limit, remaining, reset } = await limiters[key].limit(id);
//   if (!success) {
//     throw new Error(`Rate limit exceeded. Limit: ${limit}, resets at ${new Date(reset)}`);
//   }
//   return { remaining };
// }

/**
 * Temporary no-op stub — replace with the implementation above once Upstash is configured.
 */
export async function checkRateLimit(
  _key: string,
  _identifier?: string,
): Promise<{ remaining: number }> {
  return { remaining: 999 };
}
