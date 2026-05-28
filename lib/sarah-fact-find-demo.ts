// Demo fact find payloads for the listed clients. Used as a fallback when
// the in-memory store has no live data — drives the strategy recommender
// and form pre-fill before a real Sarah session has completed.

import type { SarahFactFind } from "./sarah-fact-find-schema";

function blank(): SarahFactFind {
  return {
    personalDetails: {
      fullName: "",
      dateOfBirth: "",
      address: "",
      timeAtAddress: "",
      countryOfBirth: "",
    },
    contactInformation: {
      mobile: "",
      homePhone: "",
      email: "",
      preferredContact: "",
      bestTimeToContact: "",
    },
    familyAndDependants: {
      relationshipStatus: "",
      partnerName: "",
      partnerDOB: "",
      numberOfDependants: "",
      agesOfDependants: "",
    },
    employmentAndIncome: {
      employmentStatus: "",
      employerName: "",
      occupation: "",
      annualGrossIncome: "",
      otherIncomeSources: "",
    },
    assets: {
      ownerOccupiedPropertyValue: "",
      investmentPropertyValue: "",
      savingsAndCash: "",
      sharesAndInvestments: "",
      vehicles: "",
    },
    liabilities: {
      homeMortgage: "",
      investmentLoans: "",
      personalLoans: "",
      creditCardLimits: "",
      otherLiabilities: "",
    },
    expenses: {
      housingCosts: "",
      groceries: "",
      transport: "",
      education: "",
      lifestyleAndEntertainment: "",
    },
    superannuation: {
      fundName: "",
      memberNumber: "",
      estimatedBalance: "",
      employerContributionRate: "",
      personalContributions: "",
    },
    insurance: {
      lifeInsuranceSumInsured: "",
      lifeInsuranceProvider: "",
      incomeProtectionMonthlyBenefit: "",
      tpdCover: "",
      healthInsuranceProvider: "",
    },
    goalsAndObjectives: {
      primaryFinancialGoals: "",
      targetRetirementAge: "",
      desiredRetirementIncome: "",
      investmentRiskPreference: "",
      otherConsiderations: "",
    },
    completionPercentage: 70,
    missingSections: [],
  };
}

function build(overrides: Partial<{ [K in keyof SarahFactFind]: Partial<SarahFactFind[K]> }>): SarahFactFind {
  const base = blank();
  for (const [section, fields] of Object.entries(overrides) as [
    keyof SarahFactFind,
    Record<string, string | number | string[]>,
  ][]) {
    if (section === "completionPercentage" || section === "missingSections") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (base as any)[section] = fields;
      continue;
    }
    Object.assign(base[section] as Record<string, string>, fields);
  }
  return base;
}

