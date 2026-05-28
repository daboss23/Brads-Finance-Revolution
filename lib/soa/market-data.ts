// Live market data layer. In Phase 4 demo this returns realistic May 2026
// figures. In production this will call a market data provider or a curated
// web search via the WebFetch tool. Whatever is returned is captured into
// the SOA's market snapshot list so the audit trail can prove what data
// informed the recommendation at the time.

import type { StrategyKey } from "../forms";
import type { MarketSnapshot } from "./soa-template";

export function snapshotsForStrategies(
  strategies: StrategyKey[],
): MarketSnapshot[] {
  const now = new Date().toISOString();
  const out: MarketSnapshot[] = [];

  const push = (snap: Omit<MarketSnapshot, "retrievedAt">) =>
    out.push({ ...snap, retrievedAt: now });

  // Always include current thresholds.
  push({
    id: "ato-cc-cap",
    label: "Concessional contributions cap",
    source: "ATO",
    value: "$30,000",
    notes: "Confirmed for FY 2024 / 2025.",
  });
  push({
    id: "ato-sg-rate",
    label: "Super guarantee rate",
    source: "ATO",
    value: "11.5%",
    notes: "Rises to 12% from 1 July 2026.",
  });

  if (strategies.includes("super-consolidation") || strategies.includes("ttr-strategy")) {
    push({
      id: "asuper-fee",
      label: "AustralianSuper balanced option fee",
      source: "AustralianSuper PDS",
      value: "0.50% pa plus $1.50 per week",
      notes: "Applied to assess fee impact of consolidation.",
    });
    push({
      id: "mlc-mk-fee",
      label: "MLC MasterKey Super Fundamentals fee",
      source: "MLC PDS",
      value: "0.39% pa investment plus $93.60 admin",
      notes: "Charter APL approved product.",
    });
  }

  if (strategies.includes("insurance-review")) {
    push({
      id: "aia-life-rate",
      label: "AIA Vitality Protect life premium",
      source: "AIA quote engine",
      value: "$38 per month per $500,000 cover, female non-smoker age 38",
      notes: "Indicative only. Subject to underwriting.",
    });
    push({
      id: "aia-ip-rate",
      label: "AIA Priority Protection IP premium",
      source: "AIA quote engine",
      value: "$72 per month for 75% income protection, 30 day wait, age 38",
      notes: "Indicative only. Subject to underwriting.",
    });
  }

  if (strategies.includes("investment-strategy") || strategies.includes("platform-setup")) {
    push({
      id: "mynorth-fee",
      label: "AMP MyNorth platform fee",
      source: "AMP PDS",
      value: "0.30% pa on first $250k, 0.20% above",
      notes: "Charter APL approved platform.",
    });
    push({
      id: "asx200-return",
      label: "ASX 200 ten year average return",
      source: "ASX market data",
      value: "8.4% pa total return",
      notes: "Used as upper bound only. Projections use 6.5% conservative.",
    });
  }

  if (strategies.includes("aged-care")) {
    push({
      id: "rad-rate",
      label: "Maximum permissible interest rate (MPIR)",
      source: "Services Australia",
      value: "8.42%",
      notes: "Used to convert RAD to daily accommodation payment.",
    });
  }

  return out;
}
