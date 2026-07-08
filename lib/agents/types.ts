export type AgentId =
  | "sarah"
  | "beacon"
  | "guardian"
  | "scribe"
  | "orion"
  | "atlas"
  | "cipher"
  | "nexus";

export type CostLevel = "none" | "low" | "medium" | "high";

export type AgentRunStatus = "idle" | "running" | "success" | "error";

export type UsageMode = "conservative" | "balanced" | "high-intelligence";

export type JsonSchemaLike = {
  type: string;
  required?: string[];
  properties?: Record<string, JsonSchemaLike | { type: string; items?: JsonSchemaLike }>;
  items?: JsonSchemaLike;
};

export type AgentDefinition = {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  trigger: string;
  inputSchema: JsonSchemaLike;
  outputSchema: JsonSchemaLike;
  usesAI: boolean;
  cacheTTL: number | null;
  costLevel: CostLevel;
  autoRunModes: UsageMode[];
  manualRefresh: boolean;
};

export type AgentTelemetry = {
  id: string;
  agentId: AgentId;
  clientId?: string;
  status: AgentRunStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  provider: "mock" | "anthropic" | "openai" | "deterministic";
  model: string;
  cached: boolean;
  costLevel: CostLevel;
  inputHash: string;
  error?: string;
  outputSummary?: string;
};

export type BeaconOutput = {
  clientId: string;
  completionPercentage: number;
  sectionCompletion: Record<string, "complete" | "in-progress" | "missing">;
  cleanFactFind: Record<string, Record<string, string>>;
  missingFields: string[];
  vagueFields: string[];
  suggestedClarifyingQuestions: string[];
  xplanReadyData: Record<string, unknown>;
};

export type GuardianOutput = {
  complianceScore: number;
  consentStatus: "confirmed" | "missing" | "partial";
  criticalFlags: string[];
  warningFlags: string[];
  adviserReviewFlags: string[];
  blockedFromSOA: boolean;
  reasonsBlocked: string[];
  recommendedNextActions: string[];
};

export type ScribeOutput = {
  meetingBrief: string;
  questionsForBrad: string[];
  clientConcerns: string[];
  likelyPriorities: string[];
  postMeetingSummary: string;
  newDataPoints: string[];
  recommendedDataUpdates: string[];
};

export type OrionOutput = {
  strategyThemes: string[];
  adviserConsiderations: string[];
  relevantClientFacts: string[];
  knowledgeReferences: string[];
  uncertaintyLevel: "low" | "medium" | "high";
  requiresBradDecision: true;
  disclaimer: "Adviser consideration only. Requires Brad review.";
};

export type AtlasOutput = {
  soaReady: boolean;
  soaInputPack: Record<string, unknown>;
  recommendedSections: string[];
  missingBeforeDraft: string[];
  complianceNotes: string[];
  adviserApprovalRequired: true;
};

export type CipherOutput = {
  todaysBrief: string;
  followUps: Array<{ clientId: string; clientName: string; reason: string; urgency: CostLevel }>;
  staleClients: string[];
  urgentActions: string[];
  recommendedMessages: Array<{ clientId: string; channel: "email" | "sms"; draft: string }>;
};

export type NexusOutput = {
  integrations: Array<{
    id: string;
    name: string;
    connected: boolean;
    mockMode: boolean;
    missingCredentials: string[];
    nextSetupSteps: string[];
  }>;
  connected: boolean;
  mockMode: boolean;
  missingCredentials: string[];
  nextSetupSteps: string[];
};

export type AgentOutput =
  | BeaconOutput
  | GuardianOutput
  | ScribeOutput
  | OrionOutput
  | AtlasOutput
  | CipherOutput
  | NexusOutput
  | Record<string, unknown>;

export type RunAgentOptions = {
  clientId?: string;
  force?: boolean;
  provider?: "mock" | "anthropic" | "openai" | "deterministic";
  model?: string;
};

export type AgentRunResult<TOutput extends AgentOutput = AgentOutput> = {
  agentId: AgentId;
  output: TOutput;
  cached: boolean;
  telemetry: AgentTelemetry;
  error?: string;
};
