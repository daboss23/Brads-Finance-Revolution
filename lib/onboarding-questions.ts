export type QuestionType = "text" | "textarea" | "select";

export type Question = {
  id: string;
  section: string;
  sectionIndex: number;
  text: string;
  subtext?: string;
  placeholder: string;
  type: QuestionType;
  options?: string[];
  xp: number;
};

export type Section = {
  name: string;
  index: number;
  shortName: string;
  medalLabel: string;
  completionMessage: string;
  transitionMessage: string;
};

export const SECTIONS: Section[] = [
  {
    name: "Personal Details",
    index: 0,
    shortName: "Personal",
    medalLabel: "Foundation",
    completionMessage: "Personal details locked in. Excellent start.",
    transitionMessage: "Let's begin with some personal details so Brad can tailor everything to you.",
  },
  {
    name: "Income & Employment",
    index: 1,
    shortName: "Income",
    medalLabel: "Earnings",
    completionMessage: "Income profile complete. You're building real momentum.",
    transitionMessage: "Now let's look at your income — this shapes the heart of your financial plan.",
  },
  {
    name: "Assets & Liabilities",
    index: 2,
    shortName: "Assets",
    medalLabel: "Wealth",
    completionMessage: "Wealth picture captured. You're well past the halfway mark.",
    transitionMessage: "This section gives Brad a clear view of where you stand financially today.",
  },
  {
    name: "Expenses",
    index: 3,
    shortName: "Expenses",
    medalLabel: "Flow",
    completionMessage: "Expenses noted. The picture is becoming very clear now.",
    transitionMessage: "Understanding your expenses helps Brad identify real opportunities for you.",
  },
  {
    name: "Superannuation",
    index: 4,
    shortName: "Super",
    medalLabel: "Future",
    completionMessage: "Superannuation details captured. Nearly there.",
    transitionMessage: "Super is one of your most powerful financial tools. Let's make sure Brad has the full picture.",
  },
  {
    name: "Insurance",
    index: 5,
    shortName: "Insurance",
    medalLabel: "Protection",
    completionMessage: "Protection profile complete. One final section to go.",
    transitionMessage: "Your protection strategy is a vital piece of your financial plan.",
  },
  {
    name: "Goals & Objectives",
    index: 6,
    shortName: "Goals",
    medalLabel: "Vision",
    completionMessage: "Vision captured. Your Financial Discovery is complete.",
    transitionMessage: "Last and most important — your goals. This is what everything else works towards.",
  },
];

