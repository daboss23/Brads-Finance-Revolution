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
| `ANTHROPIC_API_KEY` | Powers Sarah via Claude Sonnet; also flips dashboard to "All systems operational" |
| `ELEVENLABS_API_KEY` | Powers Sarah's voice and transcription |
| `ELEVENLABS_VOICE_ID` | `qkVB3KAXPWsBoebSnOpJ` |
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
| Sarah | Client Discovery — live Claude session producing the fact find | 0 |
| Beacon | Fact Find Structuring — normalises discovery into adviser-ready data | 1 |
| Guardian | Compliance & Risk — consent, gaps, SOA blockers | 2 |
| Scribe | Meeting Intelligence — briefs and adviser questions | 3 |
| Orion | Evidence Assembly — approved-facts evidence packet | 4 |
| ATLAS | Strategy & SOA Synthesis — final tailored strategy output | 5 |
| Cipher | Follow Up & Client Status — stalled clients, daily brief (deterministic) | 6 |
| Nexus | Integration health — deterministic, never uses AI | — |

**Every workflow agent output feeds the generated SOA** (`lib/soa/soa-generator.ts` reads all five),
and each document embeds an `agentContributions` provenance record (Sarah → ATLAS).

### Generation flow

Fact Find → Beacon → Guardian → Scribe → Orion → ATLAS → Brad review & approval → Client send.
Generation streams SSE progress (`/api/soa/[id]/generate`) with a live Agent Intelligence Chain feed;
manual runs are available at `/api/agents/run`.

---

## What Is Built

### Dashboard — `/dashboard`
Premium command centre: intelligence engine core, five-stage flow, priority queue, Sarah live brief,
pipeline snapshot, flow reading, agent activity strip. Agent statuses derive from real environment
state (keys configured or not).

### Agents — `/agents`
All eight agents with execution profiles and run history. Telemetry is persisted through the
encrypted store and hydrated on cold start (`getAgentTelemetryHydrated`).

### Clients — `/clients` and `/clients/[id]`
Pipeline matrix, shared ClientTabs across Overview, Fact Find, Strategies, Compliance, SOA pages.

### Fact Find Review — `/clients/[id]/fact-find-review`
Ten-section fact find, Sarah answers auto-populate, completion bar, editable fields, export to Word/PDF.

### Sarah AI — `/onboarding/[token]`
Client-facing Financial Discovery Session: plasma orb, ElevenLabs voice + Scribe transcription,
ten-section conversational fact find feeding straight into review. Plain punctuation only — no dashes,
no markdown, ever.

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
onboarding, Sarah endpoints, cron.

### Automation — `/api/cron/cipher`
Vercel Cron (21:00 UTC daily = 7am Sydney) runs Cipher's stalled-client scan. Protected by `CRON_SECRET`.

---

## Persistence Model

`lib/secure-store/` — records are always AES-256-GCM envelopes before they hit either backend:

- **Postgres backend:** automatic when `DATABASE_URL` is set (Neon/Supabase/Vercel). One-time setup: `psql "$DATABASE_URL" -f db/schema.sql`.
- **File backend:** encrypted JSON under `.data/secure-store` for local/dev.

Browser state mirrors to `/api/state` via `lib/state-sync.ts` (localStorage instant reads, server durable copy).

---

## Sidebar Order

Dashboard → Clients → Sarah → Fact Find → SOA → Compliance → Agents → Evidence Vault → Settings

---

## Sarah Voice Rules

- Never uses dashes, em dashes, asterisks, markdown formatting, bullet points or headers.
- Plain punctuation only in all Sarah responses.

---

## Current Build Phase

Agent command centre live; SOA generation consumes the full agent chain with provenance.

**Next priorities:**
- Live provider execution for the workflow agents (currently deterministic/mock by design)
- DocuSign real integration