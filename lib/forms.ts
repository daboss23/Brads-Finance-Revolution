// Strategy + form catalogue for BMK FS.
//
// Each form lists the fact-find field paths it needs (in SarahFactFind dot
// notation) so the PDF generator can pre-fill from Sarah's collected data
// and the UI can flag which fields are missing.

export type StrategyKey =
  | "ttr-strategy"
  | "insurance-review"
  | "aged-care"
  | "estate-planning"
  | "super-consolidation"
  | "platform-setup"
  | "investment-strategy";

export type FormId =
  | "mlc-ttr-super"
  | "mlc-ttr-income-stream"
  | "aia-life"
  | "aia-tpd"
  | "aia-ip"
  | "centrelink-aged-care-fee"
  | "amp-aged-care-pension"
  | "estate-loa"
  | "beneficiary-nomination"
  | "mlc-super"
  | "ato-rollover"
  | "amp-mynorth"
  | "bt-panorama"
  | "mlc-investment"
  | "cfs-firstchoice";

export type FormStatus = "not-started" | "generated" | "sent" | "completed";

export type ProviderKey =
  | "MLC"
  | "AIA"
  | "AMP"
  | "BT"
  | "CFS"
  | "Centrelink"
  | "BMK";

export interface ProviderInfo {
  name: string;
  website: string;
  team: string;
  email: string;
}

export const PROVIDERS: Record<ProviderKey, ProviderInfo> = {
  MLC: {
    name: "MLC",
    website: "mlc.com.au",
    team: "New Business",
    email: "newbusiness@mlc.com.au",
  },
  AIA: {
    name: "AIA",
    website: "aia.com.au",
    team: "New Business Submissions",
    email: "newbusiness@aia.com.au",
  },
  AMP: {
    name: "AMP MyNorth",
    website: "amp.com.au",
    team: "Platform Services",
    email: "platformservices@amp.com.au",
  },
  CFS: {
    name: "CFS FirstChoice",
    website: "cfs.com.au",
    team: "New Accounts",
    email: "newaccounts@cfs.com.au",
  },
  BT: {
    name: "BT Panorama",
    website: "bt.com.au",
    team: "Adviser Services",
    email: "adviserservices@bt.com.au",
  },
  Centrelink: {
    name: "Centrelink",
    website: "servicesaustralia.gov.au",
    team: "Aged Care Assessment",
    email: "agedcare@servicesaustralia.gov.au",
  },
  BMK: {
    name: "Newcastle Financial Services",
    website: "bmkfs.com.au",
    team: "Brad Lonergan",
    email: "brad@bmkfs.com.au",
  },
};

export interface FormDefinition {
  id: FormId;
  name: string;
  provider: ProviderKey;
  description: string;
  strategies: StrategyKey[];
  requiredFields: string[]; // SarahFactFind dot-path notation
}

const CORE_PERSONAL = [
  "personalDetails.fullName",
  "personalDetails.dateOfBirth",
  "personalDetails.address",
  "contactInformation.email",
  "contactInformation.mobile",
];

const CORE_SUPER = [
  "superannuation.fundName",
  "superannuation.memberNumber",
  "superannuation.estimatedBalance",
];

const CORE_EMPLOYMENT = [
  "employmentAndIncome.employerName",
  "employmentAndIncome.occupation",
  "employmentAndIncome.annualGrossIncome",
];

