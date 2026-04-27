import type { Metadata } from "next";
import Link from "next/link";
import {
  Cloud,
  Database,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Lock,
  KeyRound,
  KeySquare,
  BarChart3,
  Braces,
} from "lucide-react";
import { getTelemetryStatsAction } from "@/actions/telemetry";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/get-dictionary";
import { withLocale } from "@/lib/i18n/utils";

export const metadata: Metadata = {
  title: "Under the Hood",
  description:
    "A transparent look at the AWS architecture, Terraform IaC, CI/CD pipeline, and Spec-Driven workflow behind this portfolio.",
};

// ─── Shared primitives ───────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-foreground font-serif text-2xl font-normal tracking-tight sm:text-3xl">
      {children}
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-default-600 mt-3 max-w-3xl space-y-3 text-base leading-relaxed">
      {children}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-content1 border-divider rounded-xl border p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Architecture diagram ────────────────────────────────────────────────────

function ArchNode({
  icon,
  label,
  sublabel,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-sm ${
          accent
            ? "border border-teal-400/30 bg-gradient-to-br from-teal-400/20 to-cyan-400/20"
            : "bg-content2 border-divider border"
        }`}
      >
        {icon}
      </div>
      <span className="text-foreground text-xs leading-tight font-semibold">{label}</span>
      {sublabel && <span className="text-default-400 text-[10px] leading-tight">{sublabel}</span>}
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="text-default-300 flex flex-col items-center justify-center">
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none" aria-hidden="true">
        <path
          d="M0 7h24M18 1l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="text-default-300 flex items-center justify-center">
      <svg width="14" height="24" viewBox="0 0 14 28" fill="none" aria-hidden="true">
        <path
          d="M7 0v24M1 18l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="overflow-x-auto">
      {/* Desktop: horizontal flow */}
      <div className="hidden min-w-0 items-center justify-center gap-3 sm:flex">
        <ArchNode icon={<Globe size={22} className="text-default-500" />} label="User" />
        <ArrowRight />
        <ArchNode
          icon={<Zap size={22} className="text-teal-400" />}
          label="CloudFront"
          sublabel="CDN + TLS"
          accent
        />
        <ArrowRight />
        {/* Fork */}
        <div className="flex flex-col items-center gap-4">
          <ArchNode
            icon={<Cloud size={22} className="text-default-500" />}
            label="S3"
            sublabel="Static assets"
          />
          <ArchNode
            icon={<span className="font-mono text-base font-bold text-teal-400">λ</span>}
            label="Lambda"
            sublabel="SSR / API"
            accent
          />
        </div>
        <ArrowRight />
        <ArchNode
          icon={<Database size={22} className="text-default-500" />}
          label="Neon"
          sublabel="PostgreSQL"
        />
      </div>

      {/* Mobile: vertical flow */}
      <div className="flex flex-col items-center gap-1 sm:hidden">
        <ArchNode icon={<Globe size={22} className="text-default-500" />} label="User" />
        <ArrowDown />
        <ArchNode
          icon={<Zap size={22} className="text-teal-400" />}
          label="CloudFront"
          sublabel="CDN + TLS"
          accent
        />
        <ArrowDown />
        <div className="flex items-start gap-6">
          <ArchNode
            icon={<Cloud size={22} className="text-default-500" />}
            label="S3"
            sublabel="Static"
          />
          <ArchNode
            icon={<span className="font-mono text-base font-bold text-teal-400">λ</span>}
            label="Lambda"
            sublabel="SSR / API"
            accent
          />
        </div>
        <ArrowDown />
        <ArchNode
          icon={<Database size={22} className="text-default-500" />}
          label="Neon"
          sublabel="PostgreSQL"
        />
      </div>
    </div>
  );
}

// ─── Terraform snippet ───────────────────────────────────────────────────────

const TERRAFORM_SNIPPET = `# CloudFront distribution with two origins:
#  1. S3 — static assets (_next/static/**, public/**)
#  2. Lambda Function URL — SSR pages + API routes

resource "aws_cloudfront_distribution" "cdn" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"   # EU + US edges only

  # Origin 1 — S3 (private, accessed via OAC)
  origin {
    domain_name              = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id                = "s3-static-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.static_assets.id
  }

  # Cache behaviour — immutable static chunks (1 year TTL)
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "s3-static-origin"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 31536000
    default_ttl            = 31536000
    max_ttl                = 31536000
    # ...
  }

  # Default — forward to Lambda SSR (no cache)
  default_cache_behavior {
    target_origin_id       = "lambda-ssr-origin"
    viewer_protocol_policy = "redirect-to-https"
    default_ttl            = 0
    # ...
  }
}`;

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117]">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-[#30363d] px-4 py-2.5">
        <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-[#8b949e]">
          infrastructure/terraform/main.tf
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#e6edf3]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── CI/CD pipeline diagram ───────────────────────────────────────────────────

function PipelineStep({
  icon,
  label,
  description,
}: {
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-primary/10 text-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-base font-bold">
        {icon}
      </div>
      <div>
        <p className="text-foreground text-sm font-semibold">{label}</p>
        <p className="text-default-500 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function UnderTheHoodPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "es";
  const dict = await getDictionary(lang);
  const uth = dict.pages.underTheHood;
  const telemetry = await getTelemetryStatsAction();
  const toolsHref = withLocale(lang, "/tools");
  return (
    <div className="mx-auto max-w-5xl space-y-20 px-4 py-16">
      {/* ── Hero ── */}
      <div>
        <h1 className="text-foreground font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          {uth.heroH1Before}
          <span className="gradient-heading">{uth.heroH1Accent}</span>
        </h1>
        <p className="text-default-500 mt-4 max-w-2xl text-lg leading-relaxed">
          {uth.heroSubtitle}
        </p>
      </div>

      <section aria-labelledby="milestone-heading" className="space-y-4">
        <div>
          <p className="text-default-400 mb-1 text-xs font-semibold tracking-widest uppercase">
            {uth.milestoneSection}
          </p>
          <SectionTitle>
            <span id="milestone-heading">{uth.milestoneTitle}</span>
          </SectionTitle>
          <Prose>
            <p>{uth.milestoneP1}</p>
            <p>{uth.milestoneP2}</p>
          </Prose>
        </div>
      </section>

      {/* ── Infrastructure & Deployment ── */}
      <section aria-labelledby="infra-heading" className="space-y-6">
        <div>
          <SectionTitle>
            {uth.infraTitleBefore}{" "}
            <span id="infra-heading" className="gradient-heading">
              {uth.infraTitleAccent}
            </span>
          </SectionTitle>
          <Prose>
            <p>
              {uth.infraP1Start}
              <strong>{uth.infraP1Strong1}</strong>
              {uth.infraP1Mid1}
              <strong>{uth.infraP1Strong2}</strong>
              {uth.infraP1Mid2}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-sm">
                {uth.infraP1Code}
              </code>
              {uth.infraP1End}
            </p>
          </Prose>
        </div>

        <Card>
          <p className="text-default-500 mb-5 text-xs font-semibold tracking-widest uppercase">
            {uth.awsDiagramCaption}
          </p>
          <ArchitectureDiagram />
          <div className="border-divider mt-6 grid gap-3 border-t pt-5 sm:grid-cols-3">
            {uth.awsNodes.map((item) => (
              <div key={item.title} className="space-y-1">
                <p className="text-foreground text-sm font-semibold">
                  {item.icon} {item.title}
                </p>
                <p className="text-default-500 text-xs leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-warning/10 text-warning rounded-md px-2.5 py-1 text-xs font-semibold">
              {uth.iacBadge}
            </span>
            <p className="text-default-500 text-sm">
              {uth.terraformExcerptLead}{" "}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
                infrastructure/terraform/main.tf
              </code>
            </p>
          </div>
          <CodeBlock code={TERRAFORM_SNIPPET} />
          <p className="text-default-400 text-xs leading-relaxed">{uth.terraformFootnote}</p>
        </div>
      </section>

      {/* ── CI/CD Pipeline ── */}
      <section aria-labelledby="cicd-heading" className="space-y-6">
        <div>
          <SectionTitle>
            <span id="cicd-heading" className="gradient-heading">
              {uth.cicdTitleAccent}
            </span>{" "}
            {uth.cicdTitleAfter}
          </SectionTitle>
          <Prose>
            <p>{uth.cicdIntro}</p>
          </Prose>
        </div>

        <Card>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {uth.cicdSteps.map((step, i) => (
              <PipelineStep
                key={step.label}
                icon={String(i + 1)}
                label={step.label}
                description={step.description}
              />
            ))}
          </div>
        </Card>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/javierallvarez/portfolio-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-content2 hover:bg-content3 border-divider inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
            </svg>
            {uth.viewRepository}
          </a>
          <a
            href="https://github.com/javierallvarez/portfolio-2026/pulls?q=is%3Apr"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-content2 hover:bg-content3 border-divider inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm13-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm2-6.5A.5.5 0 0 0 6.5 11h-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V11a.5.5 0 0 0-.5-.5h-1v-.5a.5.5 0 0 0-.5-.5Zm6.5-1.25A.75.75 0 0 0 12.75 10h-1.5A.75.75 0 0 0 10.5 10.75v2.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-2.5ZM18 11a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V11Z" />
            </svg>
            {uth.viewPrHistory}
          </a>
        </div>
      </section>

      {/* ── Spec-Driven Development ── */}
      <section aria-labelledby="sdd-heading" className="space-y-6">
        <div>
          <SectionTitle>
            {uth.specTitle}{" "}
            <span id="sdd-heading" className="gradient-heading">
              {uth.specTitleAccent}
            </span>
          </SectionTitle>
          <Prose>
            <p>
              {uth.specIntroBefore}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-sm">
                /specs/JAG-XXX-title.md
              </code>
              {uth.specIntroAfter}
            </p>
          </Prose>
        </div>

        <Card>
          <ol className="space-y-3">
            {uth.specSteps.map((row, i) => (
              <li key={row.tag} className="flex items-start gap-3">
                <span className="text-primary bg-primary/10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {i + 1}
                </span>
                <div className="text-sm">
                  <span className="text-foreground font-semibold">{row.tag}</span>
                  <span className="text-default-500"> — {row.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* ── Tech stack ── */}
      <section aria-labelledby="stack-heading" className="space-y-6">
        <div>
          <SectionTitle>
            {uth.stackTitleLead}{" "}
            <span id="stack-heading" className="gradient-heading">
              {uth.stackTitleAccent}
            </span>{" "}
            {uth.stackTitleAfter}
          </SectionTitle>
          <Prose>
            <p>{uth.stackIntro}</p>
          </Prose>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="border-divider w-full border-collapse text-sm">
            <thead>
              <tr className="bg-content2 text-left">
                <th className="border-divider border px-4 py-3 font-semibold">
                  {uth.stackColLayer}
                </th>
                <th className="border-divider border px-4 py-3 font-semibold">
                  {uth.stackColTech}
                </th>
                <th className="border-divider border px-4 py-3 font-semibold">{uth.stackColWhy}</th>
              </tr>
            </thead>
            <tbody>
              {uth.techStackRows.map(({ layer, tech, why }, i) => (
                <tr key={layer} className={i % 2 === 0 ? "bg-content1" : "bg-content2/50"}>
                  <td className="border-divider text-default-500 border px-4 py-2.5 text-xs font-medium whitespace-nowrap">
                    {layer}
                  </td>
                  <td className="border-divider border px-4 py-2.5 font-mono text-xs whitespace-nowrap">
                    {tech}
                  </td>
                  <td className="border-divider text-default-500 border px-4 py-2.5 text-xs">
                    {why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Security model ── */}
      <section aria-labelledby="security-heading" className="space-y-6">
        <div>
          <SectionTitle>
            <span id="security-heading" className="gradient-heading">
              {uth.securityTitleAccent}
            </span>
            {uth.securityTitleAfter}
          </SectionTitle>
          <Prose>
            <p>{uth.securityIntro}</p>
          </Prose>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {uth.securityCards.map((item, i) => {
            const icons = [CheckCircle2, ShieldCheck, Zap, KeyRound, Globe, Lock] as const;
            const Icon = icons[i] ?? CheckCircle2;
            return (
              <Card key={item.title}>
                <p className="text-foreground mb-1 flex items-center gap-1.5 text-sm font-semibold">
                  <Icon size={15} className="text-teal-400" aria-hidden="true" /> {item.title}
                </p>
                <p className="text-default-500 text-xs leading-relaxed">{item.body}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Live DB Telemetry ── */}
      <section aria-labelledby="telemetry-heading" className="space-y-6">
        <div>
          <SectionTitle>
            {uth.telemetryTitleLead}{" "}
            <span id="telemetry-heading" className="gradient-heading">
              {uth.telemetryTitleAccent}
            </span>
          </SectionTitle>
          <Prose>
            <p>
              {uth.telemetryP1Start}{" "}
              <Link href={toolsHref} className="text-teal-400 underline-offset-2 hover:underline">
                {uth.telemetryToolsLink}
              </Link>{" "}
              {uth.telemetryP1Mid}{" "}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
                telemetry_events
              </code>{" "}
              {uth.telemetryP1End}
            </p>
          </Prose>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {uth.telemetryStats.map((stat, i) => {
            const icons = [KeySquare, BarChart3, Database, KeyRound, Braces] as const;
            const values = [
              telemetry.password_generated,
              telemetry.cron_translated,
              telemetry.discogs_searched,
              telemetry.jwt_decoded,
              telemetry.json_formatted,
            ] as const;
            const Icon = icons[i] ?? KeySquare;
            const value = values[i] ?? 0;
            return (
              <Card key={stat.label}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
                    <Icon size={20} className="text-teal-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground font-serif text-3xl leading-none font-normal">
                      {value.toLocaleString()}
                    </p>
                    <p className="text-foreground mt-1 text-sm font-medium">{stat.label}</p>
                    <p className="text-default-400 text-xs">{stat.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
