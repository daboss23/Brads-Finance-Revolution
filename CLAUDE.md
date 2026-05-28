# BMK CRM Platform

## CRITICAL RULES - READ FIRST

BMK Financial Services CRM — Brads Finance Revolution
CRITICAL RULES — READ FIRST EVERY SESSION
Never create new branches. Never use git checkout -b or git switch -c. Always commit directly to main. Always push to main. No pull requests. No exceptions. Never use inline styles. Always use Tailwind utility classes and existing CSS variable tokens. Use shadcn/ui components, never build UI from scratch. Keep components small and focused.
LIVE URL: bmk-crm-revolution.vercel.app
REPO: daboss23/Brads-Finance-Revolution
STACK: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, App Router, deployed on Vercel
ENVIRONMENT VARIABLES: ANTHROPIC_API_KEY powers Sarah via Claude Sonnet. ELEVENLABS_API_KEY powers Sarah's voice and transcription. ELEVENLABS_VOICE_ID is qkVB3KAXPWsBoebSnOpJ.
WHAT IS BUILT
Dashboard at /dashboard. Client pipeline matrix with fact find completion by section. Status badges: In Progress, Ready for Meeting, Complete, Review Required. SOA Pipeline row with KPI metrics.
Clients at /clients and /clients/[id]. Client rows show SOA status chip when SOA exists. Shared ClientTabs component across Overview, Fact Find, Strategies, Compliance pages.
Fact Find Review at /clients/[id]/fact-find-review. Ten section fact find. Sarah answers auto-populate here. Completion bar, missing sections in amber, editable fields. Export to Word and PDF.
Form Generation at /clients/[id]/forms. Pre-filled product provider forms for MLC, AIA, AMP MyNorth.
Sarah AI at /onboarding/[token]. Client-facing Financial Discovery Session. Animated plasma energy orb on canvas. ElevenLabs voice — Sarah speaks to client. ElevenLabs Scribe v1 for speech to text. Ten section fact find via natural conversation. Data feeds back to fact find review automatically. Opens with audio check then full greeting. Waits for client response before proceeding. Inactivity check at five minutes. No dashes, no markdown, plain human language only.
Intro screen at /onboarding/[token]. Newcastle Financial Services logo at /public/newcastle-logo.png. Financial Discovery Session headline. Begin My Financial Discovery gold button.
Sarah dashboard at /sarah. Fact find link management, KPI cards, drop-off analytics.
Compliance Engine at /compliance and /clients/[id]/compliance. Knowledge base with seven BID steps, six safe harbour steps, Charter AFSL 234665 obligations, ATO 2024/25 thresholds, seven approved language templates. Compliance checker computes score zero to one hundred, returns blockers, warnings, missing info. Audit trail logs all compliance events. Per-client compliance tab with score ring, checklists, issues lanes, Run Check, Download Certificate, Sign-Off actions. PDF certificate at /api/compliance/[id]/certificate. SOA gate shows locked panel listing blockers, clears to green when score is sixty or above with no blockers and adviser sign-off recorded.
SOA Generation Engine at /soa and /clients/[id]/soa and /clients/[id]/soa/generate. Knowledge base with Brad's voice rules, strategy reasoning patterns for seven strategies, six case studies. Five-layer orchestration with staged callbacks, compliance gate enforcement, market snapshot capture, audit hook. SOA Review page with inline-editable sections, comments, reviewed and approved checkboxes, compliance ring, flagged items, approval progress, PDF download, DocuSign stub. Generation page with readiness cards and SSE streaming progress across eight stages. Full client pipeline table with stage badges: Fact Find, Compliance, SOA In Progress, Review, Approved, Sent, Signed. Voice learner records before and after edit pairs. Knowledge base upload at /settings/knowledge-base with drag-drop PDFs, Written-by-Brad weighted three times. PDF export at /api/soa/[id]/pdf with branded cover, navy and gold header, all sections, footer page numbers.
SIDEBAR ORDER: Dashboard, Clients, Compliance, SOA, Fact Find, Sarah, Settings.
CURRENT BUILD PHASE: Phase 4 complete. SOA generation engine shipped. Next priorities are design polish pass on compliance and SOA pages, and DocuSign real integration.
SARAH VOICE RULES: Never uses dashes, em dashes, asterisks, markdown formatting, bullet points or headers. Plain punctuation only in all Sarah responses.
