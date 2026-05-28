// Retirement projection calculator. Conservative inputs, deterministic output.
// The SOA always discloses the assumptions used.

import type { SarahFactFind } from "../sarah-fact-find-schema";
import type { SoaProjectionPoint } from "./soa-template";

export interface ProjectionAssumptions {
  retirementAge: number;
  baseReturnPa: number;
  recommendedReturnPa: number;
  inflationPa: number;
  baseContributionRate: number; // employer SG only
  recommendedExtraPerYear: number; // additional contributions
}

export const DEFAULT_ASSUMPTIONS: ProjectionAssumptions = {
  retirementAge: 67,
  baseReturnPa: 0.055,
  recommendedReturnPa: 0.065,
  inflationPa: 0.025,
  baseContributionRate: 0.115,
  recommendedExtraPerYear: 5000,
};

function parseDollars(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : 0;
}

function parseAge(dob: string): number | null {
  if (!dob) return null;
  const yearMatch = dob.match(/(19|20)\d{2}/);
  if (!yearMatch) return null;
  const year = parseInt(yearMatch[0], 10);
  const age = new Date().getFullYear() - year;
  return age > 0 && age < 120 ? age : null;
}

export function projectSuper(
  factFind: SarahFactFind,
  overrides: Partial<ProjectionAssumptions> = {},
): { points: SoaProjectionPoint[]; assumptions: ProjectionAssumptions } {
  const a = { ...DEFAULT_ASSUMPTIONS, ...overrides };
  const startAge = parseAge(factFind.personalDetails.dateOfBirth) ?? 38;
  const startBalance = parseDollars(factFind.superannuation.estimatedBalance);
  const income = parseDollars(factFind.employmentAndIncome.annualGrossIncome);

  const sgPerYear = income * a.baseContributionRate;
  const points: SoaProjectionPoint[] = [];

  let baseBalance = startBalance;
  let recBalance = startBalance;
  for (let age = startAge; age <= a.retirementAge; age++) {
    points.push({
      age,
      current: Math.round(baseBalance),
      recommended: Math.round(recBalance),
    });
    baseBalance = baseBalance * (1 + a.baseReturnPa) + sgPerYear;
    recBalance =
      recBalance * (1 + a.recommendedReturnPa) +
      sgPerYear +
      a.recommendedExtraPerYear;
  }
  return { points, assumptions: a };
}

export function formatProjectionSummary(
  points: SoaProjectionPoint[],
  assumptions: ProjectionAssumptions,
): string {
  if (points.length === 0) return "No projection available.";
  const final = points[points.length - 1];
  const delta = final.recommended - final.current;
  const fmt = (n: number) =>
    n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
  return `By age ${final.age} the recommended strategy projects a super balance of ${fmt(
    final.recommended,
  )} compared to ${fmt(final.current)} on the current path. That is a difference of ${fmt(
    delta,
  )}. Assumptions: ${(assumptions.baseReturnPa * 100).toFixed(1)}% current return, ${(
    assumptions.recommendedReturnPa * 100
  ).toFixed(1)}% recommended return, ${(assumptions.inflationPa * 100).toFixed(
    1,
  )}% inflation, additional ${fmt(
    assumptions.recommendedExtraPerYear,
  )} per year of contributions.`;
}
