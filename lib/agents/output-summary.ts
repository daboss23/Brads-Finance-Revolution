import type {
  AgentId,
  AgentOutput,
  AtlasOutput,
  BeaconOutput,
  GuardianOutput,
  OrionOutput,
  ScribeOutput,
} from "./types";

/**
 * Human readable one-liner describing what an agent actually produced.
 * Used by the SOA generation stream (live agent feed) and telemetry views
 * so Brad can see each agent's real contribution during a run.
 */
export function describeAgentOutput(agentId: AgentId, output: AgentOutput): string {
  switch (agentId) {
    case "beacon": {
      const o = output as BeaconOutput;
      const gaps = o.missingFields?.length ?? 0;
      return `${o.completionPercentage}% of the discovery file structured, ${gaps} gap${gaps === 1 ? "" : "s"} flagged for Brad`;
    }
    case "guardian": {
      const o = output as GuardianOutput;
      return `Compliance ${o.complianceScore}/100, ${o.criticalFlags.length} critical and ${o.warningFlags.length} advisory flags, ${o.blockedFromSOA ? "file blocked pending evidence" : "clear to proceed"}`;
    }
    case "scribe": {
      const o = output as ScribeOutput;
      return `Meeting brief ready with ${o.likelyPriorities.length} priorities and ${o.questionsForBrad.length} adviser questions`;
    }
    case "orion": {
      const o = output as OrionOutput;
      return o.soaReady
        ? `Evidence packet assembled from ${o.evidencePacket.factFindHighlights.length} verified fact highlights`
        : `Evidence packet held, ${o.missingBeforeDraft.length} item${o.missingBeforeDraft.length === 1 ? "" : "s"} outstanding`;
    }
    case "atlas": {
      const o = output as AtlasOutput;
      return `${o.strategyThemes.length} strategy themes and ${o.tailoredRecommendations.length} tailored recommendations drafted for Brad review, uncertainty ${o.uncertaintyLevel}`;
    }
    default:
      return "Output ready";
  }
}