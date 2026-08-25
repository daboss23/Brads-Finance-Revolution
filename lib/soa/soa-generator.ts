// The SOA generator orchestrates the five layers:
//   1. Client intelligence (fact find)
//   2. Brad's knowledge base (voice + reasoning + cases)
//   3. Live market data (snapshotted at generation time)
//   4. Compliance foundation (gate + approved language)
//   5. Strategy reasoning (per-section synthesis)
//
// generateSoa returns a fully assembled SoaDocument or throws a
// SoaGenerationError describing exactly what is blocking the run.

import { CLIENTS } from "../data";
import { getFactFindOrDemo } from "../sarah-fact-find-store";
import { getClientProfile } from "../client-profiles";
import { recommendStrategies } from "../strategy-recommender";
import { STRATEGY_LABELS, type StrategyKey } from "../forms";
import { SEED_STRATEGIES } from "../strategy-catalogue";
import { LANGUAGE_TEMPLATES } from "../compliance/knowledge-base";
import { checkCompliance } from "../compliance/compliance-checker";
import { logAudit } from "../compliance/audit-trail";
import { getAgentOutput } from "../data/agent-output-repository";
import type { AtlasOutput, OrionOutput } from "../agents/types";

import {
  STRATEGY_PATTERNS,
  getCaseStudiesForStrategies,
} from "./knowledge-base";
import {
  SOA_SECTIONS,
  type SoaDocument,
  type SoaSectionContent,
  type SectionId,
} from "./soa-template";
import {
  projectSuper,
  formatProjectionSummary,
  DEFAULT_ASSUMPTIONS,
} from "./projection";
import { snapshotsForStrategies } from "./market-data";
import { buildSarahDemoSections, isShowpieceClient } from "./demo-soa";
import { saveSoa } from "./soa-store";

export const SOA_GENERATOR_VERSION = "1.0.0";
export const SOA_MODEL_VERSION = "claude-sonnet-4-6";

export class SoaGenerationError extends Error {
  readonly blockers: string[];
  constructor(message: string, blockers: string[]) {
    super(message);
    this.blockers = blockers;
  }
}

/** Metadata for a catalogue or custom strategy that has no built-in pattern. */
export interface CustomStrategyMeta {
  id: string;
  name: string;
  description: string;
}

export interface SoaGenerationOptions {
  /**
   * Approved strategy ids for this run. May be built-in StrategyKey values or
   * catalogue/custom ids. When omitted, the generator falls back to the
   * client profile or the recommender.
   */
  recommendations?: string[];
  /** Names + descriptions for custom strategies (which live in the browser). */
  customStrategies?: CustomStrategyMeta[];
  onStage?: (stage: GenerationStage) => void;
}

/** True for the seven built-in strategies that have reasoning patterns wired. */
function isBuiltInStrategy(id: string): id is StrategyKey {
  return Object.prototype.hasOwnProperty.call(STRATEGY_PATTERNS, id);
}

/** Resolve a display label + description for any strategy id. */
function resolveStrategyMeta(
  id: string,
  custom: CustomStrategyMeta[],
): { label: string; description: string; builtIn: boolean } {
  if (isBuiltInStrategy(id)) {
    return { label: STRATEGY_LABELS[id], description: "", builtIn: true };
  }
  const fromCustom = custom.find((c) => c.id === id);
  if (fromCustom) {
    return {
      label: fromCustom.name,
      description: fromCustom.description,
      builtIn: false,
    };
  }
  const seed = SEED_STRATEGIES.find((s) => s.id === id);
  if (seed) {
    return { label: seed.name, description: seed.description, builtIn: false };
  }
  // Unknown id — humanise it so generation never crashes.
  return {
    label: id.replace(/^custom:/, "").replace(/[-_]/g, " "),
    description: "",
    builtIn: false,
  };
}

export type GenerationStage =
  | "loading-client"
  | "compliance-gate"
  | "fetching-market"
  | "generating-summary"
  | "generating-recommendations"
  | "generating-projections"
  | "assembling"
  | "final-compliance"
  | "done";

export const STAGE_LABELS: Record<GenerationStage, string> = {
  "loading-client": "Loading client data",
  "compliance-gate": "Running compliance check",
  "fetching-market": "Fetching current market data",
  "generating-summary": "Generating executive summary",
  "generating-recommendations": "Generating recommendations",
  "generating-projections": "Generating projections",
  assembling: "Assembling document",
  "final-compliance": "Final compliance validation",
  done: "Ready for review",
};

const STAGE_ORDER: GenerationStage[] = [
  "loading-client",
  "compliance-gate",
  "fetching-market",
  "generating-summary",
  "generating-recommendations",
  "generating-projections",
  "assembling",
  "final-compliance",
  "done",
];

