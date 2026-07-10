// Pipeline view of every client's SOA status. Mirrors the brief's stages:
// "SOA In Progress, SOA Review, SOA Approved, SOA Sent, SOA Signed".

import { CLIENTS, type Client } from "../data";
import { getClientProfile } from "../client-profiles";
import { getFactFindOrDemo } from "../sarah-fact-find-store";
import { checkCompliance } from "../compliance/compliance-checker";
import { getSoa } from "./soa-store";
import { generateSoa, SoaGenerationError } from "./soa-generator";
import { isShowpieceClient } from "./demo-soa";
import type { SoaDocument, SoaStatus } from "./soa-template";

export type PipelineStage =
  | "fact-find"
  | "compliance"
  | "soa-in-progress"
  | "soa-review"
  | "soa-approved"
  | "soa-sent"
  | "soa-signed";

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  "fact-find": "Fact Find",
  compliance: "Compliance",
  "soa-in-progress": "SOA In Progress",
  "soa-review": "SOA Review",
  "soa-approved": "SOA Approved",
  "soa-sent": "SOA Sent",
  "soa-signed": "SOA Signed",
};

export interface ClientPipelineRow {
  client: Client;
  stage: PipelineStage;
  soa?: SoaDocument;
}

export function getClientPipelineRow(client: Client): ClientPipelineRow {
  let soa = getSoa(client.id);
  if (!soa && isShowpieceClient(client.id)) {
    try {
      soa = generateSoa(client.id);
    } catch (err) {
      if (!(err instanceof SoaGenerationError)) throw err;
    }
  }
  if (soa) {
    return {
      client,
      stage: stageFromSoa(soa.status),
      soa,
    };
  }
  const factFind = getFactFindOrDemo(client.id);
  const factComplete =
    (factFind?.completionPercentage ?? 0) >= 70 ||
    client.factFindSections.filter((s) => s.status === "complete").length ===
      client.factFindSections.length;
  if (!factComplete) return { client, stage: "fact-find" };

  const strategies = getClientProfile(client.id)?.strategies ?? [];
  const compliance = checkCompliance(client.id, strategies);
  if (
    compliance.overallStatus === "failed" ||
    compliance.blockers.length > 0 ||
    strategies.length === 0
  ) {
    return { client, stage: "compliance" };
  }
  return { client, stage: "soa-in-progress" };
}

function stageFromSoa(status: SoaStatus): PipelineStage {
  switch (status) {
    case "draft":
      return "soa-in-progress";
    case "in-review":
      return "soa-review";
    case "approved":
      return "soa-approved";
    case "sent":
      return "soa-sent";
    case "signed":
      return "soa-signed";
  }
}

export interface PipelineMetrics {
  inGeneration: number;
  awaitingReview: number;
  approvedReady: number;
  signedThisMonth: number;
  total: number;
}

export function getPipelineMetrics(): PipelineMetrics {
  const rows = CLIENTS.map((c) => getClientPipelineRow(c));
  const inGeneration = rows.filter((r) => r.stage === "soa-in-progress").length;
  const awaitingReview = rows.filter((r) => r.stage === "soa-review").length;
  const approvedReady = rows.filter((r) => r.stage === "soa-approved").length;

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const signedThisMonth = rows.filter((r) => {
    if (r.stage !== "soa-signed" || !r.soa) return false;
    const d = new Date(r.soa.generatedAt);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;
  return {
    inGeneration,
    awaitingReview,
    approvedReady,
    signedThisMonth,
    total: rows.length,
  };
}

export function getAllPipelineRows(): ClientPipelineRow[] {
  return CLIENTS.map((c) => getClientPipelineRow(c));
}

export const STAGE_TONE: Record<PipelineStage, string> = {
  "fact-find": "bg-zinc-700/30 text-zinc-300 border-zinc-600/50",
  compliance: "bg-warning/[0.15] text-warning border-warning/35",
  "soa-in-progress": "bg-blue-accent/15 text-blue-accent border-blue-accent/35",
  "soa-review": "bg-warning/[0.15] text-warning border-warning/35",
  "soa-approved": "bg-success/[0.15] text-success border-success/35",
  "soa-sent": "bg-gold/15 text-gold border-gold/35",
  "soa-signed": "bg-success/[0.15] text-success border-success/35",
};
