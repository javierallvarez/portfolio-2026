import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Next.js 16 renamed middleware.ts → proxy.ts (export named `proxy`).
 *
 * This proxy integrates Clerk's session sync so that `auth()` is available
 * in Server Components and Server Actions across all routes.
 *
 * Authorization is NOT enforced here — per the Next.js proxy docs, auth
 * guards live inside each Server Action ("Always verify authentication and
 * authorization inside each Server Function rather than relying on Proxy alone.")
 */
export const proxy = clerkMiddleware();

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
