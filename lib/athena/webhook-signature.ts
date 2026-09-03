// Verification for ElevenLabs post-call webhooks.
//
// ElevenLabs signs each delivery with an HMAC over `${timestamp}.${rawBody}`
// and sends it as `ElevenLabs-Signature: t=<unix seconds>,v0=<hex sha256>`.
// Under Zero Retention Mode this webhook is the ONLY copy of a discovery
// session, so an unverified or replayed payload must never reach the store.

import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_SECONDS = 30 * 60;

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: string };

export function verifyElevenLabsSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowMs: number = Date.now(),
): VerifyResult {
  if (!header) return { ok: false, reason: "missing signature header" };

  let timestamp = "";
  let digest = "";
  for (const part of header.split(",")) {
    const [k, v] = part.trim().split("=", 2);
    if (k === "t") timestamp = v ?? "";
    else if (k === "v0") digest = v ?? "";
  }
  if (!timestamp || !digest) return { ok: false, reason: "malformed signature header" };

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return { ok: false, reason: "invalid timestamp" };
  if (Math.abs(nowMs / 1000 - sentAt) > TOLERANCE_SECONDS) {
    return { ok: false, reason: "timestamp outside tolerance" };
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(digest, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature mismatch" };
  }
  return { ok: true };
}
