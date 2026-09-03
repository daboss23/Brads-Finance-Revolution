import { verifyElevenLabsSignature } from "@/lib/athena/webhook-signature";
import { persistTranscript, type TranscriptTurn } from "@/lib/secure-store/transcript-persistence";
import { EncryptionKeyMissingError } from "@/lib/secure-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    .map((t) => ({
      role: t.role === "user" ? "user" : "agent",
      message: t.message as string,
      timeInCallSecs: t.time_in_call_secs,
    }));

  const startedAtSecs = data.metadata?.start_time_unix_secs;
  const rawClientId =
    data.conversation_initiation_client_data?.dynamic_variables?.client_id;
  const clientId =
    typeof rawClientId === "string" && rawClientId.trim() !== "" ? rawClientId : undefined;

  try {
    await persistTranscript({
      conversationId: data.conversation_id,
      agentId: data.agent_id ?? "",
      clientId,
      startedAt: startedAtSecs ? new Date(startedAtSecs * 1000).toISOString() : undefined,
      receivedAt: new Date().toISOString(),
      durationSeconds: data.metadata?.call_duration_secs,
      status: data.status,
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

  log("stored transcript", data.conversation_id, `${turns.length} turns`, `client=${clientId ?? "unattached"}`);
  return Response.json({ ok: true, conversationId: data.conversation_id });
}

interface PostCallPayload {
  type?: string;
  data?: {
    agent_id?: string;
    conversation_id?: string;
    status?: string;
    transcript?: { role?: string; message?: string; time_in_call_secs?: number }[];
    metadata?: { start_time_unix_secs?: number; call_duration_secs?: number };
    conversation_initiation_client_data?: {
      dynamic_variables?: Record<string, unknown>;
    };
  };
}
