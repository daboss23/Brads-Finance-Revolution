# BMK CRM — Setup & Environment Variables

Everything you need to run the platform legitimately in production, plus how
to keep a safe demo flow for showing clients.

---

## The short version

| You want to… | Set these |
|---|---|
| **Demo only** (browse, show Sarah, show demo clients) | *Nothing required.* Optionally `DATA_ENCRYPTION_KEY` so you can also create real clients live. |
| **Sarah actually talks** in the demo | `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` |
| **Run real clients** (store real data) | Above + `DATA_ENCRYPTION_KEY`, `DATABASE_URL`, `AUTH_SESSION_SECRET`, `ADVISER_EMAIL`, `ADVISER_PASSWORD_HASH` |
| **Two-factor sign-in** | + `ADVISER_TOTP_SECRET` |
| **Email Brad when a fact find lands** | + `RESEND_API_KEY`, `NOTIFY_EMAIL` |

Set all of these in **Vercel → Project → Settings → Environment Variables**,
then redeploy. Nothing is committed to the repo.

---

## 1. AI services (Sarah's brain and voice)

| Variable | What it powers | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sarah's conversation (Claude) | console.anthropic.com → API Keys |
| `ELEVENLABS_API_KEY` | Sarah's spoken voice + speech-to-text (Scribe v1) | elevenlabs.io → Profile → API Key |
| `ELEVENLABS_VOICE_ID` | Which voice Sarah uses | Already chosen: `qkVB3KAXPWsBoebSnOpJ` |

Without these, Sarah runs in **mock mode** — the interface, orb, and flow all
work for a demo, she just won't hold a live AI conversation or speak.

## 2. Encryption (required before storing any real client data)

| Variable | Purpose |
|---|---|
| `DATA_ENCRYPTION_KEY` | 32-byte key that encrypts every client record (AES-256-GCM) |

Generate it:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Store the key in a password manager Brad controls. **Losing it means losing
access to all encrypted data.** In production, if this is not set the platform
refuses to save client data at all (it never writes plaintext PII).

## 3. Database (required for real clients to survive)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |

1. Create a free Postgres database — **Neon** (neon.tech) is the easiest;
   Supabase or Vercel Postgres also work. **Choose the Sydney region** for
   Australian data residency.
2. Run the schema once:
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```
3. Paste the connection string into `DATABASE_URL` in Vercel.

Without `DATABASE_URL` the platform falls back to encrypted local files —
fine for the sandbox, not for production (files reset on redeploy).

## 4. Adviser sign-in (required to protect the adviser pages)

| Variable | Purpose |
|---|---|
| `AUTH_SESSION_SECRET` | Signs the login session cookie |
| `ADVISER_EMAIL` | Brad's sign-in email |
| `ADVISER_PASSWORD_HASH` | Brad's password, scrypt-hashed |
| `ADVISER_TOTP_SECRET` | *(optional)* enables authenticator-app 2FA |

Generate each:

```bash
# Session secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Password hash (prompts, so the password never lands in shell history)
npx tsx scripts/hash-password.ts

# Optional TOTP secret — scan the printed otpauth URL into Google
# Authenticator / Authy / 1Password
npx tsx -e "import {generateTotpSecret, otpauthUrl} from './lib/auth/totp'; const s=generateTotpSecret(); console.log(s); console.log(otpauthUrl(s,'brad@bmk.com.au'))"
```

Sign-in only switches on when **both** `AUTH_SESSION_SECRET` and
`ADVISER_PASSWORD_HASH` are set. Until then the platform runs open (demo
mode). See `SECURITY.md` for the full model.

## 5. Email notifications (optional)

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Sends Brad an email the moment a client finishes their fact find |
| `NOTIFY_EMAIL` | Where to send it (defaults to `ADVISER_EMAIL`) |
| `NOTIFY_FROM` | *(optional)* sender address; defaults to Resend's shared sender |

Get the key free at resend.com. Without it, notifications are logged to the
server console instead of emailed — nothing breaks.

---

## Keeping a demo flow AND a real setup

These are not in conflict — the platform is built for exactly this:

- **Pure visual demo (no keys):** everything renders. Demo clients (Sarah
  Mitchell, the Carrs, etc.) have full fact finds, compliance, and SOAs you
  can walk through. Creating a *new* real client is disabled (fails closed).
- **Live demo with Sarah talking:** add the three AI keys (§1). Sarah holds a
  real conversation and speaks. Still no client data stored unless you add §2.
- **Real pilot:** add §2–§4. Now "Add Client" works, data is encrypted and
  durable, and the adviser pages require sign-in. The demo clients still sit
  alongside real ones, so you can keep demoing with them any time.

Recommended for a client showcase: set §1 (Sarah lives) **and**
`DATA_ENCRYPTION_KEY` (so you can add a client live in the meeting), and leave
sign-in off until after the showcase so you don't fumble a 2FA code on stage.
Turn on §4 sign-in before real client data goes in.

---

## Documents

Every PDF the platform produces — the **Financial Fact Find** and the
**Statement of Advice** — is rendered from branded HTML through headless
Chromium, so they carry full Newcastle navy-and-gold typography and layout.
No configuration is needed; on Vercel the bundled `@sparticuz/chromium` is
used automatically. The PDF routes allow up to 60s (`maxDuration`) for cold
starts.
