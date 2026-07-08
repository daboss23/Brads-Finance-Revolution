import type { AgentId } from "@/lib/agents/types";
import { mockClientRepository } from "@/lib/data/client-repository";
import { mockFactFindRepository } from "@/lib/data/fact-find-repository";
import { isBradReviewed } from "@/lib/review-store";

export function buildClientAgentInput(clientId: string, agentId: AgentId) {
  const client = mockClientRepository.getClient(clientId);
  const factFind = mockFactFindRepository.getFactFindSnapshot(clientId);

  return {
    agentId,
    clientId,
    client,
    answers: factFind.answers,
    factFindSource: factFind.source,
    completionPercentage: factFind.completionPercentage ?? client?.progress ?? 0,
    missingSections: factFind.missingSections ?? [],
    bradReviewed: isBradReviewed(clientId),
    approvedForSOA: false,
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}
