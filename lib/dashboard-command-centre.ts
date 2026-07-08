import { CLIENTS, type Client } from "@/lib/data";
import {
  getAllPipelineRows,
  type ClientPipelineRow,
  type PipelineStage,
} from "@/lib/soa/soa-pipeline";

export type DashboardTone =
  | "cyan"
  | "blue"
  | "gold"
  | "emerald"
  | "orange"
  | "violet"
  | "slate";

export type PriorityLevel = "critical" | "high" | "medium" | "low";

export type RuntimeAgentName =
  | "Sarah"
  | "Beacon"
  | "Guardian"
  | "Scribe"
  | "Orion"
  | "Atlas"
  | "Cipher"
  | "Nexus";

export type AgentActivityStatus = "Active" | "Idle" | "Needs Key" | "Mock";

export type DashboardMetric = {
  id: string;
  label: string;
  value: number;
  description: string;
  progress: number;
  tone: DashboardTone;
  trend: string;
};

export type WorkflowStage = {
  id: string;
  label: string;
  description: string;
  count: number;
  tone: DashboardTone;
  state: "active" | "waiting" | "blocked" | "complete";
};

export type PriorityQueueItem = {
  id: string;
  priority: PriorityLevel;
  agent: RuntimeAgentName;
  title: string;
  clientName: string;
  href: string;
};

export type SarahBriefInsight = {
  id: string;
  section: "What changed" | "Where clients are stuck" | "What needs follow-up";
  insight: string;
  timestamp: string;
  tone: DashboardTone;
};

export type PipelineSnapshotItem = {
  id: string;
  label: string;
  value: number;
  tone: DashboardTone;
};

export type NextBestActionItem = {
  id: string;
  label: string;
  count: number;
  href: string;
};

export type AgentActivityItem = {
  name: RuntimeAgentName;
  status: AgentActivityStatus;
  tone: DashboardTone;
  detail: string;
};

export type CommandCentreDashboard = {
  activeFiles: number;
  metrics: DashboardMetric[];
  workflowStages: WorkflowStage[];
  totalFilesInFlow: number;
  averageTimeInFlow: string;
  flowVelocity: string;
  conversionToMeeting: string;
  priorityQueue: PriorityQueueItem[];
  sarahBrief: SarahBriefInsight[];
  pipelineSnapshot: PipelineSnapshotItem[];
  flowReading: {
    insight: string;
    timestamp: string;
  };
  nextBestActions: NextBestActionItem[];
  agentActivity: AgentActivityItem[];
  systemStatus: "All systems operational" | "Mock mode active";
  mockModeActive: boolean;
  dataSourceLabel: string;
};

type DashboardBaseState = {
  activeClients: number;
  factFindsInProgress: number;
  readyForMeeting: number;
  readyForSoA: number;
  needsAttention: number;
  linkSentClients: Client[];
  reviewRequiredClients: Client[];
  complianceRows: ClientPipelineRow[];
  reviewRows: ClientPipelineRow[];
  stageCounts: Record<PipelineStage, number>;
  completedOrSignedCount: number;
};

