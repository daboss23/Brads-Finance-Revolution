// Client records API. Protected by the auth middleware — only a signed-in
// adviser can list or create clients.

import {
  createRealClient,
  listRealClients,
  toClient,
} from "@/lib/clients/real-client-store";
import { EncryptionKeyMissingError } from "@/lib/secure-store";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const records = await listRealClients();
  return Response.json({
    clients: records.map(toClient),
    tokens: Object.fromEntries(records.map((r) => [r.id, r.token])),
  });
}

export async function POST(req: Request) {
  const rl = rateLimit("client-create", clientIp(req), 30, 60);
  if (!rl.allowed) return rateLimited(rl);

  const body = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    mobile?: string;
    notes?: string;
  } | null;

  if (!body?.name?.trim() || !body.email?.trim() || !body.mobile?.trim()) {
    return Response.json(
      { error: "Name, email and mobile are required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return Response.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  try {
    const record = await createRealClient({
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      notes: body.notes,
    });
    return Response.json({
      ok: true,
      client: toClient(record),
      onboardingPath: `/onboarding/${record.token}`,
    });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      return Response.json(
        { error: "Server storage is not configured securely. Client was not saved." },
        { status: 503 },
      );
    }
    throw e;
  }
}
