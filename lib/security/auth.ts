// Adviser credential verification and login throttling. Node runtime only.
//
// Passwords are never stored or compared in plaintext: AUTH_PASSWORD_HASH
// holds `scrypt$<salt hex>$<hash hex>` produced by
// `node scripts/generate-credentials.mjs <password>`. Verification uses
// scrypt (memory-hard, GPU-resistant) and a timing-safe comparison.

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = scryptSync(password, salt, expected.length, SCRYPT_OPTIONS);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Login throttling — 5 failures per IP locks the endpoint for 15 minutes.
// In-memory, so limits are per serverless instance; the SECURITY.md go-live
// checklist tracks moving this to a shared store for multi-region scale.

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type AttemptRecord = { count: number; lockedUntil: number };
const attempts = new Map<string, AttemptRecord>();

export function isLockedOut(ip: string): boolean {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (rec.lockedUntil && Date.now() < rec.lockedUntil) return true;
  if (rec.lockedUntil && Date.now() >= rec.lockedUntil) attempts.delete(ip);
  return false;
}

export function recordFailedAttempt(ip: string): void {
  const rec = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCKOUT_MS;
    rec.count = 0;
  }
  attempts.set(ip, rec);
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}
