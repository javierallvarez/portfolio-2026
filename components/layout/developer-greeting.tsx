"use client";

import { useEffect } from "react";

/**
 * Easter Egg: prints a styled greeting to the browser console for any developer
 * who inspects the page. Fires exactly once on app mount.
 */
export function DeveloperGreeting() {
  useEffect(() => {
    const styles = {
      title: "font-size:16px;font-weight:bold;color:#6366f1;",
      body: "font-size:12px;color:#94a3b8;line-height:1.6;",
      link: "font-size:12px;color:#6366f1;text-decoration:underline;",
    };

    // eslint-disable-next-line no-console
    console.log(
      `%c👋 Hey there, fellow developer!
%c
You found the Easter Egg. Respect.

This portfolio is built spec-first, with every feature starting from a
/specs/JAG-XXX ticket before a single line of code is written.

Stack: Next.js 15 · TypeScript · HeroUI v3 · Drizzle ORM · PostgreSQL
CI/CD: GitHub Actions · Playwright E2E · Sentry

Curious how it's all wired together?
%c→ /under-the-hood
`,
      styles.title,
      styles.body,
      styles.link,
    );
  }, []);

  return null;
}
