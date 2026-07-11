// Encrypted server-side state for adviser UI stores (review checklist,
// SOA documents, strategy selections). Replaces browser localStorage as
// the source of truth: the browser keeps a cache for instant reads, but
// the durable copy lives in the encrypted secure store and follows Brad
// across machines and browser resets.

import { secureSet, secureList, EncryptionKeyMissingError } from "@/lib/secure-store";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_NAMESPACES = new Set([
  "review-store",
  "soa-documents",
  "client-strategies",
  "voice-learner",
]);

export async function POST(req: Request) {
  const rl = rateLimit("state-write", clientIp(req), 120, 60);
  if (!rl.allowed) return rateLimited(rl);

  const body = (await req.json().catch(() => null)) as {
    namespace?: string;
    key?: string;
    value?: unknown;
  } | null;
  if (!body?.namespace || !body.key || body.value === undefined) {
    return Response.json(
      { error: "namespace, key and value are required." },
      { status: 400 },
    );
  }
  if (!ALLOWED_NAMESPACES.has(body.namespace)) {
    return Response.json({ error: "Unknown namespace." }, { status: 400 });
  }
  try {
    await secureSet(body.namespace, body.key, body.value);
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      return Response.json(
        { error: "Server storage is not configured securely." },
        { status: 503 },
      );
    }
    throw e;
  }
}

export async function GET(req: Request) {
  const namespace = new URL(req.url).searchParams.get("namespace");
  if (!namespace || !ALLOWED_NAMESPACES.has(namespace)) {
    return Response.json({ error: "Unknown namespace." }, { status: 400 });
  }
  const entries = await secureList<unknown>(namespace);
  const state: Record<string, unknown> = {};
  for (const { key, value } of entries) state[key] = value;
  return Response.json({ state });
}
