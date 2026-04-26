import type { Metadata } from "next";
import { Webhook, Server, Globe, MessageSquare, Clock, Database, BarChart2 } from "lucide-react";
import { ArchitectureFlow, type FlowNode } from "@/components/tooling/architecture-flow";

export const metadata: Metadata = {
  title: "Internal Tooling",
  description:
    "A showcase of internal automation and productivity-engineering patterns: IAM provisioning pipelines, scheduled reporting, and API integrations using Python, Jenkins, Google Workspace, and Slack.",
};

// ─── Showcase data ────────────────────────────────────────────────────────────

const iamNodes: FlowNode[] = [
  {
    icon: Webhook,
    label: "Trigger",
    title: "HR System Webhook",
    description:
      "A new-hire event fires an HTTPS webhook the moment HR confirms a start date. The payload carries name, team, role, and required access groups.",
  },
  {
    icon: Server,
    label: "Processing",
    title: "Python Flask API",
    description:
      "A lightweight internal service validates the payload schema, looks up the provisioning policy for the role, and orchestrates the downstream calls.",
    tech: ["Python", "Flask", "Pydantic"],
  },
  {
    icon: Globe,
    label: "Action — Identity",
    title: "Google Workspace Admin API",
    description:
      "Creates the corporate Google account, assigns it to the correct OU, and adds it to the relevant Google Groups — all in a single atomic sequence.",
    tech: ["GWS Admin SDK", "OAuth 2.0", "Service Account"],
  },
  {
    icon: MessageSquare,
    label: "Action — Comms",
    title: "Slack API",
    description:
      "Sends a personalised Block Kit welcome DM to the new hire and posts a provisioning-complete notification to the IT channel with a summary card.",
    tech: ["Slack API", "Block Kit"],
  },
];

const reportingNodes: FlowNode[] = [
  {
    icon: Clock,
    label: "Trigger",
    title: "Jenkins Cron Job",
    description:
      "A scheduled Jenkins pipeline fires every weekday morning, passing environment parameters (date range, target channels) to the downstream script.",
    tech: ["Jenkins", "Groovy Pipeline"],
  },
  {
    icon: Database,
    label: "Processing",
    title: "Python Aggregation Script",
    description:
      "Connects to multiple internal databases, aggregates KPIs (deployments, incident count, open PRs), normalises the data, and builds the report payload.",
    tech: ["Python", "Pandas", "psycopg2"],
  },
  {
    icon: BarChart2,
    label: "Action",
    title: "Slack Webhook — Rich Report",
    description:
      "Posts a formatted Block Kit message to per-team channels with charts, trend indicators, and direct links to dashboards. Zero manual effort, every day.",
    tech: ["Slack Incoming Webhooks", "Block Kit"],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InternalToolingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-24 px-4 py-16">
      {/* ── Hero ── */}
      <div className="space-y-5">
        <h1 className="text-foreground font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          Internal Tooling & <span className="gradient-heading">Automation</span>
        </h1>
        <p className="text-default-500 max-w-2xl text-base leading-relaxed sm:text-lg">
          Building the invisible engines that power engineering teams. The work below rarely ships
          publicly, but it quietly eliminates hours of manual toil every week.
        </p>
        <p className="text-default-400 max-w-2xl text-sm leading-relaxed">
          These are architectural patterns I design and maintain. Each diagram shows the real
          technology stack, the data-flow sequence, and the integration points.
        </p>
      </div>

      {/* ── Showcase A ── */}
      <section className="space-y-6" aria-labelledby="iam-heading">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-teal-500/30 bg-teal-500/5 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-teal-400 uppercase">
              Showcase A
            </span>
          </div>
          <h2
            id="iam-heading"
            className="text-foreground font-serif text-2xl font-normal sm:text-3xl"
          >
            Automated IAM Provisioning
          </h2>
          <p className="text-default-500 max-w-xl text-sm leading-relaxed">
            Zero-touch onboarding pipeline integrating HR webhooks with Google Workspace and Slack.
            A new hire is fully provisioned — account, groups, and welcome message — before they
            walk through the door.
          </p>
        </div>

        <div className="max-w-lg">
          <ArchitectureFlow nodes={iamNodes} />
        </div>

        {/* Outcome callout */}
        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-5 py-4">
          <p className="text-default-400 text-sm leading-relaxed">
            <span className="text-foreground font-medium">Outcome: </span>
            Reduced average onboarding setup time from ~45 minutes of manual IT work to under 2
            minutes of automated execution per new hire.
          </p>
        </div>
      </section>

      {/* ── Showcase B ── */}
      <section className="space-y-6" aria-labelledby="reporting-heading">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-teal-500/30 bg-teal-500/5 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-teal-400 uppercase">
              Showcase B
            </span>
          </div>
          <h2
            id="reporting-heading"
            className="text-foreground font-serif text-2xl font-normal sm:text-3xl"
          >
            Daily Activity Reporting Pipeline
          </h2>
          <p className="text-default-500 max-w-xl text-sm leading-relaxed">
            Scheduled telemetry aggregation for management visibility. Every morning, teams receive
            a formatted Slack digest of the previous day&apos;s engineering activity without anyone
            lifting a finger.
          </p>
        </div>

        <div className="max-w-lg">
          <ArchitectureFlow nodes={reportingNodes} />
        </div>

        {/* Outcome callout */}
        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 px-5 py-4">
          <p className="text-default-400 text-sm leading-relaxed">
            <span className="text-foreground font-medium">Outcome: </span>
            Replaced a weekly manual report compiled in a spreadsheet with a daily automated digest,
            increasing visibility cadence 5× with zero additional effort.
          </p>
        </div>
      </section>

      {/* ── Philosophy callout ── */}
      <section className="border-divider bg-content1 space-y-3 rounded-2xl border px-6 py-6">
        <h2 className="text-foreground font-serif text-lg font-normal">Engineering Philosophy</h2>
        <p className="text-default-500 text-sm leading-relaxed">
          Good internal tooling is invisible. It runs quietly in the background, handles failures
          gracefully, and never pages anyone at 3 AM. The patterns above share three properties:{" "}
          <span className="text-foreground">idempotency</span> (safe to re-run),{" "}
          <span className="text-foreground">observability</span> (every step logs to a central
          system), and <span className="text-foreground">fault isolation</span> (a failure in the
          Slack step never rolls back the GWS provisioning).
        </p>
      </section>
    </div>
  );
}
