// Sarah's structured fact-find output schema and helpers to map it onto the
// existing FACT_FIND_SECTIONS field IDs used by the review screen.

export interface SarahFactFind {
  personalDetails: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    timeAtAddress: string;
    countryOfBirth: string;
  };
  contactInformation: {
    mobile: string;
    homePhone: string;
    email: string;
    preferredContact: string;
    bestTimeToContact: string;
  };
  familyAndDependants: {
    relationshipStatus: string;
    partnerName: string;
    partnerDOB: string;
    numberOfDependants: string;
    agesOfDependants: string;
  };
  employmentAndIncome: {
    employmentStatus: string;
    employerName: string;
    occupation: string;
    annualGrossIncome: string;
    otherIncomeSources: string;
  };
  assets: {
    ownerOccupiedPropertyValue: string;
    investmentPropertyValue: string;
    savingsAndCash: string;
    sharesAndInvestments: string;
    vehicles: string;
  };
  liabilities: {
    homeMortgage: string;
    investmentLoans: string;
    personalLoans: string;
    creditCardLimits: string;
    otherLiabilities: string;
  };
  expenses: {
    housingCosts: string;
    groceries: string;
    transport: string;
    education: string;
    lifestyleAndEntertainment: string;
  };
  superannuation: {
    fundName: string;
    memberNumber: string;
    estimatedBalance: string;
    employerContributionRate: string;
    personalContributions: string;
  };
  insurance: {
    lifeInsuranceSumInsured: string;
    lifeInsuranceProvider: string;
    incomeProtectionMonthlyBenefit: string;
    tpdCover: string;
    healthInsuranceProvider: string;
  };
  goalsAndObjectives: {
    primaryFinancialGoals: string;
    targetRetirementAge: string;
    desiredRetirementIncome: string;
    investmentRiskPreference: string;
    otherConsiderations: string;
  };
  completionPercentage: number;
  missingSections: string[];
}

// Maps Sarah's section + field → existing review-page section + field IDs.
export const SARAH_TO_REVIEW: Record<string, { section: string; field: string }> = {
  "personalDetails.fullName": { section: "personal-details", field: "full-name" },
  "personalDetails.dateOfBirth": { section: "personal-details", field: "dob" },
  "personalDetails.address": { section: "personal-details", field: "address" },
  "personalDetails.timeAtAddress": { section: "personal-details", field: "years-at-address" },
  "personalDetails.countryOfBirth": { section: "personal-details", field: "country-of-birth" },

  "contactInformation.mobile": { section: "contact-information", field: "mobile" },
  "contactInformation.homePhone": { section: "contact-information", field: "home-phone" },
  "contactInformation.email": { section: "contact-information", field: "email" },
  "contactInformation.preferredContact": { section: "contact-information", field: "preferred-contact" },
  "contactInformation.bestTimeToContact": { section: "contact-information", field: "best-time" },

  "familyAndDependants.relationshipStatus": { section: "family-dependants", field: "relationship-status" },
  "familyAndDependants.partnerName": { section: "family-dependants", field: "partner-name" },
  "familyAndDependants.partnerDOB": { section: "family-dependants", field: "partner-dob" },
  "familyAndDependants.numberOfDependants": { section: "family-dependants", field: "num-dependants" },
  "familyAndDependants.agesOfDependants": { section: "family-dependants", field: "dependant-ages" },

  "employmentAndIncome.employmentStatus": { section: "employment-income", field: "employment-status" },
  "employmentAndIncome.employerName": { section: "employment-income", field: "employer-name" },
  "employmentAndIncome.occupation": { section: "employment-income", field: "occupation" },
  "employmentAndIncome.annualGrossIncome": { section: "employment-income", field: "gross-income" },
  "employmentAndIncome.otherIncomeSources": { section: "employment-income", field: "other-income" },

  "assets.ownerOccupiedPropertyValue": { section: "assets", field: "home-value" },
  "assets.investmentPropertyValue": { section: "assets", field: "investment-property-value" },
  "assets.savingsAndCash": { section: "assets", field: "savings-cash" },
  "assets.sharesAndInvestments": { section: "assets", field: "shares-investments" },
  "assets.vehicles": { section: "assets", field: "vehicles" },

  "liabilities.homeMortgage": { section: "liabilities", field: "home-loan" },
  "liabilities.investmentLoans": { section: "liabilities", field: "investment-loan" },
  "liabilities.personalLoans": { section: "liabilities", field: "personal-loans" },
  "liabilities.creditCardLimits": { section: "liabilities", field: "credit-cards" },
  "liabilities.otherLiabilities": { section: "liabilities", field: "other-debts" },

  "expenses.housingCosts": { section: "expenses", field: "housing-costs" },
  "expenses.groceries": { section: "expenses", field: "groceries-household" },
  "expenses.transport": { section: "expenses", field: "transport" },
  "expenses.education": { section: "expenses", field: "education" },
  "expenses.lifestyleAndEntertainment": { section: "expenses", field: "lifestyle" },

  "superannuation.fundName": { section: "superannuation", field: "super-fund" },
  "superannuation.memberNumber": { section: "superannuation", field: "super-member-number" },
  "superannuation.estimatedBalance": { section: "superannuation", field: "super-balance" },
  "superannuation.employerContributionRate": { section: "superannuation", field: "employer-sg" },
  "superannuation.personalContributions": { section: "superannuation", field: "personal-contributions" },

  "insurance.lifeInsuranceSumInsured": { section: "insurance", field: "life-cover" },
  "insurance.lifeInsuranceProvider": { section: "insurance", field: "life-provider" },
  "insurance.incomeProtectionMonthlyBenefit": { section: "insurance", field: "income-protection" },
  "insurance.tpdCover": { section: "insurance", field: "tpd-cover" },
  "insurance.healthInsuranceProvider": { section: "insurance", field: "health-insurance" },

  "goalsAndObjectives.primaryFinancialGoals": { section: "goals-objectives", field: "main-goals" },
  "goalsAndObjectives.targetRetirementAge": { section: "goals-objectives", field: "retirement-age" },
  "goalsAndObjectives.desiredRetirementIncome": { section: "goals-objectives", field: "retirement-income" },
  "goalsAndObjectives.investmentRiskPreference": { section: "goals-objectives", field: "risk-tolerance" },
  "goalsAndObjectives.otherConsiderations": { section: "goals-objectives", field: "other-notes" },
};

