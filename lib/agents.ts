import {
  CORE_AGENT_BLUEPRINTS,
  CORE_AGENT_ORDER,
  type CommandAgentId,
  type CommandAgentPriority,
  type CommandAgentStatus,
  type CommandAgentTone,
} from "@/lib/agent-system";
import { CLIENTS } from "@/lib/data";

export type AgentId = CommandAgentId;

export type AgentStatus = CommandAgentStatus;

export type AgentPriority = CommandAgentPriority;

export type AgentTone = CommandAgentTone;

export type Agent = {
  id: AgentId;
  name: string;
  role: string;
  tagline: string;
  domain: string;
  description: string;
  tone: AgentTone;
  callsign: string;
  flowStep: number;
  runtimeAgents: string[];
  status: AgentStatus;
  workload: number;
  activeTask: string;
  blockedItem: string | null;
  linkedClientId: string | null;
  priority: AgentPriority;
  nextAction: string;
  queueDepth: number;
  completedToday: number;
  throughput: number[];
  confidence: number;
};

type AgentState = Omit<
  Agent,
  | "id"
  | "name"
  | "role"
  | "tagline"
  | "domain"
  | "description"
  | "tone"
  | "callsign"
  | "flowStep"
  | "runtimeAgents"
>;

const AGENT_STATE: Record<AgentId, AgentState> = {
  nova: {
    status: "active",
    workload: 68,
    activeTask: "Preparing pre meeting brief for Sarah Mitchell",
    blockedItem: null,
    linkedClientId: "sarah-mitchell",
    priority: "high",
    nextAction: "Surface insurance and goals priorities before 28 May meeting",
    queueDepth: 3,
    completedToday: 5,
    throughput: [3, 4, 2, 5, 4, 6, 5, 7],
    confidence: 94,
  },
  vanta: {
    status: "blocked",
    workload: 81,
    activeTask: "Reviewing best interests duty evidence for David Okafor",
    blockedItem: "Missing income verification and goals confirmation",
    linkedClientId: "david-okafor",
    priority: "critical",
    nextAction: "Request outstanding fact find evidence before SOA can proceed",
    queueDepth: 4,
    completedToday: 2,
    throughput: [4, 3, 5, 2, 3, 2, 4, 3],
    confidence: 88,
  },
  atlas: {
    status: "ready",
    workload: 59,
    activeTask: "Synthesising tailored SOA plan for Robert and Sue Tanner",
    blockedItem: null,
    linkedClientId: "robert-sue-tanner",
    priority: "high",
    nextAction: "Review projection assumptions and personalised recommendations with Brad",
    queueDepth: 2,
    completedToday: 1,
    throughput: [1, 2, 2, 3, 2, 3, 3, 2],
    confidence: 93,
  },
  pulse: {
    status: "monitoring",
    workload: 47,
    activeTask: "Tracking stalled clients across the pipeline",
    blockedItem: null,
    linkedClientId: "michael-kate-reynolds",
    priority: "medium",
    nextAction: "Draft reminder for Michael and Kate Reynolds with no fact find activity",
    queueDepth: 6,
    completedToday: 8,
    throughput: [6, 5, 7, 6, 8, 7, 9, 8],
    confidence: 96,
  },
};

function clientName(id: string | null): string | null {
  if (!id) return null;
  return CLIENTS.find((c) => c.id === id)?.name ?? null;
}

export const AGENTS: Agent[] = CORE_AGENT_ORDER.map((id) => {
  const blueprint = CORE_AGENT_BLUEPRINTS[id];
  return {
    ...blueprint,
    ...AGENT_STATE[id],
  };
});

export function getAgent(id: AgentId): Agent | undefined {
  return AGENTS.find((agent) => agent.id === id);
}

export function getAgentLinkedClientName(agent: Agent): string | null {
  return clientName(agent.linkedClientId);
}

export const STATUS_META: Record<
  AgentStatus,
  { label: string; dot: string; text: string; ring: string; bg: string }
> = {
  active: {
    label: "Active",
    dot: "bg-blue-accent",
    text: "text-blue-accent",
    ring: "border-blue-accent/30",
    bg: "bg-blue-accent/10",
  },
  monitoring: {
    label: "Monitoring",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    ring: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-orange-400",
    text: "text-orange-300",
    ring: "border-orange-500/30",
    bg: "bg-orange-500/10",
  },
  ready: {
    label: "Ready",
    dot: "bg-gold",
    text: "text-gold",
    ring: "border-gold/30",
    bg: "bg-gold/10",
  },
};

export const PRIORITY_META: Record<
  AgentPriority,
  { label: string; text: string; bg: string; border: string }
> = {
  low: {
    label: "Low",
    text: "text-muted-foreground/80",
    bg: "bg-white/[0.04]",
    border: "border-border/70",
  },
  medium: {
    label: "Medium",
    text: "text-blue-accent",
    bg: "bg-blue-accent/10",
    border: "border-blue-accent/25",
  },
  high: {
    label: "High",
    text: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/25",
  },
  critical: {
    label: "Critical",
    text: "text-orange-300",
    bg: "bg-orange-500/12",
    border: "border-orange-500/30",
  },
};

export type ActionQueueItem = {
  id: string;
  agentId: AgentId;
  label: string;
  clientId: string | null;
  priority: AgentPriority;
  href: string;
};

export const ACTION_QUEUE: ActionQueueItem[] = [
  {
    id: "aq-1",
    agentId: "vanta",
    label: "Resolve compliance blocker on David Okafor before SOA can proceed",
    clientId: "david-okafor",
    priority: "critical",
    href: "/clients/david-okafor/compliance",
  },
  {
    id: "aq-2",
    agentId: "atlas",
    label: "Review ATLAS SOA draft prepared for Robert and Sue Tanner",
    clientId: "robert-sue-tanner",
    priority: "high",
    href: "/clients/robert-sue-tanner/soa",
  },
  {
    id: "aq-3",
    agentId: "nova",
    label: "Review NOVA client brief for Sarah Mitchell before the 28 May meeting",
    clientId: "sarah-mitchell",
    priority: "high",
    href: "/clients/sarah-mitchell/fact-find-review",
  },
  {
    id: "aq-4",
    agentId: "vanta",
    label: "Confirm best interests evidence for Angela Forsyth",
    clientId: "angela-forsyth",
    priority: "medium",
    href: "/clients/angela-forsyth/compliance",
  },
  {
    id: "aq-5",
    agentId: "pulse",
    label: "Send PULSE follow up reminder to Michael and Kate Reynolds",
    clientId: "michael-kate-reynolds",
    priority: "medium",
    href: "/clients/michael-kate-reynolds",
  },
];

export function getActionClientName(item: ActionQueueItem): string | null {
  return clientName(item.clientId);
}
