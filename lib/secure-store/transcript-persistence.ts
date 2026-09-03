// Encrypted storage for Athena discovery transcripts.
//
// Server-only. Under Zero Retention Mode ElevenLabs discards the call the
// moment it ends, so this namespace holds the practice's own record of what
// was said — sensitive information under the Privacy Act 1988 (Cth), and
// therefore AES-256-GCM encrypted at rest like every other record here.

import { secureSet, secureGet, secureList } from "./index";

const NAMESPACE = "athena-transcripts";

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
  turns: TranscriptTurn[];
}

export async function persistTranscript(entry: StoredTranscript): Promise<void> {
  await secureSet(NAMESPACE, entry.conversationId, entry);
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
