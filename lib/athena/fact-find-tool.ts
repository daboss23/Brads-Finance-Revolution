// Shared contract for the submit_fact_find tool that Athena calls at the end of
// a voice discovery session.
//
// The fact find must never travel through the transcript. In the text build the
// model emitted a <fact-find-complete> block that SarahChat regex-stripped, but
// in a voice session anything in the transcript gets spoken aloud to the client.
// So Athena hands the data over as a tool argument instead, which is silent.

import { normalizeFactFind, type SarahFactFind } from "@/lib/sarah-fact-find-schema";

/** Name the agent knows this tool by. Must match the ElevenLabs agent config. */
export const SUBMIT_FACT_FIND_TOOL = "submit_fact_find";

/** Parameter the agent fills with the fact find, serialised as JSON. */
export const FACT_FIND_PARAM = "fact_find_json";

export type SubmitFactFindParams = {
  [FACT_FIND_PARAM]?: unknown;
};

export type ParseResult =
  | { ok: true; data: SarahFactFind }
  | { ok: false; reason: string };

/**
 * Turns whatever the agent passed into a normalised fact find.
 *
 * A voice model under time pressure produces imperfect arguments, so this
 * accepts the payload as either a JSON string or an already-decoded object, and
 * reports failures as a sentence the agent can act on rather than throwing.
 */
export function parseSubmittedFactFind(params: SubmitFactFindParams): ParseResult {
  const raw = params?.[FACT_FIND_PARAM];

  if (raw == null || raw === "") {
    return { ok: false, reason: `Missing ${FACT_FIND_PARAM}.` };
  }

  let decoded: unknown = raw;
  if (typeof raw === "string") {
    // Models sometimes wrap JSON in a markdown fence despite instructions.
    const unfenced = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
    try {
      decoded = JSON.parse(unfenced);
    } catch {
      return { ok: false, reason: `${FACT_FIND_PARAM} was not valid JSON.` };
    }
  }

  if (typeof decoded !== "object" || decoded === null || Array.isArray(decoded)) {
    return { ok: false, reason: `${FACT_FIND_PARAM} must be a JSON object.` };
  }

  return { ok: true, data: normalizeFactFind(decoded as Partial<SarahFactFind>) };
}
