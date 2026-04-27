"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Shield,
  BarChart2,
  FileText,
  Webhook,
  MessageSquare,
  Send,
  X,
  Terminal,
  AlertCircle,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepStatus = "pending" | "running" | "done" | "error";

interface SimStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  detail?: string;
  durationMs: number;
}

// ─── Simulation steps ─────────────────────────────────────────────────────────

const STEPS: SimStep[] = [
  {
    id: "gws-auth",
    icon: <Shield size={13} />,
    label: "Authenticating Google Workspace Admin access",
    durationMs: 750,
  },
  {
    id: "gws-fetch",
    icon: <BarChart2 size={13} />,
    label: "Fetching daily activity report",
    detail: "14 active sessions · 3 shared drives · 2 suspended accounts",
    durationMs: 1100,
  },
  {
    id: "pdf-compile",
    icon: <FileText size={13} />,
    label: "Compiling PDF summary report",
    detail: "report_2026-04-24.pdf  (42 KB)",
    durationMs: 900,
  },
  {
    id: "slack-auth",
    icon: <Webhook size={13} />,
    label: "Authenticating Slack Webhook endpoint",
    detail: "hooks.slack.com/services/T…/B…/****",
    durationMs: 650,
  },
  {
    id: "slack-build",
    icon: <MessageSquare size={13} />,
    label: "Compiling multi-block Slack message structure",
    detail: "header · section · fields · attachment",
    durationMs: 800,
  },
  {
    id: "slack-post",
    icon: <Send size={13} />,
    label: "POST dispatched → #adevinta-tooling",
    detail: "HTTP 200 OK · message_ts: 1745520000.123456",
    durationMs: 600,
  },
];

const TOTAL_MS = STEPS.reduce((s, st) => s + st.durationMs, 0);

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span
      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-400"
      aria-hidden="true"
    />
  );
}

// ─── Step row ────────────────────────────────────────────────────────────────

function StepRow({ step, status }: { step: SimStep; status: StepStatus }) {
  const prefix =
    status === "done" ? (
      <CheckCircle2 size={13} className="shrink-0 text-teal-400" />
    ) : status === "running" ? (
      <Spinner />
    ) : status === "error" ? (
      <AlertCircle size={13} className="shrink-0 text-red-400" />
    ) : (
      <span className="h-3 w-3 shrink-0 rounded-full border border-teal-400/20" />
    );

  return (
    <div
      className={[
        "flex items-start gap-2 py-0.5 font-mono text-xs transition-opacity duration-300",
        status === "pending" ? "opacity-30" : "opacity-100",
      ].join(" ")}
    >
      <span className="mt-0.5">{prefix}</span>
      <span className="text-teal-300/80">{step.icon}</span>
      <span className="flex flex-col gap-0.5">
        <span className={status === "done" ? "text-teal-300" : "text-teal-400/70"}>
          {step.label}
          {status === "running" && <span className="ml-1 animate-pulse text-teal-400">…</span>}
        </span>
        {step.detail && status === "done" && (
          <span className="text-teal-400/50">{step.detail}</span>
        )}
      </span>
    </div>
  );
}

// ─── Mock Slack message ───────────────────────────────────────────────────────

function SlackMessage() {
  return (
    <div className="mt-5 rounded-lg border border-teal-400/20 bg-[#1a1d21] p-4 shadow-inner">
      {/* Bot header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 text-[10px] font-black text-black shadow">
          JAG
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#d1d2d3]">Javier Automation</span>
            <span className="rounded bg-[#2b5278] px-1 py-0.5 text-[10px] font-medium text-[#70b8ff]">
              APP
            </span>
          </div>
          <span className="text-[11px] text-[#5c6068]">Today at 7:30 PM</span>
        </div>
      </div>

      {/* Left-border attachment */}
      <div className="border-l-4 border-teal-400 pl-3">
        <p className="mb-2 font-mono text-xs font-bold text-teal-300">
          📋 Daily GWS Activity Report — 2026-04-24
        </p>

        <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-xs">
          {[
            {
              icon: <Users size={11} className="text-teal-400" />,
              label: "Active sessions",
              value: "14",
            },
            {
              icon: <BarChart2 size={11} className="text-teal-400" />,
              label: "Shared drives",
              value: "3",
            },
            {
              icon: <AlertCircle size={11} className="text-amber-400" />,
              label: "Suspended accts",
              value: "2",
            },
            {
              icon: <FileText size={11} className="text-teal-400" />,
              label: "Report size",
              value: "42 KB",
            },
            {
              icon: <Send size={11} className="text-teal-400" />,
              label: "Channel",
              value: "#adevinta-tooling",
            },
            {
              icon: <Shield size={11} className="text-teal-400" />,
              label: "Auth method",
              value: "OAuth 2.0",
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-1">
              {icon}
              <span className="text-[#8e9097]">{label}:</span>
              <span className="text-[#d1d2d3]">{value}</span>
            </div>
          ))}
        </div>

        <div className="my-2 border-t border-teal-400/10" />

        <p className="font-mono text-[11px] text-[#5c6068]">
          Triggered by <span className="text-teal-400">@javier.automation</span> via GWS Admin SDK ·
          report_2026-04-24.pdf attached
        </p>
      </div>

      {/* Success badge */}
      <div className="mt-3 flex items-center gap-1.5">
        <CheckCircle2 size={12} className="text-teal-400" />
        <span className="font-mono text-[11px] font-semibold text-teal-400">
          Delivered successfully
        </span>
        <span className="ml-auto font-mono text-[10px] text-[#5c6068]">
          HTTP 200 · ts: 1745520000.123456
        </span>
      </div>
    </div>
  );
}

