import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Client-Side Configuration
 *
 * This file is loaded in the browser. Avoid importing heavy server-only modules here.
 * Full config reference: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production (0.0 – 1.0)
  // 0.1 = capture 10% of transactions for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Capture Replay for 10% of all sessions in production,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text content and block all media to protect PII
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Only send events in production to avoid polluting the Sentry project
  enabled: process.env.NODE_ENV === "production",

  debug: false,
});
