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

## 8. Known gaps / roadmap

In priority order:

1. Move the SOA review store and remaining localStorage state server-side.
2. Multi-adviser accounts with MFA/SSO (required before multi-firm use).
3. Shared-store rate limiting on public endpoints (onboarding token API).
4. APP 5 privacy collection notice on the onboarding intro screen.
5. Real DocuSign integration with webhook signature verification.
