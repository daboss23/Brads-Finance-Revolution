// Firm-wide strategy catalogue.
//
// Two jobs:
//   1. A curated library of strategies sourced from ATO guidance and the
//      MLC product suite, that Brad can pull into any client with one click.
//      These are hand-verified and shipped in code (SEED_STRATEGIES) so the
//      library works offline and stays compliance-safe — no live scraping of
//      third-party sites, which for a regulated advice tool would be a hazard.
//   2. A manual add path so Brad can author a genuinely new custom strategy
//      (name + description + optional providers) that is not one of the seven
//      built-ins. Custom strategies are stored in the browser and reused
//      across every client.
//
// The catalogue is intentionally separate from the seven built-in StrategyKey
// values in lib/forms.ts. Built-ins have provider forms, SOA reasoning
// patterns and market snapshots wired to them; catalogue strategies flow into
// the SOA as adviser-reviewed recommendation content via their description.

import type { ProviderKey } from "./forms";

export type StrategySource = "custom" | "ato" | "mlc";

export interface CatalogueStrategy {
  /** Stable id. Seeded entries use a readable slug; custom ones use custom:<ts>. */
  id: string;
  name: string;
  description: string;
  source: StrategySource;
  /** Grouping label shown in the library, e.g. "Superannuation", "Tax". */
  category: string;
  /** Where this came from — an ATO topic, an MLC product — for the audit trail. */
  reference?: string;
  /** Provider chips shown on the card. Optional for custom strategies. */
  providers?: ProviderKey[];
  createdAt?: string;
}

// ── Curated seed: ATO + MLC ──────────────────────────────────────────────────
// Hand-authored from public ATO guidance and MLC product disclosure. Figures
// are FY 2024/25 unless noted; Brad verifies against current thresholds before
// anything is sent. This is the "pull strategies from other sites" library.

export const SEED_STRATEGIES: CatalogueStrategy[] = [
  {
    id: "ato-carry-forward-concessional",
    name: "Carry-forward concessional contributions",
    description:
      "Use unused concessional contribution cap from the previous five years to make a larger tax-deductible super contribution this year, where the total super balance was under $500,000 on 30 June of the prior year. Reduces assessable income in a high-income year.",
    source: "ato",
    category: "Superannuation",
    reference: "ATO — Carry-forward concessional contributions",
    providers: ["MLC"],
  },
  {
    id: "ato-downsizer-contribution",
    name: "Downsizer contribution",
    description:
      "Contribute up to $300,000 per person from the proceeds of selling a main residence held for at least ten years, from age 55, outside the normal contribution caps. Moves money into the concessionally taxed super environment.",
    source: "ato",
    category: "Superannuation",
    reference: "ATO — Downsizer contributions into super",
    providers: ["MLC"],
  },
  {
    id: "ato-spouse-contribution-splitting",
    name: "Spouse contribution splitting",
    description:
      "Split up to 85 percent of concessional contributions to the lower-balance spouse's super to equalise balances, improve access to the transfer balance cap across the couple, and manage total super balance thresholds.",
    source: "ato",
    category: "Superannuation",
    reference: "ATO — Contributions splitting",
  },
  {
    id: "ato-spouse-contribution-tax-offset",
    name: "Spouse contribution tax offset",
    description:
      "Make a non-concessional contribution to a low-income spouse's super to receive a tax offset of up to $540 where the spouse's income is under the relevant threshold. Boosts the couple's combined retirement savings tax-effectively.",
    source: "ato",
    category: "Tax",
    reference: "ATO — Tax offset for super contributions on behalf of your spouse",
  },
  {
    id: "ato-super-co-contribution",
    name: "Government super co-contribution",
    description:
      "For a lower-income client making a personal after-tax super contribution, the government co-contributes up to $500 where income is under the lower threshold, phasing out at the upper threshold. Effectively a guaranteed return on the contribution.",
    source: "ato",
    category: "Superannuation",
    reference: "ATO — Super co-contribution",
  },
  {
    id: "ato-cgt-small-business-concessions",
    name: "Small business CGT concessions",
    description:
      "For an eligible small business owner selling active assets, apply the 15-year exemption, 50 percent active asset reduction, retirement exemption and rollover to reduce or eliminate capital gains tax, with proceeds able to flow into super under the CGT cap.",
    source: "ato",
    category: "Tax",
    reference: "ATO — Small business CGT concessions",
  },
  {
    id: "mlc-masterkey-super",
    name: "MLC MasterKey Super consolidation",
    description:
      "Consolidate multiple super accounts into MLC MasterKey Super Fundamentals to reduce duplicate admin fees and insurance premiums, simplify reporting, and access the MLC investment menu. Confirm no loss of valuable insurance before rollover.",
    source: "mlc",
    category: "Platform",
    reference: "MLC MasterKey Super Fundamentals PDS",
    providers: ["MLC"],
  },
  {
    id: "mlc-wrap-investment",
    name: "MLC Wrap managed portfolio",
    description:
      "Establish an MLC Wrap account with a managed portfolio aligned to the client's risk profile, giving consolidated reporting, tax parcel selection and rebalancing across the client's investments in one place.",
    source: "mlc",
    category: "Investment",
    reference: "MLC Wrap Investments PDS",
    providers: ["MLC"],
  },
  {
    id: "mlc-transition-to-retirement",
    name: "MLC transition to retirement pension",
    description:
      "Commence an MLC transition to retirement income stream from preservation age while still working, drawing a tax-effective pension alongside salary and, where appropriate, salary sacrificing to super to lift the retirement balance.",
    source: "mlc",
    category: "Retirement",
    reference: "MLC Pension Fundamentals PDS",
    providers: ["MLC"],
  },
  {
    id: "mlc-insurance-in-super",
    name: "MLC insurance through super",
    description:
      "Hold MLC life and TPD cover inside super so premiums are funded from the super balance rather than cash flow, sized to the client's needs. Review the tax treatment of TPD proceeds and any benefit to the estate.",
    source: "mlc",
    category: "Insurance",
    reference: "MLC Insurance PDS",
    providers: ["MLC"],
  },
];

