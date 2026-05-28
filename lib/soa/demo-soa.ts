// Hand crafted SOA for Sarah Mitchell — the showpiece demo. Realistic
// Newcastle property prices, realistic AIA premium estimates and
// conservative projections.

import type { SoaDocument, SoaSectionContent } from "./soa-template";
import { SOA_SECTIONS } from "./soa-template";

const SARAH_BODIES: Record<string, string> = {
  cover:
    "This Statement of Advice has been prepared for Sarah Jane Mitchell by Brad Lonergan, Authorised Representative of Charter Financial Planning Limited AFSL 234665, trading as Newcastle Financial Services. It is confidential and prepared for Sarah's personal use only. It should not be relied on by any other party.",

  "executive-summary":
    "Sarah, you are 39, single, working as a Senior Nurse Practitioner at Hunter Valley Health Network earning $118,000 a year. You have $48,500 in savings, $142,000 in your AustralianSuper account, and you told us your two top priorities are buying your first home in Newcastle within three to four years and getting your insurance cover right.\n\nWe recommend you activate the First Home Super Saver scheme by making $15,000 a year of voluntary concessional super contributions, take out tailored life, TPD and income protection cover through AIA, and rebalance your AustralianSuper investment option from MySuper Lifecycle to the Balanced option which better matches your moderate risk profile and your time horizon to retirement.\n\nIf you follow this plan you will save approximately $4,200 in tax in year one, increase your super balance by around $185,000 by age 67 compared to your current trajectory, and have around $48,000 in tax effective deposit savings ready to release under the FHSS scheme by mid 2029, alongside your existing cash savings. Your insurance gap closes immediately and your premiums remain affordable inside super.",

  "about-you":
    "You live at 42 Hunter Street, Newcastle and have been at this address for several years. You are single with no dependants. You work full time as a Senior Nurse Practitioner at Hunter Valley Health Network and your annual gross income is $118,000.\n\nYour current financial position is healthy and disciplined. You have $48,500 in cash savings and $12,000 in direct shares outside super. Your super balance with AustralianSuper sits at $142,000 (member number AU-4421987). You have no liabilities. Your monthly living expenses are well managed which gives us real capacity to put money to work.\n\nYou told us in your Financial Discovery Session that the things that matter most to you right now are buying your first home in Newcastle in the next three to four years and feeling confident about your insurance. We have written this plan around those two goals.",

  "risk-profile":
    "Your risk profile is Moderate. That means you are comfortable accepting some short term ups and downs in your investments in exchange for the chance of stronger long term returns, but you would not be comfortable with the kind of large drawdowns that aggressive growth assets can experience.\n\nIn plain English, a Moderate profile typically means a mix of around 60% growth assets (shares, property, infrastructure) and 40% defensive assets (cash, fixed interest). This allocation has historically returned around 6 to 7% per year over rolling ten year periods, with the occasional year of negative returns. Because you are 39 you have a long enough time horizon to ride out the bad years comfortably.\n\nI confirm that the risk profile recorded for me is Moderate and that the recommendations in this advice are aligned to that profile. Sarah Mitchell ____________________ Date ____________________",

  recommendations:
    "Recommendation 1: First Home Super Saver scheme. The FHSS scheme lets you save for your first home inside super and benefit from the lower tax rate that applies to super contributions. We recommend you start salary sacrificing $15,000 a year into your AustralianSuper account, in addition to your compulsory employer contributions. This stays under the $30,000 concessional contributions cap. At withdrawal time you can release up to $50,000 of voluntary contributions plus deemed earnings towards your home deposit. We considered using a high interest savings account or an ETF portfolio for your deposit, but for someone in your tax bracket the FHSS scheme is around $4,200 a year more tax effective and we did not want to leave that on the table. You should be ready to make a FHSS release request by mid 2029.\n\nRecommendation 2: Tailored insurance cover through AIA. You currently have no life, TPD or income protection cover other than minimal default cover inside your super. Given your income and your goal of buying property soon, we recommend life cover of $500,000, TPD cover of $400,000, and income protection covering 75% of your gross income with a 30 day waiting period and a five year benefit period. We recommend AIA Vitality Protect because it is on the Charter approved list, offers favourable underwriting for nurses, and the premium estimates are approximately $38 per month for life, $24 per month for TPD, and $72 per month for income protection. We considered TAL and Zurich and AIA came out ahead on price and definitions for your profession.\n\nRecommendation 3: Investment option change inside AustralianSuper. Your money is currently sitting in the AustralianSuper MySuper Lifecycle option. That option is appropriate for many people but it gets more defensive as you approach 65, which is too conservative given your 28 year time horizon to age 67. We recommend you switch to the AustralianSuper Balanced option, which targets a long term return of CPI plus 4% and matches your Moderate risk profile. There is no fee to switch.",

  superannuation:
    "Current position. You are with AustralianSuper, member number AU-4421987, with a current balance of $142,000. Your employer contributes the compulsory super guarantee of 11.5% (rising to 12% from 1 July 2026). You are not currently making any personal contributions.\n\nRecommended changes. Start a salary sacrifice of $15,000 a year into your AustralianSuper account from your next pay cycle. This counts as a concessional contribution and reduces your taxable income. Combined with your employer contributions of around $13,570 you remain comfortably under the $30,000 concessional cap. At the same time, switch your investment option from MySuper Lifecycle to Balanced.\n\nProjected balance at retirement. On your current trajectory your super balance at age 67 is projected to reach approximately $720,000 in today's dollars. With the recommended salary sacrifice and the Balanced investment option, the projected balance at age 67 rises to approximately $905,000. That is an additional $185,000 in retirement. Assumptions used: current path return 5.5% per year, recommended path return 6.5% per year, inflation 2.5% per year, additional contributions $15,000 per year escalated with wage growth. These are conservative estimates and actual outcomes will vary.",

  insurance:
    "Current cover assessment. You currently hold only the default insurance cover that comes with your AustralianSuper account. That cover is approximately $130,000 of life insurance and $86,000 of TPD, with no income protection. For your situation that is well below what we would consider appropriate.\n\nGap analysis. You earn $118,000 a year, you have a strong likelihood of buying a property worth $700,000 to $850,000 in Newcastle in the next three to four years, and your earning capacity is your most valuable asset. The recommended cover levels close the gap as follows. Life cover from $130,000 to $500,000 to clear a future mortgage and leave a buffer. TPD from $86,000 to $400,000. Income protection from zero to 75% of your gross income with a 30 day waiting period.\n\nProduct recommendation. AIA Vitality Protect across all three covers. Estimated combined premium of $134 per month, with life and TPD funded through your AustralianSuper account to preserve your take home pay, and income protection held outside super for tax deductibility. Claims are managed by AIA's claims team in Sydney. The vast majority of valid claims are paid within fourteen days of all evidence being received. We will help you with the application and any underwriting questions.",

  investment:
    "Asset allocation. The recommended asset allocation for your Moderate risk profile is approximately 60% growth and 40% defensive. Inside your AustralianSuper Balanced option that mix is achieved automatically. Your existing $12,000 of direct shares outside super complements this nicely and we recommend you continue to hold them rather than sell.\n\nProduct recommendation. AustralianSuper Balanced for your super. No platform required at this stage given your relatively concentrated asset base. We will revisit a managed investment platform if your investable assets outside super grow past $100,000.\n\nFee comparison. AustralianSuper Balanced charges 0.50% per year investment fee plus $1.50 per week administration. On your current balance that is approximately $788 per year. The next closest comparable Charter approved fund (MLC MasterKey Super Fundamentals) would cost approximately $647 per year, however the higher fee at AustralianSuper is offset by stronger long term performance and the simplicity of staying with one fund. We are not recommending you switch.\n\nProjected returns. Under the recommended strategy and using a conservative 6.5% per year long term return assumption, your super balance grows to approximately $905,000 by age 67. Past performance is not a guarantee of future returns.",

  "retirement-projections":
    "Current trajectory. If nothing changes, your super balance at age 67 is projected to be approximately $720,000 in today's dollars. That would deliver an annual retirement income of around $36,000 per year for a 25 year retirement, before any age pension entitlement.\n\nRecommended trajectory. With the salary sacrifice strategy and the investment option change, your projected super balance at age 67 rises to approximately $905,000. That delivers an annual retirement income of around $45,000 per year for a 25 year retirement.\n\nAssumptions. Current path uses 5.5% per year return, recommended path uses 6.5% per year. Inflation 2.5%. Salary sacrifice of $15,000 per year escalated with wage growth at 3%. Retirement age 67. Drawdown calculation uses 4% rule. Actual outcomes depend on investment performance, contribution consistency, legislative changes and your personal circumstances. We will review these projections every year at your annual review.",

  implementation:
    "1. Sign and return this SOA. Responsible: Sarah. By: within 14 days.\n2. Brad submits salary sacrifice instruction to Hunter Valley Health Network payroll. Responsible: Brad. By: within 7 days of signed SOA.\n3. Sarah completes AIA application with health questions. Responsible: Sarah. By: within 14 days. Provides: most recent payslip, Medicare details.\n4. Brad lodges AIA application and manages underwriting. Responsible: Brad. By: ongoing until cover commences.\n5. Brad submits AustralianSuper investment option switch. Responsible: Brad. By: within 7 days. Provides: member number AU-4421987.\n6. Sarah opens FHSS contribution tracking in MyGov. Responsible: Sarah. By: within 14 days.\n7. First annual review. Responsible: Brad and Sarah. By: 12 months from sign date.",

  "ongoing-service":
    "Your ongoing service is the BMK Annual Review package at $2,800 per year, paid monthly via direct debit. It includes an annual review meeting (90 minutes, in person or video), a quarterly check in by phone or email, ad hoc support for life events such as a new job or property purchase, all underwriting and provider liaison work, and unlimited email questions to Brad's direct line.\n\nIf you want to contact Brad outside of these touch points you can email brad@bmkfs.com.au or call 0419 220 991. We aim to respond within one business day.",

  "compliance-disclosures":
    "Best interests duty acknowledgement. In providing this advice your adviser has acted in your best interests and has prioritised your interests in the event of any conflict. Reasonable enquiries have been made and reasonable investigation has been conducted into the products that might achieve your objectives.\n\nFee disclosure. The total cost of this Statement of Advice is $1,950 plus the ongoing service fee of $2,800 per year. There are no commissions paid to Newcastle Financial Services on any of the investment products recommended. Insurance premiums include commission of up to 60% in year one and 22% ongoing, paid by the insurer to Charter Financial Planning Limited.\n\nGeneral advice warning. While this Statement of Advice has been prepared based on the information you have provided, you should consider its appropriateness in light of your own objectives, financial situation and needs before acting on any recommendation.\n\nRisk profile disclaimer. The investment strategy recommended in this advice is consistent with the Moderate risk profile we discussed and you confirmed. Risk profiles can change over time. You should let us know if your circumstances or attitude to risk change so we can review the strategy.\n\nPrivacy collection notice. Newcastle Financial Services collects personal information from you to provide financial advice and related services. We handle your information in accordance with the Australian Privacy Principles and our Privacy Policy, available on request.",
};

