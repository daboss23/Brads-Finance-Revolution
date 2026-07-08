import type { AgentId, CostLevel, UsageMode } from "@/lib/agents/types";

export type CommandAgentId = "nova" | "vanta" | "atlas" | "pulse";

export type CommandAgentStatus = "active" | "monitoring" | "blocked" | "ready";

export type CommandAgentPriority = "low" | "medium" | "high" | "critical";

export type CommandAgentTone = "blue" | "orange" | "gold" | "emerald" | "violet";

export type CoreAgentBlueprint = {
  id: CommandAgentId;
  name: string;
  role: string;
  tagline: string;
  domain: string;
  description: string;
  tone: CommandAgentTone;
  callsign: string;
  flowStep: number;
  runtimeAgents: AgentId[];
};

export type RuntimeAgentBlueprint = {
  id: AgentId;
  coreAgentId: CommandAgentId | null;
  name: string;
  role: string;
  description: string;
  trigger: string;
  usesAI: boolean;
  cacheTTL: number | null;
  costLevel: CostLevel;
  autoRunModes: UsageMode[];
  manualRefresh: boolean;
};

export const CORE_AGENT_ORDER: CommandAgentId[] = ["nova", "vanta", "atlas", "pulse"];

export const CORE_AGENT_BLUEPRINTS: Record<CommandAgentId, CoreAgentBlueprint> = {
  nova: {
    id: "nova",
    name: "NOVA",
    role: "Client Research Agent",
    tagline: "Client Intelligence",
    domain: "Research and pre meeting context",
    description:
      "Summarises fact-find context, highlights missing evidence and prepares Brad with the most useful client intelligence before strategy work begins.",
    tone: "blue",
    callsign: "Reads every file before Brad walks in the room",
    flowStep: 1,
    runtimeAgents: ["beacon", "scribe"],
  },
  vanta: {
    id: "vanta",
    name: "VANTA",
    role: "Risk and Compliance Agent",
    tagline: "Compliance Gate",
    domain: "Best interests duty and advice risk",
    description:
      "Owns compliance readiness, consent checks, evidence gaps and the gate that determines whether a client file can move toward advice drafting.",
    tone: "orange",
    callsign: "Nothing reaches advice without clearing the gate",
    flowStep: 2,
    runtimeAgents: ["guardian"],
  },
  atlas: {
    id: "atlas",
    name: "ATLAS",
    role: "Strategy and Final SOA Agent",
    tagline: "Strategy and Final Assembly",
    domain: "SOA drafting and strategy logic",
    description:
      "Pulls approved facts, projections, compliance guardrails and reusable knowledge into a tailored SOA plan Brad can review and refine.",
    tone: "gold",
    callsign: "Pulls approved facts, projections and knowledge fragments into a tailored SOA draft",
    flowStep: 3,
    runtimeAgents: ["orion", "atlas"],
  },
  pulse: {
    id: "pulse",
    name: "PULSE",
    role: "Client Follow Up Agent",
    tagline: "Pipeline Momentum",
    domain: "Follow ups and pipeline movement",
    description:
      "Tracks stalled clients, follow-up priorities and pipeline momentum so good files do not go cold before they reach Brad.",
    tone: "emerald",
    callsign: "Keeps every client moving, never lets one go quiet",
    flowStep: 4,
    runtimeAgents: ["cipher"],
  },
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

export const RUNTIME_AGENT_BLUEPRINTS: Record<AgentId, RuntimeAgentBlueprint> = {
  sarah: {
    id: "sarah",
    coreAgentId: null,
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
  },
  beacon: {
    id: "beacon",
    coreAgentId: "nova",
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
  },
  guardian: {
    id: "guardian",
    coreAgentId: "vanta",
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
  },
  scribe: {
    id: "scribe",
    coreAgentId: "nova",
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
  },
  orion: {
    id: "orion",
    coreAgentId: "atlas",
    name: "Orion",
    role: "SOA Evidence Assembly Agent",
    description:
      "Builds the approved evidence packet Atlas uses for tailored SOA drafting, including fact highlights, compliance notes and projection inputs.",
    trigger: "After Guardian clears core blockers and Brad review is underway",
    usesAI: true,
    cacheTTL: null,
    costLevel: "low",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
  },
  atlas: {
    id: "atlas",
    coreAgentId: "atlas",
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
  },
  cipher: {
    id: "cipher",
    coreAgentId: "pulse",
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
  },
  nexus: {
    id: "nexus",
    coreAgentId: null,
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
  },
};

export function listRuntimeBlueprints() {
  return RUNTIME_AGENT_ORDER.map((id) => RUNTIME_AGENT_BLUEPRINTS[id]);
}

export function getRuntimeBlueprint(agentId: AgentId) {
  return RUNTIME_AGENT_BLUEPRINTS[agentId];
}

export function listCoreBlueprints() {
  return CORE_AGENT_ORDER.map((id) => CORE_AGENT_BLUEPRINTS[id]);
}

export function getCoreBlueprint(coreAgentId: CommandAgentId) {
  return CORE_AGENT_BLUEPRINTS[coreAgentId];
}

export function getRuntimeBlueprintsForCore(coreAgentId: CommandAgentId) {
  return CORE_AGENT_BLUEPRINTS[coreAgentId].runtimeAgents.map(
    (agentId) => RUNTIME_AGENT_BLUEPRINTS[agentId],
  );
}
