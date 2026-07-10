import type { AgentDefinition } from "@/lib/agents/types";
import type { AgentJsonProvider } from "@/lib/ai/types";
import type {
  AtlasOutput,
  BeaconOutput,
  CipherOutput,
  GuardianOutput,
  NexusOutput,
  OrionOutput,
  ScribeOutput,
} from "@/lib/agents/types";
import { CLIENTS } from "@/lib/data";

type AgentInput = {
  clientId?: string;
  client?: (typeof CLIENTS)[number];
  answers?: Record<string, Record<string, string>>;
  bradReviewed?: boolean;
  approvedForSOA?: boolean;
};

const REQUIRED_SECTIONS = [
  "personal-details",
  "employment-income",
  "assets",
  "liabilities",
  "expenses",
  "superannuation",
  "insurance",
  "goals-objectives",
];

function asInput(input: unknown): AgentInput {
  return (input ?? {}) as AgentInput;
}

function getClient(input: AgentInput) {
  return input.client ?? CLIENTS.find((client) => client.id === input.clientId) ?? CLIENTS[0];
}

function getAnswers(input: AgentInput) {
  return input.answers ?? {};
}

function missingFields(answers: Record<string, Record<string, string>>): string[] {
  return REQUIRED_SECTIONS.flatMap((section) =>
    answers[section] && Object.keys(answers[section]).length > 0 ? [] : [section],
  );
}

function completionFromAnswers(answers: Record<string, Record<string, string>>, fallback: number) {
  const completed = REQUIRED_SECTIONS.filter(
    (section) => answers[section] && Object.values(answers[section]).some(Boolean),
  ).length;
  return Math.max(fallback, Math.round((completed / REQUIRED_SECTIONS.length) * 100));
}

function runBeacon(input: AgentInput): BeaconOutput {
  const client = getClient(input);
  const answers = getAnswers(input);
  const missing = missingFields(answers);
  const completionPercentage = completionFromAnswers(answers, client.progress);
  return {
    clientId: client.id,
    completionPercentage,
    sectionCompletion: Object.fromEntries(
      REQUIRED_SECTIONS.map((section) => [
        section,
        missing.includes(section)
          ? "missing"
          : Object.keys(answers[section] ?? {}).length >= 3
          ? "complete"
          : "in-progress",
      ]),
    ),
    cleanFactFind: answers,
    missingFields: missing,
    vagueFields: Object.entries(answers).flatMap(([section, fields]) =>
      Object.entries(fields)
        .filter(([, value]) => /maybe|unsure|estimate|approx|not sure/i.test(value))
        .map(([field]) => `${section}.${field}`),
    ),
    suggestedClarifyingQuestions: missing.slice(0, 4).map((section) =>
      `Can we confirm the missing ${section.replace(/-/g, " ")} details before Brad reviews the file?`,
    ),
    xplanReadyData: {
      clientId: client.id,
      clientName: client.name,
      adviser: client.adviser,
      sections: answers,
      source: "mock-local",
    },
  };
}

function runGuardian(input: AgentInput): GuardianOutput {
  const client = getClient(input);
  const beacon = runBeacon(input);
  const criticalFlags = [
    ...(!beacon.cleanFactFind["goals-objectives"] ? ["Goals and objectives incomplete"] : []),
    ...(!beacon.cleanFactFind.superannuation ? ["Superannuation details missing"] : []),
    ...(!beacon.cleanFactFind.insurance ? ["Insurance details need adviser review"] : []),
  ];
  const warningFlags = beacon.vagueFields.map((field) => `Vague answer requires clarification: ${field}`);
  const blockedFromSOA = criticalFlags.length > 0 || !input.bradReviewed;
  return {
    complianceScore: Math.max(48, Math.min(96, client.progress - criticalFlags.length * 8)),
    consentStatus: "partial",
    criticalFlags,
    warningFlags,
    adviserReviewFlags: [
      "Confirm consent to proceed before advice preparation",
      "Brad must review all assumptions before SOA generation",
    ],
    blockedFromSOA,
    reasonsBlocked: blockedFromSOA
      ? [
          ...criticalFlags,
          ...(!input.bradReviewed ? ["Brad review has not been marked complete"] : []),
        ]
      : [],
    recommendedNextActions: blockedFromSOA
      ? ["Resolve critical data gaps", "Complete adviser review checklist"]
      : ["Client can progress toward meeting preparation"],
  };
}

