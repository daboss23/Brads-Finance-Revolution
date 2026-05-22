export type FactFindStatus =
  | "link-sent"
  | "in-progress"
  | "ready-for-meeting"
  | "review-required"
  | "complete";

export type SectionStatus = "complete" | "in-progress" | "missing";

export type FactFindSection = {
  name: string;
  status: SectionStatus;
};

export type TimelineEvent = {
  date: string;
  event: string;
  type: "system" | "adviser" | "client";
};

export type Client = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  progress: number;
  status: FactFindStatus;
  nextAction: string;
  meetingDate: string | null;
  meetingStage: string;
  adviser: string;
  lastActivity: string;
  notes: string;
  factFindSections: FactFindSection[];
  timeline: TimelineEvent[];
};

function sections(
  overrides: Partial<Record<string, SectionStatus>> = {}
): FactFindSection[] {
  const defaults: FactFindSection[] = [
    { name: "Personal Details", status: "missing" },
    { name: "Income & Employment", status: "missing" },
    { name: "Assets & Liabilities", status: "missing" },
    { name: "Expenses", status: "missing" },
    { name: "Superannuation", status: "missing" },
    { name: "Insurance", status: "missing" },
    { name: "Goals & Objectives", status: "missing" },
  ];
  return defaults.map((s) => ({ ...s, status: overrides[s.name] ?? s.status }));
}