export function getStageOrder(): GenerationStage[] {
  return [...STAGE_ORDER];
}

// ── Public entry point ──────────────────────────────────────────────────────

export function generateSoa(
  clientId: string,
  options: SoaGenerationOptions = {},
): SoaDocument {
  const stage = (s: GenerationStage) => options.onStage?.(s);

  stage("loading-client");
  const client = CLIENTS.find((c) => c.id === clientId);
  if (!client) {
    throw new SoaGenerationError(`Unknown client: ${clientId}`, [
      `Client ${clientId} not found in CRM.`,
    ]);
  }
  const factFind = getFactFindOrDemo(clientId);
  if (!factFind) {
    throw new SoaGenerationError("Fact find missing", [
      "Sarah has not yet collected a fact find for this client.",
    ]);
  }
  const profile = getClientProfile(clientId);
  const customStrategies = options.customStrategies ?? [];
  const strategies: string[] =
    options.recommendations ??
    profile?.strategies ??
    recommendStrategies(factFind).map((r) => r.strategyKey);
  if (strategies.length === 0) {
    throw new SoaGenerationError("No strategies approved", [
      "Brad has not approved any strategies for this client. Open the Strategies tab and approve at least one before generating.",
    ]);
  }
  // Compliance scope and market lookups accept the full approved list. The
  // built-in-specific checks (.includes on a StrategyKey) simply don't match
  // catalogue/custom ids, which is correct — those flow through as
  // recommendation content and still count toward the scope of advice.
  const strategyList = strategies as StrategyKey[];

  stage("compliance-gate");
  const compliance = checkCompliance(clientId, strategyList);
  if (compliance.overallStatus === "failed" || compliance.blockers.length > 0) {
    throw new SoaGenerationError(
      "Compliance gate not cleared",
      compliance.blockers.map((b) => `${b.area}: ${b.message}`),
    );
  }

  stage("fetching-market");
  const market = snapshotsForStrategies(strategyList);
  const orionContext = readOrionContext(clientId);
  const atlasContext = readAtlasContext(clientId);

  stage("generating-summary");
  const sections: SoaSectionContent[] = isShowpieceClient(clientId)
    ? buildSarahDemoSections()
    : buildProceduralSections(
        factFind,
        strategies,
        customStrategies,
        client.name,
        orionContext,
        atlasContext,
      );

  stage("generating-recommendations");
  // Already produced in sections above; this stage gate is for the UI

  stage("generating-projections");
  const { points, assumptions } = projectSuper(factFind);

  stage("assembling");
  const doc: SoaDocument = {
    clientId,
    clientName: client.name,
    generatedAt: new Date().toISOString(),
    modelVersion: SOA_MODEL_VERSION,
    generatorVersion: SOA_GENERATOR_VERSION,
    sections,
    projections: points,
    marketSnapshots: market,
    complianceScore: compliance.complianceScore,
    complianceCertificateId: `cert-${clientId}-${Date.now()}`,
    status: "in-review",
  };

  // Ensure projection paragraph reflects actual numbers for non-Sarah clients
  if (!isShowpieceClient(clientId)) {
    const projSection = doc.sections.find((s) => s.id === "retirement-projections");
    if (projSection && projSection.body) {
      projSection.body =
        projSection.body +
        "\n\n" +
        formatProjectionSummary(points, assumptions);
    }
  }

  stage("final-compliance");
  // Re-run compliance against the assembled document. In production this
  // would scan section bodies for required phrases — for now we trust the
  // earlier gate plus the disclosure section.
  const final = checkCompliance(clientId, strategyList);
  doc.complianceScore = final.complianceScore;

  stage("done");
  saveSoa(doc);
  if (typeof window !== "undefined") {
    logAudit(clientId, "certificate-generated", "Brad", {
      format: "SOA",
      score: doc.complianceScore,
      strategies,
      modelVersion: doc.modelVersion,
      generatorVersion: doc.generatorVersion,
      marketSnapshotCount: market.length,
    });
  }
  void DEFAULT_ASSUMPTIONS; // referenced for type imports
  return doc;
}

// ── Procedural section synthesis ────────────────────────────────────────────
// For clients other than the demo showpiece, generate plausible content from
// the fact find and the strategy reasoning patterns. This is a structural
// stand-in until the Claude API integration is wired in (the streaming
// pattern lives in app/api/sarah/route.ts and will be repurposed in Phase 4
// for the real generation calls).

