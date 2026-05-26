# BMK CRM Platform

## CRITICAL RULES - READ FIRST

NEVER create new branches under any circumstances.
NEVER use git checkout -b or git switch -c.
ALWAYS commit directly to main.
ALWAYS use git add, git commit, git push origin main.
If you are about to create a branch STOP and commit 
to main instead.
No exceptions. No pull requests. Main only.

PROJECT OVERVIEW

A custom CRM and AI-powered client onboarding platform 
for BMK Financial Services (Brad Lonergan, Newcastle NSW).
Replaces manual financial planning workflows with an 
automated pipeline.

LIVE URL: bmk-crm-revolution.vercel.app
REPO: daboss23/Brads-Finance-Revolution

STACK
Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
App Router, deployed on Vercel

ENVIRONMENT VARIABLES
ANTHROPIC_API_KEY - Claude Sonnet powers Sarah
ELEVENLABS_API_KEY - voice and transcription
ELEVENLABS_VOICE_ID - qkVB3KAXPWsBoebSnOpJ

WHAT IS BUILT

Dashboard at /dashboard
Client pipeline matrix with fact find completion by section.
Status badges: In Progress, Ready for Meeting, Complete, 
Review Required.

Clients at /clients and /clients/[id]
Individual client pages with fact find review and forms tabs.

Fact Find Review at /clients/[id]/fact-find-review
10 section fact find. Sarah answers auto-populate here.
Completion bar, missing sections in amber, editable fields.
Export to Word and PDF.

Form Generation at /clients/[id]/forms
Pre-filled product provider forms for MLC, AIA, AMP MyNorth.

Sarah AI at /onboarding/[token]
Client facing Financial Discovery Session.
Animated plasma energy orb on canvas.
ElevenLabs voice - Sarah speaks to client.
ElevenLabs Scribe v1 for speech to text.
10 section fact find via natural conversation.
Data feeds back to fact find review automatically.
Opens with audio check then full greeting.
Waits for client response before proceeding.
Inactivity check at 5 minutes.
No dashes, no markdown, plain human language only.

Intro screen at /onboarding/[token] before session.
Newcastle Financial Services logo at /public/newcastle-logo.png
Financial Discovery Session headline.
Begin My Financial Discovery gold button.

Sarah dashboard at /app/(app)/sarah/page.tsx
Link management, KPI cards, drop-off analytics.

KNOWN ISSUES
Microphone transcription not fully working.
ElevenLabs Scribe v1 blob sending but text not returning.
Debug /api/transcribe route and useAudioRecorder hook.

CODING RULES
Never use inline styles.
Never create new branches - always commit to main.
Use shadcn/ui components, never build from scratch.
Keep components small and focused.
Sarah never uses dashes, em dashes, asterisks, 
markdown formatting, bullet points or headers.
Plain punctuation only in all Sarah responses.

CURRENT BUILD PHASE
Phase 2 - Sarah voice integration and data loop complete.
Next: Fix microphone transcription, world class dashboard 
design upgrade, SOA generation engine.