export const QUESTIONS: Question[] = [
  // Personal Details
  {
    id: "pd-1",
    section: "Personal Details",
    sectionIndex: 0,
    text: "What is your full legal name?",
    placeholder: "e.g. James William Carr",
    type: "text",
    xp: 50,
  },
  {
    id: "pd-2",
    section: "Personal Details",
    sectionIndex: 0,
    text: "What is your date of birth?",
    placeholder: "e.g. 15 March 1982",
    type: "text",
    xp: 50,
  },
  {
    id: "pd-3",
    section: "Personal Details",
    sectionIndex: 0,
    text: "What is your current residential address?",
    placeholder: "e.g. 42 Harbour Street, Newcastle NSW 2300",
    type: "text",
    xp: 50,
  },
  {
    id: "pd-4",
    section: "Personal Details",
    sectionIndex: 0,
    text: "What is your relationship status?",
    placeholder: "",
    type: "select",
    options: ["Single", "Partnered / De facto", "Married", "Separated", "Widowed"],
    xp: 50,
  },
  {
    id: "pd-5",
    section: "Personal Details",
    sectionIndex: 0,
    text: "Do you have any dependants? If so, how many and what are their ages?",
    subtext: "Include children or anyone financially dependent on you.",
    placeholder: "e.g. Two children — aged 8 and 11",
    type: "textarea",
    xp: 50,
  },

  // Income & Employment
  {
    id: "ie-1",
    section: "Income & Employment",
    sectionIndex: 1,
    text: "What is your current employment status?",
    placeholder: "",
    type: "select",
    options: [
      "Full-time employed",
      "Part-time employed",
      "Self-employed",
      "Business owner",
      "Contractor",
      "Retired",
      "Not currently employed",
    ],
    xp: 50,
  },
  {
    id: "ie-2",
    section: "Income & Employment",
    sectionIndex: 1,
    text: "What is your employer's name, or the name of your business?",
    placeholder: "e.g. Newcastle Building Co. or Self-employed — Consulting",
    type: "text",
    xp: 50,
  },
  {
    id: "ie-3",
    section: "Income & Employment",
    sectionIndex: 1,
    text: "What is your annual income before tax?",
    subtext: "Include base salary, bonuses, or business drawings.",
    placeholder: "e.g. $95,000",
    type: "text",
    xp: 50,
  },
  {
    id: "ie-4",
    section: "Income & Employment",
    sectionIndex: 1,
    text: "Do you receive any other sources of income?",
    subtext: "e.g. rental income, dividends, government payments, trust distributions.",
    placeholder: "e.g. Rental income $1,500/month from investment property",
    type: "textarea",
    xp: 50,
  },

  // Assets & Liabilities
  {
    id: "al-1",
    section: "Assets & Liabilities",
    sectionIndex: 2,
    text: "Do you own your home? If so, what is its approximate value?",
    placeholder: "e.g. Yes — estimated $850,000 in Merewether",
    type: "textarea",
    xp: 50,
  },
  {
    id: "al-2",
    section: "Assets & Liabilities",
    sectionIndex: 2,
    text: "Do you own any investment properties or other real estate?",
    placeholder: "e.g. One investment property in Hamilton — approx. $620,000",
    type: "textarea",
    xp: 50,
  },
  {
    id: "al-3",
    section: "Assets & Liabilities",
    sectionIndex: 2,
    text: "What savings, shares, or investment accounts do you hold?",
    subtext: "Include bank savings, managed funds, ETFs, shares.",
    placeholder: "e.g. $45,000 in savings, $30,000 in ASX shares",
    type: "textarea",
    xp: 50,
  },
  {
    id: "al-4",
    section: "Assets & Liabilities",
    sectionIndex: 2,
    text: "What outstanding loans or debts do you currently have?",
    subtext: "Include home loan, car loan, personal loans, credit cards.",
    placeholder: "e.g. Home loan $480,000 remaining, car loan $18,000",
    type: "textarea",
    xp: 50,
  },

  // Expenses
  {
    id: "ex-1",
    section: "Expenses",
    sectionIndex: 3,
    text: "What are your approximate monthly living expenses?",
    subtext: "Include food, utilities, transport, and general lifestyle costs.",
    placeholder: "e.g. Approximately $4,500 per month",
    type: "text",
    xp: 50,
  },
  {
    id: "ex-2",
    section: "Expenses",
    sectionIndex: 3,
    text: "Do you have any regular financial commitments or subscriptions?",
    subtext: "e.g. private school fees, gym, memberships, insurances.",
    placeholder: "e.g. School fees $1,200/term, gym $80/month",
    type: "textarea",
    xp: 50,
  },
  {
    id: "ex-3",
    section: "Expenses",
    sectionIndex: 3,
    text: "How would you describe your approach to day-to-day spending?",
    placeholder: "",
    type: "select",
    options: ["I follow a strict budget", "I have a loose budget", "No formal budget", "Just managing as I go"],
    xp: 50,
  },

  // Superannuation
  {
    id: "su-1",
    section: "Superannuation",
    sectionIndex: 4,
    text: "What super fund are you currently with?",
    placeholder: "e.g. Australian Super, Hostplus, Rest",
    type: "text",
    xp: 50,
  },
  {
    id: "su-2",
    section: "Superannuation",
    sectionIndex: 4,
    text: "What is your approximate current super balance?",
    placeholder: "e.g. Around $180,000",
    type: "text",
    xp: 50,
  },
  {
    id: "su-3",
    section: "Superannuation",
    sectionIndex: 4,
    text: "Do you have multiple super funds, or any old funds from previous employers?",
    placeholder: "e.g. I may have an old fund from a job in 2015",
    type: "textarea",
    xp: 50,
  },
  {
    id: "su-4",
    section: "Superannuation",
    sectionIndex: 4,
    text: "Are you making any additional voluntary contributions to super?",
    placeholder: "",
    type: "select",
    options: [
      "Yes — salary sacrifice",
      "Yes — personal contributions",
      "Employer contributions only",
      "Not sure",
    ],
    xp: 50,
  },

  // Insurance
  {
    id: "in-1",
    section: "Insurance",
    sectionIndex: 5,
    text: "Do you currently have life insurance? If so, what level of cover?",
    placeholder: "e.g. Yes — $500,000 through my super fund",
    type: "textarea",
    xp: 50,
  },
  {
    id: "in-2",
    section: "Insurance",
    sectionIndex: 5,
    text: "Do you have income protection insurance?",
    placeholder: "",
    type: "select",
    options: ["Yes — through super", "Yes — standalone policy", "No", "Not sure"],
    xp: 50,
  },
  {
    id: "in-3",
    section: "Insurance",
    sectionIndex: 5,
    text: "Do you have private health insurance?",
    placeholder: "",
    type: "select",
    options: ["Yes — hospital and extras", "Yes — hospital only", "No — Medicare only", "Not sure"],
    xp: 50,
  },

  // Goals & Objectives
  {
    id: "go-1",
    section: "Goals & Objectives",
    sectionIndex: 6,
    text: "What are your most important financial goals for the next 1–3 years?",
    subtext: "Be as specific as you like. There are no wrong answers here.",
    placeholder: "e.g. Purchase a home, pay down debt, start investing",
    type: "textarea",
    xp: 75,
  },
  {
    id: "go-2",
    section: "Goals & Objectives",
    sectionIndex: 6,
    text: "Where would you like to be financially in 10 years?",
    placeholder: "e.g. Mortgage free, semi-retired, financially independent",
    type: "textarea",
    xp: 75,
  },
  {
    id: "go-3",
    section: "Goals & Objectives",
    sectionIndex: 6,
    text: "Is there anything specific you'd like Brad to focus on, or any concerns you'd like to raise?",
    subtext: "This is your chance to flag anything important before your planning meeting.",
    placeholder: "e.g. I want to retire at 60. I'm concerned about income protection.",
    type: "textarea",
    xp: 75,
  },
];

export const SECTION_XP_BONUS = 150;
export const TOTAL_XP = QUESTIONS.reduce((sum, q) => sum + q.xp, 0) + SECTIONS.length * SECTION_XP_BONUS;
