// Canonical structure of Brad's SOA. Each section has an id, title, render
// hints and a generation brief that the AI uses to draft the content.

export type SectionId =
  | "cover"
  | "executive-summary"
  | "about-you"
  | "risk-profile"
  | "recommendations"
  | "superannuation"
  | "insurance"
  | "investment"
  | "retirement-projections"
  | "implementation"
  | "ongoing-service"
  | "compliance-disclosures";

export interface SoaSectionTemplate {
  id: SectionId;
  number: number;
  title: string;
  brief: string;
  generationGuidance: string;
  defaultConfidence: "high" | "medium" | "low";
  needsReviewByDefault: boolean;
}

export const SOA_SECTIONS: SoaSectionTemplate[] = [
  {
    id: "cover",
    number: 1,
    title: "Cover",
    brief:
      "Client name, date, adviser name, AFSL, BMK branding and confidentiality statement.",
    generationGuidance:
      "Output a short cover paragraph confirming the document is prepared for the named client by Brad Lonergan, Authorised Representative of Charter Financial Planning Limited AFSL 234665, and is confidential.",
    defaultConfidence: "high",
    needsReviewByDefault: false,
  },
  {
    id: "executive-summary",
    number: 2,
    title: "Executive Summary",
    brief:
      "Plain English one page summary written for the client not the regulator.",
    generationGuidance:
      "Write three short paragraphs. Paragraph one is the client's situation in three sentences. Paragraph two lists the key recommendations in plain English. Paragraph three describes the expected outcomes. Never use jargon.",
    defaultConfidence: "high",
    needsReviewByDefault: true,
  },
  {
    id: "about-you",
    number: 3,
    title: "About You",
    brief:
      "Current financial position, goals in client's own words, family, employment, assets and liabilities.",
    generationGuidance:
      "Quote the client's own goals where possible. Present the financial position as short paragraphs with specific dollar figures from the fact find. Acknowledge any sensitive circumstances with empathy.",
    defaultConfidence: "high",
    needsReviewByDefault: false,
  },
  {
    id: "risk-profile",
    number: 4,
    title: "Risk Profile",
    brief:
      "Formal score, category, plain English meaning, how it influences recommendations, client acknowledgement.",
    generationGuidance:
      "State the risk category. Explain what it means in two short paragraphs. Connect the profile to the recommended asset allocation. Include a client acknowledgement statement at the end.",
    defaultConfidence: "medium",
    needsReviewByDefault: true,
  },
  {
    id: "recommendations",
    number: 5,
    title: "Your Recommendations",
    brief:
      "One subsection per approved strategy with rationale, alternatives, expected outcome and steps.",
    generationGuidance:
      "For each approved strategy write five short blocks: strategy name and plain English explanation, why it suits this client specifically (reference the fact find), what we recommend and why, what alternatives we considered and why we did not choose them, expected outcome with realistic projections, implementation steps.",
    defaultConfidence: "medium",
    needsReviewByDefault: true,
  },
  {
    id: "superannuation",
    number: 6,
    title: "Superannuation Strategy",
    brief:
      "Current position, recommended changes, contribution strategy, investment option, projected balance.",
    generationGuidance:
      "Reference the client's current fund by name and balance. Recommend any changes (rollover, contribution adjustment, investment option). Include a projected balance at preservation age using conservative assumptions and state those assumptions.",
    defaultConfidence: "medium",
    needsReviewByDefault: true,
  },
  {
    id: "insurance",
    number: 7,
    title: "Insurance Recommendations",
    brief:
      "Current cover assessment, gap analysis, recommended cover, product recommendations, claims process.",
    generationGuidance:
      "List current cover (life, TPD, IP, trauma) with amounts. Show the gap to recommended cover with reasoning tied to dependants, mortgage and income. Present product options with premium estimates and explain the claims process in two short sentences.",
    defaultConfidence: "medium",
    needsReviewByDefault: true,
  },
  {
    id: "investment",
    number: 8,
    title: "Investment Strategy",
    brief:
      "Asset allocation, product recommendations, fee comparison, projected returns.",
    generationGuidance:
      "Recommend an asset allocation aligned to risk profile. List specific Charter approved products with annual fees in dollars. Provide a projected return range using conservative historical assumptions.",
    defaultConfidence: "low",
    needsReviewByDefault: true,
  },
  {
    id: "retirement-projections",
    number: 9,
    title: "Retirement Projections",
    brief:
      "Current trajectory vs recommended trajectory, side by side, with assumptions stated.",
    generationGuidance:
      "Produce a year by year projection from current age to retirement age. Show the gap between the current path and the recommended path. State every assumption clearly (contribution rate, return rate, inflation, retirement age).",
    defaultConfidence: "low",
    needsReviewByDefault: true,
  },
  {
    id: "implementation",
    number: 10,
    title: "Implementation Plan",
    brief:
      "Step by step actions, responsibility, timeline, what the client needs to provide.",
    generationGuidance:
      "Produce a numbered list of implementation actions. For each step state who is responsible (Brad, client, Colleen, provider), the deadline, and what the client needs to provide.",
    defaultConfidence: "high",
    needsReviewByDefault: false,
  },
  {
    id: "ongoing-service",
    number: 11,
    title: "Ongoing Service",
    brief:
      "Scope of ongoing advice fee, review schedule, contact details.",
    generationGuidance:
      "Describe the BMK ongoing service in plain English: annual review meeting, quarterly check-in, ad hoc support. State the fee and how to contact Brad.",
    defaultConfidence: "high",
    needsReviewByDefault: false,
  },
  {
    id: "compliance-disclosures",
    number: 12,
    title: "Compliance and Disclosures",
    brief:
      "All required statements pulled automatically from the compliance knowledge base.",
    generationGuidance:
      "Insert verbatim the approved language templates from the compliance knowledge base: best interests duty acknowledgement, fee disclosure, general advice warning, risk profile disclaimer, privacy collection notice. Do not paraphrase.",
    defaultConfidence: "high",
    needsReviewByDefault: false,
  },
];

export function getSectionTemplate(id: SectionId): SoaSectionTemplate {
  const found = SOA_SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown SOA section: ${id}`);
  return found;
}

// ── Generated document shape ────────────────────────────────────────────────

export interface SoaSectionContent {
  id: SectionId;
  number: number;
  title: string;
  body: string;
  needsReview: boolean;
  reviewReason?: string;
  confidence: "high" | "medium" | "low";
  reviewed: boolean;
  approved: boolean;
  comment?: string;
}

export interface SoaProjectionPoint {
  age: number;
  current: number;
  recommended: number;
}

export interface SoaDocument {
  clientId: string;
  clientName: string;
  generatedAt: string;
  modelVersion: string;
  generatorVersion: string;
  sections: SoaSectionContent[];
  projections: SoaProjectionPoint[];
  marketSnapshots: MarketSnapshot[];
  complianceScore: number;
  complianceCertificateId: string;
  status: SoaStatus;
}

export interface MarketSnapshot {
  id: string;
  label: string;
  source: string;
  retrievedAt: string;
  value: string;
  notes?: string;
}

export type SoaStatus =
  | "draft"
  | "in-review"
  | "approved"
  | "sent"
  | "signed";

export const SOA_STATUS_COPY: Record<
  SoaStatus,
  { label: string; tone: "neutral" | "amber" | "green" | "blue" }
> = {
  draft: { label: "Draft", tone: "neutral" },
  "in-review": { label: "In Review", tone: "amber" },
  approved: { label: "Approved", tone: "green" },
  sent: { label: "Sent", tone: "blue" },
  signed: { label: "Signed", tone: "green" },
};