export const CLIENTS: Client[] = [
  {
    id: "sarah-mitchell",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    mobile: "0412 345 678",
    progress: 85,
    status: "ready-for-meeting",
    nextAction: "Confirm meeting prep — Insurance & Goals outstanding",
    meetingDate: "28 May 2026",
    meetingStage: "Meeting Booked",
    adviser: "Brad Lonergan",
    lastActivity: "2 hours ago",
    notes:
      "Highly engaged client. Keen to review insurance cover and consolidate super. Prefers morning appointments. Referred by existing client James Carr.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "complete",
      "Assets & Liabilities": "complete",
      "Expenses": "complete",
      "Superannuation": "complete",
      "Insurance": "in-progress",
      "Goals & Objectives": "in-progress",
    }),
    timeline: [
      { date: "17 May 2026", event: "Fact find link sent via email", type: "system" },
      { date: "18 May 2026", event: "Client opened fact find — began personal details", type: "client" },
      { date: "18 May 2026", event: "Personal Details and Income sections completed", type: "client" },
      { date: "19 May 2026", event: "Assets, Expenses, and Super sections completed", type: "client" },
      { date: "19 May 2026", event: "Meeting booked for 28 May 2026", type: "adviser" },
    ],
  },
  {
    id: "james-fiona-carr",
    name: "James & Fiona Carr",
    email: "james.carr@email.com",
    mobile: "0423 567 890",
    progress: 62,
    status: "in-progress",
    nextAction: "Follow up — Assets section stalled for 5 days",
    meetingDate: null,
    meetingStage: "Data Collection",
    adviser: "Brad Lonergan",
    lastActivity: "5 days ago",
    notes:
      "Joint clients. James manages finances; Fiona leads on insurance queries. May need separate review of Fiona's super fund. Self-managed investment property needs to be captured.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "complete",
      "Assets & Liabilities": "in-progress",
      "Expenses": "in-progress",
      "Superannuation": "missing",
      "Insurance": "missing",
      "Goals & Objectives": "missing",
    }),
    timeline: [
      { date: "12 May 2026", event: "Fact find link sent via email", type: "system" },
      { date: "13 May 2026", event: "Client started fact find", type: "client" },
      { date: "14 May 2026", event: "Personal details and income completed", type: "client" },
    ],
  },
  {
    id: "tony-nguyen",
    name: "Tony Nguyen",
    email: "tony.nguyen@email.com",
    mobile: "0401 234 567",
    progress: 100,
    status: "complete",
    nextAction: "Generate financial plan — all data received",
    meetingDate: "22 May 2026",
    meetingStage: "Plan Generation",
    adviser: "Brad Lonergan",
    lastActivity: "1 day ago",
    notes:
      "Highly detailed and organised client. Submitted all supporting documents within 48 hours. Primary focus: retirement planning, property investment, and TTR strategy.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "complete",
      "Assets & Liabilities": "complete",
      "Expenses": "complete",
      "Superannuation": "complete",
      "Insurance": "complete",
      "Goals & Objectives": "complete",
    }),
    timeline: [
      { date: "8 May 2026", event: "Fact find link sent", type: "system" },
      { date: "9 May 2026", event: "Client started fact find", type: "client" },
      { date: "12 May 2026", event: "All sections submitted", type: "client" },
      { date: "14 May 2026", event: "Adviser review completed — no issues", type: "adviser" },
      { date: "15 May 2026", event: "Status updated to Complete", type: "system" },
      { date: "18 May 2026", event: "Meeting booked for 22 May 2026", type: "adviser" },
    ],
  },
  {
    id: "helen-davies",
    name: "Helen Davies",
    email: "helen.davies@email.com",
    mobile: "0435 678 901",
    progress: 40,
    status: "in-progress",
    nextAction: "Request payslips and most recent bank statements",
    meetingDate: null,
    meetingStage: "Data Collection",
    adviser: "Brad Lonergan",
    lastActivity: "3 days ago",
    notes:
      "Recently separated. Complex asset structure with jointly held property under negotiation. Requires careful handling — prioritise emotional sensitivity in all communications.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "in-progress",
      "Assets & Liabilities": "missing",
      "Expenses": "missing",
      "Superannuation": "in-progress",
      "Insurance": "missing",
      "Goals & Objectives": "missing",
    }),
    timeline: [
      { date: "10 May 2026", event: "Initial consultation — referral from existing client", type: "adviser" },
      { date: "11 May 2026", event: "Fact find link sent", type: "system" },
      { date: "13 May 2026", event: "Personal details section completed", type: "client" },
    ],
  },
  {
    id: "michael-kate-reynolds",
    name: "Michael & Kate Reynolds",
    email: "michael.reynolds@email.com",
    mobile: "0418 789 012",
    progress: 15,
    status: "link-sent",
    nextAction: "Follow-up call — link sent 6 days ago, not yet started",
    meetingDate: null,
    meetingStage: "Awaiting Start",
    adviser: "Brad Lonergan",
    lastActivity: "6 days ago",
    notes:
      "New referral. Both employed full-time, two young dependants. Primary goals: property purchase within 18 months, wealth creation strategy.",
    factFindSections: sections({
      "Personal Details": "in-progress",
      "Income & Employment": "missing",
      "Assets & Liabilities": "missing",
      "Expenses": "missing",
      "Superannuation": "missing",
      "Insurance": "missing",
      "Goals & Objectives": "missing",
    }),
    timeline: [
      { date: "13 May 2026", event: "Fact find link sent via email", type: "system" },
    ],
  },
  {
    id: "david-okafor",
    name: "David Okafor",
    email: "d.okafor@email.com",
    mobile: "0409 890 123",
    progress: 78,
    status: "review-required",
    nextAction: "Adviser review — inconsistency in asset declarations flagged",
    meetingDate: null,
    meetingStage: "Under Review",
    adviser: "Brad Lonergan",
    lastActivity: "1 day ago",
    notes:
      "Business owner — complex income structure via trust distributions and director salary. Asset declarations require cross-checking. Needs careful review before progression.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "complete",
      "Assets & Liabilities": "in-progress",
      "Expenses": "complete",
      "Superannuation": "complete",
      "Insurance": "missing",
      "Goals & Objectives": "in-progress",
    }),
    timeline: [
      { date: "9 May 2026", event: "Fact find link sent", type: "system" },
      { date: "10 May 2026", event: "Client started fact find", type: "client" },
      { date: "14 May 2026", event: "Most sections completed", type: "client" },
      { date: "16 May 2026", event: "Review flagged — asset declaration query raised", type: "adviser" },
    ],
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    mobile: "0444 012 345",
    progress: 55,
    status: "in-progress",
    nextAction: "Chase super fund statements — 3 funds listed, no documents received",
    meetingDate: null,
    meetingStage: "Data Collection",
    adviser: "Brad Lonergan",
    lastActivity: "2 days ago",
    notes:
      "First home buyer. Keen to understand FHSS scheme and salary sacrifice strategies. Very responsive — typically replies same day. Strong candidate for income protection review.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "complete",
      "Assets & Liabilities": "complete",
      "Expenses": "in-progress",
      "Superannuation": "in-progress",
      "Insurance": "missing",
      "Goals & Objectives": "missing",
    }),
    timeline: [
      { date: "11 May 2026", event: "Fact find link sent", type: "system" },
      { date: "11 May 2026", event: "Client started immediately — same day", type: "client" },
      { date: "13 May 2026", event: "Personal, income, and assets sections completed", type: "client" },
    ],
  },
  {
    id: "robert-sue-tanner",
    name: "Robert & Sue Tanner",
    email: "r.tanner@email.com",
    mobile: "0456 234 567",
    progress: 92,
    status: "ready-for-meeting",
    nextAction: "Final review before meeting on 2 Jun — Goals section to finish",
    meetingDate: "2 Jun 2026",
    meetingStage: "Meeting Booked",
    adviser: "Brad Lonergan",
    lastActivity: "4 hours ago",
    notes:
      "Pre-retirement couple (58 & 56). Primary focus: transition to retirement, aged care planning, and pension structuring. Highly engaged and well-prepared.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "complete",
      "Assets & Liabilities": "complete",
      "Expenses": "complete",
      "Superannuation": "complete",
      "Insurance": "complete",
      "Goals & Objectives": "in-progress",
    }),
    timeline: [
      { date: "5 May 2026", event: "Fact find link sent", type: "system" },
      { date: "6 May 2026", event: "Client started fact find", type: "client" },
      { date: "13 May 2026", event: "Six of seven sections completed", type: "client" },
      { date: "15 May 2026", event: "Meeting booked for 2 June 2026", type: "adviser" },
    ],
  },
  {
    id: "luke-brennan",
    name: "Luke Brennan",
    email: "luke.brennan@email.com",
    mobile: "0421 345 678",
    progress: 0,
    status: "link-sent",
    nextAction: "First follow-up — link sent, not yet opened",
    meetingDate: null,
    meetingStage: "Awaiting Start",
    adviser: "Brad Lonergan",
    lastActivity: "3 days ago",
    notes:
      "New client — young professional, age 29. Focus areas: income protection, investment plan, and beginning super contributions strategy.",
    factFindSections: sections(),
    timeline: [
      { date: "16 May 2026", event: "Fact find link sent via email", type: "system" },
    ],
  },
  {
    id: "angela-forsyth",
    name: "Angela Forsyth",
    email: "angela.forsyth@email.com",
    mobile: "0432 456 789",
    progress: 71,
    status: "review-required",
    nextAction: "Goals section needs revisiting — objectives unclear, call required",
    meetingDate: null,
    meetingStage: "Under Review",
    adviser: "Brad Lonergan",
    lastActivity: "1 day ago",
    notes:
      "Recently widowed. Estate planning and pension review are key priorities. Handle with care — situation is sensitive. Has adult children who may be involved in planning decisions.",
    factFindSections: sections({
      "Personal Details": "complete",
      "Income & Employment": "complete",
      "Assets & Liabilities": "complete",
      "Expenses": "complete",
      "Superannuation": "in-progress",
      "Insurance": "complete",
      "Goals & Objectives": "in-progress",
    }),
    timeline: [
      { date: "7 May 2026", event: "Fact find link sent", type: "system" },
      { date: "8 May 2026", event: "Client started fact find", type: "client" },
      { date: "13 May 2026", event: "Most sections completed", type: "client" },
      { date: "15 May 2026", event: "Goals section flagged for adviser review", type: "adviser" },
    ],
  },
];

export const STATUS_CONFIG: Record<
  FactFindStatus,
  { label: string; className: string }
> = {
  "link-sent": {
    label: "Link Sent",
    className: "bg-zinc-700/30 text-zinc-300 border-zinc-600/50",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/35",
  },
  "ready-for-meeting": {
    label: "Ready for Meeting",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/35",
  },
  "review-required": {
    label: "Review Required",
    className: "bg-orange-500/15 text-orange-300 border-orange-500/35",
  },
  complete: {
    label: "Complete",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
  },
};
