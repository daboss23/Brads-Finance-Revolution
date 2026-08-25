import type { AgentId, AgentOutput } from "@/lib/agents/types";

export type StoredAgentOutput = {
  clientId: string;
  agentId: AgentId;
  output: AgentOutput;
  inputHash: string;
  updatedAt: string;
};

export type AgentOutputRepository = {
  save(output: StoredAgentOutput): void;
  get(clientId: string, agentId: AgentId): StoredAgentOutput | null;
  listForClient(clientId: string): StoredAgentOutput[];
};

const outputs = new Map<string, StoredAgentOutput>();

function key(clientId: string, agentId: AgentId) {
  return `${clientId}:${agentId}`;
}

export const localAgentOutputRepository: AgentOutputRepository = {
  save(output) {
    outputs.set(key(output.clientId, output.agentId), output);
  },
  get(clientId, agentId) {
    return outputs.get(key(clientId, agentId)) ?? null;
  },
  listForClient(clientId) {
    return Array.from(outputs.values()).filter((output) => output.clientId === clientId);
  },
};

export function saveAgentOutput(
  clientId: string,
  agentId: AgentId,
  output: AgentOutput,
  inputHash: string,
) {
  localAgentOutputRepository.save({
    clientId,
    agentId,
    output,
    inputHash,
    updatedAt: new Date().toISOString(),
  });
}

export function getAgentOutput(clientId: string, agentId: AgentId) {
  return localAgentOutputRepository.get(clientId, agentId);
}
