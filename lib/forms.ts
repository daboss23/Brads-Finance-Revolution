export type FormId = "mlc-super" | "aia-insurance" | "amp-mynorth";
export type FormStatus = "not-started" | "generated" | "sent" | "completed";
export type StrategyKey = "super-consolidation" | "insurance-review" | "platform-setup";

export interface FormDefinition {
  id: FormId;
  name: string;
  provider: string;
  description: string;
  strategies: StrategyKey[];
}

export const FORMS: FormDefinition[] = [
  {
    id: "mlc-super",
    name: "Super Application",
    provider: "MLC",
    description: "MLC MasterKey Super Fundamentals — new account application",
    strategies: ["super-consolidation"],
  },
  {
    id: "aia-insurance",
    name: "Insurance Application",
    provider: "AIA",
    description: "AIA life, TPD and income protection cover application",
    strategies: ["insurance-review"],
  },
  {
    id: "amp-mynorth",
    name: "MyNorth Account Opening",
    provider: "AMP",
    description: "AMP MyNorth investment platform — account opening form",
    strategies: ["platform-setup"],
  },
];

export const STRATEGY_LABELS: Record<StrategyKey, string> = {
  "super-consolidation": "Super Consolidation",
  "insurance-review": "Insurance Review (IP / Life / TPD)",
  "platform-setup": "Platform Setup",
};

export function getFormsForStrategies(strategies: StrategyKey[]): FormDefinition[] {
  return FORMS.filter((f) => f.strategies.some((s) => strategies.includes(s)));
}

// ── localStorage store ──────────────────────────────────────────────────────

const STORE_KEY = "bmk-crm-forms-v1";

interface FormStoreData {
  statuses: Record<string, Partial<Record<FormId, FormStatus>>>;
}

function loadStore(): FormStoreData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : { statuses: {} };
  } catch {
    return { statuses: {} };
  }
}

function saveStore(store: FormStoreData): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {}
}

export function getFormStatus(clientId: string, formId: FormId): FormStatus {
  if (typeof window === "undefined") return "not-started";
  return loadStore().statuses[clientId]?.[formId] ?? "not-started";
}

export function setFormStatus(clientId: string, formId: FormId, status: FormStatus): void {
  if (typeof window === "undefined") return;
  const store = loadStore();
  if (!store.statuses[clientId]) store.statuses[clientId] = {};
  store.statuses[clientId][formId] = status;
  saveStore(store);
}

export function getAllFormStatuses(clientId: string): Partial<Record<FormId, FormStatus>> {
  if (typeof window === "undefined") return {};
  return loadStore().statuses[clientId] ?? {};
}
