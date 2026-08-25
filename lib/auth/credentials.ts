// Adviser credential verification with scrypt password hashing and
// failed-attempt lockout. Node runtime only.
//
// Configuration (see SECURITY.md §9):
//   ADVISER_EMAIL          — the adviser's sign-in email
//   ADVISER_PASSWORD_HASH  — scrypt hash, format scrypt.<salt-b64>.<hash-b64>
//   ADVISER_TOTP_SECRET    — optional base32 TOTP secret; when set, a
//                            6-digit authenticator code is required
//   AUTH_SESSION_SECRET    — 32+ byte random string signing session cookies
//
// Auth is ENFORCED whenever ADVISER_PASSWORD_HASH and AUTH_SESSION_SECRET
// are both set. Without them the platform runs open (demo mode) and logs
// a loud warning in production.

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { secureAppend } from "../secure-store";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt.${salt.toString("base64url")}.${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(".");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "base64url");
  const expected = Buffer.from(parts[2], "base64url");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

export function authConfigured(): boolean {
  return Boolean(process.env.ADVISER_PASSWORD_HASH && process.env.AUTH_SESSION_SECRET);
}

// ── Lockout tracking ─────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface Attempts {
  count: number;
  lockedUntil: number;
}

const LOCK_KEY = "__bmk_login_attempts__";

function attemptsMap(): Map<string, Attempts> {
  const g = globalThis as unknown as Record<string, Map<string, Attempts> | undefined>;
  if (!g[LOCK_KEY]) g[LOCK_KEY] = new Map();
  return g[LOCK_KEY] as Map<string, Attempts>;
}

export function isLockedOut(id: string): number {
  const a = attemptsMap().get(id);
  if (a && a.lockedUntil > Date.now()) {
    return Math.ceil((a.lockedUntil - Date.now()) / 1000);
  }
  return 0;
}

export function recordFailure(id: string, ip: string): void {
  const map = attemptsMap();
  const a = map.get(id) ?? { count: 0, lockedUntil: 0 };
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) {
    a.lockedUntil = Date.now() + LOCKOUT_MS;
    a.count = 0;
    void securityEvent("login-lockout", { id, ip });
  }
  map.set(id, a);
  void securityEvent("login-failed", { id, ip });
}

export function recordSuccess(id: string, ip: string): void {
  attemptsMap().delete(id);
  void securityEvent("login-success", { id, ip });
}

// Permanent encrypted copy of every security event.
export async function securityEvent(
  event: string,
  details: Record<string, unknown>,
): Promise<void> {
  try {
    await secureAppend("security-events", {
      event,
      timestamp: new Date().toISOString(),
      ...details,
    });
  } catch (e) {
    console.error("[auth] security event write failed:", e instanceof Error ? e.message : e);
  }
}
