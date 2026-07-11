import { getFactFind } from "@/lib/sarah-fact-find-store";
import {
  persistFactFind,
  ensureFactFindsHydrated,
} from "@/lib/secure-store/fact-find-persistence";
import { EncryptionKeyMissingError } from "@/lib/secure-store";
import type { SarahFactFind } from "@/lib/sarah-fact-find-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  const log = (...a: unknown[]) => console.log(`[complete-fact-find:${reqId}]`, ...a);
  const err = (...a: unknown[]) => console.error(`[complete-fact-find:${reqId}]`, ...a);

  try {
    const body = await req.json().catch((e) => {
      err("invalid JSON:", e);
      return null;
    });
    if (!body) {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { clientId, token, data } = body as {
      clientId?: string;
      token?: string;
      data?: SarahFactFind;
    };

    if (!clientId || !token || !data) {
      err("missing fields", { clientId: !!clientId, token: !!token, data: !!data });
      return Response.json(
        { error: "clientId, token and data are required." },
        { status: 400 },
      );
    }

    try {
      await persistFactFind({
        clientId,
        token,
        receivedAt: new Date().toISOString(),
        data,
      });
    } catch (e) {
      if (e instanceof EncryptionKeyMissingError) {
        err("refused unencrypted write:", e.message);
        return Response.json(
          { error: "Server storage is not configured securely. Data was not saved." },
          { status: 503 },
        );
      }
      throw e;
    }

    log("Sarah fact find received for", clientId, "via token", token);
    // Stub notification — wire to email/Slack when integrations come online.
    console.log(`[notify] Brad: fact find ready for client ${clientId}`);

    return Response.json({
      ok: true,
      clientId,
      completionPercentage: data.completionPercentage,
    });
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    err("fatal:", m);
    return Response.json({ error: `Fatal: ${m}` }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await ensureFactFindsHydrated();
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "clientId query param required." }, { status: 400 });
  }
  const entry = getFactFind(clientId);
  if (!entry) return Response.json({ found: false });
  return Response.json({ found: true, ...entry });
}