export function getCommandCentreDashboard(): CommandCentreDashboard {
  const state = getDashboardBaseState();
  const mockModeActive =
    !process.env.ANTHROPIC_API_KEY || !process.env.ELEVENLABS_API_KEY;
  const sarahComplete = CLIENTS.filter(
    (client) =>
      client.status === "complete" ||
      client.status === "ready-for-meeting" ||
      client.status === "review-required",
  ).length;
  const meetingConversion = Math.round(
    ((state.readyForMeeting + state.readyForSoA + state.completedOrSignedCount) /
      Math.max(state.activeClients, 1)) *
      100,
  );

  return {
    activeFiles: state.activeClients,
    metrics: buildMetrics(state),
    workflowStages: [
      {
        id: "link-sent",
        label: "Link Sent",
        description: "Invites sent to client",
        count: state.linkSentClients.length,
        tone: "gold",
        state: state.linkSentClients.length > 0 ? "active" : "waiting",
      },
      {
        id: "discovery",
        label: "Discovery In Progress",
        description: "Completing Financial Discovery",
        count: state.factFindsInProgress,
        tone: "cyan",
        state: state.factFindsInProgress > 0 ? "active" : "waiting",
      },
      {
        id: "sarah-complete",
        label: "Sarah Complete",
        description: "Ready for adviser review",
        count: sarahComplete,
        tone: "emerald",
        state: sarahComplete > 0 ? "complete" : "waiting",
      },
      {
        id: "brad-review",
        label: "Brad Review",
        description: "Adviser reviewing client information",
        count: state.reviewRequiredClients.length,
        tone: "violet",
        state: state.reviewRequiredClients.length > 0 ? "active" : "waiting",
      },
      {
        id: "ready-meeting",
        label: "Ready For Meeting",
        description: "Prepared for adviser meeting",
        count: state.readyForMeeting,
        tone: "gold",
        state: state.readyForMeeting > 0 ? "active" : "waiting",
      },
      {
        id: "ready-soa",
        label: "Ready For SOA",
        description: "Files ready for SOA production",
        count: state.readyForSoA,
        tone: "cyan",
        state: state.readyForSoA > 0 ? "active" : "waiting",
      },
      {
        id: "signed",
        label: "Signed",
        description: "Advice signed and delivered",
        count: state.completedOrSignedCount,
        tone: "blue",
        state: state.completedOrSignedCount > 0 ? "complete" : "waiting",
      },
    ],
    totalFilesInFlow: state.activeClients,
    averageTimeInFlow: "6.4 days",
    flowVelocity: "+18%",
    conversionToMeeting: `${meetingConversion}%`,
    priorityQueue: buildPriorityQueue(),
    sarahBrief: buildSarahBrief(state),
    pipelineSnapshot: buildPipelineSnapshot(state, sarahComplete),
    flowReading: {
      insight: buildFlowReading(state),
      timestamp: "Insight generated 2m ago",
    },
    nextBestActions: [
      {
        id: "follow-up-link-sent",
        label: "Follow up link sent",
        count: state.linkSentClients.length,
        href: "/clients",
      },
      {
        id: "complete-compliance",
        label: "Complete outstanding compliance",
        count: Math.max(state.complianceRows.length, state.reviewRequiredClients.length),
        href: "/compliance",
      },
      {
        id: "ready-meeting-review",
        label: "Review files ready for meeting",
        count: state.readyForMeeting,
        href: "/clients",
      },
      {
        id: "review-soa-drafts",
        label: "Review SOA drafts",
        count: state.reviewRows.length,
        href: "/soa",
      },
      {
        id: "prepare-meeting-brief",
        label: "Prepare meeting brief",
        count: state.readyForMeeting,
        href: "/clients",
      },
    ],
    agentActivity: buildAgentActivity(mockModeActive),
    systemStatus: mockModeActive ? "Mock mode active" : "All systems operational",
    mockModeActive,
    dataSourceLabel:
      "Derived from CLIENTS, SOA pipeline rows, compliance state, and dashboard mock telemetry.",
  };
}

