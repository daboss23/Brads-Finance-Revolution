// Reads a stopped client's answers out of their discovery conversation.
//
// Adviser side. Not in the middleware's public list, so it needs a signed in
// adviser session like every other client route.
//
// Deliberately a POST Brad presses rather than something that runs on page
// load. It spends Anthropic credit, and a route that quietly bills the practice
// every time someone opens a client record is a route that gets turned off.

import {
  getDiscoverySessions,
  type DiscoverySession,
} from "@/lib/athena/discovery-sessions";
import {
  extractAnswers,
  ExtractionUnavailableError,
} from "@/lib/athena/answer-extraction";
import {
  persistPartialFactFind,
  getPartialFactFind,
} from "@/lib/secure-store/partial-fact-find-persistence";
import { EncryptionKeyMissingError } from "@/lib/secure-store";
import { getFactFind } from "@/lib/athena-fact-find-store";
import { ensureFactFindsHydrated } from "@/lib/secure-store/fact-find-persistence";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** The session worth reading: the most recent unfinished one that has answers. */
function sessionToExtract(
  sessions: DiscoverySession[],
): DiscoverySession | undefined {
  return sessions.find((s) => s.status !== "completed" && s.answerCount > 0);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  // A real extraction is one call per client per stop. This cap is far above
  // that and far below anything that could run up a bill by held enter key.
  const rl = rateLimit("extract-answers", clientIp(req), 10, 60);
  if (!rl.allowed) return rateLimited(rl);

  const err = (...a: unknown[]) => console.error("[extract-answers]", ...a);
  const clientId = params.id;

  // A client who came back and finished has a confirmed fact find, which beats
  // anything read out of a transcript. Refuse rather than offer a second,
  // worse answer to the same question.
  await ensureFactFindsHydrated();
  if (getFactFind(clientId)) {
    return Response.json(
      {
        error:
          "This client has a completed fact find. Their confirmed answers are already on this page.",
      },
      { status: 409 },
    );
  }

  const sessions = await getDiscoverySessions(clientId);
  const session = sessionToExtract(sessions);
  if (!session) {
    return Response.json(
      { error: "This client has no unfinished session with answers in it." },
      { status: 404 },
    );
  }

  // Nothing new has been said since the last read, so there is nothing to buy.
  const existing = await getPartialFactFind(clientId);
  const force = new URL(req.url).searchParams.get("force") === "true";
  if (
    !force &&
    existing &&
    existing.threadId === session.threadId &&
    existing.turnCount >= session.turns.length
  ) {
    return Response.json({
      ok: true,
      reused: true,
      fieldCount: existing.fieldCount,
      extractedAt: existing.extractedAt,
    });
  }

  try {
    const { data, fieldCount, model } = await extractAnswers(session.turns);

    await persistPartialFactFind({
      clientId,
      threadId: session.threadId,
      extractedAt: new Date().toISOString(),
      turnCount: session.turns.length,
      fieldCount,
      model,
      data,
    });

    return Response.json({ ok: true, reused: false, fieldCount });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      err("refused unencrypted write:", e.message);
      return Response.json(
        { error: "Server storage is not configured securely." },
        { status: 503 },
      );
    }
    if (e instanceof ExtractionUnavailableError) {
      err(e.reason, e.message);
      // The adviser is the one who can fix a credential or a model that is not
      // enabled, so unlike the client facing routes this one says what broke.
      return Response.json(
        { error: e.message, reason: e.reason },
        { status: e.reason === "no_answers" ? 404 : 503 },
      );
    }
    err("failed:", e instanceof Error ? e.message : e);
    return Response.json(
      { error: "Could not read this session." },
      { status: 500 },
    );
  }
}
