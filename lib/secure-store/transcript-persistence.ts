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
