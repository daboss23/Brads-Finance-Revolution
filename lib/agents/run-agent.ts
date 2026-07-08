import { randomUUID } from "crypto";
import { getAgentCache, hashAgentInput, setAgentCache } from "@/lib/agents/cache";
import { logAgentTelemetry } from "@/lib/agents/events";
import { getAgentDefinition } from "@/lib/agents/registry";
import type {
  AgentId,
  AgentOutput,
  AgentRunResult,
  AgentTelemetry,
  RunAgentOptions,
} from "@/lib/agents/types";
import { generateAgentJson } from "@/lib/ai/generate-json";
import { saveAgentOutput } from "@/lib/data/agent-output-repository";

function summariseOutput(output: AgentOutput): string {
  if ("completionPercentage" in output) return `Beacon completion ${output.completionPercentage}%`;
  if ("complianceScore" in output) return `Guardian score ${output.complianceScore}`;
  if ("meetingBrief" in output) return "Meeting brief ready";
  if ("strategyThemes" in output) {
    const themes = Array.isArray(output.strategyThemes) ? output.strategyThemes : [];
    return `${themes.length} strategy themes`;
  }
  if ("soaReady" in output) return output.soaReady ? "SOA input pack ready" : "SOA input pack blocked";
  if ("todaysBrief" in output) {
    return typeof output.todaysBrief === "string" ? output.todaysBrief : "Cipher brief ready";
  }
  if ("integrations" in output) {
    const integrations = Array.isArray(output.integrations) ? output.integrations : [];
    return `${integrations.length} integrations checked`;
  }
  return "Agent output ready";
}

export async function runAgent<TOutput extends AgentOutput = AgentOutput>(
  agentId: AgentId,
  input: unknown,
  options: RunAgentOptions = {},
): Promise<AgentRunResult<TOutput>> {
  const agent = getAgentDefinition(agentId);
  const inputHash = hashAgentInput(input);
  const provider = options.provider ?? (agent.usesAI ? "mock" : "deterministic");
  const model = options.model ?? (provider === "mock" ? "mock-agent-v1" : "deterministic-v1");
  const startedAt = new Date();

  if (!options.force) {
    const cached = getAgentCache(agentId, inputHash) as TOutput | null;
    if (cached) {
      const telemetry: AgentTelemetry = {
        id: randomUUID(),
        agentId,
        clientId: options.clientId,
        status: "success",
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 0,
        provider,
        model,
        cached: true,
        costLevel: agent.costLevel,
        inputHash,
        outputSummary: summariseOutput(cached),
      };
      logAgentTelemetry(telemetry);
      return { agentId, output: cached, cached: true, telemetry };
    }
  }

  try {
    const output = (await generateAgentJson(agent, input, { provider, model })) as TOutput;
    setAgentCache(agentId, inputHash, output, agent.cacheTTL);
    if (options.clientId) saveAgentOutput(options.clientId, agentId, output, inputHash);

    const completedAt = new Date();
    const telemetry: AgentTelemetry = {
      id: randomUUID(),
      agentId,
      clientId: options.clientId,
      status: "success",
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      provider,
      model,
      cached: false,
      costLevel: agent.costLevel,
      inputHash,
      outputSummary: summariseOutput(output),
    };
    logAgentTelemetry(telemetry);
    return { agentId, output, cached: false, telemetry };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent failed";
    const fallback = { error: "Agent output unavailable", safeFallback: true } as unknown as TOutput;
    const completedAt = new Date();
    const telemetry: AgentTelemetry = {
      id: randomUUID(),
      agentId,
      clientId: options.clientId,
      status: "error",
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
      provider,
      model,
      cached: false,
      costLevel: agent.costLevel,
      inputHash,
      error: message,
      outputSummary: "Safe fallback returned",
    };
    logAgentTelemetry(telemetry);
    return { agentId, output: fallback, cached: false, telemetry, error: message };
  }
}