const STORE_KEY = "bmk-crm-strategy-catalogue-v1";

interface CatalogueStore {
  /** Custom strategies authored by Brad. Seeds are code-shipped, not stored. */
  custom: CatalogueStrategy[];
  /** Ids of seed strategies Brad has hidden from the library. */
  hiddenSeeds: string[];
}

function load(): CatalogueStore {
  if (typeof window === "undefined") return { custom: [], hiddenSeeds: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { custom: [], hiddenSeeds: [] };
    const parsed = JSON.parse(raw) as Partial<CatalogueStore>;
    return {
      custom: parsed.custom ?? [],
      hiddenSeeds: parsed.hiddenSeeds ?? [],
    };
  } catch {
    return { custom: [], hiddenSeeds: [] };
  }
}

function save(state: CatalogueStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** The full library: seeded ATO/MLC entries (minus hidden) plus custom ones. */
export function getCatalogue(): CatalogueStrategy[] {
  const { custom, hiddenSeeds } = load();
  const seeds = SEED_STRATEGIES.filter((s) => !hiddenSeeds.includes(s.id));
  return [...custom, ...seeds];
}

export function getCatalogueStrategy(id: string): CatalogueStrategy | undefined {
  if (id.startsWith("custom:")) {
    return load().custom.find((s) => s.id === id);
  }
  return SEED_STRATEGIES.find((s) => s.id === id);
}

export interface NewCustomStrategy {
  name: string;
  description: string;
  category?: string;
  providers?: ProviderKey[];
}

export function addCustomStrategy(input: NewCustomStrategy): CatalogueStrategy {
  const strategy: CatalogueStrategy = {
    id: `custom:${Date.now()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    source: "custom",
    category: input.category?.trim() || "Custom",
    providers: input.providers,
    createdAt: new Date().toISOString(),
  };
  const state = load();
  state.custom = [strategy, ...state.custom];
  save(state);
  return strategy;
}

/** Remove a custom strategy, or hide a seeded one from the library. */
export function removeCatalogueStrategy(id: string): void {
  const state = load();
  if (id.startsWith("custom:")) {
    state.custom = state.custom.filter((s) => s.id !== id);
  } else if (!state.hiddenSeeds.includes(id)) {
    state.hiddenSeeds = [...state.hiddenSeeds, id];
  }
  save(state);
}

/** Human-readable label for any catalogue id, resolvable server-side for seeds. */
export function catalogueLabel(id: string): string | undefined {
  return SEED_STRATEGIES.find((s) => s.id === id)?.name;
}
