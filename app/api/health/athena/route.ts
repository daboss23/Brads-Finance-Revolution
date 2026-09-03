import Anthropic from "@anthropic-ai/sdk";
import { anthropicCredentialStatus } from "@/lib/ai/anthropic-credentials";
import { ATHENA_MODEL } from "@/lib/ai/athena-model";

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

  const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
  const checks: Record<string, unknown> = {
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

  if (!credential.configured) {
    return Response.json(
      {
        ok: false,
        athenaCanRun: false,
        problem: credential.detail,
        fix:
          credential.reason === "missing"
            ? "Set ANTHROPIC_API_KEY for the Production environment, then redeploy. Environment variables are not picked up by an already-running deployment."
            : "Re-paste ANTHROPIC_API_KEY. The stored value does not look like an Anthropic key, which usually means a truncated paste or the wrong secret.",
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
    console.error("[health/athena] provider call failed:", apiErr?.status, apiErr?.message);
    return Response.json(
      {
        ok: false,
        athenaCanRun: false,
        problem: `The Anthropic key is well formed but the provider rejected the call (${apiErr?.status ?? "no status"}).`,
        detail: apiErr?.message ?? "Unknown provider error.",
        fix:
          apiErr?.status === 401
            ? "The key is not valid. Check it has not been revoked, and that the value in this environment has no stray whitespace."
            : apiErr?.status === 404
              ? `The workspace cannot call ${ATHENA_MODEL}. Confirm the model is enabled for the account behind this key.`
              : apiErr?.status === 429
                ? "Rate limited or out of credit. Check the workspace balance and limits."
                : "See the detail above and the function logs for the full provider response.",
        checks,
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, athenaCanRun: true, checks });
}
