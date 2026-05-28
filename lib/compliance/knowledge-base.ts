// BMK Compliance Knowledge Base
// Stores the rules, thresholds and approved language that Brad's compliance
// engine evaluates every piece of advice against. Each block below is a
// canonical reference for Charter Financial Planning AFSL 234665.

export type ComplianceStatus =
  | "pending"
  | "passed"
  | "failed"
  | "not-applicable";

export type ImpactLevel = "low" | "medium" | "high" | "critical";

// ── Best Interests Duty ─────────────────────────────────────────────────────

export interface BestInterestsStep {
  id: string;
  requirement: string;
  description: string;
  checkItems: string[];
  status: ComplianceStatus;
  evidence: string;
}

export const BEST_INTERESTS_DUTY: BestInterestsStep[] = [
  {
    id: "bid-1",
    requirement: "Identify objectives, financial situation and needs",
    description:
      "Identify the objectives, financial situation and needs of the client.",
    checkItems: [
      "Client goals documented in fact find",
      "Income and expenses captured",
      "Asset and liability position recorded",
      "Family circumstances noted",
    ],
    status: "pending",
    evidence: "",
  },
  {
    id: "bid-2",
    requirement: "Identify the subject matter of the advice sought",
    description:
      "Identify the subject matter of the advice the client is seeking.",
    checkItems: [
      "Scope of advice clearly documented",
      "Client confirmation of advice areas obtained",
      "Out of scope items explicitly noted",
    ],
    status: "pending",
    evidence: "",
  },
  {
    id: "bid-3",
    requirement: "Identify relevant client circumstances",
    description:
      "Identify the objectives, financial situation and needs of the client that are reasonably relevant to the advice.",
    checkItems: [
      "Relevant circumstances filtered from full fact find",
      "Risk profile assessed",
      "Time horizon documented",
      "Liquidity needs identified",
    ],
    status: "pending",
    evidence: "",
  },
  {
    id: "bid-4",
    requirement: "Make reasonable enquiries",
    description:
      "Make reasonable enquiries to obtain complete and accurate information.",
    checkItems: [
      "Information gaps identified and addressed",
      "Supporting documents requested where appropriate",
      "Client statements verified where practical",
    ],
    status: "pending",
    evidence: "",
  },
  {
    id: "bid-5",
    requirement: "Conduct reasonable investigation of products",
    description:
      "Conduct a reasonable investigation into financial products that might achieve the client's objectives.",
    checkItems: [
      "Approved product list consulted",
      "Multiple product options considered",
      "Comparison documented",
      "Selection rationale recorded",
    ],
    status: "pending",
    evidence: "",
  },
  {
    id: "bid-6",
    requirement: "Base judgements on relevant circumstances",
    description:
      "Base all judgements on the client's relevant circumstances.",
    checkItems: [
      "Recommendations tied to documented objectives",
      "No generic advice templates used",
      "Strategy aligned to risk profile",
    ],
    status: "pending",
    evidence: "",
  },
  {
    id: "bid-7",
    requirement: "Take any other reasonable step",
    description:
      "Take any other step that would reasonably be regarded as being in the best interests of the client.",
    checkItems: [
      "Cost benefit considered",
      "Alternative strategies evaluated",
      "Client given opportunity to ask questions",
    ],
    status: "pending",
    evidence: "",
  },
];

// ── Safe Harbour (section 961B(2)) ──────────────────────────────────────────

export interface SafeHarbourStep {
  id: string;
  requirement: string;
  description: string;
  status: ComplianceStatus;
  evidence: string;
}

export const SAFE_HARBOUR_STEPS: SafeHarbourStep[] = [
  {
    id: "sh-1",
    requirement: "Identify objectives, financial situation and needs",
    description:
      "Identify the objectives, financial situation and needs of the client disclosed by the client through instructions.",
    status: "pending",
    evidence: "",
  },
  {
    id: "sh-2",
    requirement: "Identify subject matter of advice",
    description:
      "Identify the subject matter of the advice sought by the client.",
    status: "pending",
    evidence: "",
  },
  {
    id: "sh-3",
    requirement: "Identify circumstances relevant to advice",
    description:
      "Identify the objectives, financial situation and needs that are reasonably considered relevant to the advice.",
    status: "pending",
    evidence: "",
  },
  {
    id: "sh-4",
    requirement: "Make reasonable enquiries",
    description:
      "Where reasonable to obtain it, make reasonable enquiries to obtain complete and accurate information.",
    status: "pending",
    evidence: "",
  },
  {
    id: "sh-5",
    requirement: "Assess adviser expertise",
    description:
      "Assess whether the adviser has the expertise required to provide the advice and decline to provide it otherwise.",
    status: "pending",
    evidence: "",
  },
  {
    id: "sh-6",
    requirement: "Investigate product replacement",
    description:
      "If recommending a replacement product, conduct a reasonable investigation that the client is likely to be in a better position.",
    status: "pending",
    evidence: "",
  },
];

// ── AFSL Obligations ────────────────────────────────────────────────────────

