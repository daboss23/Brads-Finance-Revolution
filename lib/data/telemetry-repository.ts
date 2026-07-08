import { getAgentTelemetry, getLatestTelemetryByClient } from "@/lib/agents/events";
import type { AgentTelemetry } from "@/lib/agents/types";

export type TelemetryRepository = {
  list(limit?: number): AgentTelemetry[];
  listForClient(clientId: string): AgentTelemetry[];
};

export const localTelemetryRepository: TelemetryRepository = {
  list(limit = 40) {
    return getAgentTelemetry(limit);
  },
  listForClient(clientId) {
    return getLatestTelemetryByClient(clientId);
  },
};
