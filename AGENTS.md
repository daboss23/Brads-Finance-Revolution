# AGENTS.md

Guidance for AI coding agents (Codex, Copilot, and others) working in this repo.

## Project

BMK CRM Platform — a Next.js 14 / TypeScript / Tailwind / shadcn/ui app (App Router, Vercel).
See `CLAUDE.md` for full architecture, feature map, and conventions. Key rules that apply to all agents:

- No inline styles. Use Tailwind utility classes and existing CSS variable tokens.
- Use shadcn/ui components — don't build UI primitives from scratch.
- Keep components small and focused.
- Sarah's voice output: plain punctuation only — no dashes, em dashes, asterisks, markdown, bullets, or headers.

## Skills library

This repo carries a set of design/animation reference skills under `.claude/skills/`.
Claude Code discovers and applies them automatically. **Other agents (Codex, Copilot) do not** —
so when doing relevant work, read the matching `SKILL.md` (and any files it links) and follow it.

Each skill is a folder with a `SKILL.md`; some include `references/`, `scripts/`, or `data/`.

| Skill | Read it when |
|---|---|
| `.claude/skills/shadcn/SKILL.md` | Adding/searching/fixing shadcn components, registries, presets — most UI work here. |
| `.claude/skills/frontend-ui-ux/SKILL.md` | Any frontend/UI/UX build, redesign, styling, design QA, or Lighthouse/perf/accessibility audit. |
| `.claude/skills/ui-ux-pro-max/SKILL.md` | Broad UI/UX design intelligence — styles, palettes, font pairings, UX guidelines, charts. |
| `.claude/skills/premium-frontend-ui/SKILL.md` | High-end immersive web experiences with advanced motion and typography. |
| `.claude/skills/dashboard/SKILL.md` | Dark cloud-platform dashboards — modular grids, glass panels, data hierarchy. |
| `.claude/skills/minimalist-ui/SKILL.md` | Clean editorial, warm monochrome, flat bento layouts. |
| `.claude/skills/industrial-brutalist-ui/SKILL.md` | Raw Swiss/terminal brutalist interfaces, data-heavy. |
| `.claude/skills/material-3/SKILL.md` | Material Design 3 (Compose / Flutter / limited web). |
| `.claude/skills/gsap-core/SKILL.md` | GSAP core API — tweens, easing, stagger, matchMedia. |
| `.claude/skills/gsap-timeline/SKILL.md` | Sequencing/choreographing animations with GSAP timelines. |
| `.claude/skills/gsap-scrolltrigger/SKILL.md` | Scroll-linked animation, pinning, parallax, scrub. |
| `.claude/skills/gsap-react/SKILL.md` | GSAP in React/Next.js — useGSAP, refs, cleanup. |
| `.claude/skills/gsap-frameworks/SKILL.md` | GSAP in Vue/Svelte and other non-React frameworks. |
| `.claude/skills/gsap-plugins/SKILL.md` | GSAP plugins — ScrollSmoother, Flip, Draggable, SplitText, SVG, physics. |
| `.claude/skills/gsap-performance/SKILL.md` | Optimizing GSAP animation for smooth 60fps. |
| `.claude/skills/gsap-utils/SKILL.md` | `gsap.utils` helpers — clamp, mapRange, random, snap, etc. |
| `.claude/skills/mobile-app-ui-design/SKILL.md` | Mobile app screens, flows, onboarding, mobile navigation. |
| `.claude/skills/expo-building-native-ui/SKILL.md` | Building apps with Expo Router. |
| `.claude/skills/swiftui/SKILL.md` | Idiomatic Apple-native SwiftUI. |

For this project's stack, the most-used skills are `shadcn`, `frontend-ui-ux`, `ui-ux-pro-max`,
and the `gsap-*` set (relevant to Sarah's animated plasma orb).