export interface AfslObligation {
  id: string;
  obligation: string;
  description: string;
  reference: string;
  status: ComplianceStatus;
}

export const AFSL_OBLIGATIONS: AfslObligation[] = [
  {
    id: "afsl-apl",
    obligation: "Approved Product List",
    description:
      "Recommendations must come from the current Charter approved product list.",
    reference: "Charter APL v2024.3",
    status: "pending",
  },
  {
    id: "afsl-soa-template",
    obligation: "Approved SOA template",
    description:
      "Use only the current Charter approved Statement of Advice template.",
    reference: "Charter SOA Template v8",
    status: "pending",
  },
  {
    id: "afsl-fds",
    obligation: "Fee Disclosure Statement",
    description:
      "FDS must be issued annually for clients with an ongoing fee arrangement.",
    reference: "Corporations Act s962G",
    status: "pending",
  },
  {
    id: "afsl-roa",
    obligation: "Record of Advice",
    description:
      "Where simple advice is given, a Record of Advice must be retained for seven years.",
    reference: "Corporations Act s946B",
    status: "pending",
  },
  {
    id: "afsl-fsg",
    obligation: "Financial Services Guide",
    description:
      "An FSG must be provided to the client before financial services are provided.",
    reference: "Corporations Act s941A",
    status: "pending",
  },
  {
    id: "afsl-privacy",
    obligation: "Privacy Act compliance",
    description:
      "All client data must be handled in accordance with the Australian Privacy Principles.",
    reference: "Privacy Act 1988",
    status: "pending",
  },
  {
    id: "afsl-breach",
    obligation: "Breach reporting",
    description:
      "Reportable situations must be reported to Charter within the required timeframes.",
    reference: "ASIC RG 78",
    status: "pending",
  },
];

// ── ATO Thresholds (2024 / 2025) ────────────────────────────────────────────

export interface AtoThreshold {
  id: string;
  label: string;
  value: string;
  description: string;
  changedRecently: boolean;
}

export const ATO_THRESHOLDS: AtoThreshold[] = [
  {
    id: "concessional-cap",
    label: "Concessional contributions cap",
    value: "$30,000",
    description: "Annual concessional (pre tax) contributions cap.",
    changedRecently: true,
  },
  {
    id: "non-concessional-cap",
    label: "Non concessional contributions cap",
    value: "$120,000",
    description: "Annual non concessional (post tax) contributions cap.",
    changedRecently: true,
  },
  {
    id: "transfer-balance-cap",
    label: "Transfer balance cap",
    value: "$1,900,000",
    description:
      "Lifetime limit on amounts transferred into retirement phase income streams.",
    changedRecently: false,
  },
  {
    id: "listo-threshold",
    label: "Low income super tax offset threshold",
    value: "$37,000",
    description:
      "Adjusted taxable income threshold for the low income super tax offset.",
    changedRecently: false,
  },
  {
    id: "sg-rate",
    label: "Super guarantee rate",
    value: "11.5%",
    description: "Compulsory employer super contribution rate.",
    changedRecently: true,
  },
  {
    id: "preservation-age",
    label: "Preservation age",
    value: "60",
    description:
      "Minimum age super can be accessed once a condition of release is met.",
    changedRecently: false,
  },
  {
    id: "age-pension-age",
    label: "Age pension age",
    value: "67",
    description: "Qualifying age for the Australian age pension.",
    changedRecently: false,
  },
];

export const THRESHOLDS_LAST_UPDATED = "1 July 2024";
export const THRESHOLDS_FINANCIAL_YEAR = "2024 / 2025";

// ── Approved Compliance Language ────────────────────────────────────────────

export type LanguageType =
  | "general-advice"
  | "personal-advice"
  | "fee-disclosure"
  | "privacy"
  | "best-interests"
  | "risk-profile"
  | "product-replacement";

export interface LanguageTemplate {
  id: string;
  type: LanguageType;
  title: string;
  body: string;
  lastUpdated: string;
  reviewDue: string;
}

