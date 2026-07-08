import {
  RUNTIME_AGENT_BLUEPRINTS,
  RUNTIME_AGENT_ORDER,
} from "@/lib/agent-system";
import type { AgentDefinition, AgentId } from "@/lib/agents/types";

const objectSchema = {
  type: "object",
  properties: {},
};

export const AGENT_REGISTRY: Record<AgentId, AgentDefinition> = Object.fromEntries(
  RUNTIME_AGENT_ORDER.map((id) => {
    const blueprint = RUNTIME_AGENT_BLUEPRINTS[id];
    return [
      id,
      {
        id: blueprint.id,
        name: blueprint.name,
        role: blueprint.role,
        description: blueprint.description,
        trigger: blueprint.trigger,
        inputSchema: objectSchema,
        outputSchema: objectSchema,
        usesAI: blueprint.usesAI,
        cacheTTL: blueprint.cacheTTL,
        costLevel: blueprint.costLevel,
        autoRunModes: blueprint.autoRunModes,
        manualRefresh: blueprint.manualRefresh,
      } satisfies AgentDefinition,
    ];
  }),
) as Record<AgentId, AgentDefinition>;

export const AGENT_FLOW: AgentId[] = [...RUNTIME_AGENT_ORDER];

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
