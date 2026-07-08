import type { AgentDefinition, AgentId } from "@/lib/agents/types";

const objectSchema = {
  type: "object",
  properties: {},
};

export const AGENT_REGISTRY: Record<AgentId, AgentDefinition> = {
  sarah: {
    id: "sarah",
    name: "Sarah",
    role: "Client Discovery Agent",
    description: "Runs the live client discovery session and produces the raw structured fact-find payload.",
    trigger: "During client onboarding only",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: true,
    cacheTTL: null,
    costLevel: "medium",
    autoRunModes: [],
    manualRefresh: false,
  },
  beacon: {
    id: "beacon",
    name: "Beacon",
    role: "Fact Find Structuring Agent",
    description: "Normalises Sarah and manual fact-find data into adviser-ready sections.",
    trigger: "After Sarah completes or fact-find data changes",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: true,
    cacheTTL: null,
    costLevel: "low",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
  },
  guardian: {
    id: "guardian",
    name: "Guardian",
    role: "Compliance and Risk Agent",
    description: "Checks consent, required data, inconsistencies and SOA blockers.",
    trigger: "After Beacon output or Brad review status changes",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: true,
    cacheTTL: null,
    costLevel: "low",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
  },
  scribe: {
    id: "scribe",
    name: "Scribe",
    role: "Meeting Intelligence Agent",
    description: "Creates Brad's meeting brief and later turns transcripts into adviser notes.",
    trigger: "When a client becomes ready for meeting",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: true,
    cacheTTL: null,
    costLevel: "medium",
    autoRunModes: ["balanced", "high-intelligence"],
    manualRefresh: true,
  },
  orion: {
    id: "orion",
    name: "Orion",
    role: "Strategy Intelligence Agent",
    description: "Produces adviser-only strategy considerations. It never approves or sends advice.",
    trigger: "After Guardian confirms enough data exists",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: true,
    cacheTTL: null,
    costLevel: "medium",
    autoRunModes: ["high-intelligence"],
    manualRefresh: true,
  },
  atlas: {
    id: "atlas",
    name: "Atlas",
    role: "SOA Draft Preparation Agent",
    description: "Builds the SOA input pack from Brad-approved fact-find data.",
    trigger: "Only after Brad clicks Approve for SOA",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: true,
    cacheTTL: null,
    costLevel: "medium",
    autoRunModes: [],
    manualRefresh: true,
  },
  cipher: {
    id: "cipher",
    name: "Cipher",
    role: "Follow Up and Client Status Agent",
    description: "Tracks stale clients, missing information and daily follow-up priorities.",
    trigger: "Daily brief, stale pipeline checks and message drafting",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: false,
    cacheTTL: 12 * 60 * 60 * 1000,
    costLevel: "none",
    autoRunModes: ["conservative", "balanced", "high-intelligence"],
    manualRefresh: true,
  },
  nexus: {
    id: "nexus",
    name: "Nexus",
    role: "Integration Agent",
    description: "Reports integration, provider, database and credential health without using AI.",
    trigger: "Settings, command centre and integration health checks",
    inputSchema: objectSchema,
    outputSchema: objectSchema,
    usesAI: false,
    cacheTTL: 5 * 60 * 1000,
    costLevel: "none",
    autoRunModes: ["conservative", "balanced", "high-intelligence"],
    manualRefresh: true,
  },
};

export const AGENT_FLOW: AgentId[] = [
  "sarah",
  "beacon",
  "guardian",
  "scribe",
  "orion",
  "atlas",
  "cipher",
  "nexus",
];

export function getAgentDefinition(agentId: AgentId): AgentDefinition {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentId}`);
  }
  return agent;
}

export function listAgentDefinitions(): AgentDefinition[] {
  return AGENT_FLOW.map((id) => AGENT_REGISTRY[id]);
}
