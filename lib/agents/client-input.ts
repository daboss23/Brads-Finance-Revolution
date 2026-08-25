import type { AgentId } from "@/lib/agents/types";
import { mockClientRepository } from "@/lib/data/client-repository";
import { mockFactFindRepository } from "@/lib/data/fact-find-repository";
import { isBradReviewed } from "@/lib/review-store";
import { checkCompliance } from "@/lib/compliance/compliance-checker";
import { getClientProfile } from "@/lib/client-profiles";

export function buildClientAgentInput(clientId: string, agentId: AgentId) {
  const client = mockClientRepository.getClient(clientId);
  const factFind = mockFactFindRepository.getFactFindSnapshot(clientId);
  const strategies = getClientProfile(clientId)?.strategies ?? [];
  const compliance = checkCompliance(clientId, strategies);
  const bradReviewed = isBradReviewed(clientId);

  return {
    agentId,
    clientId,
    client,
    answers: factFind.answers,
    factFindSource: factFind.source,
    completionPercentage: factFind.completionPercentage ?? client?.progress ?? 0,
    missingSections: factFind.missingSections ?? [],
    bradReviewed,
    approvedForSOA: compliance.blockers.length === 0,
    compliance: {
      score: compliance.complianceScore,
      blockers: compliance.blockers.map((issue) => issue.message),
      warnings: [
        ...compliance.warnings.map((issue) => issue.message),
        ...compliance.missingInformation.map((issue) => issue.message),
      ],
    },
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}
