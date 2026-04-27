import type { FlowNode } from "@/components/tooling/architecture-flow";
import type { Dictionary } from "@/lib/get-dictionary";
import { BarChart2, Clock, Database, Globe, MessageSquare, Server, Webhook } from "lucide-react";

type FlowCopy = Dictionary["pages"]["internalTooling"]["iamFlow"][number];

function mapIamNode(
  icon: FlowNode["icon"],
  row: FlowCopy,
): Pick<FlowNode, "icon" | "label" | "title" | "description" | "tech"> {
  return {
    icon,
    label: row.label,
    title: row.title,
    description: row.description,
    tech: row.tech,
  };
}

function mapReportingNode(
  icon: FlowNode["icon"],
  row: FlowCopy,
): Pick<FlowNode, "icon" | "label" | "title" | "description" | "tech"> {
  return {
    icon,
    label: row.label,
    title: row.title,
    description: row.description,
    tech: row.tech,
  };
}

export function buildIamFlowNodes(
  rows: Dictionary["pages"]["internalTooling"]["iamFlow"],
): FlowNode[] {
  const icons = [Webhook, Server, Globe, MessageSquare] as const;
  return rows.map((row, i) => mapIamNode(icons[i]!, row) as FlowNode);
}

export function buildReportingFlowNodes(
  rows: Dictionary["pages"]["internalTooling"]["reportingFlow"],
): FlowNode[] {
  const icons = [Clock, Database, BarChart2] as const;
  return rows.map((row, i) => mapReportingNode(icons[i]!, row) as FlowNode);
}