function runScribe(input: AgentInput): ScribeOutput {
  const client = getClient(input);
  return {
    meetingBrief: `${client.name} is ${client.progress}% through fact-find with current stage ${client.meetingStage}. Brad should focus on goals, risk tolerance, insurance context and any incomplete evidence before advice work begins.`,
    questionsForBrad: [
      "What outcome would make this advice process feel successful for the client?",
      "Are there any recent life changes that alter risk, insurance or cash-flow needs?",
      "Which assumptions should Brad confirm before strategy work starts?",
    ],
    clientConcerns: [
      client.notes.includes("separated") ? "Sensitive personal circumstances" : "Clarity and confidence before committing",
      "Missing or incomplete evidence may slow SOA readiness",
    ],
    likelyPriorities: ["Goals clarification", "Cash-flow confidence", "Insurance and super review"],
    postMeetingSummary: "No meeting transcript has been supplied yet.",
    newDataPoints: [],
    recommendedDataUpdates: ["Record meeting outcomes after Brad completes the discussion"],
  };
}

function runOrion(input: AgentInput): OrionOutput {
  const client = getClient(input);
  const guardian = runGuardian(input);
  const answers = getAnswers(input);
  const topSections = Object.entries(answers)
    .filter(([, fields]) => Object.values(fields).some(Boolean))
    .slice(0, 4)
    .map(([section, fields]) => {
      const preview = Object.values(fields).filter(Boolean).slice(0, 2).join("; ");
      return `${section.replace(/-/g, " ")}: ${preview}`;
    });
  const growthGoal =
    /first home|property/i.test(client.notes) ? "Property acquisition" : "Long-term wealth accumulation";
  const projectionInputs = [
    { label: "Current progress", value: `${client.progress}% fact-find complete` },
    { label: "Meeting stage", value: client.meetingStage },
    { label: "Primary goal lane", value: growthGoal },
    { label: "Advice focus", value: /insurance/i.test(client.notes) ? "Insurance and cash-flow resilience" : "Retirement and wealth strategy" },
  ];
  const knowledgeChunks = [
    "Use Brad voice rules to keep recommendations commercial, direct and plain-English.",
    "Pull only compliant language templates that match the client's actual strategy scope.",
    "Pair every recommendation with implementation sequencing and clear assumptions.",
  ];
  const missingBeforeDraft = guardian.blockedFromSOA
    ? guardian.reasonsBlocked
    : [];
  return {
    soaReady: Boolean(input.bradReviewed && !guardian.blockedFromSOA),
    evidencePacket: {
      approvedFactsOnly: input.bradReviewed === true,
      factFindHighlights: topSections.length > 0 ? topSections : [client.notes],
      complianceGuardrails: guardian.adviserReviewFlags,
      knowledgeChunks,
      projectionInputs,
    },
    recommendedSections: [
      "Client position and goals",
      "Strategy logic and trade-offs",
      "Projection assumptions",
      "Risks and implementation sequencing",
    ],
    missingBeforeDraft,
    complianceNotes: guardian.warningFlags,
    nextDataPulls: guardian.blockedFromSOA
      ? ["Resolve blocker list before final strategy synthesis"]
      : ["Pull relevant advice chunk from knowledge base", "Confirm projection assumptions with Brad"],
    adviserApprovalRequired: true,
  };
}

