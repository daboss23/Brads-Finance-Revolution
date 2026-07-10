// HMAC-SHA256 signed session tokens.
//
// Uses the Web Crypto API only, so the same code verifies sessions in the
// Edge middleware and issues them in Node API routes. Tokens are stateless:
// `v1.<base64url payload>.<base64url signature>` with an expiry baked into
// the signed payload, so tampering with any byte invalidates the session.

export const SESSION_COOKIE = "bmk_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hour adviser workday

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
};

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string, usage: KeyUsage): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

export async function createSessionToken(secret: string, sub = "adviser"): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    jti: toBase64Url(crypto.getRandomValues(new Uint8Array(12))),
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret, "sign");
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`v1.${body}`));
  return `v1.${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const [, body, sig] = parts;

  const sigBytes = fromBase64Url(sig);
  if (!sigBytes) return null;

  // crypto.subtle.verify is constant-time; forged signatures always fail here
  // before the payload is ever trusted.
  const key = await hmacKey(secret, "verify");
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as unknown as ArrayBuffer,
    encoder.encode(`v1.${body}`),
  );
  if (!valid) return null;

  const payloadBytes = fromBase64Url(body);
  if (!payloadBytes) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
    if (typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SESSION_SECRET && process.env.AUTH_PASSWORD_HASH);
}
