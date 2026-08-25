# BMK CRM Security Model

This document describes how client data is protected in the BMK CRM
platform and what must be configured before real client data is stored.

## 1. What is protected

- **Fact finds** — the full client financial picture collected by Sarah
  (income, assets, debts, super, insurance, goals, health, estate).
- **Audit trail** — every compliance action (check runs, sign-offs,
  certificate generation) with actor and timestamp.

## 2. Encryption at rest

All client records are encrypted **by the application** with
**AES-256-GCM** before they reach any storage backend
(`lib/secure-store/crypto.ts`). The stored value is an `enc1.…` envelope
containing IV, authentication tag, and ciphertext. Consequences:

- A stolen database, disk, or backup yields only ciphertext.
- GCM authenticates as well as encrypts — a tampered record fails
  decryption loudly rather than silently returning corrupted data.
- The database provider never sees plaintext client data.

## 3. Fails closed

In production (`NODE_ENV=production`), if `DATA_ENCRYPTION_KEY` is not
set the platform **refuses to write client data at all** (HTTP 503 on
save). Plaintext PII at rest is never a possible state. In development a
dev-only derived key is used so the sandbox runs with zero setup.

## 4. Storage backends

`lib/secure-store/backend.ts` selects automatically:

| Backend | When | Notes |
|---|---|---|
| Postgres | `DATABASE_URL` is set | Neon, Supabase, Vercel Postgres all work |
| Encrypted local files | otherwise | `.data/secure-store/`, for dev/sandbox |

Fact finds are rehydrated from encrypted storage at every server boot,
so data survives restarts and deploys.

## 5. Durable audit trail

Compliance audit events are appended server-side via `/api/audit` into
the same encrypted store (append-only `secure_events` table in
Postgres). The browser localStorage copy is a UI cache only.

## 6. Production activation (~10 minutes)

1. Create a Postgres database (Neon free tier is fine to start).
2. Run the schema once: `psql "$DATABASE_URL" -f db/schema.sql`
3. In Vercel → Project → Settings → Environment Variables, set
   `DATABASE_URL` and `DATA_ENCRYPTION_KEY` (see §7), then redeploy.

## 7. Key generation and handling

Generate a 32-byte key:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- Store it only in Vercel environment variables (or a secret manager).
- Never commit it, never log it, never email it.
- **Losing the key means losing access to all encrypted data** — keep a
  copy in a password manager Brad controls.
- To rotate: decrypt-and-re-encrypt migration is required (the `enc1.`
  version prefix exists so a future `enc2.` rotation can run in place).

## 8. Rate limiting

All public endpoints are rate limited per source IP
(`lib/rate-limit.ts`): sign-in (10/min with 15-minute lockout after 5
failed attempts), fact-find submission (10/min), Sarah conversation
(30/min), transcription (30/min), audit and state writes. Limits are
per server instance — adequate for a single-adviser deployment; swap in
a shared store (Upstash/Postgres) when going multi-instance.

## 9. Adviser sign-in with MFA

Session-cookie authentication protects every adviser page and API.
Client-facing onboarding stays public (clients authenticate via their
per-session link token). Enforcement switches on when both
`ADVISER_PASSWORD_HASH` and `AUTH_SESSION_SECRET` are set; without them
the platform runs open in demo mode and logs a warning.

Setup:

```bash
# 1. Password hash (prompts so the password never lands in shell history):
npx tsx scripts/hash-password.ts

# 2. Session secret:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Optional TOTP secret for authenticator-app MFA:
npx tsx -e "import {generateTotpSecret, otpauthUrl} from './lib/auth/totp'; const s=generateTotpSecret(); console.log(s); console.log(otpauthUrl(s,'brad@bmk.com.au'))"
```

Set in Vercel: `ADVISER_EMAIL`, `ADVISER_PASSWORD_HASH`,
`AUTH_SESSION_SECRET`, and optionally `ADVISER_TOTP_SECRET` (scan the
otpauth URL as a QR code into Google Authenticator/Authy/1Password).

Properties: scrypt password hashing, constant-time comparison, uniform
error messages (no user enumeration), 15-minute lockout after 5
failures, HMAC-SHA256 signed HttpOnly SameSite cookies with 12-hour
expiry, RFC 6238 TOTP with ±1 step drift tolerance, and every sign-in,
failure, lockout, and logout appended to the encrypted security event
log.

## 10. Known gaps / roadmap

In priority order:

1. Multi-adviser accounts and SSO (current auth is single-adviser).
2. Shared-store rate limiting for multi-instance deployments.
3. Real DocuSign integration with webhook signature verification.
4. Key rotation tooling (enc2 envelope migration).
5. Independent penetration test before onboarding other firms.