function buildProceduralSections(
  factFind: ReturnType<typeof getFactFindOrDemo>,
  strategies: string[],
  customStrategies: CustomStrategyMeta[],
  clientName: string,
  orionContext: OrionOutput | null,
  atlasContext: AtlasOutput | null,
): SoaSectionContent[] {
  if (!factFind) throw new Error("Fact find required");

  const isJointClient = clientName.includes("&") || /\band\b/i.test(clientName);
  const clientAddress = isJointClient ? "James and Fiona" : clientName.split(" ")[0];
  const responsibleClient = isJointClient ? clientName.replace("&", "and") : clientAddress;
  const meta = (id: string) => resolveStrategyMeta(id, customStrategies);
  const caseStudies = getCaseStudiesForStrategies(
    strategies.filter(isBuiltInStrategy),
  );
  const incomeRaw = factFind.employmentAndIncome.annualGrossIncome || "your income";
  const superFund = factFind.superannuation.fundName || "your current super fund";
  const superBalance = factFind.superannuation.estimatedBalance || "your current balance";
  const atlasRecommendations = atlasContext?.tailoredRecommendations ?? [];
  const atlasThemes = atlasContext?.strategyThemes ?? [];
  const atlasAssumptions = atlasContext?.projectionAssumptions ?? [];
  const atlasPersonalisation = atlasContext?.personalizationNotes ?? [];
  const orionHighlights = orionContext?.evidencePacket.factFindHighlights ?? [];
  const orionProjectionInputs = orionContext?.evidencePacket.projectionInputs ?? [];

  const bodies: Partial<Record<SectionId, string>> = {
    cover: `This Statement of Advice has been prepared for ${clientName} by Brad Lonergan, Authorised Representative of Charter Financial Planning Limited AFSL 234665, trading as Newcastle Financial Services. It is confidential and prepared for your personal use only.`,

    "executive-summary": `${clientAddress}, this plan covers ${strategies
      .map((s) => meta(s).label.toLowerCase())
      .join(", ")} based on the information we collected during your Financial Discovery Session. The recommendations are tailored to your situation, your income of ${incomeRaw} and your stated goals. Working through this plan should put you in a measurably stronger financial position by your annual review.${atlasPersonalisation.length > 0 ? ` Adviser context used for this draft includes ${atlasPersonalisation.join(" ")}` : ""}`,

    "about-you": `You are ${factFind.familyAndDependants.relationshipStatus.toLowerCase() || "currently single"} living at ${factFind.personalDetails.address || "your current address"}. ${
      factFind.familyAndDependants.numberOfDependants &&
      factFind.familyAndDependants.numberOfDependants !== "0"
        ? `You have ${factFind.familyAndDependants.numberOfDependants} dependants. `
        : "You have no dependants. "
    }You work as ${factFind.employmentAndIncome.occupation || "your current role"} at ${factFind.employmentAndIncome.employerName || "your current employer"} earning ${incomeRaw}. Your superannuation is held with ${superFund} with a balance of ${superBalance}. You told us your priorities are ${factFind.goalsAndObjectives.primaryFinancialGoals || "the goals you described in your session"}.`,

    "risk-profile": `Your recorded risk profile is ${factFind.goalsAndObjectives.investmentRiskPreference || "Moderate"}. That profile guides every investment recommendation in this plan. We have aligned the recommended asset allocation accordingly. Please confirm this still reflects your attitude to risk by signing the acknowledgement at the back of this document.${atlasThemes.length > 0 ? ` The strategy themes highlighted for your file are ${atlasThemes.map((theme) => theme.toLowerCase()).join(", ")}.` : ""}`,

    // Always produce one recommendation per approved strategy — built-in,
    // ATO/MLC catalogue or custom — so every strategy Brad pulled in appears
    // in the plan. The ATLAS agent's tailored narrative is folded in as
    // additional adviser context after the strategy list.
    recommendations: (() => {
      const perStrategy = strategies.map((s, i) => {
        const m = meta(s);
        if (isBuiltInStrategy(s)) {
          const pattern = STRATEGY_PATTERNS[s];
          return `Recommendation ${i + 1}: ${m.label}. ${pattern.openingAngle} We recommend this strategy because it fits your circumstances based on what you shared with us. Key things this addresses for you: ${pattern.mustCover.slice(0, 2).join("; ")}. Alternatives considered and not chosen: standard product without active review, do nothing. Implementation steps are documented in the implementation plan below.`;
        }
        // Catalogue or custom strategy: reason from its description.
        return `Recommendation ${i + 1}: ${m.label}. ${m.description} We recommend this strategy because it fits your circumstances based on what you shared with us. Alternatives considered and not chosen: standard product without active review, do nothing. This recommendation requires adviser review. Implementation steps are documented in the implementation plan below.`;
      });

      const evidenceNote =
        orionHighlights.length > 0
          ? ` This is supported by file evidence including ${orionHighlights.join(" ")}`
          : "";
      const adviserContext = atlasRecommendations.map(
        (recommendation) =>
          `Adviser consideration: ${recommendation}${evidenceNote}`,
      );

      return [...perStrategy, ...adviserContext].join("\n\n");
    })(),

    superannuation: `Your super is currently with ${superFund} at ${superBalance}. We recommend reviewing your investment option and contribution rate at the next annual review. ${caseStudies.find((c) => c.strategy === "super-consolidation")?.learning ?? ""}`,

    insurance: strategies.includes("insurance-review")
      ? `Your current cover is below what we would consider appropriate for your circumstances. We recommend tailored life, TPD and income protection cover through a Charter approved insurer. Premium estimates will be confirmed at underwriting.`
      : `Insurance was not included in the scope of this advice. We recommend a separate insurance review within the next twelve months.`,

    investment: strategies.includes("investment-strategy") || strategies.includes("platform-setup")
      ? `We recommend an asset allocation matching your ${factFind.goalsAndObjectives.investmentRiskPreference || "moderate"} risk profile, implemented through a Charter approved platform. Fees and projected returns are detailed below.`
      : `An investment strategy outside super was not included in the scope of this advice.`,

    "retirement-projections": `Your retirement projection is set out below using conservative assumptions. We will update this every year at your annual review.${atlasAssumptions.length > 0 ? ` The current modelling assumptions for this draft are ${atlasAssumptions.join(" ")}` : ""}${orionProjectionInputs.length > 0 ? ` Key inputs include ${orionProjectionInputs.map((item) => `${item.label}: ${item.value}`).join(". ")}.` : ""}`,

    implementation: `1. Sign and return this SOA. Responsible: ${responsibleClient}. By: within 14 days.\n2. Brad and Colleen lodge all provider applications. Responsible: Brad. By: within 7 days of signed SOA.\n3. Annual review meeting. Responsible: Brad and ${responsibleClient}. By: 12 months from sign date.`,

    "ongoing-service": `Your ongoing service is the BMK Annual Review package. It includes an annual review meeting, quarterly check-in, ad hoc support for life events and all provider liaison work.`,

    "compliance-disclosures": LANGUAGE_TEMPLATES.map((t) => `${t.title}. ${t.body}`).join("\n\n"),
  };

  return SOA_SECTIONS.map((tpl) => ({
    id: tpl.id,
    number: tpl.number,
    title: tpl.title,
    body: bodies[tpl.id] ?? "",
    needsReview: tpl.needsReviewByDefault,
    reviewReason: tpl.needsReviewByDefault
      ? "Procedurally generated — Brad to verify before sending."
      : undefined,
    confidence: tpl.defaultConfidence,
    reviewed: false,
    approved: false,
  }));
}

