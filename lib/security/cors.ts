import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production"
    ? [process.env.NEXT_PUBLIC_APP_URL ?? ""].filter(Boolean)
    : ["http://localhost:3000", "http://127.0.0.1:3000"];

/**
 * Returns CORS headers for API route handlers.
 *
 * Usage in a Route Handler:
 * ```ts
 * export async function OPTIONS(req: NextRequest) {
 *   return new Response(null, { headers: getCorsHeaders(req) });
 * }
 * ```
 */
export function getCorsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Validates that an incoming request originates from an allowed origin.
 * Use this to guard mutating Route Handlers.
 */
export function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? "";
  return ALLOWED_ORIGINS.includes(origin);
}
