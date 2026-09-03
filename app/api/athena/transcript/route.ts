import {
  mergeTranscript,
  type TranscriptSource,
  type TranscriptTurn,
} from "@/lib/secure-store/transcript-persistence";
import { EncryptionKeyMissingError } from "@/lib/secure-store";
import { getRealClientByToken } from "@/lib/clients/real-client-store";
import { getLinkByToken } from "@/lib/athena-data";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Caps. A discovery session is roughly eighty turns of ordinary speech, so
// these sit far above a real conversation and far below anything that could
// be used to fill the store through a leaked onboarding link.
const MAX_TURNS = 400;
const MAX_MESSAGE_CHARS = 8_000;

// Live capture of a discovery session, written as it happens.
//
// This is the route that makes the practice, rather than ElevenLabs, the
// system of record. The completion tool only fires when a client reaches the
// end, and most of the value is lost before that: a client who stops at
// question six has still told us their income, their debts and their goals.
// Without this route that session exists only in the vendor's dashboard.
//
// Public by necessity, because clients are not signed in. Two things keep
// that safe: the onboarding token has to resolve to a real client file, and
// the client id is taken from that token rather than from the request body,
// so a valid link can only ever write to its own client's session.
export async function POST(req: Request) {
  // Generous: a fifteen minute session flushes every few seconds.
  const rl = rateLimit("athena-transcript", clientIp(req), 200, 60);
  if (!rl.allowed) return rateLimited(rl);

  const err = (...a: unknown[]) => console.error("[athena-transcript]", ...a);

  const body = await req.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { token, conversationId, turns, source, completed, startedAt } = body as {
    token?: string;
    conversationId?: string;
    turns?: unknown;
    source?: TranscriptSource;
    completed?: boolean;
    startedAt?: string;
  };

  if (!token || !conversationId || !Array.isArray(turns)) {
    return Response.json(
      { error: "token, conversationId and turns are required." },
      { status: 400 },
    );
  }

  if (turns.length > MAX_TURNS) {
    return Response.json({ error: "Too many turns." }, { status: 413 });
  }

  // The client id comes from the token, never from the caller. A valid
  // onboarding link must not be able to write into someone else's file.
  const realClient = await getRealClientByToken(token);
  const clientId = realClient?.id ?? getLinkByToken(token)?.clientId;
  if (!clientId) {
    return Response.json(
      { error: "Invalid or expired onboarding link." },
      { status: 403 },
    );
  }

  const clean: TranscriptTurn[] = [];
  for (const t of turns) {
    const turn = t as { role?: unknown; message?: unknown; timeInCallSecs?: unknown };
    if (typeof turn.message !== "string") continue;
    const message = turn.message.trim();
    if (!message) continue;
    clean.push({
      role: turn.role === "user" ? "user" : "agent",
      message: message.slice(0, MAX_MESSAGE_CHARS),
      timeInCallSecs:
        typeof turn.timeInCallSecs === "number" ? turn.timeInCallSecs : undefined,
    });
  }

  try {
    const stored = await mergeTranscript({
      conversationId,
      agentId: process.env.ELEVENLABS_AGENT_ID ?? "",
      clientId,
      startedAt,
      receivedAt: new Date().toISOString(),
      status: completed ? "completed" : "in-progress",
      sources: [source === "text" ? "text" : "live"],
      completed: Boolean(completed),
      turns: clean,
    });
    return Response.json({ ok: true, turns: stored.turns.length });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      err("refused unencrypted write:", e.message);
      return Response.json(
        { error: "Server storage is not configured securely." },
        { status: 503 },
      );
    }
    err("store failed:", e instanceof Error ? e.message : e);
    return Response.json({ error: "Unable to store transcript." }, { status: 500 });
  }
}
