// Encrypted storage for Athena discovery transcripts.
//
// Server-only. This namespace is the practice's own record of what was said
// in a discovery session: sensitive information under the Privacy Act 1988
// (Cth), and therefore AES-256-GCM encrypted at rest like every other record
// here.
//
// Three writers land here and they do not agree on completeness:
//
//   live      the browser, every few seconds while the session runs. The only
//             writer that captures a session the client abandons halfway.
//   post-call the ElevenLabs webhook, once, after the call ends. Authoritative
//             on timing, but it only fires if the agent is configured to send
//             it, and its payload depends on the workspace retention setting.
//   text      the Anthropic fallback session, same cadence as live.
//
// mergeTranscript is what makes three writers safe: a write can add turns to a
// record but never take them away. That rule is the whole point. Without it a
// post-call payload that arrives empty would silently erase a complete session
// the browser had already captured turn by turn.

import { secureSet, secureGet, secureList } from "./index";

const NAMESPACE = "athena-transcripts";

export type TranscriptSource = "live" | "post-call" | "text";

export interface TranscriptTurn {
  role: "agent" | "user";
  message: string;
  timeInCallSecs?: number;
}

export interface StoredTranscript {
  conversationId: string;
  /**
   * Groups the records that make up one discovery conversation.
   *
   * A text session that a client resumes reuses its conversation id, so its
   * record simply grows. A voice session cannot: ElevenLabs mints a fresh
   * conversation id for every call, so a client who returns produces a second
   * record that starts with a copy of the first one's turns. Both records
   * carry the same thread id, which is what lets the adviser see one resumed
   * session rather than two contradictory ones.
   *
   * Defaults to the conversation id, so a session that is never resumed is a
   * thread of one and needs no special handling anywhere.
   */
  threadId?: string;
  agentId: string;
  clientId?: string;
  startedAt?: string;
  receivedAt: string;
  durationSeconds?: number;
  status?: string;
  /** Which writers have contributed to this record, in arrival order. */
  sources?: TranscriptSource[];
  /** True once a session ended by its own completion, not by abandonment. */
  completed?: boolean;
  /** ElevenLabs' own summary and outcome, from the post-call payload. */
  summary?: string;
  callSuccessful?: string;
  terminationReason?: string;
  /**
   * When the vendor intends to drop its own copy, read from the post-call
   * payload's deletion_settings. Worth keeping: it is the practice's evidence
   * of where a client's disclosures still exist and for how long.
   */
  vendorDeletion?: {
    deleteAtIso?: string;
    deleteTranscriptAndPii?: boolean;
    deleteAudio?: boolean;
  };
  turns: TranscriptTurn[];
}

// Adds to a transcript without ever shrinking it.
//
// Turns are compared by count rather than merged turn by turn. The writers
// each hold the whole conversation from its start, so the longer list is a
// superset of the shorter one, and picking it is both correct and impossible
// to corrupt with a retry, a duplicate delivery or an out of order flush.
export async function mergeTranscript(
  entry: StoredTranscript,
): Promise<StoredTranscript> {
  const existing = await secureGet<StoredTranscript>(
    NAMESPACE,
    entry.conversationId,
  );

  if (!existing) {
    const first: StoredTranscript = {
      ...entry,
      threadId: entry.threadId ?? entry.conversationId,
      sources: entry.sources ?? [],
    };
    await secureSet(NAMESPACE, entry.conversationId, first);
    return first;
  }

  const keepIncoming = entry.turns.length >= existing.turns.length;
  const sources = existing.sources ?? [];
  const incomingSources = entry.sources ?? [];

  const merged: StoredTranscript = {
    conversationId: entry.conversationId,
    // Set once, by whichever writer created the record. A later flush must not
    // be able to move a record into a different thread.
    threadId: existing.threadId ?? entry.threadId ?? entry.conversationId,
    // Prefer whichever writer actually knows each field. The live writer has
    // no duration and the post-call writer has no client token, so neither
    // alone produces a complete record.
    agentId: entry.agentId || existing.agentId,
    clientId: entry.clientId ?? existing.clientId,
    startedAt: existing.startedAt ?? entry.startedAt,
    receivedAt: entry.receivedAt,
    durationSeconds: entry.durationSeconds ?? existing.durationSeconds,
    status: entry.status ?? existing.status,
    sources: [...sources, ...incomingSources.filter((s) => !sources.includes(s))],
    completed: entry.completed || existing.completed,
    // Only the post-call writer knows any of these, so a live flush arriving
    // afterwards must not blank them.
    summary: entry.summary ?? existing.summary,
    callSuccessful: entry.callSuccessful ?? existing.callSuccessful,
    terminationReason: entry.terminationReason ?? existing.terminationReason,
    vendorDeletion: entry.vendorDeletion ?? existing.vendorDeletion,
    turns: keepIncoming ? entry.turns : existing.turns,
  };

  await secureSet(NAMESPACE, entry.conversationId, merged);
  return merged;
}

export async function getTranscript(
  conversationId: string,
): Promise<StoredTranscript | undefined> {
  return secureGet<StoredTranscript>(NAMESPACE, conversationId);
}

export async function listTranscripts(): Promise<StoredTranscript[]> {
  const entries = await secureList<StoredTranscript>(NAMESPACE);
  return entries
    .map((e) => e.value)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

// Every record belonging to one client, oldest first.
//
// Records written before the client id was captured (or by a post-call webhook
// that arrived without one) are simply not this client's and are skipped: an
// unattributed transcript must never surface under someone else's name.
export async function listTranscriptsForClient(
  clientId: string,
): Promise<StoredTranscript[]> {
  const entries = await secureList<StoredTranscript>(NAMESPACE);
  return entries
    .map((e) => e.value)
    .filter((t) => t.clientId === clientId)
    .sort((a, b) => transcriptStart(a).localeCompare(transcriptStart(b)));
}

/** Best available start time. Falls back to arrival for pre-thread records. */
export function transcriptStart(t: StoredTranscript): string {
  return t.startedAt ?? t.receivedAt;
}

/** Every record in one thread, oldest first. */
export function threadOf(t: StoredTranscript): string {
  return t.threadId ?? t.conversationId;
}
