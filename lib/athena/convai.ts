// ElevenLabs Conversational AI (ConvAI) helpers for Athena's live session.
//
// This is the path that carries a real discovery session. The agent runs its
// own LLM on ElevenLabs' side, so a live session costs nothing against the
// practice's Anthropic balance and survives that balance running dry. The
// text fallback in AthenaChat is the opposite: every turn is an Anthropic
// call.
//
// The durable copy of a session is written by this platform, AES-256-GCM
// encrypted, from the post-call webhook and from the submit_fact_find client
// tool. See SECURITY.md §10 for the retention posture, and confirm the
// agent's privacy settings in the ElevenLabs dashboard match what that
// section claims.

const API_ROOT = "https://api.elevenlabs.io/v1/convai";
const SIGNED_URL_ENDPOINT = `${API_ROOT}/conversation/get-signed-url`;

export class ConvAiNotConfiguredError extends Error {}

export function convAiConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_AGENT_ID);
}

// Mint a short-lived signed WebSocket URL so the browser can open the
// session without ever seeing ELEVENLABS_API_KEY.
export async function createSignedUrl(): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) {
    throw new ConvAiNotConfiguredError(
      "ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must both be set.",
    );
  }

  const url = `${SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(agentId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "xi-api-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs signed-url failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const body = (await res.json()) as { signed_url?: string };
  if (!body.signed_url) {
    throw new Error("ElevenLabs returned no signed_url.");
  }
  return body.signed_url;
}

export type ConvAiProbe =
  | { ok: true; agentName: string }
  | { ok: false; reason: "not_configured" | "rejected" | "unreachable"; detail: string };

// Ask ElevenLabs whether the configured agent actually exists and the key can
// reach it. A present environment variable proves nothing: a revoked key, a
// deleted agent and a typo in the id all read as "configured" but fail the
// moment a client clicks begin. The health check calls this so that failure
// is visible to the adviser before it is visible to a client.
export async function probeConvAi(): Promise<ConvAiProbe> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const agentId = process.env.ELEVENLABS_AGENT_ID?.trim();
  if (!apiKey || !agentId) {
    return {
      ok: false,
      reason: "not_configured",
      detail: `Missing ${!apiKey ? "ELEVENLABS_API_KEY" : "ELEVENLABS_AGENT_ID"}.`,
    };
  }

  try {
    const res = await fetch(`${API_ROOT}/agents/${encodeURIComponent(agentId)}`, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      return {
        ok: false,
        reason: "rejected",
        detail: `ElevenLabs returned ${res.status} for agent ${agentId}. ${detail}`,
      };
    }

    const body = (await res.json()) as { name?: string };
    return { ok: true, agentName: body.name ?? agentId };
  } catch (e) {
    return {
      ok: false,
      reason: "unreachable",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}