const REVIEW_FLAGS: Record<string, { needsReview: boolean; reason?: string; confidence: "high" | "medium" | "low" }> = {
  cover: { needsReview: false, confidence: "high" },
  "executive-summary": {
    needsReview: true,
    reason: "Confirm the dollar savings and projection numbers match the appendix.",
    confidence: "medium",
  },
  "about-you": { needsReview: false, confidence: "high" },
  "risk-profile": {
    needsReview: true,
    reason: "Confirm risk profile was formally documented with the client.",
    confidence: "medium",
  },
  recommendations: {
    needsReview: true,
    reason: "Verify the FHSS election, AIA premium estimates and AustralianSuper option change instructions.",
    confidence: "medium",
  },
  superannuation: {
    needsReview: true,
    reason: "Projection used conservative assumptions. Confirm before sending.",
    confidence: "medium",
  },
  insurance: {
    needsReview: true,
    reason: "Premium estimates are indicative — subject to underwriting.",
    confidence: "medium",
  },
  investment: { needsReview: false, confidence: "medium" },
  "retirement-projections": {
    needsReview: true,
    reason: "Projection model used. Brad to confirm before client sees it.",
    confidence: "low",
  },
  implementation: { needsReview: false, confidence: "high" },
  "ongoing-service": { needsReview: false, confidence: "high" },
  "compliance-disclosures": { needsReview: false, confidence: "high" },
};

export function buildSarahDemoSections(): SoaSectionContent[] {
  return SOA_SECTIONS.map((tpl) => {
    const flag = REVIEW_FLAGS[tpl.id] ?? {
      needsReview: tpl.needsReviewByDefault,
      confidence: tpl.defaultConfidence,
    };
    return {
      id: tpl.id,
      number: tpl.number,
      title: tpl.title,
      body: SARAH_BODIES[tpl.id] ?? "",
      needsReview: flag.needsReview,
      reviewReason: flag.reason,
      confidence: flag.confidence,
      reviewed: false,
      approved: false,
    };
  });
}

export function isShowpieceClient(clientId: string): boolean {
  return clientId === "sarah-mitchell";
}
