import type { AgentId, AgentTelemetry } from "@/lib/agents/types";
import { secureAppend, secureEvents } from "@/lib/secure-store";

// Telemetry is kept in an in-memory ring buffer for same-instance reads and
// mirrored through the encrypted store (file backend locally, Postgres when
// DATABASE_URL is set) so run history survives serverless cold starts.
const TELEMETRY_NAMESPACE = "agent-telemetry";
const MEMORY_LIMIT = 80;
const PERSISTED_LOOKBACK = 120;

const telemetryEvents: AgentTelemetry[] = [];
let hydration: Promise<void> | null = null;

export function logAgentTelemetry(event: AgentTelemetry) {
  telemetryEvents.unshift(event);
  telemetryEvents.splice(MEMORY_LIMIT);
  // Fire-and-forget durable copy — telemetry must never block or break a run.
  void secureAppend(TELEMETRY_NAMESPACE, event).catch(() => {
    // Offline store: the in-memory copy still serves this instance.
  });
}

/**
 * Telemetry with cold-start hydration. The first call after a fresh instance
 * merges the persisted event log into memory (deduped by event id), so the
 * Agents page shows real run history instead of "idle" after a redeploy.
 */
export async function getAgentTelemetryHydrated(limit = 40): Promise<AgentTelemetry[]> {
  if (!hydration) {
    hydration = (async () => {
      try {
        const persisted = await secureEvents<AgentTelemetry>(
          TELEMETRY_NAMESPACE,
          PERSISTED_LOOKBACK,
        );
        const seen = new Set(telemetryEvents.map((event) => event.id));
        for (const event of persisted) {
          if (event?.id && !seen.has(event.id)) {
            telemetryEvents.push(event);
            seen.add(event.id);
          }
        }
        telemetryEvents.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
        telemetryEvents.splice(MEMORY_LIMIT);
      } catch {
        // Store unavailable — serve whatever this instance has in memory.
      }
    })();
  }
  await hydration;
  return telemetryEvents.slice(0, limit);
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