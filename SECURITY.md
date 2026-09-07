# BMK CRM Security Model

This document describes how client data is protected in the BMK CRM
platform and what must be configured before real client data is stored.

## 1. What is protected

- **Fact finds** — the full client financial picture collected by Athena
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
failed attempts), fact-find submission (10/min), Athena conversation
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

## 10. Third-party voice processing (ElevenLabs)

Athena's discovery session sends a client's name, date of birth, address,
income, assets, liabilities, superannuation and, in section 9, their health
conditions to ElevenLabs. That is sensitive information under the Privacy
Act 1988 (Cth), so the design rule is that the practice holds the record and
the vendor holds as little as the architecture allows.

### What cannot be avoided

A live voice agent cannot run without the vendor processing the
conversation. Audio reaches ElevenLabs for speech to text, the transcript
reaches the model that generates each reply, and the reply is spoken by
their voice engine. Retention can be reduced to near nothing; processing
cannot. Disclose ElevenLabs in the privacy collection notice.

The text fallback session substitutes Anthropic for ElevenLabs. It does not
remove the third party, it changes which one.

### Current agent settings

Configured on agent `ELEVENLABS_AGENT_ID`, under
`platform_settings.privacy`:

| Setting | Value | Effect |
|---|---|---|
| `record_voice` | `false` | No audio recording is stored at any point |
| `retention_days` | `7` | Transcripts are removed after a week |
| `delete_transcript_and_pii` | `true` | Removal covers transcript text and PII, not just metadata |
| `delete_audio` | `true` | Any audio artefact is removed on the same schedule |
| `zero_retention_mode` | `false` | See the trade-off below |
| `user_memory.enabled` | `false` | Nothing a client says is carried into another conversation |

Also disabled: `topic_discovery` and `sentiment_analysis`. Both ran a
separate analysis model (`analysis_llm`, a Google Gemini model) across the
full transcript, which put client financial data in front of a further
processor. Nothing in this codebase reads topics or sentiment, so switching
them off costs no functionality.

`conversation_config.agent.prompt.backup_llm_config` is restricted to
Anthropic (`claude-sonnet-4-5`). It previously cascaded to Gemini and GPT-4o,
which meant a provider outage would have silently routed a client's
financial discovery through Google or OpenAI. A fallback still exists, so an
overloaded primary model does not end the session.

### Why not Zero Retention Mode

ZRM is the strongest available position and remains the target. It is not on
yet for one reason: the ElevenLabs post-call webhook is not yet pointed at
`/api/elevenlabs/post-call`. Turning ZRM on against an unwired webhook
removes the vendor-side copy while nothing on the practice side receives the
authoritative post-call payload. Seven-day retention keeps a recoverable
window until the webhook is verified end to end.

Switch ZRM on only after a real call has been observed landing in the
`athena-transcripts` namespace through that route.

### How the practice holds its own copy

Three writers land in the `athena-transcripts` namespace, and
`mergeTranscript` reconciles them:

| Writer | Source | Depends on the vendor? |
|---|---|---|
| `live` | The browser, debounced about every 5s and on `pagehide` | No |
| `text` | The Anthropic fallback session, same cadence | No |
| `post-call` | The ElevenLabs webhook, once per call | Yes |

The `live` writer is the load-bearing one: the practice's record is built
from the browser as the client speaks, so it survives an abandoned session,
a webhook that never fires, and vendor-side deletion. A write can add turns
but never remove them, so a sparse or duplicate delivery cannot erase a
complete session already captured.

The client id is always derived from the onboarding token server side, never
read from the request body, so a valid link can only ever write to its own
record.

### Transport and authentication

The webhook is authenticated by HMAC-SHA256 over `${timestamp}.${rawBody}`
using `ELEVENLABS_WEBHOOK_SECRET`, compared in constant time, with a
30-minute timestamp window that rejects replays. An unsigned, missigned or
stale payload is rejected with 401 before the body is parsed. This is why
`/api/elevenlabs/` is a public prefix in `middleware.ts`: it authenticates
the sender, not an adviser session.

`GET /api/athena/signed-url` mints the short-lived session URL so
`ELEVENLABS_API_KEY` never reaches the browser. It is public by necessity
(clients are not signed in) but requires a valid onboarding token, so a
stranger cannot use it to open sessions or burn conversation minutes.

### Open items

- Wire the post-call webhook, verify it, then enable ZRM.
- `platform_settings.auth.enable_auth` is `false` on the agent, so the agent
  is reachable by anyone holding the agent id. The app's signed-URL flow is
  unaffected; this concerns direct use of the id outside the app.
- Retention changes apply to new conversations only
  (`apply_to_existing_conversations` is `false`). Sessions recorded before
  this change are still held indefinitely and need a deliberate purge.

## 11. Known gaps / roadmap

In priority order:

1. Multi-adviser accounts and SSO (current auth is single-adviser).
2. Shared-store rate limiting for multi-instance deployments.
3. Real DocuSign integration with webhook signature verification.
4. Key rotation tooling (enc2 envelope migration).
5. Independent penetration test before onboarding other firms.
6. Adviser-facing screen for the encrypted `athena-transcripts` namespace
   (records are stored and retrievable, but not yet surfaced in the UI).
