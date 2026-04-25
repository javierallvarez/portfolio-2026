import type { Metadata } from "next";
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
} from "lucide-react";
import { getTelemetryStatsAction } from "@/actions/telemetry";

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

// ─── Tech table ──────────────────────────────────────────────────────────────

const TECH_STACK = [
  {
    layer: "Framework",
    tech: "Next.js 15 (App Router)",
    why: "Server Components, Server Actions, and ISR out of the box",
  },
  {
    layer: "Language",
    tech: "TypeScript (strict) + Python",
    why: "`any` is a lint error; Python handles backend APIs (Flask), Jenkins pipelines, and advanced automation scripts",
  },
  {
    layer: "Styling",
    tech: "Tailwind CSS + HeroUI v3",
    why: "Utility-first speed with accessible, themeable components",
  },
  {
    layer: "Database",
    tech: "PostgreSQL via Drizzle ORM",
    why: "Type-safe queries without the ORM magic overhead",
  },
  {
    layer: "Auth",
    tech: "Clerk v7",
    why: "RBAC with zero-infrastructure overhead; JWKS-based JWT verification",
  },
  {
    layer: "Validation",
    tech: "Zod",
    why: "Single schema shared between server actions and client forms",
  },
  {
    layer: "External API",
    tech: "Discogs REST API",
    why: "Server-side token; client never touches the secret",
  },
  {
    layer: "AI",
    tech: "Vercel AI SDK + Gemini 2.5 Flash",
    why: "Streaming text via `streamText` → `toTextStreamResponse()`; Upstash Redis rate-limits the chat route to 5 req/min per IP",
  },
  {
    layer: "Testing",
    tech: "Playwright E2E",
    why: "Chromium + Mobile Safari; runs against production build in CI",
  },
  {
    layer: "CI/CD",
    tech: "GitHub Actions",
    why: "Lint → type-check → build → E2E; PRs blocked on red CI",
  },
  {
    layer: "IaC (demo)",
    tech: "Terraform ≥ 1.7",
    why: "HCL is cloud-agnostic; demonstrates enterprise AWS readiness",
  },
  {
    layer: "Hosting (live)",
    tech: "Vercel + Neon",
    why: "Zero-ops; $0/month on free tier for a portfolio workload",
  },
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function UnderTheHoodPage() {
  const telemetry = await getTelemetryStatsAction();
  return (
    <div className="mx-auto max-w-5xl space-y-20 px-4 py-16">
      {/* ── Hero ── */}
      <div>
        <h1 className="text-foreground font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          Under the <span className="gradient-heading">Hood</span>
        </h1>
        <p className="text-default-500 mt-4 max-w-2xl text-lg leading-relaxed">
          A transparent look at the architecture, infrastructure-as-code, CI/CD pipeline, and
          engineering process behind this portfolio.
        </p>
      </div>

      {/* ── Infrastructure & Deployment ── */}
      <section aria-labelledby="infra-heading" className="space-y-6">
        <div>
          <SectionTitle>
            Infrastructure &amp;{" "}
            <span id="infra-heading" className="gradient-heading">
              Deployment
            </span>
          </SectionTitle>
          <Prose>
            <p>
              The live site runs on <strong>Vercel + Neon</strong> for cost-efficiency — zero
              infrastructure to operate and a generous free tier that fits a portfolio workload.
              However, enterprise roles demand AWS fluency, so the repository includes
              production-grade <strong>Terraform manifests</strong> that define the same
              architecture on AWS: ready to{" "}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-sm">
                terraform apply
              </code>{" "}
              against a real account.
            </p>
          </Prose>
        </div>

        {/* Architecture diagram */}
        <Card>
          <p className="text-default-500 mb-5 text-xs font-semibold tracking-widest uppercase">
            AWS Architecture
          </p>
          <ArchitectureDiagram />
          <div className="border-divider mt-6 grid gap-3 border-t pt-5 sm:grid-cols-3">
            {[
              {
                icon: "⚡",
                title: "CloudFront",
                body: "Global CDN with TLS termination, WAF integration, and signed-URL support for private content.",
              },
              {
                icon: "🗄️",
                title: "S3 + OAC",
                body: "Immutable static bundle behind a private bucket. CloudFront accesses it via Origin Access Control — no public bucket URL.",
              },
              {
                icon: "λ",
                title: "Lambda (Node 20)",
                body: "Handles SSR pages, API routes, and ISR revalidation. Function URL exposes an HTTPS endpoint without API Gateway overhead.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-1">
                <p className="text-foreground text-sm font-semibold">
                  {item.icon} {item.title}
                </p>
                <p className="text-default-500 text-xs leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Terraform snippet */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-warning/10 text-warning rounded-md px-2.5 py-1 text-xs font-semibold">
              IaC
            </span>
            <p className="text-default-500 text-sm">
              Excerpt from{" "}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
                infrastructure/terraform/main.tf
              </code>
            </p>
          </div>
          <CodeBlock code={TERRAFORM_SNIPPET} />
          <p className="text-default-400 text-xs leading-relaxed">
            The full manifests (<code className="font-mono">main.tf</code>,{" "}
            <code className="font-mono">variables.tf</code>,{" "}
            <code className="font-mono">outputs.tf</code>) live in{" "}
            <code className="font-mono">/infrastructure/terraform/</code> in the repository. They
            define an S3 bucket, a CloudFront distribution with two cache behaviors (static long-TTL
            vs. SSR passthrough), a Lambda function with a Function URL, and all IAM roles. No state
            backend is configured to avoid free-tier surprises — a production setup would add an S3
            backend with DynamoDB state locking.
          </p>
        </div>
      </section>

      {/* ── CI/CD Pipeline ── */}
      <section aria-labelledby="cicd-heading" className="space-y-6">
        <div>
          <SectionTitle>
            <span id="cicd-heading" className="gradient-heading">
              CI/CD
            </span>{" "}
            Pipeline
          </SectionTitle>
          <Prose>
            <p>
              Every push to any branch triggers the GitHub Actions workflow. PRs cannot be merged
              while any job is red — there is no manual override.
            </p>
          </Prose>
        </div>

        <Card>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <PipelineStep
              icon="1"
              label="Lint & Type-check"
              description="ESLint (strict) + Prettier format check + tsc --noEmit. Catches style drift and type errors before a single byte is compiled."
            />
            <PipelineStep
              icon="2"
              label="Build"
              description="next build with dummy env vars. Catches missing environment variable references and SSR-incompatible imports at compile time."
            />
            <PipelineStep
              icon="3"
              label="Playwright E2E"
              description="30 tests across Chromium + Mobile Safari, run against the production artifact. Tests cover navigation, responsive layout, and page content."
            />
            <PipelineStep
              icon="4"
              label="Artifact Upload"
              description="The .next/ build output is uploaded as a GitHub artifact (7-day retention) so the E2E job reuses the exact same binary without rebuilding."
            />
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
            View repository
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
            PR history (JAG-XXX workflow)
          </a>
        </div>
      </section>

      {/* ── Spec-Driven Development ── */}
      <section aria-labelledby="sdd-heading" className="space-y-6">
        <div>
          <SectionTitle>
            Spec-Driven{" "}
            <span id="sdd-heading" className="gradient-heading">
              Development
            </span>
          </SectionTitle>
          <Prose>
            <p>
              No code is written without a spec. Every feature starts as a{" "}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-sm">
                /specs/JAG-XXX-title.md
              </code>{" "}
              file that defines context, technical decisions, acceptance criteria, and an AI
              contribution section. The spec is the single source of truth: it is written before the
              branch is cut and closed when CI is green.
            </p>
          </Prose>
        </div>

        <Card>
          <ol className="space-y-3">
            {[
              ["IDEA", "Identify the feature or fix needed"],
              ["SPEC", "Write /specs/JAG-XXX-title.md with acceptance criteria"],
              ["BRANCH", "git checkout -b feat/JAG-XXX-short-title"],
              ["IMPLEMENT", "Build against the spec — AI pair-programming, always reviewed"],
              ["PR", "Open PR using the PULL_REQUEST_TEMPLATE (includes AI Contribution table)"],
              ["CI", "GitHub Actions: lint → build → Playwright E2E"],
              ["MERGE", "Squash merge to main with JAG-XXX in the commit message"],
              ["CLOSE", "Update spec status to ✅ Done"],
            ].map(([step, desc], i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="text-primary bg-primary/10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {i + 1}
                </span>
                <div className="text-sm">
                  <span className="text-foreground font-semibold">{step}</span>
                  <span className="text-default-500"> — {desc}</span>
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
            Tech{" "}
            <span id="stack-heading" className="gradient-heading">
              Stack
            </span>{" "}
            &amp; Rationale
          </SectionTitle>
          <Prose>
            <p>Every technology choice has a documented reason — no cargo-culting.</p>
          </Prose>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="border-divider w-full border-collapse text-sm">
            <thead>
              <tr className="bg-content2 text-left">
                <th className="border-divider border px-4 py-3 font-semibold">Layer</th>
                <th className="border-divider border px-4 py-3 font-semibold">Technology</th>
                <th className="border-divider border px-4 py-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              {TECH_STACK.map(({ layer, tech, why }, i) => (
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
              Security
            </span>{" "}
            Model
          </SectionTitle>
          <Prose>
            <p>Security is layered — no single control is relied upon exclusively.</p>
          </Prose>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: <CheckCircle2 size={15} className="text-teal-400" />,
              title: "Input validation",
              body: "Zod schemas on every Server Action and API route. The same schema validates client-side forms and server-side payloads.",
            },
            {
              icon: <ShieldCheck size={15} className="text-teal-400" />,
              title: "XSS prevention",
              body: "A zero-dependency regex sanitizer strips all HTML tags and null bytes before any string reaches the database.",
            },
            {
              icon: <Zap size={15} className="text-teal-400" />,
              title: "Rate limiting",
              body: "Upstash Redis sliding-window limiter on all mutating endpoints. The AI Chat route is aggressively capped at 5 requests per minute per IP to prevent abuse and protect billing quotas. Anonymous and authenticated limits are configured separately.",
            },
            {
              icon: <KeyRound size={15} className="text-teal-400" />,
              title: "RBAC (Clerk)",
              body: "Anonymous users can only recommend vinyls. The admin (me) can add to collection, update, and delete — enforced server-side.",
            },
            {
              icon: <Globe size={15} className="text-teal-400" />,
              title: "CORS allowlist",
              body: "lib/security/cors.ts enforces an explicit origin allowlist. Unknown origins receive a 403 before any handler runs.",
            },
            {
              icon: <Lock size={15} className="text-teal-400" />,
              title: "No secrets in code",
              body: "All credentials live in .env (gitignored) and GitHub Secrets. .env.example documents the required variables without values.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <p className="text-foreground mb-1 flex items-center gap-1.5 text-sm font-semibold">
                {item.icon} {item.title}
              </p>
              <p className="text-default-500 text-xs leading-relaxed">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Live DB Telemetry ── */}
      <section aria-labelledby="telemetry-heading" className="space-y-6">
        <div>
          <SectionTitle>
            Live{" "}
            <span id="telemetry-heading" className="gradient-heading">
              Telemetry
            </span>
          </SectionTitle>
          <Prose>
            <p>
              Every tool interaction on the{" "}
              <a href="/tools" className="text-teal-400 underline-offset-2 hover:underline">
                Developer Utilities
              </a>{" "}
              page and every Discogs search in the Interactive Lab appends an anonymous row to the{" "}
              <code className="bg-content2 rounded px-1 py-0.5 font-mono text-xs">
                telemetry_events
              </code>{" "}
              table in Neon PostgreSQL. Counts below are live — no caching, fresh on every page
              load.
            </p>
          </Prose>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <KeySquare size={20} className="text-teal-400" />,
              label: "Passwords Generated",
              value: telemetry.password_generated,
              description: "via Password Generator",
            },
            {
              icon: <BarChart3 size={20} className="text-teal-400" />,
              label: "Cron Expressions Translated",
              value: telemetry.cron_translated,
              description: "via Cron Translator",
            },
            {
              icon: <Database size={20} className="text-teal-400" />,
              label: "Discogs Searches",
              value: telemetry.discogs_searched,
              description: "via Interactive Lab",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground font-serif text-3xl leading-none font-normal">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-foreground mt-1 text-sm font-medium">{stat.label}</p>
                  <p className="text-default-400 text-xs">{stat.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
