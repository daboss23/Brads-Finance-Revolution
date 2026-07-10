import type { AgentId, CostLevel, UsageMode } from "@/lib/agents/types";

export type CommandAgentStatus = "active" | "monitoring" | "blocked" | "ready";

export type CommandAgentPriority = "low" | "medium" | "high" | "critical";

export type CommandAgentTone = "blue" | "orange" | "gold" | "emerald" | "violet";

export type AgentCategory =
  | "discovery"
  | "workflow"
  | "strategy"
  | "operations"
  | "platform";

export type RuntimeAgentBlueprint = {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  trigger: string;
  usesAI: boolean;
  cacheTTL: number | null;
  costLevel: CostLevel;
  autoRunModes: UsageMode[];
  manualRefresh: boolean;
  category: AgentCategory;
  flowStep: number | null;
};

export const RUNTIME_AGENT_ORDER: AgentId[] = [
  "sarah",
  "beacon",
  "guardian",
  "scribe",
  "orion",
  "atlas",
  "cipher",
  "nexus",
];

export const ACTIVE_WORKFLOW_AGENT_ORDER: AgentId[] = [
  "beacon",
  "guardian",
  "scribe",
  "orion",
  "atlas",
];

export const RUNTIME_AGENT_BLUEPRINTS: Record<AgentId, RuntimeAgentBlueprint> = {
  sarah: {
    id: "sarah",
    name: "Sarah",
    role: "Client Discovery Agent",
    description:
      "Runs the live client discovery session and produces the raw structured fact-find payload.",
    trigger: "During client onboarding only",
    usesAI: true,
    cacheTTL: null,
    costLevel: "medium",
    autoRunModes: [],
    manualRefresh: false,
    category: "discovery",
    flowStep: 0,
  },
  beacon: {
    id: "beacon",
    name: "Beacon",
    role: "Fact Find Structuring Agent",
    description:
      "Normalises Sarah and manual fact-find data into adviser-ready sections.",
    trigger: "After Sarah completes or fact-find data changes",
    usesAI: true,
    cacheTTL: null,
    costLevel: "low",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
    category: "workflow",
    flowStep: 1,
  },
  guardian: {
    id: "guardian",
    name: "Guardian",
    role: "Compliance and Risk Agent",
    description:
      "Checks consent, required data, inconsistencies and SOA blockers.",
    trigger: "After Beacon output or Brad review status changes",
    usesAI: true,
    cacheTTL: null,
    costLevel: "low",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
    category: "workflow",
    flowStep: 2,
  },
  scribe: {
    id: "scribe",
    name: "Scribe",
    role: "Meeting Intelligence Agent",
    description:
      "Creates Brad's meeting brief and later turns transcripts into adviser notes.",
    trigger: "When a client becomes ready for meeting",
    usesAI: true,
    cacheTTL: null,
    costLevel: "medium",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
    category: "workflow",
    flowStep: 3,
  },
  orion: {
    id: "orion",
    name: "Orion",
    role: "SOA Evidence Assembly Agent",
    description:
      "Builds the approved evidence packet ATLAS uses for tailored SOA drafting, including fact highlights, compliance notes and projection inputs.",
    trigger: "After Guardian clears core blockers and Brad review is underway",
    usesAI: true,
    cacheTTL: null,
    costLevel: "low",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
    category: "strategy",
    flowStep: 4,
  },
  atlas: {
    id: "atlas",
    name: "ATLAS",
    role: "Strategy and Final SOA Agent",
    description:
      "Synthesises approved facts, compliance guardrails, meeting context, knowledge chunks and projection assumptions into Brad-ready SOA strategy output.",
    trigger: "After Orion assembles the evidence packet and Brad is ready for draft strategy review",
    usesAI: true,
    cacheTTL: null,
    costLevel: "medium",
    autoRunModes: ["high-intelligence"],
    manualRefresh: true,
    category: "strategy",
    flowStep: 5,
  },
  cipher: {
    id: "cipher",
    name: "Cipher",
    role: "Follow Up and Client Status Agent",
    description:
      "Tracks stale clients, missing information and daily follow-up priorities.",
    trigger: "Daily brief, stale pipeline checks and message drafting",
    usesAI: false,
    cacheTTL: 12 * 60 * 60 * 1000,
    costLevel: "none",
    autoRunModes: ["conservative", "balanced", "high-intelligence"],
    manualRefresh: true,
    category: "operations",
    flowStep: 6,
  },
  nexus: {
    id: "nexus",
    name: "Nexus",
    role: "Integration Agent",
    description:
      "Reports integration, provider, database and credential health without using AI.",
    trigger: "Settings, command centre and integration health checks",
    usesAI: false,
    cacheTTL: 5 * 60 * 1000,
    costLevel: "none",
    autoRunModes: ["conservative", "balanced", "high-intelligence"],
    manualRefresh: true,
    category: "platform",
    flowStep: null,
  },
};

export function listRuntimeBlueprints() {
  return RUNTIME_AGENT_ORDER.map((id) => RUNTIME_AGENT_BLUEPRINTS[id]);
}

export function getRuntimeBlueprint(agentId: AgentId) {
  return RUNTIME_AGENT_BLUEPRINTS[agentId];
}

export function listActiveWorkflowBlueprints() {
  return ACTIVE_WORKFLOW_AGENT_ORDER.map((id) => RUNTIME_AGENT_BLUEPRINTS[id]);
}
