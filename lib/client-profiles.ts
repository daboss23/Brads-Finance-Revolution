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
    strategies: ["insurance-review", "super-consolidation"],
  },
  "james-fiona-carr": {
    strategies: ["ttr-strategy", "investment-strategy"],
  },
  "tony-nguyen": {
    strategies: ["platform-setup", "super-consolidation"],
  },
  "david-okafor": {
    strategies: ["insurance-review"],
  },
  "priya-sharma": {
    strategies: ["super-consolidation", "investment-strategy"],
  },
  "robert-sue-tanner": {
    strategies: ["ttr-strategy", "aged-care"],
  },
  "helen-davies": {
    strategies: ["estate-planning", "insurance-review"],
  },
};

export function getClientProfile(clientId: string): ClientProfile | null {
  return PROFILES[clientId] ?? null;
}
