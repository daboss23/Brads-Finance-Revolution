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

## 2. API keys and secrets

- One key per environment, minimum scope, rotated if ever exposed.
- Keys live only in Vercel environment variables and `.env.local`
  (gitignored). Never commit keys, and never prefix a secret with
  `NEXT_PUBLIC_` (that ships it to the browser).

## 3. Client onboarding links

- Fact find tokens are validated in `lib/security/onboarding-access.ts`
  before a Sarah session starts. Unknown or unsent tokens and links older
  than `LINK_VALIDITY_DAYS` show a lockout screen
  (`components/onboarding/LinkUnavailable.tsx`) instead of a session.
- Validity is currently 90 days to keep the demo data usable; tighten to 30
  days at go-live.

## 4. Transport and browser hardening

`next.config.mjs` applies on every route:

- **HSTS** — browsers only ever connect over HTTPS.
- **X-Frame-Options: DENY / CSP frame-ancestors 'none'** — the onboarding
  flow cannot be embedded in another site (clickjacking).
- **nosniff, Referrer-Policy, Permissions-Policy** — microphone stays
  available to Sarah (`self`) while camera and geolocation are blocked.

## 5. Audit trail

Compliance actions are recorded per client with the checker version that
produced them (`lib/compliance/audit-trail.ts`) so a Charter or ASIC review
can reconstruct what rules applied at the time.

## 6. Go-live checklist (before real client data enters production)

The current build stores fact find data in browser localStorage and static
demo files. That is fine for the sandbox, but before onboarding real
clients:

- [ ] Move client records to a real database with encryption at rest and
      per-request access control.
- [ ] Replace demo tokens with cryptographically random, single-client
      tokens generated server-side; reduce `LINK_VALIDITY_DAYS` to 30.
- [ ] Server-side session/authentication for the adviser dashboard (it is
      currently unauthenticated).
- [ ] Extend the audit trail to log data access, not just compliance
      actions, and persist it server-side.
- [ ] Define a retention and deletion policy (APP 11) and a client access /
      correction process (APP 12 and 13).
- [ ] Publish a privacy collection notice on the onboarding intro screen
      (APP 5).
- [ ] Review Anthropic and ElevenLabs data processing terms for handling of
      voice and transcript data.

## 7. Reporting a concern

Suspected data exposure or a vulnerability: contact Brad Lonergan
immediately, rotate affected keys in Vercel, and record the event in the
audit trail.
