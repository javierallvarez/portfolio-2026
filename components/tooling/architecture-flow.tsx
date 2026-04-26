import type { LucideIcon } from "lucide-react";
import { ArrowDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlowNode {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tech?: string[];
}

export interface ArchitectureFlowProps {
  nodes: FlowNode[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/5 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-teal-400">
      {label}
    </span>
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1" aria-hidden="true">
      {/* Dashed animated line */}
      <div className="h-6 w-px animate-pulse bg-teal-500/30" />
      <ArrowDown size={14} className="text-teal-500/60" />
    </div>
  );
}

function Node({ node, index }: { node: FlowNode; index: number }) {
  const Icon = node.icon;

  return (
    <div
      className="border-divider bg-content1 relative flex gap-4 rounded-2xl border p-5 transition-shadow hover:shadow-md"
      role="listitem"
    >
      {/* Step number */}
      <span className="absolute -top-2.5 -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
        {index + 1}
      </span>

      {/* Icon */}
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 ring-1 ring-teal-500/20">
        <Icon size={18} className="text-teal-400" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[10px] font-semibold tracking-widest text-teal-500/70 uppercase">
          {node.label}
        </p>
        <p className="text-foreground font-serif text-sm leading-snug font-normal sm:text-base">
          {node.title}
        </p>
        <p className="text-default-500 text-xs leading-relaxed">{node.description}</p>
        {node.tech && node.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {node.tech.map((t) => (
              <TechBadge key={t} label={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a sequential architecture flow diagram using Tailwind + Lucide icons.
 * Accepts a flat array of nodes; connectors are generated automatically between them.
 */
export function ArchitectureFlow({ nodes }: ArchitectureFlowProps) {
  return (
    <ol className="flex flex-col" role="list" aria-label="Architecture flow">
      {nodes.map((node, i) => (
        <li key={node.title} className="flex flex-col">
          <Node node={node} index={i} />
          {i < nodes.length - 1 && <Connector />}
        </li>
      ))}
    </ol>
  );
}
