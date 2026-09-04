// Pulling a stopped client's answers out of the conversation they had.
//
// A finished session hands us the fact find directly: Athena calls
// submit_fact_find and the ten sections fill themselves. A session that stops
// at question six never fires that tool, so everything the client said sits in
// the transcript as prose and the review screen shows nothing. This module is
// what turns those turns back into fields.
//
// The whole design is built around one failure mode. A financial fact find
// that quietly contains a number the client never said is worse than an empty
// one, because an empty field asks Brad a question and a wrong field answers
// it. So extraction only ever records what was actually said, the result is
// stored in its own namespace that nothing downstream reads, and it reaches an
// SOA only after Brad has looked at it.

import Anthropic from "@anthropic-ai/sdk";
import { anthropicCredentialStatus } from "@/lib/ai/anthropic-credentials";
import {
  normalizeFactFind,
  type AthenaFactFind,
} from "@/lib/athena-fact-find-schema";
import type { TranscriptTurn } from "@/lib/secure-store/transcript-persistence";

// Deliberately not ATHENA_MODEL. The discovery session is a conversation, and
// a conversational model is the right tool for it. This is a careful read of
// financial disclosures where a misread number lands in an adviser's file, so
// it runs on the most capable model rather than the cheapest one that would
// usually pass. One call per stopped client, not one per turn.
export const EXTRACTION_MODEL = "claude-opus-5";

// Effort is the cost lever here, not the model. The task is narrowly specified
// and the transcript is short, so medium buys the care this needs without
// paying for deliberation the task does not have.
const EXTRACTION_EFFORT = "medium" as const;

const MAX_OUTPUT_TOKENS = 8_000;

export interface ExtractedAnswers {
  /** Only what the client actually said. Everything else is an empty string. */
  data: AthenaFactFind;
  /** How many of the fifty fields the client actually answered. */
  fieldCount: number;
  model: string;
}

export class ExtractionUnavailableError extends Error {
  constructor(
    message: string,
    readonly reason: "no_credential" | "no_answers" | "provider",
  ) {
    super(message);
    this.name = "ExtractionUnavailableError";
  }
}

const SYSTEM_PROMPT = `You read transcripts of financial discovery conversations for an Australian financial advice practice and return the client's answers as structured data.

The conversation you are given is unfinished. The client stopped partway through, so most fields will have no answer in it. That is expected and it is not a problem to solve.

## The one rule that matters

Record only what the client actually said. Never infer, never estimate, never calculate, never fill a gap with something reasonable.

If the client did not answer a field, its value is an empty string. An empty field is correct and useful, because it tells the adviser what still needs asking. A field you filled in from an assumption is a false statement in a client's financial record, and the adviser has no way to tell it apart from something the client really said.

Specifically:
- Never convert, total, or do arithmetic on figures. If they said their repayments are 3200 a month, do not record an annual figure anywhere.
- Never carry a value from one field into another. A home loan balance is not an investment loan balance.
- Never resolve a maybe. "I think around 400 thousand, I would have to check" is uncertain, so record it as the client said it, hedge included.
- Never use anything Athena said as an answer. Only the client's own words count. If Athena suggested a figure and the client did not confirm it, there is no answer.
- If the client explicitly declined a question, leave the field empty.

## Formatting

Write values the way an Australian adviser would read them back. Money as "$95,000". Dates as "12 March 1984". Keep the client's own hedging words when they hedged, for example "about $480,000" or "roughly 60, still deciding".

Where the client answered in prose, keep it readable and short rather than quoting the whole sentence. "I run a plumbing business" becomes an occupation of "Self employed, plumbing business".

## Output

Return the JSON object for the given schema and nothing else. Set completionPercentage to the percentage of the fifty fields you actually filled, as a whole number. Put the readable title of any of the ten areas that came out entirely empty into missingSections.`;

function transcriptFor(turns: TranscriptTurn[]): string {
  return turns
    .map((t) => `${t.role === "user" ? "CLIENT" : "ATHENA"}: ${t.message}`)
    .join("\n");
}

/** Counts the fifty answer fields that actually carry a value. */
export function countFilledFields(data: AthenaFactFind): number {
  let filled = 0;
  for (const [key, section] of Object.entries(data)) {
    if (key === "completionPercentage" || key === "missingSections") continue;
    if (!section || typeof section !== "object") continue;
    for (const value of Object.values(section as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) filled += 1;
    }
  }
  return filled;
}