function getDashboardBaseState(): DashboardBaseState {
  const pipelineRows = getAllPipelineRows();
  const stageCounts: Record<PipelineStage, number> = {
    "fact-find": 0,
    compliance: 0,
    "soa-in-progress": 0,
    "soa-review": 0,
    "soa-approved": 0,
    "soa-sent": 0,
    "soa-signed": 0,
  };

  pipelineRows.forEach((row) => {
    stageCounts[row.stage] += 1;
  });

  const linkSentClients = CLIENTS.filter((client) => client.status === "link-sent");
  const reviewRequiredClients = CLIENTS.filter(
    (client) => client.status === "review-required",
  );
  const complianceRows = pipelineRows.filter((row) => row.stage === "compliance");
  const reviewRows = pipelineRows.filter((row) => row.stage === "soa-review");
  const attentionIds = new Set<string>();

  linkSentClients.forEach((client) => attentionIds.add(client.id));
  reviewRequiredClients.forEach((client) => attentionIds.add(client.id));
  complianceRows.forEach((row) => attentionIds.add(row.client.id));
  reviewRows.forEach((row) => attentionIds.add(row.client.id));

  const completedOrSigned = new Set(
    CLIENTS.filter((client) => client.status === "complete").map((client) => client.id),
  );
  pipelineRows
    .filter((row) => row.stage === "soa-signed")
    .forEach((row) => completedOrSigned.add(row.client.id));

  return {
    activeClients: CLIENTS.length,
    factFindsInProgress: CLIENTS.filter((client) => client.status === "in-progress")
      .length,
    readyForMeeting: CLIENTS.filter((client) => client.status === "ready-for-meeting")
      .length,
    readyForSoA: stageCounts["soa-in-progress"],
    needsAttention: attentionIds.size,
    linkSentClients,
    reviewRequiredClients,
    complianceRows,
    reviewRows,
    stageCounts,
    completedOrSignedCount: completedOrSigned.size,
  };
}

function buildMetrics(state: DashboardBaseState): DashboardMetric[] {
  return [
    {
      id: "active-clients",
      label: "Active Clients",
      value: state.activeClients,
      description: "Clients in onboarding or advice workflow",
      progress: 100,
      tone: "blue",
      trend: "2 from yesterday",
    },
    {
      id: "fact-finds",
      label: "Fact Finds In Progress",
      value: state.factFindsInProgress,
      description: "Clients completing Financial Discovery",
      progress: percentage(state.factFindsInProgress, state.activeClients),
      tone: "cyan",
      trend: "1 from yesterday",
    },
    {
      id: "ready-meeting",
      label: "Ready For Meeting",
      value: state.readyForMeeting,
      description: "Prepared for adviser meeting or review",
      progress: percentage(state.readyForMeeting, state.activeClients),
      tone: "gold",
      trend: "No change",
    },
    {
      id: "ready-soa",
      label: "Ready For SOA",
      value: state.readyForSoA,
      description: "Files ready for Statement of Advice production",
      progress: percentage(state.readyForSoA, state.activeClients),
      tone: "emerald",
      trend: "1 from yesterday",
    },
    {
      id: "needs-attention",
      label: "Needs Attention",
      value: state.needsAttention,
      description: "Clients or files blocked, incomplete, or follow-up due",
      progress: percentage(state.needsAttention, state.activeClients),
      tone: "orange",
      trend: "2 from yesterday",
    },
  ];
}

function buildPriorityQueue(): PriorityQueueItem[] {
  return [
    {
      id: "guardian-david-okafor",
      priority: "critical",
      agent: "Guardian",
      title: "Resolve compliance blocker on David Okafor before SOA can proceed",
      clientName: clientName("david-okafor"),
      href: "/clients/david-okafor/compliance",
    },
    {
      id: "atlas-tanner-soa",
      priority: "high",
      agent: "Atlas",
      title: "Review SOA draft prepared for Robert and Sue Tanner",
      clientName: clientName("robert-sue-tanner"),
      href: "/clients/robert-sue-tanner/soa",
    },
    {
      id: "scribe-sarah-meeting",
      priority: "high",
      agent: "Scribe",
      title: "Review meeting brief for Sarah Mitchell before 28 May meeting",
      clientName: clientName("sarah-mitchell"),
      href: "/clients/sarah-mitchell/fact-find-review",
    },
    {
      id: "guardian-angela-evidence",
      priority: "medium",
      agent: "Guardian",
      title: "Confirm best interests evidence for Angela Forsyth",
      clientName: clientName("angela-forsyth"),
      href: "/clients/angela-forsyth/compliance",
    },
    {
      id: "cipher-reynolds-id",
      priority: "low",
      agent: "Cipher",
      title: "Follow up ID verification for Michael and Kate Reynolds",
      clientName: clientName("michael-kate-reynolds"),
      href: "/clients/michael-kate-reynolds",
    },
  ];
}

