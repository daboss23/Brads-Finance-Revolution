// One discovery conversation, as the practice sees it.
//
// The store holds transcript records, not sessions. A client who starts on
// Tuesday, closes the tab at question six and comes back on Thursday leaves
// one record if they were on the text session and two if they were on voice,
// because ElevenLabs mints a new conversation id for every call. Neither shape
// is a thing the adviser should have to reason about.
//
// This module collapses records into sessions, keyed by thread, and gives each
// one a status the client's own screen agrees with: a session Brad is told is
// resumable is exactly a session the client can still resume.

import {
  listTranscriptsForClient,
  threadOf,
  transcriptStart,
  type StoredTranscript,
  type TranscriptTurn,
} from "@/lib/secure-store/transcript-persistence";

// How long a half finished session stays resumable.
//
// Not a technical limit. Financial disclosures go stale, and a client picking
// up a three week old conversation would be answering questions against a
// situation that has moved. After this they start fresh, which is also the
// point at which the record stops being a live task and becomes history.
export const RESUME_WINDOW_DAYS = 14;

// A session whose last write is this recent is treated as still running rather
// than paused. Comfortably longer than the five second flush cadence, so a
// client thinking about an answer never reads as having walked away.
const LIVE_WINDOW_MINUTES = 5;

export type DiscoverySessionStatus =
  /** Finished on Athena's own terms and submitted a fact find. */
  | "completed"
  /** Written to within the last few minutes: the client is in it right now. */
  | "live"
  /** Stopped partway and still inside the resume window. */
  | "paused"
  /** Stopped partway and past the resume window. History, not a task. */
  | "abandoned";

export interface DiscoverySession {
  /** Stable across resumes. Safe to use as a React key and a UI anchor. */
  threadId: string;
  /** The record a resume should write into. */
  conversationId: string;
  status: DiscoverySessionStatus;
  /** Voice, text, or both if the client failed over mid session. */
  channels: Array<"voice" | "text">;
  startedAt: string;
  lastActivityAt: string;
  /** Present once the ElevenLabs webhook has landed. */
  durationSeconds?: number;
  summary?: string;
  turns: TranscriptTurn[];
  /** Client answers only. The headline number for "how much did we get?". */
  answerCount: number;
  /** How many times the client came back to this conversation. */
  resumeCount: number;
}

function statusOf(
  completed: boolean,
  lastActivityAt: string,
  now: number,
): DiscoverySessionStatus {
  if (completed) return "completed";
  const age = now - new Date(lastActivityAt).getTime();
  if (Number.isNaN(age)) return "abandoned";
  if (age <= LIVE_WINDOW_MINUTES * 60_000) return "live";
  if (age <= RESUME_WINDOW_DAYS * 86_400_000) return "paused";
  return "abandoned";
}

function channelsOf(records: StoredTranscript[]): Array<"voice" | "text"> {
  const out = new Set<"voice" | "text">();
  for (const r of records) {
    for (const s of r.sources ?? []) {
      // post-call only ever follows a live voice call, so it names no channel
      // the live writer has not already claimed.
      if (s === "text") out.add("text");
      if (s === "live" || s === "post-call") out.add("voice");
    }
  }
  return [...out];
}

// Collapses a client's records into sessions, newest first.
//
// Within a thread the longest turn list wins, for the same reason the store
// itself never shrinks a record: every writer holds the conversation from its
// start, so the longest list is a superset of the others. A resumed voice
// session seeds its new record with the previous one's turns, which is what
// makes that hold across records and not just within one.
export function buildDiscoverySessions(
  records: StoredTranscript[],
  now: number = Date.now(),
): DiscoverySession[] {
  const threads = new Map<string, StoredTranscript[]>();
  for (const r of records) {
    const id = threadOf(r);
    const bucket = threads.get(id);
    if (bucket) bucket.push(r);
    else threads.set(id, [r]);
  }

  const sessions: DiscoverySession[] = [];
  for (const [threadId, bucket] of threads) {
    const ordered = [...bucket].sort((a, b) =>
      transcriptStart(a).localeCompare(transcriptStart(b)),
    );
    const richest = ordered.reduce((best, r) =>
      r.turns.length >= best.turns.length ? r : best,
    );
    const latest = ordered[ordered.length - 1];
    const completed = ordered.some((r) => r.completed);
    const lastActivityAt = ordered
      .map((r) => r.receivedAt)
      .sort()
      .at(-1) as string;

    sessions.push({
      threadId,
      // Resumes continue the most recent record, not the richest one: those
      // differ only while a stale flush is in flight, and the newest record is
      // the one the next writer is already pointed at.
      conversationId: latest.conversationId,
      status: statusOf(completed, lastActivityAt, now),
      channels: channelsOf(ordered),
      startedAt: transcriptStart(ordered[0]),
      lastActivityAt,
      durationSeconds: ordered.find((r) => r.durationSeconds)?.durationSeconds,
      summary: ordered.find((r) => r.summary)?.summary,
      turns: richest.turns,
      answerCount: richest.turns.filter((t) => t.role === "user").length,
      resumeCount: ordered.length - 1,
    });
  }

  return sessions.sort((a, b) =>
    b.lastActivityAt.localeCompare(a.lastActivityAt),
  );
}

/** Every discovery session for one client, newest first. Adviser side. */
export async function getDiscoverySessions(
  clientId: string,
): Promise<DiscoverySession[]> {
  return buildDiscoverySessions(await listTranscriptsForClient(clientId));
}

// The session a returning client should be dropped back into, if any.
//
// Deliberately narrow. A completed session is finished, one past the resume
// window is history, and one where the client never actually answered anything
// is not worth restoring: a client who opened the link, heard Athena say hello
// and closed the tab should get a clean start, not a welcome back offering to
// restore nothing. Anything else and they pick up where they stopped.
export async function findResumableSession(
  clientId: string,
): Promise<DiscoverySession | null> {
  const sessions = await getDiscoverySessions(clientId);
  // Never resume into a thread when a later attempt already completed: the
  // client has finished, whatever an older abandoned attempt still holds.
  if (sessions.some((s) => s.status === "completed")) return null;
  return (
    sessions.find(
      (s) =>
        (s.status === "paused" || s.status === "live") && s.answerCount > 0,
    ) ?? null
  );
}
