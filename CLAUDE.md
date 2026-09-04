# BMK CRM Platform

---

## ⛔ CRITICAL RULES — READ FIRST. NO EXCEPTIONS.

> **NEVER** commit directly to `main`.
> **ALWAYS** work on a feature branch (e.g. `consolidate/newer-variant`), push it,
> and wait for Brad's approval before merging to `main`.
> **NEVER** use inline styles.
> **ALWAYS** use Tailwind utility classes and existing CSS variable tokens.
> **ALWAYS** use shadcn/ui components — never build UI primitives from scratch.
> Keep components small and focused.

---

## Project Overview

A custom CRM and AI-powered client onboarding platform for BMK Financial Services (Brad Lonergan, Newcastle NSW).
The goal: an automated financial advice operating system where an agent chain carries every client
from discovery to a Brad-approved Statement of Advice — plans that get measurably better as the
system learns.

- **Live URL:** bmk-crm-revolution.vercel.app
- **Repo:** daboss23/Brads-Finance-Revolution

---

## Stack

- Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- App Router, deployed on Vercel
- Encrypted persistence: Postgres when `DATABASE_URL` is set, encrypted local files otherwise

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` | **Athena's live discovery session.** Both together, or clients drop to the Anthropic text fallback. Agent: `agent_9701m1j9jnzzevjsy1fxt439969a`. The agent runs its own LLM, so a live session costs no Anthropic credit |
| `DATA_ENCRYPTION_KEY` | **32 bytes, base64 or hex.** Encrypts every client record (AES-256-GCM). Generate it yourself: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Not recoverable and not resettable: save it in a password manager before Vercel. Without it, production refuses to write any client data |
| `ANTHROPIC_API_KEY` | The text fallback Athena, the workflow agents, and the "All systems operational" badge. Every fallback turn bills this balance |
| `ELEVENLABS_VOICE_ID` | `qkVB3KAXPWsBoebSnOpJ`. Text-fallback speech only; the live agent carries its own voice |
| `ELEVENLABS_WEBHOOK_SECRET` | HMAC secret that authenticates the ElevenLabs post-call webhook |
| `DATABASE_URL` | Switches secure-store from encrypted files to Postgres (run `db/schema.sql` once) |
| `ADVISER_EMAIL` / `ADVISER_PASSWORD_HASH` | Adviser sign-in (see `scripts/hash-password.ts`) |
| `AUTH_SESSION_SECRET` | Signs adviser session cookies |
| `ADVISER_TOTP_SECRET` | Optional TOTP multi-factor for sign-in |
| `CRON_SECRET` | Bearer token Vercel Cron sends to `/api/cron/cipher` |

---

## The Agent System (8 agents)

Defined in `lib/agent-system.ts`, executed through `lib/agents/run-agent.ts`
(caching + telemetry + safe fallbacks), prompts in `lib/agents/prompts.ts`.

| Agent | Role | Flow step |
|---|---|---|
| Athena | Client Discovery — live Claude session producing the fact find | 0 |
| Beacon | Fact Find Structuring — normalises discovery into adviser-ready data | 1 |
| Guardian | Compliance & Risk — consent, gaps, SOA blockers | 2 |
| Scribe | Meeting Intelligence — briefs and adviser questions | 3 |
| Orion | Evidence Assembly — approved-facts evidence packet | 4 |
| ATLAS | Strategy & SOA Synthesis — final tailored strategy output | 5 |
| Cipher | Follow Up & Client Status — stalled clients, daily brief (deterministic) | 6 |
| Nexus | Integration health — deterministic, never uses AI | — |

**Every workflow agent output feeds the generated SOA** (`lib/soa/soa-generator.ts` reads all five),
and each document embeds an `agentContributions` provenance record (Athena → ATLAS).

### Generation flow

Fact Find → Beacon → Guardian → Scribe → Orion → ATLAS → Brad review & approval → Client send.
Generation streams SSE progress (`/api/soa/[id]/generate`) with a live Agent Intelligence Chain feed;
manual runs are available at `/api/agents/run`.

---

## What Is Built

### Dashboard — `/dashboard`
Premium command centre: intelligence engine core, five-stage flow, priority queue, Athena live brief,
pipeline snapshot, flow reading, agent activity strip. Agent statuses derive from real environment
state (keys configured or not).

### Agents — `/agents`
All eight agents with execution profiles and run history. Telemetry is persisted through the
encrypted store and hydrated on cold start (`getAgentTelemetryHydrated`).

### Clients — `/clients` and `/clients/[id]`
Pipeline matrix, shared ClientTabs across Overview, Fact Find, Strategies, Compliance, SOA pages.

### Fact Find Review — `/clients/[id]/fact-find-review`
Ten-section fact find, Athena answers auto-populate, completion bar, editable fields, export to Word/PDF.

### Athena AI — `/onboarding/[token]`
Client-facing Financial Discovery Session: plasma orb, ten-section conversational fact find feeding
straight into review. Plain punctuation only — no dashes, no markdown, ever.

**Two sessions, one room.** `/api/athena/session-mode` decides which the client gets, and both render
the same shell (`AthenaIntroScreen`, `AthenaStage`, `AthenaTranscript`, `AthenaSessionComplete`).

| | Voice (preferred) | Text (fallback) |
|---|---|---|
| Component | `AthenaVoiceSession` | `AthenaChat` |
| Runs on | ElevenLabs ConvAI agent, its own LLM | Anthropic, per turn |
| Costs Anthropic credit | No | Yes, every turn |
| Conversation defined in | The ElevenLabs agent, versioned there | `lib/agents/prompts.ts` + the route |
| Fact find lands via | `submit_fact_find` client tool | `<fact-find-complete>` block |

Voice is preferred because it survives an empty Anthropic balance. The browser opens the socket with a
signed URL from `/api/athena/signed-url` and passes `client_first_name` and `client_id` as dynamic
variables — the agent's opening line and its completion tool both depend on them. If the agent cannot
be reached the page fails over to the text session mid-flow, without asking the client to start again.

Editing the voice conversation means editing the agent in the ElevenLabs dashboard, not this repo.

### Compliance Engine — `/compliance` and `/clients/[id]/compliance`
BID steps, safe harbour, Charter AFSL 234665 obligations, ATO thresholds, approved language templates.
Score ring, blockers/warnings lanes, audit trail, PDF certificate, SOA gate at score ≥ 60 with no blockers
plus adviser sign-off.

### SOA Engine — `/soa`, `/clients/[id]/soa`, `/clients/[id]/soa/generate`
Five-layer orchestration, compliance gate enforcement, market snapshots, staged SSE generation,
review page with inline editing (every edit trains the voice learner), PDF export, DocuSign stub.

### Evidence Vault — `/evidence-vault`
Knowledge layer with live counts derived from the SOA store, fact-find store, voice learner and
knowledge bases.

### Auth — `/login` + `middleware.ts`
Session gate with demo-mode fallback, rate limiting, lockout, optional TOTP MFA. Public paths:
onboarding, Athena endpoints, cron.

### Automation — `/api/cron/cipher`
Vercel Cron (21:00 UTC daily = 7am Sydney) runs Cipher's stalled-client scan. Protected by `CRON_SECRET`.

---

## Discovery Session Capture

The practice, not ElevenLabs, is the system of record. Three writers land in the
`athena-transcripts` namespace and `mergeTranscript` reconciles them:

| Writer | When | Covers |
|---|---|---|
| `live` | Browser, debounced ~5s + on `pagehide` | Voice sessions, including ones the client abandons |
| `text` | Same cadence | The Anthropic fallback session |
| `post-call` | ElevenLabs webhook, once | Authoritative timing and duration |

**A write can add turns but never remove them.** Turn lists are compared by
length and the longer one wins, so a retry, a duplicate delivery, an out of
order flush, or an empty post-call payload are all harmless. Without that rule a
sparse webhook would erase a complete session the browser had already captured.

The client id is always derived from the onboarding token server side, never
read from the request body, so a valid link can only write to its own file.

### Resuming a half finished session

A client who stops partway reopens the same link and carries on from the next
question. `GET /api/athena/transcript?token=` returns the session to resume;
`findResumableSession` offers one back only while it is unfinished, has turns,
and was last touched within `RESUME_WINDOW_DAYS` (14). Records carry a
`threadId`, set once and never movable, so a resumed voice session joins the
original conversation instead of reading as a second abandoned one.

Text resume works end to end. Voice resume saves and shows the client's answers
today, but Athena only skips the covered ground once the ElevenLabs agent prompt
reads the `is_resumed` and `resume_context` dynamic variables the browser
already sends. The exact snippet to paste is in `docs/athena-resume.md`.

### Partial sessions in the CRM

`/clients/[id]` shows a notice when a client has an unfinished session.
`/clients/[id]/fact-find-review` shows every session, its status, how many
answers it captured, and the full transcript on expand. Status is derived in
`lib/athena/discovery-sessions.ts` and matches what the client can still do:
live, paused, abandoned, completed.

---

## Persistence Model

`lib/secure-store/` — records are always AES-256-GCM envelopes before they hit either backend:

- **Postgres backend:** automatic when `DATABASE_URL` is set (Neon/Supabase/Vercel). One-time setup: `psql "$DATABASE_URL" -f db/schema.sql`.
- **File backend:** encrypted JSON under `.data/secure-store` for local/dev.

Browser state mirrors to `/api/state` via `lib/state-sync.ts` (localStorage instant reads, server durable copy).

---

## Sidebar Order

Dashboard → Clients → Athena → Fact Find → SOA → Compliance → Agents → Evidence Vault → Settings

---

## Athena Voice Rules

- Never uses dashes, em dashes, asterisks, markdown formatting, bullet points or headers.
- Plain punctuation only in all Athena responses.

---

## Current Build Phase

Agent command centre live; SOA generation consumes the full agent chain with provenance.

**Next priorities:**
- Live provider execution for the workflow agents (currently deterministic/mock by design)
- DocuSign real integration
- Point the ElevenLabs agent's post-call webhook at `/api/elevenlabs/post-call` so full transcripts
  persist, not just the fact find (the route and its HMAC check are built and waiting)
- Add the resume block to the ElevenLabs agent prompt so voice sessions skip covered ground
  (`docs/athena-resume.md` has the snippet and the two variables to declare)