import Anthropic from "@anthropic-ai/sdk";
import { anthropicCredentialStatus } from "@/lib/ai/anthropic-credentials";
import { ATHENA_MODEL } from "@/lib/ai/athena-model";
import { probeConvAi } from "@/lib/athena/convai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Adviser-only diagnostic for Athena's live session.
//
// When a client sees "Athena could not connect" the cause is upstream of the
// browser and invisible from it: a missing key, a key the provider rejects, a
// model the workspace cannot call. This endpoint answers that in one request
// so nobody has to read function logs to find out which.
//
// It sits under /api/health/, which is NOT a public prefix in middleware.ts,
// so it requires the adviser session. It reports whether credentials work,
// never what they are.
export async function GET() {
  const credential = anthropicCredentialStatus();

  // The live agent is the path a client actually gets, so test it first and
  // test it for real. A present ELEVENLABS_AGENT_ID proves nothing.
  const convAi = await probeConvAi();

  const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
  const checks: Record<string, unknown> = {
    voiceSessionReachable: convAi.ok,
    voiceSessionDetail: convAi.ok
      ? `Live agent "${convAi.agentName}" is reachable.`
      : convAi.detail,
    anthropicKeyConfigured: credential.configured,
    elevenLabsKeyConfigured: Boolean(elevenKey),
    elevenLabsVoiceIdConfigured: Boolean(process.env.ELEVENLABS_VOICE_ID?.trim()),
    elevenLabsAgentIdConfigured: Boolean(process.env.ELEVENLABS_AGENT_ID?.trim()),
    elevenLabsWebhookSecretConfigured: Boolean(
      process.env.ELEVENLABS_WEBHOOK_SECRET?.trim(),
    ),
    encryptionKeyConfigured: Boolean(process.env.DATA_ENCRYPTION_KEY?.trim()),
    model: ATHENA_MODEL,
  };

  // A reachable live agent means discovery works regardless of Anthropic:
  // the agent runs its own model. Report that plainly instead of failing the
  // whole check on a credential the client-facing session no longer needs.
  if (convAi.ok) {
    const anthropicNote = credential.configured
      ? "The Anthropic text fallback is also configured."
      : `The Anthropic text fallback is unavailable (${credential.detail}), which does not affect live discovery sessions.`;

    return Response.json({
      ok: true,
      athenaCanRun: true,
      sessionMode: "voice",
      note: `Clients get the live ElevenLabs session. ${anthropicNote}`,
      checks,
    });
  }

  if (!credential.configured) {
    return Response.json(
      {
        ok: false,
        athenaCanRun: false,
        sessionMode: "unavailable",
        problem: `Neither Athena can run. Live session: ${convAi.detail} Text fallback: ${credential.detail}`,
        // Restoring the live agent is the higher leverage repair: it carries
        // the real discovery conversation and costs nothing per session,
        // whereas the text fallback bills Anthropic for every turn. Lead with
        // it, and give the Anthropic fix second.
        fix: `${
          convAi.reason === "not_configured"
            ? "First, set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID for the Production environment and redeploy. That restores the live spoken session, which does not use the Anthropic balance."
            : "First, restore the live agent: confirm ELEVENLABS_AGENT_ID matches an agent that still exists in the ElevenLabs workspace and that ELEVENLABS_API_KEY has not been revoked. That session does not use the Anthropic balance."
        } Then, for the text fallback: ${
          credential.reason === "missing"
            ? "set ANTHROPIC_API_KEY for the Production environment and redeploy. Environment variables are not picked up by an already-running deployment."
            : "re-paste ANTHROPIC_API_KEY. The stored value does not look like an Anthropic key, which usually means a truncated paste or the wrong secret."
        }`,
        checks,
      },
      { status: 503 },
    );
  }

  // Smallest possible live call. This is what separates "the key is present"
  // from "the provider accepts it for this model".
  try {
    const anthropic = new Anthropic({ apiKey: credential.key });
    await anthropic.messages.create({
      model: ATHENA_MODEL,
      max_tokens: 1,
      messages: [{ role: "user", content: "ping" }],
    });
  } catch (e: unknown) {
    const apiErr = e as { status?: number; message?: string };
    const message = apiErr?.message ?? "Unknown provider error.";
    console.error("[health/athena] provider call failed:", apiErr?.status, message);

    // An exhausted balance is a 400 invalid_request_error, not a 429, so it
    // has to be recognised by message or it reads as a generic bad request.
    const outOfCredit = /credit balance is too low|insufficient credit/i.test(message);

    return Response.json(
      {
        ok: false,
        athenaCanRun: false,
        sessionMode: "unavailable",
        problem: outOfCredit
          ? "The Anthropic key is valid but the workspace has no credit left, so every Athena session will fail."
          : `The Anthropic key is well formed but the provider rejected the call (${apiErr?.status ?? "no status"}).`,
        detail: message,
        fix: outOfCredit
          ? `Either restore the live ElevenLabs session, which does not use the Anthropic balance (${convAi.detail}), or top up at console.anthropic.com under Billing. No redeploy is needed once credit is added.`
          : apiErr?.status === 401
            ? "The key is not valid. Check it has not been revoked, and that the value in this environment has no stray whitespace."
            : apiErr?.status === 403
              ? `The key does not have access to ${ATHENA_MODEL}. Check the key's permissions in the Console.`
              : apiErr?.status === 404
                ? `The workspace cannot call ${ATHENA_MODEL}. Confirm the model is enabled for the account behind this key.`
                : apiErr?.status === 429
                  ? "Rate limited. Check the workspace rate limits, then retry."
                  : "See the detail above and the function logs for the full provider response.",
        checks,
      },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    athenaCanRun: true,
    sessionMode: "text",
    note: `Clients get the Anthropic text session because the live agent is unreachable: ${convAi.detail} Every session bills the Anthropic balance until that is fixed.`,
    checks,
  });
}