// ─── Inner simulation (always mounted fresh — parent controls lifecycle) ──────
//
// This component runs the simulation once on mount. The parent renders it only
// when the console is open, and provides a fresh `key` on each open so React
// unmounts/remounts it, naturally resetting all state — no manual reset needed.

function ConsoleSimulation({ onClose }: { onClose: () => void }) {
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);

  // Run simulation once on mount — empty deps is intentional
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    STEPS.forEach((step, i) => {
      const startAt = elapsed + i * 120;

      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setCurrentStep(i);
          setStatuses((prev) => ({ ...prev, [step.id]: "running" }));
        }, startAt),
      );

      const doneAt = startAt + step.durationMs;

      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setStatuses((prev) => ({ ...prev, [step.id]: "done" }));
          if (i === STEPS.length - 1) {
            timers.push(
              setTimeout(() => {
                if (!cancelled) setDone(true);
              }, 400),
            );
          }
        }, doneAt),
      );

      elapsed = doneAt;
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  // Esc closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Automation console"
      className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl shadow-2xl"
      style={{
        background: "#0d1117",
        border: "1px solid rgba(45, 212, 191, 0.25)",
        boxShadow: "0 0 40px rgba(45, 212, 191, 0.08), 0 25px 50px rgba(0,0,0,0.8)",
      }}
    >
      {/* CRT scanlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)",
        }}
      />

      {/* Title bar */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "rgba(45, 212, 191, 0.15)", background: "#161b22" }}
      >
        <div className="flex items-center gap-2.5">
          <Terminal size={14} className="text-teal-400" />
          <span className="font-mono text-xs font-semibold text-teal-300">
            javier-automation / gws-slack-report
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close automation console"
            className="text-[#5c6068] transition-colors hover:text-teal-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Console body */}
      <div className="max-h-[70vh] overflow-y-auto p-5">
        <p className="mb-4 font-mono text-xs text-teal-400/60">
          <span className="text-teal-400">❯</span> node scripts/gws-daily-report.js
          --channel=#adevinta-tooling
        </p>

        <div className="space-y-1.5">
          {STEPS.map((step, i) => (
            <StepRow
              key={step.id}
              step={step}
              status={statuses[step.id] ?? (i <= currentStep ? "running" : "pending")}
            />
          ))}
        </div>

        {done && (
          <div className="mt-4 border-t pt-4" style={{ borderColor: "rgba(45, 212, 191, 0.15)" }}>
            <p className="font-mono text-xs text-teal-400">
              <span className="text-teal-300">✓</span> Pipeline completed in{" "}
              <span className="text-teal-300">{(TOTAL_MS / 1000).toFixed(1)}s</span> — exit code{" "}
              <span className="text-teal-300">0</span>
            </p>
          </div>
        )}

        {done && <SlackMessage />}
      </div>
    </div>
  );
}

// ─── Public wrapper — controls overlay visibility ─────────────────────────────

interface AutomationConsoleProps {
  isOpen: boolean;
  /** Incremented by the parent on each open to force a fresh ConsoleSimulation mount */
  runKey: number;
  onClose: () => void;
}

export function AutomationConsole({ isOpen, runKey, onClose }: AutomationConsoleProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 print:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Fresh simulation instance per open */}
      <ConsoleSimulation key={runKey} onClose={onClose} />
    </div>
  );
}
