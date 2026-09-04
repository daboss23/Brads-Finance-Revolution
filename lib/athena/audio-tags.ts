// Athena's performance directions, removed before anything is kept.
//
// The live ElevenLabs agent is instructed to write square bracket stage
// directions into its turns, like [warmly] or [chuckles]. The voice engine
// reads them and the client never hears them, but they are still in the text
// the browser receives, and the practice's record should hold what was said
// rather than how it was performed.
//
// Three things go wrong if they are left in. Brad's transcript reads
// "[warmly] Hi James", a resumed session feeds stage directions back to the
// agent as if they were conversation, and the extraction model has to work out
// which brackets are speech and which are staging before it can read a number
// out of an answer.
//
// Two rules keep this from ever eating something a client said. It runs on
// Athena's turns only, and a client's turn reaches us through speech to text,
// which does not produce square brackets at all. And it only removes a single
// bracketed word, so a bracket around a phrase survives untouched.

import type { TranscriptTurn } from "@/lib/secure-store/transcript-persistence";

/** One bracketed word. Deliberately not two: "[my wife]" is not a direction. */
const AUDIO_TAG = /\[[a-zA-Z]{2,20}\]/g;

export function stripAudioTags(text: string): string {
  if (!text.includes("[")) return text;
  return text
    .replace(AUDIO_TAG, " ")
    // Close the gap a removed tag leaves, including the space it would push in
    // front of a comma or a full stop.
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

// Cleans a whole conversation. Agent turns only, for the reason above.
export function stripAudioTagsFromTurns(
  turns: TranscriptTurn[],
): TranscriptTurn[] {
  let changed = false;
  const out = turns.map((turn) => {
    if (turn.role !== "agent") return turn;
    const message = stripAudioTags(turn.message);
    if (message === turn.message) return turn;
    changed = true;
    return { ...turn, message };
  });
  // Keep the original array when nothing moved, so this stays free to call on
  // every flush of a text session that never had a tag in it.
  return changed ? out : turns;
}