export const DEMO_FACT_FINDS: Record<string, SarahFactFind> = {
  "sarah-mitchell": build({
    personalDetails: {
      fullName: "Sarah Jane Mitchell",
      dateOfBirth: "14 March 1987",
      address: "42 Hunter Street, Newcastle NSW 2300",
    },
    contactInformation: {
      mobile: "0412 345 678",
      email: "sarah.mitchell@email.com",
    },
    familyAndDependants: {
      relationshipStatus: "Single",
      numberOfDependants: "0",
    },
    employmentAndIncome: {
      employmentStatus: "Employed full time",
      employerName: "Hunter Valley Health Network",
      occupation: "Senior Nurse Practitioner",
      annualGrossIncome: "$118,000",
    },
    assets: {
      savingsAndCash: "$48,500",
      sharesAndInvestments: "$12,000",
    },
    superannuation: {
      fundName: "AustralianSuper",
      memberNumber: "AU-4421987",
      estimatedBalance: "$142,000",
    },
    goalsAndObjectives: {
      investmentRiskPreference: "Moderate",
    },
  }),

  "james-fiona-carr": build({
    personalDetails: {
      fullName: "James and Fiona Carr",
      dateOfBirth: "James: 8 Feb 1968, Fiona: 22 Sep 1970",
      address: "12 Bar Beach Avenue, Newcastle NSW 2300",
    },
    contactInformation: {
      mobile: "0419 222 314",
      email: "james.carr@email.com",
    },
    familyAndDependants: {
      relationshipStatus: "Married",
      partnerName: "Fiona Carr",
      numberOfDependants: "0",
    },
    employmentAndIncome: {
      employmentStatus: "Both employed full time",
      employerName: "BHP / Hunter New England Health",
      annualGrossIncome: "$145,000 combined",
    },
    assets: {
      ownerOccupiedPropertyValue: "$780,000",
      savingsAndCash: "$36,000",
      sharesAndInvestments: "$58,000",
    },
    liabilities: {
      homeMortgage: "$220,000",
    },
    superannuation: {
      fundName: "Hostplus / First State Super",
      estimatedBalance: "$380,000 combined",
    },
    goalsAndObjectives: {
      investmentRiskPreference: "Growth",
    },
  }),

  "tony-nguyen": build({
    personalDetails: {
      fullName: "Tony Minh Nguyen",
      dateOfBirth: "22 September 1983",
      address: "18 Merewether Drive, Newcastle NSW 2291",
    },
    contactInformation: {
      mobile: "0438 901 322",
      email: "tony.nguyen@email.com",
    },
    familyAndDependants: {
      relationshipStatus: "Married",
      numberOfDependants: "2",
      agesOfDependants: "6, 9",
    },
    employmentAndIncome: {
      employmentStatus: "Employed full time",
      employerName: "Newcastle City Council",
      occupation: "Civil Engineer",
      annualGrossIncome: "$95,000",
    },
    assets: {
      ownerOccupiedPropertyValue: "$640,000",
      savingsAndCash: "$22,000",
      sharesAndInvestments: "$30,000",
    },
    liabilities: {
      homeMortgage: "$350,000",
    },
    superannuation: {
      fundName: "REST Super",
      estimatedBalance: "$87,000",
    },
    goalsAndObjectives: {
      investmentRiskPreference: "Moderate",
    },
  }),

  "david-okafor": build({
    personalDetails: {
      fullName: "David Okafor",
      dateOfBirth: "11 May 1974",
      address: "22 Kookaburra Close, Warners Bay NSW 2282",
    },
    contactInformation: {
      mobile: "0409 890 123",
      email: "d.okafor@email.com",
    },
    familyAndDependants: {
      relationshipStatus: "Married",
      numberOfDependants: "2",
    },
    employmentAndIncome: {
      employmentStatus: "Business owner",
      employerName: "Okafor Mechanical Services Pty Ltd",
      annualGrossIncome: "$130,000",
    },
    superannuation: {
      fundName: "REST Super",
      estimatedBalance: "$210,000",
    },
    goalsAndObjectives: {
      investmentRiskPreference: "Moderate",
    },
  }),

  "priya-sharma": build({
    personalDetails: {
      fullName: "Priya Sharma",
      dateOfBirth: "3 June 1991",
      address: "8 Wallaby Court, Charlestown NSW 2290",
    },
    contactInformation: {
      mobile: "0451 332 778",
      email: "priya.sharma@email.com",
    },
    familyAndDependants: {
      relationshipStatus: "Single",
      numberOfDependants: "0",
    },
    employmentAndIncome: {
      employmentStatus: "Employed full time",
      annualGrossIncome: "$88,000",
    },
    assets: {
      savingsAndCash: "$62,000",
    },
    superannuation: {
      fundName: "AustralianSuper",
      estimatedBalance: "$54,000",
    },
    goalsAndObjectives: {
      investmentRiskPreference: "Growth",
    },
  }),

  "robert-sue-tanner": build({
    personalDetails: {
      fullName: "Robert and Sue Tanner",
      dateOfBirth: "Robert: 4 April 1961, Sue: 30 Nov 1963",
      address: "5 Pacific Drive, Bar Beach NSW 2300",
    },
    contactInformation: {
      mobile: "0418 220 991",
      email: "r.tanner@email.com",
    },
    familyAndDependants: {
      relationshipStatus: "Married",
      partnerName: "Sue Tanner",
      numberOfDependants: "0",
    },
    employmentAndIncome: {
      employmentStatus: "Semi retired",
      annualGrossIncome: "$60,000 combined",
    },
    assets: {
      ownerOccupiedPropertyValue: "$1,100,000",
      investmentPropertyValue: "$650,000",
      savingsAndCash: "$85,000",
    },
    superannuation: {
      fundName: "AustralianSuper / Hostplus",
      estimatedBalance: "$520,000 combined",
    },
    goalsAndObjectives: {
      investmentRiskPreference: "Conservative",
    },
  }),

  "helen-davies": build({
    personalDetails: {
      fullName: "Helen Davies",
      dateOfBirth: "17 January 1953",
      address: "31 Ridgeway Road, Mount Hutton NSW 2290",
    },
    contactInformation: {
      mobile: "0407 554 992",
      email: "helen.davies@email.com",
    },
    familyAndDependants: {
      relationshipStatus: "Widowed",
      numberOfDependants: "3",
      agesOfDependants: "42, 39, 36 (adult)",
    },
    employmentAndIncome: {
      employmentStatus: "Retired",
      annualGrossIncome: "$0",
    },
    assets: {
      ownerOccupiedPropertyValue: "$540,000",
      savingsAndCash: "$92,000",
      sharesAndInvestments: "$48,000",
    },
    superannuation: {
      fundName: "AustralianSuper",
      estimatedBalance: "$0",
    },
    goalsAndObjectives: {
      primaryFinancialGoals:
        "Review estate planning, no current will or beneficiary nominations in place.",
      investmentRiskPreference: "Conservative",
    },
  }),
};

export function getDemoFactFind(clientId: string): SarahFactFind | undefined {
  return DEMO_FACT_FINDS[clientId];
}
