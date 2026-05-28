// Brad's voice, methodology and reasoning framework. This is the prompt
// substrate the SOA generator uses to make Claude write like Brad rather
// than like a generic SOA template.

import type { StrategyKey } from "../forms";

// ── Voice profile ───────────────────────────────────────────────────────────

export interface VoiceProfile {
  rules: string[];
  doExamples: string[];
  dontExamples: string[];
}

export const BRAD_VOICE: VoiceProfile = {
  rules: [
    "Write in plain conversational Australian English.",
    "Explain complex concepts simply, never use jargon without unpacking it.",
    "Always connect every recommendation back to something the client said.",
    "Use short paragraphs of two to four sentences and clear section headings.",
    "Write in the active voice, never the passive voice.",
    "Always explain the why behind every recommendation.",
    "Acknowledge client concerns directly before addressing them.",
    "Speak to the client as a partner not as a regulator.",
    "Use the client's own words and goals where possible.",
    "Use dollar figures and concrete numbers over percentages where helpful.",
  ],
  doExamples: [
    "Sarah, you told us that buying your first home in the next three to four years matters most. Here is how we get you there.",
    "Right now your super is with AustralianSuper sitting at $142,000. That is a solid base. Here is how we make it work harder.",
    "You mentioned you would like to feel more confident about insurance. Let us look at what cover sized to your situation actually looks like.",
  ],
  dontExamples: [
    "It is hereby recommended that the client undertake a transition to retirement strategy.",
    "The advice contained herein has been formulated in accordance with the client's stated objectives.",
    "Furthermore, the implementation of the proposed strategy will result in optimisation of taxation outcomes.",
  ],
};

// ── Strategy reasoning patterns ─────────────────────────────────────────────

export interface StrategyPattern {
  openingAngle: string;
  mustCover: string[];
  mustReference: string[];
  pitfalls: string[];
}

export const STRATEGY_PATTERNS: Record<StrategyKey, StrategyPattern> = {
  "ttr-strategy": {
    openingAngle:
      "Always explain what TTR means in plain English first, before touching strategy.",
    mustCover: [
      "Client's specific age and super balance",
      "Before and after numbers in dollars",
      "Tax benefit shown in dollars per year, not percentages",
      "What changes day to day for the client",
    ],
    mustReference: [
      "Preservation age (60 for current cohort)",
      "Concessional contribution cap of $30,000",
      "Specific super fund name and balance",
    ],
    pitfalls: [
      "Address the common concern about accessing super early — it is not early access, it is a structural change.",
      "Do not over-promise the tax benefit. Use conservative assumptions.",
    ],
  },
  "insurance-review": {
    openingAngle:
      "Always start with what the client is protecting, not the products.",
    mustCover: [
      "Dependants by name and age where known",
      "Mortgage balance by dollar amount",
      "Gap between current cover and recommended cover",
      "Real scenario that illustrates the need",
    ],
    mustReference: [
      "Income to protect",
      "Mortgage and other liabilities",
      "Existing cover inside super",
    ],
    pitfalls: [
      "Never use fear tactics. Use facts and empathy.",
      "Do not recommend cover the client cannot reasonably afford.",
    ],
  },
  "super-consolidation": {
    openingAngle:
      "Lead with the fee savings in dollar terms per year.",
    mustCover: [
      "Current fund name and balance",
      "Fee comparison in dollars per year",
      "Step by step rollover process",
      "How insurance inside the old fund is handled",
    ],
    mustReference: [
      "Specific fund name",
      "ATO rollover authority",
      "Charter approved product list",
    ],
    pitfalls: [
      "Address the common concern about losing insurance cover in the old fund.",
      "Flag any exit fees or insurance cancellation triggers up front.",
    ],
  },
  "investment-strategy": {
    openingAngle:
      "Always anchor the conversation to the client's risk profile score.",
    mustCover: [
      "Risk profile and what it means in everyday language",
      "Asset allocation in plain English",
      "Projected growth scenarios using conservative assumptions",
      "Time horizon and retirement age",
    ],
    mustReference: [
      "Investment risk preference captured in fact find",
      "Time horizon to retirement",
      "Liquidity needs over the next two years",
    ],
    pitfalls: [
      "Do not present a single point projection as a guarantee.",
      "Do not assume the client knows what defensive versus growth means.",
    ],
  },
  "platform-setup": {
    openingAngle:
      "Frame the platform as the way the client gets visibility and control.",
    mustCover: [
      "Why a managed platform over direct holdings",
      "Fees in dollars per year on the proposed balance",
      "How rebalancing works in practice",
      "Reporting cadence",
    ],
    mustReference: [
      "Current investable assets",
      "Charter approved platforms",
    ],
    pitfalls: [
      "Do not bury the platform fee in basis points without showing the dollar equivalent.",
    ],
  },
  "aged-care": {
    openingAngle:
      "Lead with empathy. Aged care planning is rarely about the client themselves.",
    mustCover: [
      "Family circumstances",
      "Means testing implications",
      "Cash flow under the recommended structure",
    ],
    mustReference: [
      "Centrelink income and asset thresholds",
      "Refundable accommodation deposit options",
    ],
    pitfalls: [
      "Never minimise the emotional weight of these decisions.",
    ],
  },
  "estate-planning": {
    openingAngle:
      "Explain that estate planning is about clarity for the people the client loves.",
    mustCover: [
      "Beneficiary nominations across super and insurance",
      "How super death benefits flow through the will or directly",
      "Tax position of beneficiaries",
    ],
    mustReference: [
      "Relationship status",
      "Number and ages of dependants",
      "Existing will (or absence of one)",
    ],
    pitfalls: [
      "Do not give legal advice. Recommend referral to estate planning lawyer for documents.",
    ],
  },
};

