export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "radio"
  | "textarea"
  | "date"
  | "currency";

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
  prefix?: string;
  optional?: boolean;
}

export interface FactFindSection {
  id: string;
  title: string;
  sarahIntro: string;
  fields: Field[];
}

export const FACT_FIND_SECTIONS: FactFindSection[] = [
  {
    id: "personal-details",
    title: "Personal Details",
    sarahIntro:
      "Let's start with the basics — your personal details. This helps us confirm your identity and ensures your financial plan is built specifically for you from the very beginning.",
    fields: [
      {
        id: "full-name",
        label: "Full legal name",
        type: "text",
        placeholder: "As it appears on official documents",
        required: true,
      },
      {
        id: "dob",
        label: "Date of birth",
        type: "date",
        required: true,
      },
      {
        id: "address",
        label: "Current residential address",
        type: "text",
        placeholder: "Street, suburb, state, postcode",
        required: true,
      },
      {
        id: "years-at-address",
        label: "How long have you lived at this address?",
        type: "select",
        options: [
          "Less than 1 year",
          "1–2 years",
          "2–5 years",
          "5–10 years",
          "10+ years",
        ],
        required: true,
      },
      {
        id: "country-of-birth",
        label: "Country of birth",
        type: "text",
        placeholder: "e.g. Australia",
        required: true,
      },
    ],
  },
  {
    id: "contact-information",
    title: "Contact Information",
    sarahIntro:
      "Next, your contact details. This ensures Brad and the BMK team can reach you easily — and that your plan and any important updates are always sent to the right place.",
    fields: [
      {
        id: "mobile",
        label: "Mobile number",
        type: "tel",
        placeholder: "04XX XXX XXX",
        required: true,
      },
      {
        id: "home-phone",
        label: "Home phone",
        type: "tel",
        placeholder: "Optional",
        optional: true,
      },
      {
        id: "email",
        label: "Email address",
        type: "email",
        placeholder: "your@email.com",
        required: true,
      },
      {
        id: "preferred-contact",
        label: "Preferred contact method",
        type: "select",
        options: ["Mobile", "Email", "Home phone"],
        required: true,
      },
      {
        id: "best-time",
        label: "Best time to contact you",
        type: "select",
        options: ["Morning (8am–12pm)", "Afternoon (12pm–5pm)", "Evening (5pm–8pm)", "Any time"],
        required: true,
      },
    ],
  },
  {
    id: "family-dependants",
    title: "Family & Dependants",
    sarahIntro:
      "Understanding your family situation shapes how we approach protection, estate planning, and your long-term financial goals. Take your time with this section.",
    fields: [
      {
        id: "relationship-status",
        label: "Relationship status",
        type: "select",
        options: ["Single", "Married", "De facto", "Separated", "Divorced", "Widowed"],
        required: true,
      },
      {
        id: "partner-name",
        label: "Partner's full name",
        type: "text",
        placeholder: "If applicable",
        optional: true,
      },
      {
        id: "partner-dob",
        label: "Partner's date of birth",
        type: "date",
        optional: true,
      },
      {
        id: "num-dependants",
        label: "Number of financial dependants",
        type: "number",
        placeholder: "0",
        required: true,
        hint: "Include children and any other dependants you financially support",
      },
      {
        id: "dependant-ages",
        label: "Ages of dependants",
        type: "text",
        placeholder: "e.g. 8, 12, 15",
        optional: true,
        hint: "Separate multiple ages with a comma",
      },
    ],
  },
  {
    id: "employment-income",
    title: "Employment & Income",
    sarahIntro:
      "Your income is central to understanding what's achievable in your financial plan. Don't worry about being exact — we can refine the details together.",
    fields: [
      {
        id: "employment-status",
        label: "Employment status",
        type: "select",
        options: [
          "Employed — full time",
          "Employed — part time",
          "Self-employed",
          "Business owner",
          "Contract / casual",
          "Retired",
          "Not currently working",
        ],
        required: true,
      },
      {
        id: "employer-name",
        label: "Employer / business name",
        type: "text",
        placeholder: "e.g. Acme Corporation",
        optional: true,
      },
      {
        id: "occupation",
        label: "Occupation / role",
        type: "text",
        placeholder: "e.g. Senior Project Manager",
        required: true,
      },
      {
        id: "gross-income",
        label: "Annual gross income",
        type: "currency",
        placeholder: "0",
        prefix: "$",
        required: true,
        hint: "Before tax, including salary and regular bonuses",
      },
      {
        id: "other-income",
        label: "Other income sources",
        type: "textarea",
        placeholder: "e.g. rental income $24,000/yr, dividends $3,200/yr",
        optional: true,
        hint: "Include rental income, investments, side businesses, etc.",
      },
    ],
  },
  {
    id: "assets",
    title: "Assets",
    sarahIntro:
      "Let's map out what you own. Estimates are perfectly fine here — we're building a picture of your overall position, not an audit. We can refine these figures together.",
    fields: [
      {
        id: "home-value",
        label: "Owner-occupied property value",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
        hint: "Approximate current market value",
      },
      {
        id: "investment-property-value",
        label: "Investment property value",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "savings-cash",
        label: "Total savings & cash (bank accounts)",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        required: true,
      },
      {
        id: "shares-investments",
        label: "Shares & managed investments",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "vehicles",
        label: "Vehicles (approximate value)",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
    ],
  },
  {
    id: "liabilities",
    title: "Liabilities",
    sarahIntro:
      "Now the other side of the ledger — what you owe. Understanding your liabilities alongside your assets gives us a clear picture of your net position and helps us build the right strategy.",
    fields: [
      {
        id: "home-loan",
        label: "Home mortgage — outstanding balance",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "investment-loan",
        label: "Investment property loan/s",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "personal-loans",
        label: "Personal loans",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "credit-cards",
        label: "Credit card limits (total)",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "other-debts",
        label: "Other liabilities",
        type: "textarea",
        placeholder: "Describe any other debts, HECS/HELP, buy-now-pay-later, etc.",
        optional: true,
      },
    ],
  },
  {
    id: "expenses",
    title: "Expenses",
    sarahIntro:
      "A clear picture of your regular expenses helps us understand your lifestyle and identify realistic opportunities within your plan — without suggesting changes that don't fit how you live.",
    fields: [
      {
        id: "housing-costs",
        label: "Monthly housing costs (mortgage or rent)",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        required: true,
      },
      {
        id: "groceries-household",
        label: "Monthly groceries & household",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        required: true,
      },
      {
        id: "transport",
        label: "Monthly transport costs",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        required: true,
        hint: "Include fuel, registration, public transport, parking",
      },
      {
        id: "education",
        label: "Monthly education costs",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
        hint: "School fees, tuition, childcare, etc.",
      },
      {
        id: "lifestyle",
        label: "Monthly lifestyle & entertainment",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        required: true,
        hint: "Dining, subscriptions, travel, sports, hobbies",
      },
    ],
  },
  {
    id: "superannuation",
    title: "Superannuation",
    sarahIntro:
      "Superannuation is often one of the most valuable assets Australians hold — and also one of the most overlooked. Let's make sure we have your super details captured accurately so nothing is left on the table.",
    fields: [
      {
        id: "super-fund",
        label: "Superannuation fund name",
        type: "text",
        placeholder: "e.g. AustralianSuper, Hostplus, REST",
        required: true,
      },
      {
        id: "super-member-number",
        label: "Member number",
        type: "text",
        placeholder: "Found on your super statement",
        optional: true,
      },
      {
        id: "super-balance",
        label: "Estimated current balance",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        required: true,
      },
      {
        id: "employer-sg",
        label: "Employer contribution rate",
        type: "text",
        placeholder: "e.g. 11%",
        required: true,
        hint: "Standard SG is currently 11%. Check your payslip if unsure.",
      },
      {
        id: "personal-contributions",
        label: "Personal contributions (per year)",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
        hint: "Any additional voluntary contributions you make",
      },
    ],
  },
  {
    id: "insurance",
    title: "Insurance",
    sarahIntro:
      "Your existing insurance tells us what protection you already have — and helps us identify any gaps in your cover. Even rough figures are helpful here.",
    fields: [
      {
        id: "life-cover",
        label: "Life insurance — sum insured",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "life-provider",
        label: "Life insurance — provider",
        type: "text",
        placeholder: "e.g. TAL, MLC, AIA",
        optional: true,
      },
      {
        id: "income-protection",
        label: "Income protection — monthly benefit",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "tpd-cover",
        label: "Total & permanent disability (TPD) cover",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        optional: true,
      },
      {
        id: "health-insurance",
        label: "Health insurance provider",
        type: "text",
        placeholder: "e.g. Medibank, Bupa, HCF",
        optional: true,
      },
    ],
  },
  {
    id: "goals-objectives",
    title: "Goals & Objectives",
    sarahIntro:
      "This is the heart of your financial plan. Take a moment to think about what truly matters to you — short, medium, and long term. Your answers here shape everything that follows. There are no wrong answers.",
    fields: [
      {
        id: "main-goals",
        label: "What are your primary financial goals?",
        type: "textarea",
        placeholder:
          "e.g. Pay off the mortgage in 10 years, build an investment portfolio, fund children's education, retire comfortably…",
        required: true,
        hint: "Be as specific or general as you like — we'll explore this together",
      },
      {
        id: "retirement-age",
        label: "Target retirement age",
        type: "number",
        placeholder: "e.g. 65",
        required: true,
      },
      {
        id: "retirement-income",
        label: "Desired annual income in retirement",
        type: "currency",
        prefix: "$",
        placeholder: "0",
        required: true,
        hint: "In today's dollars — don't worry about inflation, we'll account for that",
      },
      {
        id: "risk-tolerance",
        label: "Investment risk preference",
        type: "select",
        options: [
          "Conservative — I prioritise stability over growth",
          "Moderate — I want a balance of growth and stability",
          "Growth — I'm comfortable with some volatility for better returns",
          "Aggressive — I want maximum long-term growth",
        ],
        required: true,
      },
      {
        id: "other-notes",
        label: "Any other important considerations?",
        type: "textarea",
        placeholder:
          "e.g. upcoming life events, inheritance, business sale, health considerations, specific concerns…",
        optional: true,
      },
    ],
  },
];
