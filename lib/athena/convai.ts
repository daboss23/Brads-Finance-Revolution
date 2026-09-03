// ElevenLabs Conversational AI (ConvAI) helpers for Athena's live session.
//
// Athena's agent runs under Zero Retention Mode: ElevenLabs holds no
// transcript, no audio and no PII once a call ends. The only durable copy
// of a discovery session is the one this platform writes, AES-256-GCM
// encrypted, from the post-call webhook. See SECURITY.md §10.

const SIGNED_URL_ENDPOINT =
  "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";

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