// The schema the model must answer in. Deliberately the same shape the
// completion tool produces, so a partial extraction and a finished fact find
// are the same object and every consumer downstream stays unchanged.
const SECTION_FIELDS: Record<string, string[]> = {
  personalDetails: ["fullName", "dateOfBirth", "address", "timeAtAddress", "countryOfBirth"],
  contactInformation: ["mobile", "homePhone", "email", "preferredContact", "bestTimeToContact"],
  familyAndDependants: ["relationshipStatus", "partnerName", "partnerDOB", "numberOfDependants", "agesOfDependants"],
  employmentAndIncome: ["employmentStatus", "employerName", "occupation", "annualGrossIncome", "otherIncomeSources"],
  assets: ["ownerOccupiedPropertyValue", "investmentPropertyValue", "savingsAndCash", "sharesAndInvestments", "vehicles"],
  liabilities: ["homeMortgage", "investmentLoans", "personalLoans", "creditCardLimits", "otherLiabilities"],
  expenses: ["housingCosts", "groceries", "transport", "education", "lifestyleAndEntertainment"],
  superannuation: ["fundName", "memberNumber", "estimatedBalance", "employerContributionRate", "personalContributions"],
  insurance: ["lifeInsuranceSumInsured", "lifeInsuranceProvider", "incomeProtectionMonthlyBenefit", "tpdCover", "healthInsuranceProvider"],
  goalsAndObjectives: ["primaryFinancialGoals", "targetRetirementAge", "desiredRetirementIncome", "investmentRiskPreference", "otherConsiderations"],
};

function buildSchema(): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  for (const [section, fields] of Object.entries(SECTION_FIELDS)) {
    properties[section] = {
      type: "object",
      properties: Object.fromEntries(
        fields.map((f) => [f, { type: "string" }]),
      ),
      required: fields,
      additionalProperties: false,
    };
  }
  properties.completionPercentage = { type: "integer" };
  properties.missingSections = { type: "array", items: { type: "string" } };

  return {
    type: "object",
    properties,
    required: [...Object.keys(SECTION_FIELDS), "completionPercentage", "missingSections"],
    additionalProperties: false,
  };
}

// Reads a stopped conversation and returns the client's answers.
//
// Throws rather than returning a half answer: a caller that cannot tell a
// failed extraction from a client who said nothing would show Brad an empty
// fact find and let him believe the client gave nothing away.
export async function extractAnswers(
  turns: TranscriptTurn[],
): Promise<ExtractedAnswers> {
  const clientTurns = turns.filter((t) => t.role === "user");
  if (clientTurns.length === 0) {
    throw new ExtractionUnavailableError(
      "This session has no client answers to read.",
      "no_answers",
    );
  }

  const credential = anthropicCredentialStatus();
  if (!credential.configured) {
    throw new ExtractionUnavailableError(
      `Anthropic credential unusable: ${credential.detail}`,
      "no_credential",
    );
  }

  const anthropic = new Anthropic({ apiKey: credential.key });

  let response;
  try {
    response = await anthropic.messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: EXTRACTION_EFFORT,
        format: { type: "json_schema", schema: buildSchema() },
      },
      messages: [
        {
          role: "user",
          content: `Here is the unfinished discovery conversation. Return the client's answers.\n\n${transcriptFor(turns)}`,
        },
      ],
    });
  } catch (e) {
    // Name the model in the message. A workspace that does not have this model
    // enabled fails exactly like a billing problem otherwise, and the two need
    // completely different fixes.
    const detail = e instanceof Error ? e.message : String(e);
    throw new ExtractionUnavailableError(
      `Extraction failed on ${EXTRACTION_MODEL}: ${detail}`,
      "provider",
    );
  }

  // A refusal is a 200 with no usable content, so stop_reason is checked before
  // anything is read out of the response.
  if (response.stop_reason === "refusal") {
    throw new ExtractionUnavailableError(
      "The model declined to read this transcript.",
      "provider",
    );
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: Partial<AthenaFactFind>;
  try {
    parsed = JSON.parse(text) as Partial<AthenaFactFind>;
  } catch {
    throw new ExtractionUnavailableError(
      "The extraction did not come back as readable data.",
      "provider",
    );
  }

  const data = normalizeFactFind(parsed);
  const fieldCount = countFilledFields(data);

  // Recompute rather than trusting the model's own arithmetic: this number
  // drives the completion bar Brad reads at a glance.
  data.completionPercentage = Math.round((fieldCount / 50) * 100);

  return { data, fieldCount, model: EXTRACTION_MODEL };
}
