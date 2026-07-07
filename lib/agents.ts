import type { LucideIcon } from "lucide-react";
import {
  Activity,
  FileSignature,
  Radar,
  ShieldCheck,
} from "lucide-react";

export type AgentStatus = "Active" | "Monitoring" | "Blocked" | "Ready";
export type AgentPriority = "Low" | "Medium" | "High" | "Critical";

export interface AgentTask {
  title: string;
  client: string;
  priority: AgentPriority;
  eta: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  workload: number;
  signal: string;
  accent: string;
  tone: string;
  activeTask: AgentTask;
  blockedItem?: string;
  nextAction: string;
  capabilities: string[];
}

export const AGENTS: AgentProfile[] = [
  {
    id: "nova",
    name: "NOVA",
    role: "Client Research Agent",
    description:
      "Builds the pre meeting intelligence layer by turning fact find data into a sharp client brief for Brad.",
    icon: Radar,
    status: "Active",
    workload: 78,
    signal: "Research velocity high",
    accent: "from-blue-accent/70",
    tone: "text-blue-accent bg-blue-accent/12 border-blue-accent/30",
    activeTask: {
      title: "Prepare Sarah Mitchell meeting brief",
      client: "Sarah Mitchell",
      priority: "High",
      eta: "18 min",
    },
    nextAction: "Validate missing insurance context before Brad's prep window.",
    capabilities: [
      "Client profile summary",
      "Missing detail detection",
      "Pre meeting brief",
    ],
  },
  {
    id: "vanta",
    name: "VANTA",
    role: "Risk & Compliance Agent",
    description:
      "Controls the compliance gate, checks file quality and highlights advice risk before SOA progress.",
    icon: ShieldCheck,
    status: "Blocked",
    workload: 64,
    signal: "2 blockers live",
    accent: "from-amber-400/75",
    tone: "text-amber-300 bg-amber-400/12 border-amber-400/30",
    activeTask: {
      title: "Resolve David Okafor BID evidence gap",
      client: "David Okafor",
      priority: "Critical",
      eta: "Now",
    },
    blockedItem: "Risk preference and replacement product evidence incomplete.",
    nextAction: "Hold SOA movement until file evidence is completed.",
    capabilities: [
      "Best interests duty checks",
      "Risk flags",
      "SOA readiness gate",
    ],
  },
  {
    id: "orion",
    name: "ORION",
    role: "Strategy & SOA Agent",
    description:
      "Brings the advice file together, drafts strategy logic and prepares the final SOA draft for Brad's approval.",
    icon: FileSignature,
    status: "Active",
    workload: 86,
    signal: "SOA assembly in motion",
    accent: "from-gold/80",
    tone: "text-gold bg-gold/12 border-gold/35",
    activeTask: {
      title: "Assemble Tony Nguyen SOA draft",
      client: "Tony Nguyen",
      priority: "High",
      eta: "32 min",
    },
    nextAction: "Combine goals, projections, risks, fees and implementation into adviser review draft.",
    capabilities: [
      "Strategy assembly",
      "SOA drafting",
      "Adviser review pack",
    ],
  },
  {
    id: "pulse",
    name: "PULSE",
    role: "Client Follow Up Agent",
    description:
      "Keeps client momentum moving by detecting stalls, prioritising follow ups and drafting reminders.",
    icon: Activity,
    status: "Monitoring",
    workload: 52,
    signal: "Pipeline tempo steady",
    accent: "from-emerald-400/70",
    tone: "text-emerald-300 bg-emerald-400/12 border-emerald-400/30",
    activeTask: {
      title: "Follow up unopened fact find links",
      client: "3 clients",
      priority: "Medium",
      eta: "Today",
    },
    nextAction: "Queue personalised nudges for clients stalled before fact find completion.",
    capabilities: [
      "Stall detection",
      "Reminder drafts",
      "Pipeline tempo",
    ],
  },
];

export const AGENT_SYSTEM_SUMMARY = {
  active: AGENTS.filter((agent) => agent.status === "Active").length,
  blocked: AGENTS.filter((agent) => agent.status === "Blocked").length,
  averageWorkload: Math.round(
    AGENTS.reduce((total, agent) => total + agent.workload, 0) / AGENTS.length,
  ),
  criticalTasks: AGENTS.filter(
    (agent) => agent.activeTask.priority === "Critical",
  ).length,
};

export const AGENT_FLOW = [
  { label: "Capture", detail: "Sarah fact find" },
  { label: "Research", detail: "NOVA client brief" },
  { label: "Risk Gate", detail: "VANTA compliance" },
  { label: "Strategy", detail: "ORION SOA draft" },
  { label: "Momentum", detail: "PULSE follow up" },
];

export const ORION_FINAL_SOA_NOTE =
  "ORION writes the final SOA draft and brings the client file, compliance gate, advice strategy, projections and implementation steps together for Brad to approve.";
