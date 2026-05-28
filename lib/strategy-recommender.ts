// Rules engine that reads Sarah's collected fact find and returns
// recommended strategies with a short rationale and a confidence band.

import type { SarahFactFind } from "./sarah-fact-find-schema";
import type { StrategyKey } from "./forms";
import { STRATEGY_LABELS } from "./forms";

export type Confidence = "low" | "medium" | "high";

export interface Recommendation {
  strategyKey: StrategyKey;
  strategyName: string;
  reason: string;
  confidence: Confidence;
}

// ── helpers ───────────────────────────────────────────────────────────────

function dollarsToNumber(value: string): number {
  if (!value) return 0;
  const m = value.replace(/[^0-9.]/g, "");
  const n = parseFloat(m);
  return isFinite(n) ? n : 0;
}

function ageFromDob(value: string): number | null {
  if (!value) return null;
  // Try several common formats: "14 March 1987", "1987-03-14", "14/03/1987"
  const dateMatch =
    value.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/) ||
    value.match(/(\d{4})-(\d{2})-(\d{2})/) ||
    value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  let year: number | null = null;
  if (dateMatch) {
    const last = dateMatch[dateMatch.length - 1];
    if (last && /^\d{4}$/.test(last)) year = parseInt(last, 10);
    else if (/^\d{4}$/.test(dateMatch[1])) year = parseInt(dateMatch[1], 10);
  }
  if (!year) {
    const yearOnly = value.match(/(19|20)\d{2}/);
    if (yearOnly) year = parseInt(yearOnly[0], 10);
  }
  if (!year) return null;
  const thisYear = new Date().getFullYear();
  const age = thisYear - year;
  return age > 0 && age < 120 ? age : null;
}

function pickEarliestAge(value: string): number | null {
  if (!value) return null;
  const ages = (value.match(/(19|20)\d{2}/g) ?? []).map((y) => parseInt(y, 10));
  if (ages.length === 0) return ageFromDob(value);
  const earliest = Math.min(...ages); // older partner
  return new Date().getFullYear() - earliest;
}

function confidenceFromHits(hits: number): Confidence {
  if (hits >= 3) return "high";
  if (hits === 2) return "medium";
  return "low";
}

function rec(
  strategyKey: StrategyKey,
  reason: string,
  confidence: Confidence,
): Recommendation {
  return {
    strategyKey,
    strategyName: STRATEGY_LABELS[strategyKey],
    reason,
    confidence,
  };
}

// ── rules ─────────────────────────────────────────────────────────────────

