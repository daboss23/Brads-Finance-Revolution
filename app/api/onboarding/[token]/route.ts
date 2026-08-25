// Public token check for client onboarding links. Returns only the
// client's first name and id — never financial data — so the intro
// screen can greet the client. Rate limited against token guessing.

import { getRealClientByToken } from "@/lib/clients/real-client-store";
import { getLinkByToken } from "@/lib/sarah-data";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { token: string } },
) {
  const rl = rateLimit("onboarding-token", clientIp(req), 20, 60);
  if (!rl.allowed) return rateLimited(rl);

  const real = await getRealClientByToken(params.token);
  if (real) {
    return Response.json({ valid: true, clientId: real.id, clientName: real.name });
  }
  const demo = getLinkByToken(params.token);
  if (demo) {
    return Response.json({ valid: true, clientId: demo.clientId, clientName: demo.clientName });
  }
  return Response.json({ valid: false }, { status: 404 });
}