// ── Case study library ──────────────────────────────────────────────────────

export interface CaseStudy {
  id: string;
  title: string;
  strategy: StrategyKey;
  situation: string;
  recommendation: string;
  outcome: string;
  learning: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "case-young-family",
    title: "Young family protection",
    strategy: "insurance-review",
    situation:
      "Couple in early thirties, two children under five, single income of $98,000, mortgage of $480,000 with twenty four years remaining. No cover outside default super.",
    recommendation:
      "Life cover of $750,000 to clear the mortgage and fund family expenses, TPD of $500,000 and income protection covering 75% of gross income with a 30 day waiting period.",
    outcome:
      "Premiums structured through super where appropriate to preserve household cash flow. Family had certainty within four weeks.",
    learning:
      "When a single income covers a family, the conversation is about giving them choices, not buying products.",
  },
  {
    id: "case-ttr",
    title: "Pre-retirement TTR",
    strategy: "ttr-strategy",
    situation:
      "Couple aged 61 and 59, combined super of $640,000, mortgage cleared, both still working full time, looking to slow down within five years.",
    recommendation:
      "TTR pension started for the older partner with salary sacrifice replacing the income drawn. Conservative drawdown of 6% annually. Investment options rebalanced to a 60/40 split.",
    outcome:
      "Estimated additional $14,000 per year of pre-tax savings reinvested into super. On track to retire two years earlier than the original plan.",
    learning:
      "Show the dollars saved every year, not the tax rate. Clients understand dollars in their pocket.",
  },
  {
    id: "case-super-consol",
    title: "Super consolidation",
    strategy: "super-consolidation",
    situation:
      "Client aged 41 with four super accounts from previous employers totalling $186,000. Annual fees combined were $2,840.",
    recommendation:
      "Consolidate into one Charter approved fund. Replace and re-rate insurance cover before rolling over. Set up consolidated investment option matching moderate risk profile.",
    outcome:
      "Annual fee dropped to $1,180. Insurance cover preserved at the same level. Single statement and visibility for the client.",
    learning:
      "Always replace the insurance before you roll the old fund out. Always.",
  },
  {
    id: "case-fhss",
    title: "First home saver",
    strategy: "investment-strategy",
    situation:
      "Single client aged 29 on $88,000, saving for a first home in Newcastle within three years. $42,000 in cash, no super contributions beyond compulsory.",
    recommendation:
      "Activate First Home Super Saver scheme with $15,000 per year of voluntary concessional contributions. Cash savings to remain liquid in offset style account.",
    outcome:
      "Estimated tax saving of $4,200 in the first year. On track to release $45,000 plus deemed earnings under FHSS rules in time for deposit.",
    learning:
      "First home buyers respond to specific dollar amounts and timelines, not generic super messaging.",
  },
  {
    id: "case-business",
    title: "Business owner insurance",
    strategy: "insurance-review",
    situation:
      "Business owner aged 48, $1.2m turnover, partner not in the business, two children in private school. Director loan account of $180,000.",
    recommendation:
      "Personal cover sized to clear director loan and fund education through to year twelve. Key person cover held inside the business to cover revenue impact for twelve months.",
    outcome:
      "Family and business protected against the same trigger event without doubling up cover.",
    learning:
      "Separate the personal and the business cover. Two different problems, two different policies.",
  },
  {
    id: "case-aged-care",
    title: "Aged care planning",
    strategy: "aged-care",
    situation:
      "Adult daughter helping her mother (aged 82) move from her home into residential aged care. Family home worth $720,000, $80,000 in super, pension income $24,000 per year.",
    recommendation:
      "Refundable accommodation deposit structured to preserve pension and minimise daily care fees. Family home retained and rented while RAD partially funded from super and savings.",
    outcome:
      "Pension preserved. Care fees minimised by $9,400 per year. Daughter relieved of the financial uncertainty.",
    learning:
      "Aged care is a family conversation. The client is rarely the person paying.",
  },
];

export function getCaseStudiesForStrategies(
  strategies: StrategyKey[],
): CaseStudy[] {
  return CASE_STUDIES.filter((c) => strategies.includes(c.strategy));
}

// ── Composite system prompt fragment ────────────────────────────────────────

export function buildVoiceSystemFragment(): string {
  return [
    "## Brad's voice",
    ...BRAD_VOICE.rules.map((r) => `- ${r}`),
    "",
    "## Examples of writing in Brad's voice",
    ...BRAD_VOICE.doExamples.map((e) => `GOOD: ${e}`),
    "",
    "## Anti-examples (do not write like this)",
    ...BRAD_VOICE.dontExamples.map((e) => `BAD: ${e}`),
  ].join("\n");
}
