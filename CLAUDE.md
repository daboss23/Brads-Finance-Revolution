# BMK CRM Platform

---

## ⛔ CRITICAL RULES — READ FIRST. NO EXCEPTIONS.

> **NEVER** create new branches under any circumstances.
> **NEVER** use `git checkout -b` or `git switch -c`.
> **ALWAYS** commit directly to `main`.
> **ALWAYS** push to `main`. No pull requests. No exceptions.
> **NEVER** use inline styles.
> **ALWAYS** use Tailwind utility classes and existing CSS variable tokens.
> **ALWAYS** use shadcn/ui components — never build UI from scratch.
> Keep components small and focused.

---

## Project Overview

A custom CRM and AI-powered client onboarding platform for BMK Financial Services (Brad Lonergan, Newcastle NSW).
Replaces manual financial planning workflows with an automated pipeline.

- **Live URL:** bmk-crm-revolution.vercel.app
- **Repo:** daboss23/Brads-Finance-Revolution

---

## Stack

- Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- App Router, deployed on Vercel

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Powers Sarah via Claude Sonnet |
| `ELEVENLABS_API_KEY` | Powers Sarah's voice and transcription |
| `ELEVENLABS_VOICE_ID` | `qkVB3KAXPWsBoebSnOpJ` |

---

## What Is Built

### Dashboard — `/dashboard`
- Client pipeline matrix with fact find completion by section.
- Status badges: In Progress, Ready for Meeting, Complete, Review Required.
- SOA Pipeline row with KPI metrics.

### Clients — `/clients` and `/clients/[id]`
- Client rows show SOA status chip when SOA exists.
- Shared ClientTabs component across Overview, Fact Find, Strategies, Compliance pages.

### Fact Find Review — `/clients/[id]/fact-find-review`
- Ten section fact find. Sarah answers auto-populate here.
- Completion bar, missing sections in amber, editable fields.
- Export to Word and PDF.

### Form Generation — `/clients/[id]/forms`
- Pre-filled product provider forms for MLC, AIA, AMP MyNorth.

### Sarah AI — `/onboarding/[token]`
- Client-facing Financial Discovery Session.
- Animated plasma energy orb on canvas.
- ElevenLabs voice — Sarah speaks to client.
- ElevenLabs Scribe v1 for speech to text.
- Ten section fact find via natural conversation.
- Data feeds back to fact find review automatically.
- Opens with audio check then full greeting.
- Waits for client response before proceeding.
- Inactivity check at five minutes.
- No dashes, no markdown, plain human language only.

### Intro Screen — `/onboarding/[token]` (before session)
- Newcastle Financial Services logo at `/public/newcastle-logo.png`
- Financial Discovery Session headline.
- Begin My Financial Discovery gold button.

### Sarah Dashboard — `/sarah`
- Fact find link management, KPI cards, drop-off analytics.

### Compliance Engine — `/compliance` and `/clients/[id]/compliance`
- Knowledge base with seven BID steps, six safe harbour steps, Charter AFSL 234665 obligations, ATO 2024/25 thresholds, seven approved language templates.
- Compliance checker computes score zero to one hundred, returns blockers, warnings, missing info.
- Audit trail logs all compliance events.
- Per-client compliance tab with score ring, checklists, issues lanes, Run Check, Download Certificate, Sign-Off actions.
- PDF certificate at `/api/compliance/[id]/certificate`.
- SOA gate shows locked panel listing blockers, clears to green when score is sixty or above with no blockers and adviser sign-off recorded.

### SOA Generation Engine — `/soa`, `/clients/[id]/soa`, `/clients/[id]/soa/generate`
- Knowledge base with Brad's voice rules, strategy reasoning patterns for seven strategies, six case studies.
- Five-layer orchestration with staged callbacks, compliance gate enforcement, market snapshot capture, audit hook.
- SOA Review page with inline-editable sections, comments, reviewed and approved checkboxes, compliance ring, flagged items, approval progress, PDF download, DocuSign stub.
- Generation page with readiness cards and SSE streaming progress across eight stages.
- Full client pipeline table with stage badges: Fact Find, Compliance, SOA In Progress, Review, Approved, Sent, Signed.
- Voice learner records before and after edit pairs.
- Knowledge base upload at `/settings/knowledge-base` with drag-drop PDFs, Written-by-Brad weighted three times.
- PDF export at `/api/soa/[id]/pdf` with branded cover, navy and gold header, all sections, footer page numbers.

---

## Sidebar Order

Dashboard → Clients → Compliance → SOA → Fact Find → Sarah → Settings

---

## Sarah Voice Rules

- Never uses dashes, em dashes, asterisks, markdown formatting, bullet points or headers.
- Plain punctuation only in all Sarah responses.

---

## Current Build Phase

**Phase 5 complete.** Security layer and real client lifecycle shipped:
- AES-256-GCM encrypted persistence (Postgres via `DATABASE_URL` or local files), fails closed without `DATA_ENCRYPTION_KEY`.
- Adviser sign-in with TOTP MFA and lockout (`SECURITY.md` §9); middleware gates all adviser pages.
- Rate limiting, durable encrypted audit trail, APP 5 notice on onboarding.
- Real clients: Add Client dialog creates encrypted records with private onboarding tokens; fact-find completion advances pipeline status and emails Brad (Resend).
- Security report at `docs/BMK-CRM-Security-Report.pdf`.

**Next priorities:**
- Production activation: set env vars per SECURITY.md, then pilot one real client end to end.
- Knowledge vault: actually store and parse uploaded PDFs into the voice engine.
- DocuSign real integration.
