import { verifyElevenLabsSignature } from "@/lib/athena/webhook-signature";
import { mergeTranscript, type TranscriptTurn } from "@/lib/secure-store/transcript-persistence";
import { stripAudioTags } from "@/lib/athena/audio-tags";
import { EncryptionKeyMissingError } from "@/lib/secure-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// A long discovery transcript is tens of kilobytes. Anything far above that is
// an audio delivery, which this route does not store.
const MAX_BODY_BYTES = 2_000_000;

// Post-call webhook from ElevenLabs.
//
// Athena's agent runs under Zero Retention Mode: ElevenLabs keeps no
// transcript, no audio and no PII after a call. This route is therefore the
// single point at which a discovery session becomes a durable record, and it
// writes only through the encrypted store. Two consequences shape the code
// below: an unverified payload is rejected outright, and a failed write
// returns 5xx so ElevenLabs retries rather than silently dropping the file.
//
// Authenticated by HMAC signature, not by the adviser session cookie, so
// /api/elevenlabs/ is listed as a public prefix in middleware.ts.
export async function POST(req: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  const log = (...a: unknown[]) => console.log(`[eleven-post-call:${reqId}]`, ...a);
  const err = (...a: unknown[]) => console.error(`[eleven-post-call:${reqId}]`, ...a);

  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) {
    err("ELEVENLABS_WEBHOOK_SECRET not set — refusing unverifiable payload");
    return Response.json({ error: "Webhook not configured." }, { status: 503 });
  }

  // Audio deliveries carry a base64 MP3 of the whole call and arrive chunked.
  // They are megabytes, they are refused by the platform's request body limit
  // anyway, and this practice does not want vendor-held audio. Turn them away
  // before reading the body, and do it with a 200: a webhook is auto disabled
  // after ten consecutive failures, and an audio delivery must not be allowed
  // to take the transcript deliveries down with it.
  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    log("ignoring oversized delivery:", declaredLength, "bytes");
    return Response.json({ ok: true, ignored: "oversized" });
  }

  // Signature is computed over the exact bytes sent, so read the body as
  // text and parse only after verification passes.
  const raw = await req.text();
  const verdict = verifyElevenLabsSignature(
    raw,
    req.headers.get("elevenlabs-signature"),
    secret,
  );
  if (!verdict.ok) {
    err("rejected:", verdict.reason);
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: PostCallPayload;
  try {
    payload = JSON.parse(raw) as PostCallPayload;
  } catch {
    err("verified payload was not JSON");
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (payload.type !== "post_call_transcription") {
    log("ignoring event type:", payload.type);
    return Response.json({ ok: true, ignored: payload.type });
  }

  const data = payload.data;
  if (!data?.conversation_id) {
    err("payload missing conversation_id");
    return Response.json({ error: "Missing conversation_id." }, { status: 400 });
  }

  const turns: TranscriptTurn[] = (data.transcript ?? [])
    .filter((t) => typeof t.message === "string" && t.message.trim() !== "")
    .map((t) => {
      const role = t.role === "user" ? "user" : "agent";
      return {
        role,
        // Same rule as the live writer. The vendor's own copy of a turn keeps
        // Athena's square bracket stage directions, and the practice's record
        // holds what was said rather than how it was performed.
        message:
          role === "agent"
            ? stripAudioTags(t.message as string)
            : (t.message as string),
        timeInCallSecs: t.time_in_call_secs,
      } satisfies TranscriptTurn;
    });

  let stored: Awaited<ReturnType<typeof mergeTranscript>>;
  const startedAtSecs = data.metadata?.start_time_unix_secs;
  const deletion = data.metadata?.deletion_settings;
  const rawClientId =
    data.conversation_initiation_client_data?.dynamic_variables?.client_id;
  const clientId =
    typeof rawClientId === "string" && rawClientId.trim() !== "" ? rawClientId : undefined;

  try {
    // Merged, never replaced. The browser has usually already written this
    // session turn by turn, and this payload can legitimately arrive with
    // fewer turns than that record holds, or with none at all depending on the
    // workspace retention setting. A plain write would erase a complete
    // transcript in exactly the case the retry exists to protect.
    stored = await mergeTranscript({
      conversationId: data.conversation_id,
      agentId: data.agent_id ?? "",
      clientId,
      startedAt: startedAtSecs ? new Date(startedAtSecs * 1000).toISOString() : undefined,
      receivedAt: new Date().toISOString(),
      durationSeconds: data.metadata?.call_duration_secs,
      status: data.status,
      sources: ["post-call"],
      summary: data.analysis?.transcript_summary,
      callSuccessful: data.analysis?.call_successful,
      terminationReason: data.metadata?.termination_reason,
      // Recorded so the practice can answer, per client, where a disclosure
      // still exists and until when.
      vendorDeletion: deletion
        ? {
            deleteAtIso: deletion.deletion_time_unix_secs
              ? new Date(deletion.deletion_time_unix_secs * 1000).toISOString()
              : undefined,
            deleteTranscriptAndPii: deletion.delete_transcript_and_pii,
            deleteAudio: deletion.delete_audio,
          }
        : undefined,
      turns,
    });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      err("refused unencrypted write:", e.message);
      // 503 so ElevenLabs retries once the key is configured.
      return Response.json(
        { error: "Server storage is not configured securely." },
        { status: 503 },
      );
    }
    err("store failed:", e instanceof Error ? e.message : e);
    return Response.json({ error: "Unable to store transcript." }, { status: 500 });
  }

  // Log both numbers. A payload smaller than the stored record is the signal
  // that the live writer is carrying the session and this webhook is not.
  log(
    "stored transcript",
    data.conversation_id,
    `payload=${turns.length} turns`,
    `stored=${stored.turns.length} turns`,
    `sources=${(stored.sources ?? []).join("+") || "none"}`,
    `client=${stored.clientId ?? "unattached"}`,
  );
  return Response.json({
    ok: true,
    conversationId: data.conversation_id,
    turns: stored.turns.length,
  });
}

interface PostCallPayload {
  type?: string;
  data?: {
    agent_id?: string;
    conversation_id?: string;
    status?: string;
    transcript?: { role?: string; message?: string; time_in_call_secs?: number }[];
    metadata?: {
      start_time_unix_secs?: number;
      call_duration_secs?: number;
      termination_reason?: string;
      deletion_settings?: {
        deletion_time_unix_secs?: number;
        delete_transcript_and_pii?: boolean;
        delete_audio?: boolean;
      };
    };
    analysis?: {
      transcript_summary?: string;
      call_successful?: string;
    };
    conversation_initiation_client_data?: {
      dynamic_variables?: Record<string, unknown>;
    };
  };
}
