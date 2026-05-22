// Sample collected fact-find data per client and section.
// In production this would come from a database; here it drives the review screen.

export type FieldAnswers = Record<string, string>;       // fieldId → value
export type ClientAnswers = Record<string, FieldAnswers>; // sectionId → fields

const SARAH: ClientAnswers = {
  "personal-details": {
    "full-name": "Sarah Jane Mitchell",
    "dob": "14 March 1987",
    "address": "42 Hunter Street, Newcastle NSW 2300",
    "years-at-address": "2–5 years",
    "country-of-birth": "Australia",
  },
  "contact-information": {
    "mobile": "0412 345 678",
    "home-phone": "—",
    "email": "sarah.mitchell@email.com",
    "preferred-contact": "Email",
    "best-time": "Morning (8am–12pm)",
  },
  "family-dependants": {
    "relationship-status": "Single",
    "partner-name": "—",
    "num-dependants": "0",
    "dependant-ages": "—",
  },
  "employment-income": {
    "employment-status": "Employed — full time",
    "employer-name": "Hunter Valley Health Network",
    "occupation": "Senior Nurse Practitioner",
    "gross-income": "$118,000",
    "other-income": "Casual shifts — approx. $8,000/yr",
  },
  "assets": {
    "home-value": "—",
    "investment-property-value": "—",
    "savings-cash": "$48,500",
    "shares-investments": "$12,000",
    "vehicles": "$22,000",
  },
  "liabilities": {
    "home-loan": "—",
    "investment-loan": "—",
    "personal-loans": "—",
    "credit-cards": "$8,000",
    "other-debts": "—",
  },
  "expenses": {
    "housing-costs": "$2,100",
    "groceries-household": "$650",
    "transport": "$380",
    "education": "—",
    "lifestyle": "$800",
  },
  "superannuation": {
    "super-fund": "AustralianSuper",
    "super-member-number": "AU-4421987",
    "super-balance": "$142,000",
    "employer-sg": "11%",
    "personal-contributions": "—",
  },
  // In-progress sections — partial data
  "insurance": {
    "health-insurance": "Medibank",
  },
  "goals-objectives": {
    "main-goals": "Purchase a home in Newcastle within 3–4 years. Build investment portfolio. Review insurance cover — concerned I'm underinsured.",
    "retirement-age": "62",
  },
};

const TONY: ClientAnswers = {
  "personal-details": {
    "full-name": "Tony Minh Nguyen",
    "dob": "22 September 1971",
    "address": "18 Merewether Drive, Newcastle NSW 2291",
    "years-at-address": "10+ years",
    "country-of-birth": "Australia",
  },
  "contact-information": {
    "mobile": "0401 234 567",
    "home-phone": "02 4921 5500",
    "email": "tony.nguyen@email.com",
    "preferred-contact": "Mobile",
    "best-time": "Morning (8am–12pm)",
  },
  "family-dependants": {
    "relationship-status": "Married",
    "partner-name": "Linh Nguyen",
    "partner-dob": "8 January 1974",
    "num-dependants": "2",
    "dependant-ages": "19, 22",
  },
  "employment-income": {
    "employment-status": "Self-employed",
    "employer-name": "Nguyen Building Group Pty Ltd",
    "occupation": "Director / Builder",
    "gross-income": "$285,000",
    "other-income": "Rental income: $36,000/yr (investment property, Hamilton)",
  },
  "assets": {
    "home-value": "$1,450,000",
    "investment-property-value": "$820,000",
    "savings-cash": "$185,000",
    "shares-investments": "$94,000",
    "vehicles": "$65,000",
  },
  "liabilities": {
    "home-loan": "$420,000",
    "investment-loan": "$310,000",
    "personal-loans": "—",
    "credit-cards": "$15,000",
    "other-debts": "—",
  },
  "expenses": {
    "housing-costs": "$3,200",
    "groceries-household": "$1,200",
    "transport": "$800",
    "education": "—",
    "lifestyle": "$2,500",
  },
  "superannuation": {
    "super-fund": "SMSF — Nguyen Family Super Fund",
    "super-member-number": "SMSF-TN-123456",
    "super-balance": "$1,240,000",
    "employer-sg": "N/A — self-employed",
    "personal-contributions": "$27,500",
  },
  "insurance": {
    "life-cover": "$2,000,000",
    "life-provider": "AIA",
    "income-protection": "$18,500",
    "tpd-cover": "$1,000,000",
    "health-insurance": "Bupa Gold",
  },
  "goals-objectives": {
    "main-goals": "Transition to retirement at 60. Maximise SMSF over the next 5 years. Investigate TTR strategy. Sell investment property in 5–7 years and redeploy capital.",
    "retirement-age": "60",
    "retirement-income": "$120,000",
    "risk-tolerance": "Moderate — I want a balance of growth and stability",
    "other-notes": "Considering selling the business within 10 years. Want to understand CGT implications now.",
  },
};

const JAMES: ClientAnswers = {
  "personal-details": {
    "full-name": "James William Carr & Fiona Marie Carr",
    "dob": "James: 3 June 1979 / Fiona: 14 November 1981",
    "address": "7 Beaumont Street, Hamilton NSW 2303",
    "years-at-address": "5–10 years",
    "country-of-birth": "Australia",
  },
  "contact-information": {
    "mobile": "0423 567 890",
    "email": "james.carr@email.com",
    "preferred-contact": "Mobile",
    "best-time": "Afternoon (12pm–5pm)",
  },
  "employment-income": {
    "employment-status": "Employed — full time",
    "employer-name": "Hunter Water Corporation",
    "occupation": "Senior Project Engineer",
    "gross-income": "$162,000",
    "other-income": "Investment property rental: $28,000/yr",
  },
  "assets": {
    "home-value": "$1,150,000",
    "investment-property-value": "$680,000",
    "savings-cash": "$95,000",
  },
};

const DAVID: ClientAnswers = {
  "personal-details": {
    "full-name": "David Chukwuemeka Okafor",
    "dob": "17 August 1978",
    "address": "22 Kookaburra Close, Warners Bay NSW 2282",
    "years-at-address": "2–5 years",
    "country-of-birth": "Nigeria",
  },
  "contact-information": {
    "mobile": "0409 890 123",
    "email": "d.okafor@email.com",
    "preferred-contact": "Email",
    "best-time": "Evening (5pm–8pm)",
  },
  "employment-income": {
    "employment-status": "Business owner",
    "employer-name": "Okafor Mechanical Services Pty Ltd",
    "occupation": "Director",
    "gross-income": "$220,000",
    "other-income": "Trust distributions: $45,000/yr (estimate)",
  },
  "expenses": {
    "housing-costs": "$2,800",
    "groceries-household": "$900",
    "transport": "$650",
    "lifestyle": "$1,200",
  },
  "superannuation": {
    "super-fund": "REST Super",
    "super-balance": "$285,000",
    "employer-sg": "11%",
  },
};

const CLIENT_ANSWERS: Record<string, ClientAnswers> = {
  "sarah-mitchell": SARAH,
  "tony-nguyen": TONY,
  "james-fiona-carr": JAMES,
  "david-okafor": DAVID,
};

export function getClientAnswers(clientId: string): ClientAnswers {
  return CLIENT_ANSWERS[clientId] ?? {};
}