export const FORMS: FormDefinition[] = [
  // ── TTR Strategy ────────────────────────────────────────────────────────
  {
    id: "mlc-ttr-super",
    name: "MLC MasterKey Super TTR Application",
    provider: "MLC",
    description: "MLC MasterKey Super Fundamentals — TTR account application",
    strategies: ["ttr-strategy"],
    requiredFields: [...CORE_PERSONAL, ...CORE_SUPER, ...CORE_EMPLOYMENT],
  },
  {
    id: "mlc-ttr-income-stream",
    name: "MLC TTR Income Stream Application",
    provider: "MLC",
    description: "MLC TTR pension — income stream application",
    strategies: ["ttr-strategy"],
    requiredFields: [...CORE_PERSONAL, ...CORE_SUPER, "employmentAndIncome.annualGrossIncome"],
  },

  // ── Insurance Review ────────────────────────────────────────────────────
  {
    id: "aia-life",
    name: "AIA Life Insurance Application",
    provider: "AIA",
    description: "AIA Vitality Protect — life cover application",
    strategies: ["insurance-review"],
    requiredFields: [...CORE_PERSONAL, ...CORE_EMPLOYMENT, "familyAndDependants.numberOfDependants"],
  },
  {
    id: "aia-tpd",
    name: "AIA Total and Permanent Disability Application",
    provider: "AIA",
    description: "AIA TPD cover — standalone or linked",
    strategies: ["insurance-review"],
    requiredFields: [...CORE_PERSONAL, ...CORE_EMPLOYMENT],
  },
  {
    id: "aia-ip",
    name: "AIA Income Protection Application",
    provider: "AIA",
    description: "AIA Priority Protection — income protection cover",
    strategies: ["insurance-review"],
    requiredFields: [...CORE_PERSONAL, ...CORE_EMPLOYMENT],
  },

  // ── Aged Care ───────────────────────────────────────────────────────────
  {
    id: "centrelink-aged-care-fee",
    name: "Centrelink Aged Care Fee Assessment",
    provider: "Centrelink",
    description: "Income and assets assessment for residential aged care fees",
    strategies: ["aged-care"],
    requiredFields: [
      ...CORE_PERSONAL,
      "assets.ownerOccupiedPropertyValue",
      "assets.savingsAndCash",
      "assets.sharesAndInvestments",
      "superannuation.estimatedBalance",
    ],
  },
  {
    id: "amp-aged-care-pension",
    name: "AMP MyNorth Aged Care Pension Application",
    provider: "AMP",
    description: "AMP MyNorth aged care pension — account opening",
    strategies: ["aged-care"],
    requiredFields: [...CORE_PERSONAL, ...CORE_SUPER],
  },

  // ── Estate Planning ─────────────────────────────────────────────────────
  {
    id: "estate-loa",
    name: "Letter of Advice (Estate Planning)",
    provider: "BMK",
    description: "Newcastle FS letter of advice template — estate planning",
    strategies: ["estate-planning"],
    requiredFields: [
      ...CORE_PERSONAL,
      "familyAndDependants.relationshipStatus",
      "familyAndDependants.partnerName",
      "familyAndDependants.numberOfDependants",
    ],
  },
  {
    id: "beneficiary-nomination",
    name: "Beneficiary Nomination Form",
    provider: "BMK",
    description: "Generic binding beneficiary nomination — super and insurance",
    strategies: ["estate-planning"],
    requiredFields: [
      ...CORE_PERSONAL,
      "superannuation.fundName",
      "superannuation.memberNumber",
    ],
  },

  // ── Super Consolidation ─────────────────────────────────────────────────
  {
    id: "mlc-super",
    name: "MLC MasterKey Super Fundamentals Application",
    provider: "MLC",
    description: "MLC MasterKey Super Fundamentals — new account application",
    strategies: ["super-consolidation"],
    requiredFields: [...CORE_PERSONAL, ...CORE_SUPER, ...CORE_EMPLOYMENT],
  },
  {
    id: "ato-rollover",
    name: "ATO Rollover Authority Form",
    provider: "BMK",
    description: "ATO authority to rollover super into a nominated fund",
    strategies: ["super-consolidation"],
    requiredFields: [...CORE_PERSONAL, "superannuation.fundName", "superannuation.memberNumber"],
  },

  // ── Platform Setup ──────────────────────────────────────────────────────
  {
    id: "amp-mynorth",
    name: "AMP MyNorth Investment Platform Application",
    provider: "AMP",
    description: "AMP MyNorth investment platform — account opening form",
    strategies: ["platform-setup"],
    requiredFields: [...CORE_PERSONAL, "assets.savingsAndCash", "assets.sharesAndInvestments"],
  },
  {
    id: "bt-panorama",
    name: "BT Panorama Account Opening",
    provider: "BT",
    description: "BT Panorama investment platform — account opening",
    strategies: ["platform-setup"],
    requiredFields: [...CORE_PERSONAL, "assets.sharesAndInvestments"],
  },

  // ── Investment Strategy ─────────────────────────────────────────────────
  {
    id: "mlc-investment",
    name: "MLC Investment Application",
    provider: "MLC",
    description: "MLC managed investment — application form",
    strategies: ["investment-strategy"],
    requiredFields: [
      ...CORE_PERSONAL,
      "assets.savingsAndCash",
      "goalsAndObjectives.investmentRiskPreference",
    ],
  },
  {
    id: "cfs-firstchoice",
    name: "CFS FirstChoice Investments Application",
    provider: "CFS",
    description: "Colonial First State FirstChoice — investment account opening",
    strategies: ["investment-strategy"],
    requiredFields: [
      ...CORE_PERSONAL,
      "assets.savingsAndCash",
      "goalsAndObjectives.investmentRiskPreference",
    ],
  },
];

