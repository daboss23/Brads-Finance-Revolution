// XPLAN entity → platform shapes.
//
// This is the file to edit once the API Agreement lands and the real field
// names are visible. XPLAN sites carry heavy per-site customisation, so the
// field names below are the documented defaults and every one of them should
// be checked against Brad's actual site before a real client is imported.
//
// Everything is defensive: an unrecognised or absent field maps to an empty
// string rather than throwing, so one renamed field cannot break an import.

import type { SarahFactFind } from "@/lib/sarah-fact-find-schema";

/** The subset of an XPLAN entity this platform reads. */
export interface XplanEntity {
  entity_id: string | number;
  [field: string]: unknown;
}

function str(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/** First non-empty value among several candidate field names. */
function pick(entity: XplanEntity, ...names: string[]): string {
  for (const name of names) {
    const v = str(entity[name]);
    if (v) return v;
  }
  return "";
}

function money(entity: XplanEntity, ...names: string[]): string {
  const raw = pick(entity, ...names);
  if (!raw) return "";
  const n = Number(raw.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n)) return raw;
  return "$" + n.toLocaleString("en-AU");
}

export function xplanEntityId(entity: XplanEntity): string {
  return String(entity.entity_id);
}

/**
 * Stable local id for an imported record. Prefixed so an XPLAN-sourced client
 * can never collide with a locally created one, and so it is obvious in logs
 * and URLs where a record came from.
 */
export function localIdFor(entity: XplanEntity): string {
  return `xplan-${xplanEntityId(entity)}`;
}

export function xplanDisplayName(entity: XplanEntity): string {
  const full = pick(entity, "display_name", "full_name");
  if (full) return full;
  const first = pick(entity, "first_name", "given_name", "preferred_name");
  const last = pick(entity, "last_name", "surname", "family_name");
  return [first, last].filter(Boolean).join(" ") || "Unnamed XPLAN entity";
}

export function xplanEmail(entity: XplanEntity): string {
  return pick(entity, "email", "email_address", "personal_email", "work_email");
}

export function xplanMobile(entity: XplanEntity): string {
  return pick(entity, "mobile", "mobile_phone", "phone_mobile", "cell");
}

/**
 * Build the fact find from an XPLAN entity. Only fields XPLAN actually
 * carries are filled; the rest stay empty so Sarah, or Brad at the meeting,
 * can complete them. Completion is recomputed from what landed rather than
 * asserted, so the compliance gate still sees an honest picture.
 */
export function toFactFind(entity: XplanEntity): SarahFactFind {
  const data: Omit<SarahFactFind, "completionPercentage" | "missingSections"> = {
    personalDetails: {
      fullName: xplanDisplayName(entity),
      dateOfBirth: pick(entity, "date_of_birth", "dob", "birth_date"),
      address: pick(entity, "address", "residential_address", "home_address"),
      timeAtAddress: pick(entity, "time_at_address"),
      countryOfBirth: pick(entity, "country_of_birth", "birth_country"),
    },
    contactInformation: {
      mobile: xplanMobile(entity),
      homePhone: pick(entity, "home_phone", "phone_home"),
      email: xplanEmail(entity),
      preferredContact: pick(entity, "preferred_contact_method"),
      bestTimeToContact: pick(entity, "best_time_to_contact"),
    },
    familyAndDependants: {
      relationshipStatus: pick(entity, "marital_status", "relationship_status"),
      partnerName: pick(entity, "partner_name", "spouse_name"),
      partnerDOB: pick(entity, "partner_date_of_birth", "spouse_dob"),
      numberOfDependants: pick(entity, "number_of_dependants", "dependants"),
      agesOfDependants: pick(entity, "dependant_ages"),
    },
    employmentAndIncome: {
      employmentStatus: pick(entity, "employment_status"),
      employerName: pick(entity, "employer", "employer_name"),
      occupation: pick(entity, "occupation", "job_title"),
      annualGrossIncome: money(entity, "annual_income", "gross_income", "salary"),
      otherIncomeSources: pick(entity, "other_income"),
    },
    assets: {
      ownerOccupiedPropertyValue: money(entity, "home_value", "owner_occupied_value"),
      investmentPropertyValue: money(entity, "investment_property_value"),
      savingsAndCash: money(entity, "cash_savings", "savings"),
      sharesAndInvestments: money(entity, "shares_value", "investments_value"),
      vehicles: money(entity, "vehicles_value"),
    },
    liabilities: {
      homeMortgage: money(entity, "mortgage_balance", "home_loan_balance"),
      investmentLoans: money(entity, "investment_loan_balance"),
      personalLoans: money(entity, "personal_loan_balance"),
      creditCardLimits: money(entity, "credit_card_limit"),
      otherLiabilities: money(entity, "other_liabilities"),
    },
    expenses: {
      housingCosts: money(entity, "housing_costs"),
      groceries: money(entity, "groceries"),
      transport: money(entity, "transport_costs"),
      education: money(entity, "education_costs"),
      lifestyleAndEntertainment: money(entity, "lifestyle_costs"),
    },
    superannuation: {
      fundName: pick(entity, "super_fund", "super_fund_name"),
      memberNumber: pick(entity, "super_member_number"),
      estimatedBalance: money(entity, "super_balance"),
      employerContributionRate: pick(entity, "employer_contribution_rate"),
      personalContributions: money(entity, "personal_contributions"),
    },
    insurance: {
      lifeInsuranceSumInsured: money(entity, "life_sum_insured"),
      lifeInsuranceProvider: pick(entity, "life_insurer", "life_provider"),
      incomeProtectionMonthlyBenefit: money(entity, "ip_monthly_benefit"),
      tpdCover: money(entity, "tpd_sum_insured"),
      healthInsuranceProvider: pick(entity, "health_insurer"),
    },
    goalsAndObjectives: {
      primaryFinancialGoals: pick(entity, "goals", "primary_goals"),
      targetRetirementAge: pick(entity, "target_retirement_age", "retirement_age"),
      desiredRetirementIncome: money(entity, "desired_retirement_income"),
      investmentRiskPreference: pick(entity, "risk_profile", "risk_tolerance"),
      otherConsiderations: pick(entity, "notes", "other_considerations"),
    },
  };

  const sections = Object.entries(data) as [
    keyof typeof data,
    Record<string, string>,
  ][];

  const missingSections = sections
    .filter(([, fields]) => Object.values(fields).every((v) => !v))
    .map(([name]) => String(name));

  const totalFields = sections.reduce(
    (n, [, fields]) => n + Object.keys(fields).length,
    0,
  );
  const filledFields = sections.reduce(
    (n, [, fields]) => n + Object.values(fields).filter(Boolean).length,
    0,
  );

  return {
    ...data,
    completionPercentage: totalFields
      ? Math.round((filledFields / totalFields) * 100)
      : 0,
    missingSections,
  };
}
