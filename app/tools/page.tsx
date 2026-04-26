import type { Metadata } from "next";
import { PasswordGenerator } from "@/components/tools/password-generator";
import { CronTranslator } from "@/components/tools/cron-translator";
import { JwtDecoder } from "@/components/tools/jwt-decoder";
import { JsonFormatter } from "@/components/tools/json-formatter";

export const metadata: Metadata = {
  title: "Developer Utilities",
  description:
    "Small, fast, client-side developer tools. Every interaction is tracked anonymously in PostgreSQL — live telemetry visible on the Under the Hood page.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-16">
      {/* ── Hero ── */}
      <div>
        <h1 className="text-foreground font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          Developer <span className="gradient-heading">Utilities</span>
        </h1>
        <p className="text-default-500 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
          Small, fast, and completely client-side tools. Every interaction is tracked anonymously in
          our live <span className="text-foreground font-medium">PostgreSQL database</span> — the
          aggregate counts are visible in real time on the{" "}
          <a href="/under-the-hood" className="text-teal-400 underline-offset-2 hover:underline">
            Under the Hood
          </a>{" "}
          page.
        </p>
      </div>

      {/* ── Tools grid ── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <PasswordGenerator />
        <CronTranslator />
        <JwtDecoder />
        <JsonFormatter />
      </div>

      {/* ── Callout ── */}
      <div className="border-divider bg-content1 rounded-2xl border px-6 py-5">
        <p className="text-default-500 text-sm leading-relaxed">
          <span className="text-foreground font-medium">How telemetry works: </span>
          Each tool fires a{" "}
          <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
            trackEventAction
          </code>{" "}
          Server Action that appends a row to the{" "}
          <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
            telemetry_events
          </code>{" "}
          table. No personal data, no fingerprinting — just an event type and a timestamp. Counts
          are aggregated server-side on each page load.
        </p>
      </div>
    </div>
  );
}
