# BMK CRM Design System

## 1. Atmosphere & Identity

BMK CRM should feel like a quiet operational command centre. The interface is dark, glassy, and premium, with gold used for decision-making moments and cyan or violet reserved for telemetry energy. The signature is restrained liquid depth: panels feel alive through glow, blur, and subtle motion, but the information hierarchy stays calm and readable.

## 2. Color

### Palette

| Role | Token | Dark Value | Usage |
|------|-------|------------|-------|
| Page background | `--background` | `222 28% 4%` | App shell background |
| Primary text | `--foreground` | `0 0% 96%` | Headlines and body text |
| Card surface | `--card` | `222 24% 9%` | Standard panels and tables |
| Elevated surface | `--surface-elevated` | `222 22% 12%` | Higher-emphasis modules |
| Secondary surface | `--secondary` | `222 18% 14%` | Tinted chips and subdued containers |
| Muted surface | `--muted` | `222 20% 14%` | Track fills and quiet backgrounds |
| Secondary text | `--muted-foreground` | `220 12% 78%` | Metadata and helper copy |
| Border | `--border` | `222 18% 22%` | Dividers and panel outlines |
| Primary accent | `--gold` | `43 68% 54%` | CTAs, high-value status, focus moments |
| Supporting accent | `--blue-accent` | `210 82% 66%` | Progress and system activity |
| Destructive | `--destructive` | `0 68% 55%` | Errors and blocking issues |

### Rules

- Gold is for intent, readiness, and highlighted action. It should not wash the whole screen.
- Cyan and violet are atmospheric telemetry accents, not primary semantic colors.
- Orange and amber are reserved for attention, pressure, and review states.
- New UI work must use existing HSL tokens or document additions here first.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Page title | `28px-34px` | `600` | `1` | Main route headings |
| Section title | `17px-18px` | `600` | `1.2` | Panel titles |
| Metric value | `34px-40px` | `600` | `1` | KPI numbers |
| Body | `13px-14px` | `400-500` | `1.5-1.6` | Primary supporting copy |
| Meta | `12px` | `500-600` | `1.4` | Status and helper text |
| Command label | `10px` | `600` | `1.3` | Uppercase overlines and telemetry labels |

### Font Stack

- Primary: system sans via the default app font stack
- Mono: system monospace fallback only when tabular or code-like data is needed

### Rules

- Uppercase overlines use the existing `.cmd-label` treatment.
- Metric numbers should feel sharp and dense, not oversized for spectacle.
- Body text should stay in the `13px-14px` range inside dashboard panels to preserve scan speed.

## 4. Spacing & Layout

### Base Unit

All spacing is based on a **4px** rhythm.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Micro gaps, separators |
| `--space-2` | `8px` | Tight metadata groupings |
| `--space-3` | `12px` | Compact panel internals |
| `--space-4` | `16px` | Standard card padding |
| `--space-5` | `20px` | Comfortable internal spacing |
| `--space-6` | `24px` | Panel padding and grouped sections |
| `--space-8` | `32px` | Larger sectional spacing |

### Grid

- Max content width: `1480px`
- Dashboard rhythm: dense modular grid with `12px-16px` gutters
- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`

### Rules

- Primary dashboard surfaces should stay within one parent shell and feel like coordinated modules.
- The first screenful should answer the route’s core operational question before showing secondary telemetry.
- Large decorative visuals must earn their space with action value.

## 5. Components

### Glass Panel

- **Structure**: section wrapper with tinted gradient background, soft border, inner highlight, and restrained blur
- **Variants**: default, emphasis, alert
- **Spacing**: `16px-20px` internal padding
- **States**: default, hover, focus-visible when interactive
- **Accessibility**: maintain contrast against dark surfaces and preserve readable helper text
- **Motion**: optional subtle opacity or transform drift only

### Priority Metric Card

- **Structure**: overline, value, helper copy, small icon capsule, restrained activity rail
- **Variants**: neutral, readiness, attention
- **Spacing**: compact, optimized for five-up desktop layout
- **States**: default, hover, reduced-motion fallback
- **Accessibility**: value remains readable without relying on color alone
- **Motion**: slow breathing movement and a gentle telemetry shimmer on the rail

### Action Queue Row

- **Structure**: priority badge, action title, supporting metadata, forward affordance
- **Variants**: critical, high, medium, low
- **Spacing**: `12px-16px`
- **States**: default, hover, focus-visible
- **Accessibility**: full row is clickable, labels remain explicit, no icon-only meaning
- **Motion**: hover elevation only

### Status Badge

- **Structure**: compact bordered chip using existing `Badge`
- **Variants**: fact find statuses and SOA pipeline stages
- **Spacing**: fixed compact padding
- **States**: static semantic state
- **Accessibility**: wording must remain explicit, not color-only

### Client Health Row

- **Structure**: client identity, stage/status chips, reason-for-attention, next action, activity timing
- **Variants**: default, alerting
- **Spacing**: row-based rhythm for fast scanning
- **States**: hover, focus-visible
- **Accessibility**: readable on mobile as a stacked layout

### Client Progress Engine

- **Structure**: dominant central module with an orbital workflow, stage nodes, Sarah intelligence core, and compact operational metrics
- **Variants**: onboarding engine only for the main dashboard
- **Spacing**: `16px-20px` internal padding, with nodes stacking below the core on small screens
- **States**: active nodes pulse softly, links and analytics action have hover and focus-visible states
- **Accessibility**: stage labels, counts, and descriptions remain text-first so color and position are not the only cues
- **Motion**: slow orbital glow using transform and opacity only, disabled for reduced motion

### Dashboard Support Panels

- **Structure**: Priority Queue, Sarah Brief, Pipeline Snapshot, Flow Reading, Next Best Actions, and Agent Activity Strip all use the Glass Panel material with tighter internals
- **Variants**: action, insight, telemetry, status
- **Spacing**: compact `12px-16px` rows inside `16px-20px` panels
- **States**: default, hover, focus-visible for clickable rows and actions
- **Accessibility**: badges use explicit text labels, agent status is written out, and rows keep visible forward affordances
- **Motion**: hover elevation only, no layout animation

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | `150ms-200ms` | `ease-out` | Button and row hover |
| Standard | `250ms-300ms` | `ease-in-out` | Panel hover and transitions |
| Ambient | `6s-12s` | `ease-in-out` | Breathing glow and background drift |

### Rules

- Only animate `transform` and `opacity`.
- Motion must feel like system awareness, not entertainment.
- Status pulses, rails, and glow shifts should support situational awareness without stealing focus.
- Respect `prefers-reduced-motion` by disabling ambient motion and shimmer.

## 7. Depth & Surface

### Strategy

Mixed glass plus tonal shift.

- Primary surfaces use layered gradients, a light internal highlight, and soft shadow depth.
- Borders remain thin and semi-transparent to keep modules legible on dark backgrounds.
- Stronger glow is reserved for top-level metrics and primary actions.
- Decorative motion and glow should never compete with status badges or metric values.