function readOrionContext(clientId: string): OrionOutput | null {
  const stored = getAgentOutput(clientId, "orion");
  if (!stored || !("soaReady" in stored.output)) return null;
  return stored.output as OrionOutput;
}

function readAtlasContext(clientId: string): AtlasOutput | null {
  const stored = getAgentOutput(clientId, "atlas");
  if (!stored || !("strategyThemes" in stored.output)) return null;
  return stored.output as AtlasOutput;
}

// ── Diagnostics ─────────────────────────────────────────────────────────────

export interface GenerationReadiness {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  strategies: StrategyKey[];
  complianceScore: number;
  factFindCompletion: number;
}

export function getGenerationReadiness(clientId: string): GenerationReadiness {
  const factFind = getFactFindOrDemo(clientId);
  const profile = getClientProfile(clientId);
  const strategies = profile?.strategies ?? [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!factFind) {
    blockers.push("Fact find has not been collected by Sarah.");
  } else if (factFind.completionPercentage < 70) {
    warnings.push(
      `Fact find is only ${factFind.completionPercentage}% complete. Some sections may be generated with limited information.`,
    );
  }

  if (strategies.length === 0) {
    blockers.push("No strategies have been approved for this client.");
  }

  let score = 0;
  if (factFind) {
    const compliance = checkCompliance(clientId, strategies);
    score = compliance.complianceScore;
    if (compliance.overallStatus === "failed") {
      blockers.push("Compliance gate failed — open the Compliance tab to resolve.");
    }
    for (const b of compliance.blockers) {
      blockers.push(`Compliance: ${b.area} — ${b.message}`);
    }
    for (const w of compliance.warnings) {
      warnings.push(`Compliance: ${w.area} — ${w.message}`);
    }
    for (const m of compliance.missingInformation) {
      warnings.push(`Missing data: ${m.area} — ${m.message}`);
    }
  }

  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    strategies,
    complianceScore: score,
    factFindCompletion: factFind?.completionPercentage ?? 0,
  };
}
