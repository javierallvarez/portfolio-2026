import type { Metadata } from "next";
import { ArchitectureFlow } from "@/components/tooling/architecture-flow";
import { buildIamFlowNodes, buildReportingFlowNodes } from "@/lib/i18n/internal-tooling-nodes";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Internal Tooling",
  description:
    "A showcase of internal automation and productivity-engineering patterns: IAM provisioning pipelines, scheduled reporting, and API integrations using Python, Jenkins, Google Workspace, and Slack.",
};

export default async function InternalToolingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const t = dict.pages.internalTooling;
  const iamNodes = buildIamFlowNodes(t.iamFlow);
  const reportingNodes = buildReportingFlowNodes(t.reportingFlow);

  return (
    <div className="mx-auto max-w-4xl space-y-24 px-4 py-16">
      <div className="space-y-5">
        <h1 className="text-foreground font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          {t.heroTitleLead} <span className="gradient-heading">{t.heroTitleAccent}</span>
        </h1>
        <p className="text-default-500 max-w-2xl text-base leading-relaxed sm:text-lg">
          {t.heroP1}
        </p>
        <p className="text-default-400 max-w-2xl text-sm leading-relaxed">{t.heroP2}</p>
      </div>

      <section className="space-y-6" aria-labelledby="iam-heading">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-teal-500/30 bg-teal-500/5 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-teal-400 uppercase">
              {t.showcaseA}
            </span>
          </div>
          <h2
            id="iam-heading"
            className="text-foreground font-serif text-2xl font-normal sm:text-3xl"
          >
            {t.iamTitle}
          </h2>
          <p className="text-default-500 max-w-xl text-sm leading-relaxed">{t.iamIntro}</p>
        </div>

        <div className="max-w-lg">
          <ArchitectureFlow nodes={iamNodes} />
        </div>

        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-5 py-4">
          <p className="text-default-400 text-sm leading-relaxed">
            <span className="text-foreground font-medium">{t.outcomeLabel} </span>
            {t.iamOutcome}
          </p>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="reporting-heading">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-teal-500/30 bg-teal-500/5 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-teal-400 uppercase">
              {t.showcaseB}
            </span>
          </div>
          <h2
            id="reporting-heading"
            className="text-foreground font-serif text-2xl font-normal sm:text-3xl"
          >
            {t.reportingTitle}
          </h2>
          <p className="text-default-500 max-w-xl text-sm leading-relaxed">{t.reportingIntro}</p>
        </div>

        <div className="max-w-lg">
          <ArchitectureFlow nodes={reportingNodes} />
        </div>

        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-5 py-4">
          <p className="text-default-400 text-sm leading-relaxed">
            <span className="text-foreground font-medium">{t.outcomeLabel} </span>
            {t.reportingOutcome}
          </p>
        </div>
      </section>

      <section className="border-divider bg-content1 space-y-3 rounded-2xl border px-6 py-6">
        <h2 className="text-foreground font-serif text-lg font-normal">{t.philosophyTitle}</h2>
        <p className="text-default-500 text-sm leading-relaxed">{t.philosophyBody}</p>
      </section>
    </div>
  );
}