export function recommendStrategies(data: SarahFactFind): Recommendation[] {
  const out: Recommendation[] = [];

  const age = pickEarliestAge(data.personalDetails.dateOfBirth);
  const income = dollarsToNumber(data.employmentAndIncome.annualGrossIncome);
  const superBal = dollarsToNumber(data.superannuation.estimatedBalance);
  const dependants = parseInt(data.familyAndDependants.numberOfDependants || "0", 10) || 0;
  const homeMortgage = dollarsToNumber(data.liabilities.homeMortgage);
  const savings = dollarsToNumber(data.assets.savingsAndCash);
  const sharesOutsideSuper = dollarsToNumber(data.assets.sharesAndInvestments);
  const ownerHome = dollarsToNumber(data.assets.ownerOccupiedPropertyValue);
  const investmentProperty = dollarsToNumber(data.assets.investmentPropertyValue);
  const totalAssets =
    ownerHome + investmentProperty + savings + sharesOutsideSuper + superBal;
  const lifeCover = dollarsToNumber(data.insurance.lifeInsuranceSumInsured);
  const lifeProvider = data.insurance.lifeInsuranceProvider;
  const employmentStatus = data.employmentAndIncome.employmentStatus.toLowerCase();
  const stillWorking =
    employmentStatus.includes("employed") ||
    employmentStatus.includes("self") ||
    employmentStatus.includes("contractor") ||
    employmentStatus.includes("business") ||
    employmentStatus.includes("semi");
  const riskPref = data.goalsAndObjectives.investmentRiskPreference.toLowerCase();
  const goalsText = (
    data.goalsAndObjectives.primaryFinancialGoals +
    " " +
    data.goalsAndObjectives.otherConsiderations
  ).toLowerCase();

  // ── TTR Strategy ────────────────────────────────────────────────────────
  if (
    age !== null &&
    age >= 55 &&
    age <= 67 &&
    stillWorking &&
    superBal > 100_000
  ) {
    let hits = 1;
    if (superBal > 250_000) hits++;
    if (age >= 58 && age <= 65) hits++;
    out.push(
      rec(
        "ttr-strategy",
        "Client is approaching preservation age with a strong super balance. A TTR strategy could boost retirement savings while maintaining income.",
        confidenceFromHits(hits),
      ),
    );
  }

  // ── Insurance Review ────────────────────────────────────────────────────
  const noLifeCover = lifeCover === 0 && !lifeProvider.trim();
  if ((dependants > 0 || homeMortgage > 0 || income > 80_000) && noLifeCover) {
    let hits = 0;
    if (dependants > 0) hits++;
    if (homeMortgage > 0) hits++;
    if (income > 80_000) hits++;
    out.push(
      rec(
        "insurance-review",
        "Client has financial dependants and income to protect but insurance cover appears insufficient or unknown.",
        confidenceFromHits(hits),
      ),
    );
  }

  // ── Super Consolidation ─────────────────────────────────────────────────
  const fundName = data.superannuation.fundName.toLowerCase();
  const multipleSuper =
    fundName.includes("/") ||
    fundName.includes(" and ") ||
    fundName.includes(",") ||
    /multiple|several|two|three|few/.test(goalsText);
  if (multipleSuper || (superBal > 0 && superBal < 50_000 && (age ?? 99) < 45)) {
    let hits = 1;
    if (multipleSuper) hits++;
    if (superBal > 0 && superBal < 50_000) hits++;
    out.push(
      rec(
        "super-consolidation",
        "Consolidating super funds could reduce fees and improve long term balance growth.",
        confidenceFromHits(hits),
      ),
    );
  }

  // ── Platform Setup ──────────────────────────────────────────────────────
  const platformMentioned = /mynorth|panorama|firstchoice|platform/.test(
    goalsText,
  );
  if (sharesOutsideSuper > 20_000 && !platformMentioned) {
    let hits = 1;
    if (sharesOutsideSuper > 50_000) hits++;
    if (savings > 50_000) hits++;
    out.push(
      rec(
        "platform-setup",
        "Client has investable assets that could benefit from a managed investment platform.",
        confidenceFromHits(hits),
      ),
    );
  }

  // ── Aged Care ───────────────────────────────────────────────────────────
  const mentionsAgedCare =
    /aged care|nursing home|elderly|parent in care|caring for/.test(goalsText);
  if ((age !== null && age > 70) || mentionsAgedCare) {
    let hits = 1;
    if (age !== null && age > 75) hits++;
    if (mentionsAgedCare) hits++;
    out.push(
      rec(
        "aged-care",
        "Aged care planning may be relevant given client age or family circumstances.",
        confidenceFromHits(hits),
      ),
    );
  }

  // ── Estate Planning ─────────────────────────────────────────────────────
  const mentionsEstate = /will|estate|beneficiary|inheritance|widow/.test(
    goalsText + " " + data.familyAndDependants.relationshipStatus.toLowerCase(),
  );
  if ((dependants > 0 && totalAssets > 500_000) || mentionsEstate) {
    let hits = 1;
    if (dependants > 0) hits++;
    if (totalAssets > 500_000) hits++;
    if (mentionsEstate) hits++;
    out.push(
      rec(
        "estate-planning",
        "Client profile suggests estate planning review would be valuable.",
        confidenceFromHits(hits),
      ),
    );
  }

  // ── Investment Strategy ─────────────────────────────────────────────────
  const moderateOrAbove =
    riskPref.includes("moderate") ||
    riskPref.includes("growth") ||
    riskPref.includes("aggressive") ||
    riskPref.includes("balanced");
  const investmentMentioned = /investment portfolio|managed funds|etf|shares strategy/.test(
    goalsText,
  );
  if ((savings > 50_000 || moderateOrAbove) && !investmentMentioned) {
    let hits = 0;
    if (savings > 50_000) hits++;
    if (moderateOrAbove) hits++;
    if (sharesOutsideSuper > 10_000) hits++;
    out.push(
      rec(
        "investment-strategy",
        "Client has capacity and appetite for an investment strategy.",
        confidenceFromHits(Math.max(hits, 1)),
      ),
    );
  }

  return out;
}
