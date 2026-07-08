import type { AgentId, AgentTelemetry } from "@/lib/agents/types";

const telemetryEvents: AgentTelemetry[] = [];

export function logAgentTelemetry(event: AgentTelemetry) {
  telemetryEvents.unshift(event);
  telemetryEvents.splice(80);
}

export function getAgentTelemetry(limit = 40): AgentTelemetry[] {
  return telemetryEvents.slice(0, limit);
}

export function getLatestTelemetryForAgent(agentId: AgentId): AgentTelemetry | undefined {
  return telemetryEvents.find((event) => event.agentId === agentId);
}

export function getLatestTelemetryByClient(clientId: string): AgentTelemetry[] {
  return telemetryEvents.filter((event) => event.clientId === clientId);
}
