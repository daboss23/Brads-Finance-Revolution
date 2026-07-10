# Security & Data Handling Policy — BMK CRM Platform

This platform captures client personal and financial information (income,
superannuation, insurance, family and estate details) for BMK Financial
Services under Charter AFSL 234665. That makes it subject to the Australian
Privacy Act 1988 and the Australian Privacy Principles (APPs). This document
defines how the codebase and deployments protect that data.

---

## 1. Environments

| Environment | `NEXT_PUBLIC_APP_ENV` | Data allowed | Where |
|---|---|---|---|
| **Production** | `production` | Real client data | The production Vercel project only |
| **Sandbox** | unset / anything else | **Synthetic data only** | Local dev, Vercel previews, staging |

- The environment is resolved in `lib/security/env.ts`. Anything not
  explicitly marked production **defaults to sandbox**.
- Sandbox builds render a permanent amber banner
  (`components/system/SandboxBanner.tsx`) reminding everyone that real
  client information must never be entered.
- Never copy production data into a sandbox for debugging. Reproduce issues
  with the synthetic demo clients in `lib/sarah-data.ts`.

### Setting up the sandbox on Vercel

1. Create a second Vercel project (e.g. `bmk-crm-sandbox`) pointed at the
   same repo, or use Vercel Preview deployments.
2. On the **production** project only, set `NEXT_PUBLIC_APP_ENV=production`.
3. Give each project its **own** `ANTHROPIC_API_KEY` and
   `ELEVENLABS_API_KEY`. A leaked sandbox key must never grant anything in
   production.

## 2. Adviser authentication

The entire adviser surface (dashboard, clients, compliance, SOA, all
internal APIs) sits behind `middleware.ts`. Only the client onboarding flow
and its token-guarded APIs are public.

- **Credentials**: run `node scripts/generate-credentials.mjs "<password>"`
  and set the printed `AUTH_PASSWORD_HASH` and `AUTH_SESSION_SECRET` on the
  Vercel project. The password is hashed with scrypt (memory-hard,
  GPU-resistant) and never stored; verification is timing-safe.
- **Sessions**: stateless HMAC-SHA256 signed tokens in an `httpOnly`,
  `secure`, `SameSite=Lax` cookie, 8-hour expiry. Tampering with one byte
  invalidates the session (`lib/security/session.ts`).
- **Throttling**: 5 failed attempts from an IP locks login for 15 minutes.
- **Fail closed**: a production deployment without auth configured serves
  nothing (503). Sandbox builds without credentials stay open for
  development, behind the sandbox banner.
- **Logging**: every login success/failure, lockout and logout emits a
  structured security event (`lib/security/access-log.ts`) into the Vercel
  runtime logs.

## 3. Client API protection

The client-facing endpoints (`/api/sarah`, `/api/sarah/voice`,
`/api/transcribe`, `/api/complete-fact-find`) never require an adviser
session, but each request must carry a valid fact find token
(`x-onboarding-token`). Invalid or expired tokens get a 401 before any AI,
voice or storage call runs, so the Anthropic and ElevenLabs keys cannot be
farmed through the public endpoints.

## 4. API keys and secrets

- One key per environment, minimum scope, rotated if ever exposed.
- Keys live only in Vercel environment variables and `.env.local`
  (gitignored). Never commit keys, and never prefix a secret with
  `NEXT_PUBLIC_` (that ships it to the browser).

## 5. Client onboarding links

- Fact find tokens are validated in `lib/security/onboarding-access.ts`
  before a Sarah session starts. Unknown or unsent tokens and links older
  than `LINK_VALIDITY_DAYS` show a lockout screen
  (`components/onboarding/LinkUnavailable.tsx`) instead of a session.
- Validity is currently 90 days to keep the demo data usable; tighten to 30
  days at go-live.

## 6. Transport and browser hardening

`next.config.mjs` applies on every route:

- **HSTS** — browsers only ever connect over HTTPS.
- **X-Frame-Options: DENY / CSP frame-ancestors 'none'** — the onboarding
  flow cannot be embedded in another site (clickjacking).
- **nosniff, Referrer-Policy, Permissions-Policy** — microphone stays
  available to Sarah (`self`) while camera and geolocation are blocked.

## 7. Encrypted persistence

All persisted client data flows through `lib/db/persistence.ts` and is
encrypted with AES-256-GCM (`lib/db/crypto.ts`) **before** it reaches any
storage backend — a stolen database dump or file yields only authenticated
ciphertext.

- **Postgres backend**: set `DATABASE_URL` (Neon, Supabase or Vercel
  Postgres) and run `db/schema.sql` once against it. Fact finds and
  security events persist there automatically from then on.
- **Sandbox backend**: without `DATABASE_URL`, encrypted blobs are written
  to `.data/` (gitignored) so local development persists across restarts.
- **Key**: set `DATA_ENCRYPTION_KEY` (32 bytes base64):
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
  Production **fails closed** without it — client data is never written in
  plaintext. Sandbox auto-generates a local key in `.data/dev.key`.
- The in-memory read cache is hydrated from persistence at every server
  boot (`instrumentation.ts`), and security events get a durable copy in
  the same backend.

## 8. Audit trail

Compliance actions are recorded per client with the checker version that
produced them (`lib/compliance/audit-trail.ts`) so a Charter or ASIC review
can reconstruct what rules applied at the time.

## 9. Go-live checklist (before real client data enters production)

The current build stores fact find data in browser localStorage and static
demo files. That is fine for the sandbox, but before onboarding real
clients:

- [x] Encrypted persistence for fact finds and security events
      (AES-256-GCM app-layer encryption over Postgres or local file).
- [ ] Provision the production Postgres (Neon/Supabase/Vercel Postgres),
      run db/schema.sql, set DATABASE_URL and DATA_ENCRYPTION_KEY.
- [ ] Move the remaining browser-localStorage stores (compliance audit
      trail, review store) into the same persistence layer.
- [ ] Issue new links with `generateOnboardingToken()` (128-bit random)
      and retire the short demo tokens; reduce `LINK_VALIDITY_DAYS` to 30.
- [ ] Move login throttling to a shared store (e.g. Upstash) so limits
      apply across all serverless instances.
- [ ] Multi-adviser accounts with per-user credentials, MFA and SSO for
      firm-scale deployments (single shared adviser credential today).
- [ ] Extend the audit trail to log data access, not just compliance
      actions, and persist it server-side.
- [ ] Define a retention and deletion policy (APP 11) and a client access /
      correction process (APP 12 and 13).
- [ ] Publish a privacy collection notice on the onboarding intro screen
      (APP 5).
- [ ] Review Anthropic and ElevenLabs data processing terms for handling of
      voice and transcript data.

## 10. Reporting a concern

Suspected data exposure or a vulnerability: contact Brad Lonergan
immediately, rotate affected keys in Vercel, and record the event in the
audit trail.
