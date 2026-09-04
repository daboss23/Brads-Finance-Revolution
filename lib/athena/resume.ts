// Picking a discovery session back up.
//
// Shared by both sessions because the client should not be able to tell which
// one they are on. Whichever Athena answers, a returning client sees the
// conversation they already had and is asked the next question, not the first.

import type { TranscriptTurn } from "@/lib/secure-store/transcript-persistence";

export interface AthenaResumeState {
  /** Ties the resumed record back to the original conversation. */
  threadId: string;
  /** The record the previous attempt was writing into. */
  conversationId: string;
  startedAt?: string;
  lastActivityAt: string;
  answerCount: number;
  turns: TranscriptTurn[];
}

// Asks the server whether this client has a conversation waiting.
//
// Never throws and never blocks the session: a client whose resume lookup fails
// gets a fresh start, which is worse than resuming and far better than a dead
// screen. The only cost of a false negative is questions asked twice.
export async function fetchResumeState(
  token: string | undefined,
): Promise<AthenaResumeState | null> {
  if (!token) return null;
  try {
    const res = await fetch(
      `/api/athena/transcript?token=${encodeURIComponent(token)}`,
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { resume?: AthenaResumeState | null };
    const resume = body.resume;
    if (!resume || !Array.isArray(resume.turns) || resume.turns.length === 0) {
      return null;
    }
    return resume;
  } catch (e) {
    console.error("[athena-resume] lookup failed:", e);
    return null;
  }
}

// How long the client was away, in words Athena can say out loud.
export function timeAwayLabel(lastActivityAt: string): string {
  const ms = Date.now() - new Date(lastActivityAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "earlier";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return "a little earlier today";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return "earlier today";
  const days = Math.round(hours / 24);
  if (days <= 1) return "yesterday";
  return `${days} days ago`;
}

// The prior conversation, flattened for the live agent.
//
// ElevenLabs holds no memory of a call once it ends, and a resumed call is a
// new call. The only channel into it is a dynamic variable, so the previous
// turns go in as text the agent can read before it speaks. Capped because a
// dynamic variable rides in the connection payload, not a streamed message.
const MAX_RESUME_CONTEXT_CHARS = 6_000;

export function resumeContextFor(turns: TranscriptTurn[]): string {
  const lines = turns.map(
    (t) => `${t.role === "user" ? "Client" : "Athena"}: ${t.message}`,
  );

  // Trim from the front. The recent turns decide what to ask next, and the
  // early ones are the audio check and the greeting, which carry the least.
  let out = lines.join("\n");
  while (out.length > MAX_RESUME_CONTEXT_CHARS && lines.length > 1) {
    lines.shift();
    out = lines.join("\n");
  }
  return out.slice(-MAX_RESUME_CONTEXT_CHARS);
}