function buildSarahBrief(state: DashboardBaseState): SarahBriefInsight[] {
  return [
    {
      id: "sarah-mitchell-ready",
      section: "What changed",
      insight:
        "Sarah Mitchell is now ready for her 28 May 2026 meeting. Financial Discovery is complete enough for Brad review.",
      timestamp: "2m ago",
      tone: "cyan",
    },
    {
      id: "clients-stuck",
      section: "Where clients are stuck",
      insight: `${state.linkSentClients.length} clients have not started cleanly after link sent, and ${state.reviewRequiredClients.length} files need adviser review.`,
      timestamp: "5m ago",
      tone: "violet",
    },
    {
      id: "follow-up",
      section: "What needs follow-up",
      insight: `${state.complianceRows.length + state.reviewRequiredClients.length} compliance tasks need attention before the next SOA wave can move.`,
      timestamp: "8m ago",
      tone: "orange",
    },
  ];
}

function buildPipelineSnapshot(
  state: DashboardBaseState,
  sarahComplete: number,
): PipelineSnapshotItem[] {
  return [
    {
      id: "link-sent",
      label: "Link Sent",
      value: state.linkSentClients.length,
      tone: "slate",
    },
    {
      id: "in-progress",
      label: "In Progress",
      value: state.factFindsInProgress,
      tone: "cyan",
    },
    {
      id: "sarah-complete",
      label: "Sarah Complete",
      value: sarahComplete,
      tone: "emerald",
    },
    {
      id: "ready-meeting",
      label: "Ready For Meeting",
      value: state.readyForMeeting,
      tone: "gold",
    },
    {
      id: "ready-soa",
      label: "Ready For SOA",
      value: state.readyForSoA,
      tone: "violet",
    },
    {
      id: "signed",
      label: "Signed",
      value: state.completedOrSignedCount,
      tone: "emerald",
    },
  ];
}

function buildFlowReading(state: DashboardBaseState): string {
  const reviewPressure = state.reviewRequiredClients.length + state.readyForSoA;

  if (reviewPressure > 0) {
    return `${numberWord(reviewPressure)} files are sitting between Sarah Complete and Ready For Meeting. Prioritising adviser reviews will unlock the next wave fastest.`;
  }

  if (state.linkSentClients.length > 0) {
    return `${numberWord(state.linkSentClients.length)} files still need a nudge after link sent. Clearing that entry point will lift discovery velocity.`;
  }

  return "The flow is balanced right now. Keep monitoring Sarah completions and SOA draft reviews for the next pressure point.";
}

function buildAgentActivity(mockModeActive: boolean): AgentActivityItem[] {
  return [
    {
      name: "Sarah",
      status: mockModeActive ? "Mock" : "Active",
      tone: "cyan",
      detail: mockModeActive ? "voice key pending" : "discovery online",
    },
    {
      name: "Beacon",
      status: "Active",
      tone: "emerald",
      detail: "fact-find normalised",
    },
    {
      name: "Guardian",
      status: "Active",
      tone: "emerald",
      detail: "3 checks queued",
    },
    {
      name: "Scribe",
      status: "Idle",
      tone: "gold",
      detail: "brief ready",
    },
    {
      name: "Orion",
      status: "Active",
      tone: "emerald",
      detail: "evidence sync",
    },
    {
      name: "Atlas",
      status: "Active",
      tone: "cyan",
      detail: "SOA draft ready",
    },
    {
      name: "Cipher",
      status: "Active",
      tone: "emerald",
      detail: "follow-up sweep",
    },
    {
      name: "Nexus",
      status: mockModeActive ? "Needs Key" : "Idle",
      tone: mockModeActive ? "orange" : "blue",
      detail: mockModeActive ? "credentials missing" : "integrations scanned",
    },
  ];
}

function clientName(clientId: string): string {
  return CLIENTS.find((client) => client.id === clientId)?.name ?? "Client file";
}

function percentage(value: number, total: number): number {
  return Math.round((value / Math.max(total, 1)) * 100);
}

function numberWord(value: number): string {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
  ];
  const word = words[value] ?? String(value);
  return word.charAt(0).toUpperCase() + word.slice(1);
}
