import type { Metadata } from "next";
import Link from "next/link";
import { PasswordGenerator } from "@/components/tools/password-generator";
import { CronTranslator } from "@/components/tools/cron-translator";
import { JwtDecoder } from "@/components/tools/jwt-decoder";
import { JsonFormatter } from "@/components/tools/json-formatter";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";
import { withLocale } from "@/lib/i18n/utils";

export const metadata: Metadata = {
  title: "Developer Utilities",
  description:
    "Small, fast, client-side developer tools. Every interaction is tracked anonymously in PostgreSQL. Live telemetry is visible on the Under the Hood page.",
};

export default async function ToolsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const t = dict.pages.tools;
  const underTheHoodHref = withLocale(lang, "/under-the-hood");

  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-16">
      <div>
        <h1 className="text-foreground font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          {t.title} <span className="gradient-heading">{t.titleAccent}</span>
        </h1>
        <p className="text-default-500 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
          {t.introLead} <span className="text-foreground font-medium">{t.introDb}</span>.{" "}
          {t.introMid}{" "}
          <Link
            href={underTheHoodHref}
            className="text-teal-400 underline-offset-2 hover:underline"
          >
            {t.introLink}
          </Link>{" "}
          {t.introEnd}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <PasswordGenerator />
        <CronTranslator />
        <JwtDecoder />
        <JsonFormatter />
      </div>

      <div className="border-divider bg-content1 rounded-2xl border px-6 py-5">
        <p className="text-default-500 text-sm leading-relaxed">
          <span className="text-foreground font-medium">{t.telemetryLead} </span>
          {t.telemetryP1}
          <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
            trackEventAction
          </code>
          {t.telemetryP2}
          <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
            telemetry_events
          </code>
          {t.telemetryP3}
        </p>
      </div>
    </div>
  );
}
