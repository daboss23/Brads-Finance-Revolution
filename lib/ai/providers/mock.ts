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
  return {
    strategyThemes: ["Superannuation review", "Insurance adequacy", "Cash-flow and goal funding"],
    adviserConsiderations: [
      "Adviser consideration only. Requires Brad review. Consider whether super consolidation or contribution strategy is relevant after product research.",
      "Adviser consideration only. Requires Brad review. Review insurance needs against income, debt and dependant context before any recommendation.",
    ],
    relevantClientFacts: [client.notes, `Current fact-find progress: ${client.progress}%`],
    knowledgeReferences: ["BID seven-step checklist", "Safe harbour evidence checklist", "Brad voice rules"],
    uncertaintyLevel: client.progress >= 85 ? "medium" : "high",
    requiresBradDecision: true,
    disclaimer: "Adviser consideration only. Requires Brad review.",
  };
}

function runAtlas(input: AgentInput): AtlasOutput {
  const client = getClient(input);
  const guardian = runGuardian(input);
  const soaReady = Boolean(input.approvedForSOA && !guardian.blockedFromSOA);
  return {
    soaReady,
    soaInputPack: {
      clientId: client.id,
      clientName: client.name,
      approvedFactsOnly: input.bradReviewed === true,
      progress: client.progress,
      meetingStage: client.meetingStage,
    },
    recommendedSections: ["Client profile", "Goals", "Strategy rationale", "Risks", "Implementation"],
    missingBeforeDraft: soaReady ? [] : guardian.reasonsBlocked,
    complianceNotes: guardian.adviserReviewFlags,
    adviserApprovalRequired: true,
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
