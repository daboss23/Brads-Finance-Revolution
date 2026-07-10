# Newcastle Financial Services — Command System Design

## 1. Atmosphere & Identity

The platform is a black and gold luxury financial command system: private banking software crossed with a high-end instrument cluster. Surfaces are warm near-black machined panels with champagne-gold rim light; gold marks intent, readiness, and decision moments. Muted teal and soft blue are quiet telemetry accents. The one moment a visitor remembers: the gold-ringed Intelligence Flow engine breathing at the centre of the Command Centre, with Sarah's core glowing inside it. Quiet wealth, precision, control, trust — an elite adviser cockpit, never a generic SaaS dashboard.

## 2. Color

### Palette

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Page background | `--background` | `220 20% 3%` (#050608) | App shell background |
| Primary text | `--foreground` | `44 35% 94%` (#F5F2EA) | Headlines and body text |
| Card surface | `--card` | `218 17% 8%` (#10141A) | Standard panels and tables |
| Elevated surface | `--surface-elevated` | `220 18% 13%` (#1C2028) | Higher-emphasis modules |
| Secondary surface | `--secondary` | `219 15% 13%` | Tinted chips and subdued containers |
| Muted surface | `--muted` | `219 15% 12%` | Track fills and quiet backgrounds |
| Secondary text | `--muted-foreground` | `45 5% 65%` (#A9A7A0) | Metadata and helper copy |
| Faint text | `--text-faint` | `120 3% 45%` (#6F746F) | Tertiary labels only |
| Border | `--border` | `219 14% 18%` | Dividers and panel outlines |
| Gold ramp | `--gold-bright` → `--gold` → `--gold-dim` → `--gold-shadow` | #F0D28A → #C9A84C → dim → #6E5220 | CTAs, readiness, focus, rim light |
| Teal accent | `--teal-accent` | `175 65% 53%` (#36D6C8) | Telemetry, Sarah energy |
| Soft blue | `--blue-accent` | `212 100% 65%` (#4EA3FF) | Progress and system activity |
| Success | `--success` | `158 57% 50%` (#38C98B) | Completed / healthy |
| Warning | `--warning` | `36 66% 54%` (#D89A3D) | Attention and review pressure |
| Destructive | `--destructive` | `6 63% 55%` (#D65345) | Critical alerts only |

### Rules

- Gold is a ramp, not one hex: bright for lit edges and numbers, champagne for chrome, shadow for depth. Never bright yellow, never neon.
- Teal/blue are atmospheric telemetry accents, never primary semantics. Violet is retired.
- Red only for critical blockers. Amber for pressure and review states.
- No white backgrounds anywhere; no rainbow gradients.
- New UI work must use existing HSL tokens or document additions here first.

## 3. Typography

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Page title | `28px-34px` | `600` | `1` | Main route headings |
| Section title | `17px-18px` | `600` | `1.2` | Panel titles |
| Metric value | `34px-40px` | `600` | `1` | KPI numbers (tabular figures) |
| Body | `13px-14px` | `400-500` | `1.5-1.6` | Primary supporting copy |
| Meta | `12px` | `500-600` | `1.4` | Status and helper text |
| Command label | `10px` | `600` | `0.22em tracking` | Uppercase overlines (`.cmd-label`) |

- Fonts: Geist Sans (`--font-geist`) primary, Geist Mono for tabular/serial data.
- Uppercase micro-labels with wide letter-spacing are the signature technical register.
- Metric numbers use `tnum` feature settings — sharp and dense, not spectacle.

## 4. Spacing & Layout

- 4px rhythm; standard card padding 16-20px; panel gutters 12-16px.
- Max content width `1480px`; breakpoints `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.
- Every page: one clear central feature module, primary and secondary zones, fewer equal-weight cards. Desktop first, tablet clean, mobile stacked.
- First screenful answers the route's core operational question.

## 5. Components

### Instrument Panel (`.glass-panel` + `.glass-hover`)
- Machined dark gradient surface, thin warm border, inner gold-tinted rim light (`::before`), deep drop shadow. Hover: gold border bloom + soft gold glow.
- Variants via edge glows: `.edge-gold` `.edge-teal` `.edge-blue` `.edge-emerald` `.edge-orange`.

### Gold Button (`.btn-gold`) / Ghost Button (`.btn-glass`)
- Gold: brushed champagne vertical gradient, lit top edge, antique shadow base, dark text. Hover deepens glow.
- Ghost: dark translucent instrument key with gold border on hover.

### PageHeader
- `.cmd-label` overline, page title, short subtitle, right side: status pill / date / primary action.

### MetricCard
- Overline, large tabular number, helper copy, thin progress rail, small icon capsule. Tones: gold (readiness), teal (telemetry), amber (attention), emerald (done), blue (system).

### StatusPill / Status Badge
- Compact bordered chip; text always explicit, never color-only. Live states get `.status-live` ping.

### CircularEngine (Intelligence Flow)
- Dominant dashboard module: Sarah core centre, rotating gold ring, 8 stage nodes with counts and live dots, gold connective arc. Slow orbit (28s), breathing core, disabled under reduced motion.

### Priority Queue Row / Client Row
- Severity badge, title, agent + client metadata, forward chevron. Full row clickable, hover elevation only.

### Agent Node / AgentActivityStrip
- Name, role, written-out status, tone dot. Chain order: Sarah → Beacon → Guardian → Scribe → Orion → ATLAS, with Nexus as system health. Retired names (Oracle, Forge, Cipher, Nova, Vanta) must not appear.

### Gold Rule (`.gold-rule`)
- 1px divider fading from transparent through gold — section separation inside dark panels.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | `150ms-200ms` | `ease-out` | Button and row hover |
| Standard | `250ms-300ms` | `ease-in-out` | Panel hover and transitions |
| Ambient | `6s-28s` | `ease-in-out` / linear | Breathing glow, ring rotation, rail sheen |

- Only animate `transform`, `opacity`, `filter`.
- Motion is system awareness, not entertainment: subtle pulse, breathing glow, slow ring rotation, soft status blink.
- `prefers-reduced-motion` disables all ambient animation.

## 7. Depth & Surface

- Luxury metal/glass instrumentation, not glassmorphism: restrained blur, layered gradients, machined rim light, deep shadows.
- Gold rim lighting is the signature material — panel `::before` rims, `.gold-rule` dividers, active nav inset.
- Strong glow reserved for the central engine, top-level metrics, and primary actions. Decoration never competes with status and metric values.
