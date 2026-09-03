import { createSignedUrl, ConvAiNotConfiguredError } from "@/lib/athena/convai";
import { getRealClientByToken } from "@/lib/clients/real-client-store";
import { getLinkByToken } from "@/lib/athena-data";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mints the signed WebSocket URL the client's browser uses to talk to
// Athena. Public by necessity (clients are not signed in) but bound to a
// valid onboarding token, so a stranger cannot burn conversation minutes
// or open a session that is not attached to a real client file.
export async function GET(req: Request) {
  const rl = rateLimit("athena-signed-url", clientIp(req), 10, 60);
  if (!rl.allowed) return rateLimited(rl);

  const err = (...a: unknown[]) => console.error("[athena-signed-url]", ...a);

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return Response.json({ error: "token query param required." }, { status: 400 });
  }

  const realClient = await getRealClientByToken(token);
  const clientId = realClient?.id ?? getLinkByToken(token)?.clientId;
  if (!clientId) {
    return Response.json(
      { error: "Invalid or expired onboarding link." },
      { status: 403 },
    );
  }

  try {
    const signedUrl = await createSignedUrl();
    // clientId is echoed back so the browser can pass it to ElevenLabs as a
    // dynamic variable. The post-call webhook reads it back to attach the
    // transcript to the right client file.
    return Response.json({ signedUrl, clientId });
  } catch (e) {
    if (e instanceof ConvAiNotConfiguredError) {
      err(e.message);
      return Response.json(
        { error: "Athena's live session is not configured on this deployment." },
        { status: 503 },
      );
    }
    err("fatal:", e instanceof Error ? e.message : e);
    return Response.json({ error: "Unable to start the session." }, { status: 502 });
  }
}
