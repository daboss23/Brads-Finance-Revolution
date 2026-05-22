import type { StrategyKey } from "./forms";

export interface ClientProfile {
  tfn?: string;
  superFund?: string;
  superMemberNumber?: string;
  superBalance?: number;
  occupation?: string;
  employer?: string;
  annualIncome?: number;
  strategies: StrategyKey[];
}

const PROFILES: Record<string, ClientProfile> = {
  "sarah-mitchell": {
    tfn: "123-456-789",
    superFund: "AustralianSuper",
    superMemberNumber: "AU-4421987",
    superBalance: 142000,
    occupation: "Senior Nurse Practitioner",
    employer: "Hunter Valley Health Network",
    annualIncome: 118000,
    strategies: ["super-consolidation", "insurance-review"],
  },
};

export function getClientProfile(clientId: string): ClientProfile | null {
  return PROFILES[clientId] ?? null;
}