export const LANGUAGE_TEMPLATES: LanguageTemplate[] = [
  {
    id: "lang-general",
    type: "general-advice",
    title: "General advice warning",
    body:
      "The information provided is general advice only. It has been prepared without taking into account your objectives, financial situation or needs. Before acting on this advice you should consider its appropriateness having regard to your own objectives, financial situation and needs.",
    lastUpdated: "1 March 2024",
    reviewDue: "1 March 2025",
  },
  {
    id: "lang-personal",
    type: "personal-advice",
    title: "Personal advice disclaimer",
    body:
      "This Statement of Advice has been prepared by Brad Lonergan, an authorised representative of Charter Financial Planning Limited AFSL 234665. The advice contained in this document is personal advice and has been prepared based on the information you have provided. If any of that information is incomplete or inaccurate the advice may not be appropriate for you.",
    lastUpdated: "1 March 2024",
    reviewDue: "1 March 2025",
  },
  {
    id: "lang-fds",
    type: "fee-disclosure",
    title: "Fee disclosure statement",
    body:
      "This Fee Disclosure Statement sets out the fees you have paid for the past twelve months, the services you were entitled to receive, and the services you actually received. If you have any questions about the fees disclosed or the services provided please contact your adviser.",
    lastUpdated: "1 July 2024",
    reviewDue: "1 July 2025",
  },
  {
    id: "lang-privacy",
    type: "privacy",
    title: "Privacy collection notice",
    body:
      "Newcastle Financial Services collects personal information from you to provide financial advice and related services. We handle your information in accordance with the Australian Privacy Principles and our Privacy Policy, available on request. We may disclose your information to product providers, our licensee and other parties involved in the implementation of your advice.",
    lastUpdated: "1 February 2024",
    reviewDue: "1 February 2025",
  },
  {
    id: "lang-bid",
    type: "best-interests",
    title: "Best interests duty acknowledgement",
    body:
      "In providing this advice your adviser has acted in your best interests and has prioritised your interests in the event of any conflict. Reasonable enquiries have been made and reasonable investigation has been conducted into the products that might achieve your objectives.",
    lastUpdated: "1 March 2024",
    reviewDue: "1 March 2025",
  },
  {
    id: "lang-risk",
    type: "risk-profile",
    title: "Risk profile disclaimer",
    body:
      "The investment strategy recommended in this advice is consistent with the risk profile we discussed and you confirmed. Risk profiles can change over time. You should let us know if your circumstances or attitude to risk change so we can review the strategy.",
    lastUpdated: "1 March 2024",
    reviewDue: "1 March 2025",
  },
  {
    id: "lang-replacement",
    type: "product-replacement",
    title: "Product replacement justification",
    body:
      "Where this advice involves replacing one financial product with another, the recommended product has been selected because it is reasonably likely to leave you in a better position. The comparison considered fees, features, insurance cover, tax outcomes and any exit costs. A summary of the comparison is attached.",
    lastUpdated: "1 March 2024",
    reviewDue: "1 March 2025",
  },
];

export const LANGUAGE_TYPE_LABELS: Record<LanguageType, string> = {
  "general-advice": "General Advice",
  "personal-advice": "Personal Advice",
  "fee-disclosure": "Fee Disclosure",
  privacy: "Privacy",
  "best-interests": "Best Interests Duty",
  "risk-profile": "Risk Profile",
  "product-replacement": "Product Replacement",
};

// ── Regulatory Updates ──────────────────────────────────────────────────────

export interface RegulatoryUpdate {
  id: string;
  date: string;
  source: "ASIC" | "ATO" | "APRA" | "Charter" | "AFCA";
  title: string;
  summary: string;
  impact: ImpactLevel;
  affectedAreas: string[];
}

export const REGULATORY_UPDATES: RegulatoryUpdate[] = [
  {
    id: "reg-2026-01",
    date: "12 May 2026",
    source: "ASIC",
    title: "Updated guidance on retirement income advice",
    summary:
      "ASIC has updated Regulatory Guide 175 with new expectations for retirement income advice, focusing on longevity risk and aged care considerations.",
    impact: "high",
    affectedAreas: [
      "TTR strategies",
      "Pension structuring",
      "Aged care planning",
    ],
  },
  {
    id: "reg-2026-02",
    date: "1 May 2026",
    source: "ATO",
    title: "Confirmation of super guarantee rate increase",
    summary:
      "The super guarantee rate will increase to 12% from 1 July 2026, the final scheduled increase under the legislated schedule.",
    impact: "medium",
    affectedAreas: ["Super contributions", "Salary sacrifice", "Cash flow"],
  },
  {
    id: "reg-2026-03",
    date: "22 April 2026",
    source: "ATO",
    title: "Division 296 tax on super balances above $3 million",
    summary:
      "Further detail released on the operation of the additional 15% tax on earnings attributable to super balances exceeding $3 million.",
    impact: "high",
    affectedAreas: ["High balance super", "SMSF strategy", "Estate planning"],
  },
  {
    id: "reg-2026-04",
    date: "10 April 2026",
    source: "Charter",
    title: "APL update — managed account additions",
    summary:
      "Three new managed account portfolios have been added to the Charter approved product list. Two existing portfolios have been placed on hold pending review.",
    impact: "medium",
    affectedAreas: ["Investment strategy", "Platform setup"],
  },
  {
    id: "reg-2026-05",
    date: "28 March 2026",
    source: "ASIC",
    title: "Reportable situations regime reminder",
    summary:
      "ASIC has issued a reminder on the operation of the reportable situations regime and timeframes for notifying significant breaches.",
    impact: "low",
    affectedAreas: ["Breach reporting", "Practice governance"],
  },
  {
    id: "reg-2026-06",
    date: "15 March 2026",
    source: "AFCA",
    title: "Insurance claims handling complaints up 18%",
    summary:
      "AFCA has reported an 18% increase in insurance claims handling complaints. Advisers should ensure cover recommendations document claims handling history.",
    impact: "medium",
    affectedAreas: ["Insurance review", "Product selection"],
  },
];

export const UPDATES_LAST_CHECKED = "28 May 2026 at 8:42 am";