export const STRATEGY_LABELS: Record<StrategyKey, string> = {
  "ttr-strategy": "TTR Strategy (Transition to Retirement)",
  "insurance-review": "Insurance Review (IP / Life / TPD)",
  "aged-care": "Aged Care",
  "estate-planning": "Estate Planning",
  "super-consolidation": "Super Consolidation",
  "platform-setup": "Platform Setup",
  "investment-strategy": "Investment Strategy",
};

export const STRATEGY_DESCRIPTIONS: Record<StrategyKey, string> = {
  "ttr-strategy":
    "Boost retirement savings while still working by drawing a tax-effective pension alongside salary.",
  "insurance-review":
    "Review and arrange Life, TPD and Income Protection cover sized to the client's situation.",
  "aged-care":
    "Plan and structure the financial side of residential or in-home aged care.",
  "estate-planning":
    "Beneficiary nominations, wills and succession planning across super, insurance and assets.",
  "super-consolidation":
    "Bring multiple super funds together to reduce fees and simplify retirement planning.",
  "platform-setup":
    "Establish a managed investment platform so investments are visible, reportable and rebalanceable.",
  "investment-strategy":
    "Design and implement a diversified investment portfolio aligned to the client's goals.",
};

export function getFormsForStrategies(strategies: StrategyKey[]): FormDefinition[] {
  return FORMS.filter((f) => f.strategies.some((s) => strategies.includes(s)));
}

export function getProvidersForStrategy(strategy: StrategyKey): ProviderKey[] {
  const set = new Set<ProviderKey>();
  for (const f of FORMS) {
    if (f.strategies.includes(strategy)) set.add(f.provider);
  }
  return Array.from(set);
}

// ── Form status store (localStorage) ────────────────────────────────────────

export type ActionedBy = "Brad" | "Colleen";

export interface FormStatusEntry {
  status: FormStatus;
  updatedAt: string; // ISO
  actionedBy?: ActionedBy;
  notes?: string;
}

const STORE_KEY = "bmk-crm-forms-v2";

interface FormStoreData {
  entries: Record<string, Partial<Record<FormId, FormStatusEntry>>>;
}

function loadStore(): FormStoreData {
  if (typeof window === "undefined") return { entries: {} };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as FormStoreData) : { entries: {} };
  } catch {
    return { entries: {} };
  }
}

function saveStore(store: FormStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota
  }
}

export function getFormEntry(clientId: string, formId: FormId): FormStatusEntry {
  if (typeof window === "undefined") {
    return { status: "not-started", updatedAt: "" };
  }
  return (
    loadStore().entries[clientId]?.[formId] ?? {
      status: "not-started",
      updatedAt: "",
    }
  );
}

export function getAllFormEntries(
  clientId: string,
): Partial<Record<FormId, FormStatusEntry>> {
  if (typeof window === "undefined") return {};
  return loadStore().entries[clientId] ?? {};
}

export function setFormEntry(
  clientId: string,
  formId: FormId,
  patch: Partial<FormStatusEntry>,
): void {
  if (typeof window === "undefined") return;
  const store = loadStore();
  if (!store.entries[clientId]) store.entries[clientId] = {};
  const prev = store.entries[clientId][formId] ?? {
    status: "not-started" as FormStatus,
    updatedAt: "",
  };
  store.entries[clientId][formId] = {
    ...prev,
    ...patch,
    updatedAt:
      patch.status && patch.status !== prev.status
        ? new Date().toISOString()
        : prev.updatedAt || new Date().toISOString(),
  };
  saveStore(store);
}