function runAtlas(input: AgentInput): AtlasOutput {
  const client = getClient(input);
  const guardian = runGuardian(input);
  const orion = runOrion(input);
  const propertyGoal = /first home|property/i.test(client.notes);
  const insuranceNeed = /insurance|dependant|debt/i.test(client.notes);
  const strategyThemes = [
    propertyGoal ? "Goal-linked capital accumulation" : "Long-term wealth and retirement positioning",
    insuranceNeed ? "Insurance protection alignment" : "Cash-flow and contribution efficiency",
    "Superannuation and implementation sequencing",
  ];
  const recommendationPool = [
    propertyGoal
      ? "Use cash-flow surplus and tax-effective contribution settings to build a home deposit plan without derailing long-term retirement balances."
      : "Sequence super contributions and portfolio settings around the client's long-term retirement timeline and liquidity needs.",
    insuranceNeed
      ? "Review life, TPD and income protection settings against earnings, debts and dependant reliance so the cover recommendation solves a real protection gap."
      : "Use contribution and cash reserve settings to strengthen resilience before taking additional investment risk.",
    "Stage implementation so urgent protection or structure changes happen first, followed by optimisation work once evidence is complete.",
  ];
  const personalizationNotes = [
    client.notes,
    `Current fact-find completion is ${client.progress}% and meeting stage is ${client.meetingStage}.`,
    input.bradReviewed
      ? "Brad review is complete, so ATLAS can rely on approved facts and focus on advice tailoring."
      : "Brad review is not complete, so ATLAS should keep uncertainty visible and avoid final-sounding recommendations.",
  ];
  const projectionAssumptions = [
    propertyGoal
      ? "Model savings and contribution pathways against the client's stated property timing window."
      : "Model long-term balances and contribution benefits over the client's likely accumulation horizon.",
    insuranceNeed
      ? "Reflect premium affordability and cash-flow impact before recommending protection changes."
      : "Stress test contribution levels against day-to-day cash-flow stability.",
    "Make every projection explicit about assumptions, data gaps and required adviser validation.",
  ];
  return {
    strategyThemes,
    tailoredRecommendations: recommendationPool,
    relevantClientFacts: orion.evidencePacket.factFindHighlights,
    knowledgeReferences: [
      "Brad voice rules",
      "BID seven-step checklist",
      "Safe harbour evidence checklist",
      "SOA knowledge base strategy patterns",
    ],
    reusableAdviceChunks: [
      "Recommendation rationale should connect client goals, current position, benefits, risks and implementation timing in one flow.",
      "Projection language should explain what the numbers depend on and what may change after product research or underwriting.",
      "Risk disclosures should be specific to cash-flow, insurance affordability, market volatility or legislative assumptions as relevant.",
    ],
    projectionAssumptions,
    personalizationNotes,
    uncertaintyLevel:
      guardian.blockedFromSOA || client.progress < 80
        ? "high"
        : client.progress < 95
        ? "medium"
        : "low",
    requiresBradDecision: true,
    disclaimer: "Adviser consideration only. Requires Brad review.",
  };
}

function runCipher(): CipherOutput {
  const stale = CLIENTS.filter((client) => client.status === "link-sent" || client.lastActivity.includes("days"));
  const urgent = CLIENTS.filter((client) => client.status === "review-required");
  return {
    todaysBrief: `${urgent.length} review file${urgent.length === 1 ? "" : "s"} need Brad, and ${stale.length} client${stale.length === 1 ? "" : "s"} may need follow-up.`,
    followUps: stale.map((client) => ({
      clientId: client.id,
      clientName: client.name,
      reason: client.nextAction,
      urgency: client.status === "review-required" ? "medium" : "low",
    })),
    staleClients: stale.map((client) => client.id),
    urgentActions: urgent.map((client) => client.nextAction),
    recommendedMessages: stale.slice(0, 2).map((client) => ({
      clientId: client.id,
      channel: "email",
      draft: `Hi ${client.name.split(" ")[0]}, just checking in on the outstanding fact-find details so Brad can prepare properly for the next step.`,
    })),
  };
}

function runNexus(): NexusOutput {
  const integrations = [
    { id: "xplan", name: "Xplan", env: "XPLAN_API_KEY" },
    { id: "docusign", name: "DocuSign", env: "DOCUSIGN_CLIENT_ID" },
    { id: "email", name: "Email/SMS", env: "EMAIL_PROVIDER_API_KEY" },
    { id: "anthropic", name: "Anthropic", env: "ANTHROPIC_API_KEY" },
    { id: "elevenlabs", name: "ElevenLabs Voice", env: "ELEVENLABS_API_KEY" },
  ].map((item) => {
    const connected = Boolean(process.env[item.env]);
    return {
      id: item.id,
      name: item.name,
      connected,
      mockMode: !connected,
      missingCredentials: connected ? [] : [item.env],
      nextSetupSteps: connected ? [] : [`Add ${item.env} to Vercel environment variables`],
    };
  });

  return {
    integrations,
    connected: integrations.every((item) => item.connected),
    mockMode: integrations.some((item) => item.mockMode),
    missingCredentials: integrations.flatMap((item) => item.missingCredentials),
    nextSetupSteps: integrations.flatMap((item) => item.nextSetupSteps),
  };
}

export const mockProvider: AgentJsonProvider = {
  id: "mock",
  async generateJson(agent: AgentDefinition, input: unknown) {
    const parsed = asInput(input);
    switch (agent.id) {
      case "beacon":
        return runBeacon(parsed);
      case "guardian":
        return runGuardian(parsed);
      case "scribe":
        return runScribe(parsed);
      case "orion":
        return runOrion(parsed);
      case "atlas":
        return runAtlas(parsed);
      case "cipher":
        return runCipher();
      case "nexus":
        return runNexus();
      case "sarah":
      default:
        return {
          transcriptSummary: "Sarah session output is captured by the existing onboarding flow.",
          safeFallback: true,
        };
    }
  },
};
