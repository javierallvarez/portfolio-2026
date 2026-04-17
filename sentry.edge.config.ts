import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Edge Runtime Configuration
 *
 * Used by middleware and Edge API routes.
 * Full config reference: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  enabled: process.env.NODE_ENV === "production",

  debug: false,
});
