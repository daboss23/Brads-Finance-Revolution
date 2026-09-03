// Mints a short-lived signed URL so the browser can open a WebSocket straight
// to Athena's ElevenLabs agent. The API key stays server side.
//
// Gated on the onboarding token: without this check anyone who found the route
// could open sessions against the agent and burn conversational minutes.

import { getRealClientByToken } from "@/lib/clients/real-client-store";
import { getLinkByToken } from "@/lib/sarah-data";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNED_URL_ENDPOINT =
  "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";

export async function POST(req: Request) {
  const rl = rateLimit("athena-session", clientIp(req), 10, 60);
  if (!rl.allowed) return rateLimited(rl);

  const reqId = Math.random().toString(36).slice(2, 8);
  const log = (...a: unknown[]) => console.log(`[athena-session:${reqId}]`, ...a);
  const err = (...a: unknown[]) => console.error(`[athena-session:${reqId}]`, ...a);

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    if (!apiKey) {
      err("Missing ELEVENLABS_API_KEY");
      return Response.json(
        { error: "Server misconfigured: ELEVENLABS_API_KEY not set." },
        { status: 500 },
      );
    }
    if (!agentId) {
      err("Missing ELEVENLABS_AGENT_ID");
      return Response.json(
        { error: "Server misconfigured: ELEVENLABS_AGENT_ID not set." },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => null);
    const token = (body as { token?: unknown } | null)?.token;
    if (typeof token !== "string" || !token) {
      return Response.json({ error: "Missing token." }, { status: 400 });
    }

    const real = await getRealClientByToken(token);
    const demo = real ? undefined : getLinkByToken(token);
    const client = real
      ? { id: real.id, name: real.name }
      : demo
        ? { id: demo.clientId, name: demo.clientName }
        : null;

    if (!client) {
      err("invalid onboarding token");
      return Response.json(
        { error: "Invalid or expired onboarding link." },
        { status: 403 },
      );
    }

    const url = `${SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(agentId)}`;
    const upstream = await fetch(url, { headers: { "xi-api-key": apiKey } });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      err("ElevenLabs signed-url failed:", upstream.status, detail.slice(0, 400));
      return Response.json(
        { error: `Could not start the session (${upstream.status}).` },
        { status: 502 },
      );
    }

    const payload = (await upstream.json()) as { signed_url?: string };
    if (!payload.signed_url) {
      err("ElevenLabs returned no signed_url");
      return Response.json(
        { error: "Could not start the session." },
        { status: 502 },
      );
    }

    log("signed url issued for client", client.id);
    return Response.json(
      { signedUrl: payload.signed_url, clientId: client.id, clientName: client.name },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    const anyErr = e as { message?: string };
    err("Fatal:", anyErr?.message);
    return Response.json({ error: "Could not start the session." }, { status: 500 });
  }
}
