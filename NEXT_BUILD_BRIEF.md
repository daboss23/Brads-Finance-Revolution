# Updated Build Brief

## Build Name

Agent Command Centre and Premium Dashboard Upgrade

## Main Goal

Upgrade the app into a premium financial advice operating system with a clean four agent structure.

Do not build eight agents yet. That is too much for the first version.

Start with four core agents:

1. NOVA
2. VANTA
3. ORION
4. PULSE

The product should feel like an elite performance cockpit for financial advice. It should not feel like a generic CRM, generic AI chatbot app, or neon sci fi dashboard.

## Design Direction

Use a premium visual style inspired by:

- Elite sports performance
- Speed
- Force
- Power
- Acceleration
- Athlete movement
- Telemetry
- High trust financial advice
- Institutional command centres

Avoid:

- Generic sci fi
- Loud neon effects
- Cheap robot visuals
- Cluttered dashboards
- Large architecture changes unless requested

Use:

- Premium dark surfaces
- Gold as a precision accent
- Sharp typography
- Subtle gradients
- Clean metric cards
- Progress rails
- Pipeline movement indicators
- Agent workload indicators
- Responsive layouts

## Existing Product Context

The app already has:

- Dashboard
- Clients
- Compliance
- SOA
- Fact Find
- Athena
- Settings

The app already has a client pipeline, SOA pipeline, compliance checks, Athena onboarding, and fact find data.

The next build should improve the product experience and add a clear agent layer without rebuilding the entire architecture.

## Four Agent System

### NOVA — Client Research Agent

NOVA handles client intelligence and pre meeting research.

Responsibilities:

- Summarise client profile
- Read fact find information
- Identify missing client details
- Prepare pre meeting briefs
- Surface key client priorities
- Help Brad understand the client quickly

NOVA owns the research and client context layer.

### VANTA — Risk and Compliance Agent

VANTA handles risk, compliance, and best interests duty checks.

Responsibilities:

- Check fact find completeness
- Identify missing compliance evidence
- Flag advice risk
- Review best interests duty requirements
- Check whether the file is ready for SOA generation
- Explain what is blocking advice progress

VANTA owns the compliance gate.

### ORION — Strategy and SOA Agent

ORION is the main strategy and final SOA assembly agent.

ORION writes the SOA draft and brings everything together.

Responsibilities:

- Read the client fact find
- Read NOVA client research
- Read VANTA compliance checks
- Review advice scope
- Build the strategy logic
- Draft the SOA
- Assemble goals, recommendations, risks, reasoning, projections, fees, and implementation steps
- Prepare the final SOA draft for Brad to review and approve

Important:

ORION prepares the final SOA draft, but Brad remains the final human approver.

Recommended flow:

Fact Find
↓
NOVA client brief
↓
VANTA risk and compliance check
↓
ORION strategy and SOA draft
↓
Brad review and approval
↓
Client send

### PULSE — Client Follow Up Agent

PULSE keeps the client pipeline moving.

Responsibilities:

- Detect stalled clients
- Suggest follow ups
- Draft reminder messages
- Prioritise who Brad should contact next
- Track pipeline momentum
- Identify clients who have not started or have gone quiet

PULSE owns client momentum and follow up.

## Agents To Save For Later

Do not build these as full agents yet:

- ECHO
- ATLAS
- CIPHER
- NEXUS

Use them later as specialist modules or background capabilities.

Possible future use:

- ECHO for transcripts and meeting notes
- ATLAS for data mapping
- CIPHER for document intelligence
- NEXUS for integrations

For this build, keep the product focused on NOVA, VANTA, ORION, and PULSE.

## New Page Required

Add a new page:

/agents

The Agents page should show the four core agents.

Each agent card should show:

- Agent name
- Agent role
- Current status
- Current workload
- Active task
- Blocked item if any
- Linked client if any
- Priority level
- Suggested next action

Agent statuses:

- Active
- Monitoring
- Blocked
- Ready

Priority levels:

- Low
- Medium
- High
- Critical

## Sidebar Update

Add Agents to the sidebar navigation.

Suggested nav order:

- Dashboard
- Clients
- Compliance
- SOA
- Fact Find
- Athena
- Agents
- Settings

## Dashboard Upgrade

Upgrade the dashboard into a premium operating brief.

Add or improve:

- Today’s Operating Brief
- Agent Activity strip
- Action Queue
- Pipeline Velocity
- Client Readiness
- Bottleneck panel
- SOA readiness indicators

The dashboard should show what needs Brad’s attention today.

Example dashboard actions:

- Review SOA draft prepared by ORION
- Resolve compliance blocker flagged by VANTA
- Call client stalled in fact find
- Review NOVA client brief before meeting
- Send PULSE follow up reminder

## Suggested First Implementation

Keep it simple and local first.

Create mock/local agent data.

Do not add a database.

Do not add authentication changes.

Do not add external integrations.

Do not make large architectural changes.

Focus on:

- Premium UI
- Clear agent positioning
- Reusable components
- Responsive layout
- Clean data structure
- Build passing successfully

## Technical Notes

Use the existing Next.js and Tailwind setup.

Use existing components and design tokens where possible.

Use lucide icons if needed.

Keep files clean and readable.

Avoid try/catch around imports.

## Build Checks

After the build, run:

npm run build

If lint is available and relevant, run:

npm run lint

Explain:

- What changed
- What files changed
- What checks were run
- Any warnings or failures