export type ReviewAnswers = Record<string, Record<string, string>>;

export function sarahToReviewAnswers(data: SarahFactFind): ReviewAnswers {
  const out: ReviewAnswers = {};
  for (const [key, target] of Object.entries(SARAH_TO_REVIEW)) {
    const [sec, field] = key.split(".") as [keyof SarahFactFind, string];
    const sectionData = data[sec] as Record<string, string> | undefined;
    const value = sectionData?.[field] ?? "";
    if (!out[target.section]) out[target.section] = {};
    out[target.section][target.field] = value;
  }
  return out;
}

// Fills in any missing sections so partial fact finds (an interrupted
// Sarah session, a minimal API payload) never crash consumers that read
// section fields directly.
export function normalizeFactFind(partial: Partial<SarahFactFind>): SarahFactFind {
  return {
    personalDetails: {
      fullName: "", dateOfBirth: "", address: "", timeAtAddress: "", countryOfBirth: "",
      ...partial.personalDetails,
    },
    contactInformation: {
      mobile: "", homePhone: "", email: "", preferredContact: "", bestTimeToContact: "",
      ...partial.contactInformation,
    },
    familyAndDependants: {
      relationshipStatus: "", partnerName: "", partnerDOB: "", numberOfDependants: "", agesOfDependants: "",
      ...partial.familyAndDependants,
    },
    employmentAndIncome: {
      employmentStatus: "", employerName: "", occupation: "", annualGrossIncome: "", otherIncomeSources: "",
      ...partial.employmentAndIncome,
    },
    assets: {
      ownerOccupiedPropertyValue: "", investmentPropertyValue: "", savingsAndCash: "", sharesAndInvestments: "", vehicles: "",
      ...partial.assets,
    },
    liabilities: {
      homeMortgage: "", investmentLoans: "", personalLoans: "", creditCardLimits: "", otherLiabilities: "",
      ...partial.liabilities,
    },
    expenses: {
      housingCosts: "", groceries: "", transport: "", education: "", lifestyleAndEntertainment: "",
      ...partial.expenses,
    },
    superannuation: {
      fundName: "", memberNumber: "", estimatedBalance: "", employerContributionRate: "", personalContributions: "",
      ...partial.superannuation,
    },
    insurance: {
      lifeInsuranceSumInsured: "", lifeInsuranceProvider: "", incomeProtectionMonthlyBenefit: "", tpdCover: "", healthInsuranceProvider: "",
      ...partial.insurance,
    },
    goalsAndObjectives: {
      primaryFinancialGoals: "", targetRetirementAge: "", desiredRetirementIncome: "", investmentRiskPreference: "", otherConsiderations: "",
      ...partial.goalsAndObjectives,
    },
    completionPercentage: partial.completionPercentage ?? 0,
    missingSections: partial.missingSections ?? [],
  };
}
