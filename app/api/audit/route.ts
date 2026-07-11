import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";
// Durable audit trail endpoint.
//
// Compliance and security events are appended to the encrypted secure
// store (Postgres when DATABASE_URL is set, encrypted local files
// otherwise), giving a permanent, queryable history that survives the
// browser and server restarts alike.

import { secureAppend, secureEvents } from "@/lib/secure-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAMESPACE = "audit-trail";

interface AuditEventBody {
  clientId?: string;
  action?: string;
  actor?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
  complianceVersion?: string;
}

export async function POST(req: Request) {
  const rl = rateLimit("audit", clientIp(req), 60, 60);
  if (!rl.allowed) return rateLimited(rl);
  try {
    const body = (await req.json().catch(() => null)) as AuditEventBody | null;
    if (!body || !body.clientId || !body.action) {
      return Response.json({ error: "clientId and action are required." }, { status: 400 });
    }
    await secureAppend(NAMESPACE, {
      clientId: body.clientId,
      action: body.action,
      actor: body.actor ?? "System",
      timestamp: body.timestamp ?? new Date().toISOString(),
      details: body.details ?? {},
      complianceVersion: body.complianceVersion ?? "unknown",
    });
    return Response.json({ ok: true });
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    console.error("[audit] append failed:", m);
    return Response.json({ error: m }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  const events = await secureEvents<AuditEventBody>(NAMESPACE, 1000);
  const filtered = clientId ? events.filter((e) => e.clientId === clientId) : events;
  return Response.json({ events: filtered });
}
