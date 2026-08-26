---
name: threejs-r3f
description: >-
  Build and edit 3D / WebGL visuals in this BMK CRM using React Three Fiber (the
  project already depends on three, @react-three/fiber, @react-three/drei and
  @react-three/postprocessing). Use this whenever the task involves a Three.js
  scene, an R3F <Canvas>, a GLSL shader, a plasma/orb/glow/energy effect, an
  animated 3D node graph or constellation, a particle system, or any request
  phrased as "3D", "WebGL", "shader", "make the dashboard core feel alive", or
  "add a 3D visualization" — even when the user does not name Three.js directly.
  It captures the exact house pattern proven by components/orb (SSR-safe dynamic
  loading, a WebGL context-loss + error CSS fallback, useFrame state lerping,
  shaders kept in their own module, palette-as-identity, Tailwind-token-only
  styling) so new 3D work matches what already ships instead of reinventing it.
---

# Three.js / React Three Fiber in the BMK CRM

This project renders 3D through **React Three Fiber (R3F)**, not raw `three`
scene graphs. The reference implementation is Sarah's Fusion Core in
`components/orb/` — read it before writing anything new:

- `components/orb/OrbCanvas.tsx` — the `<Canvas>` host, fallback and recovery
- `components/orb/PlasmaOrb.tsx` — the scene: meshes, uniforms, `useFrame` loop
- `components/orb/shaders.ts` — all GLSL, exported as tagged string constants
- `components/dashboard/EngineCore3D.tsx` — the SSR-safe `dynamic()` wrapper

Match that structure. The rules below are what make these scenes ship-safe on
Vercel and feel like one product; follow the reasoning, not just the letter.

## The four-file shape

Every 3D feature is four small files, each with one job. Keeping them split is
what lets Next.js code-split the WebGL bundle out of the server render and lets
you reason about the render loop without wading through shader source.

1. **`XyzCanvas.tsx`** (`"use client"`) — owns the `<Canvas>`, the error
   boundary, the CSS fallback and WebGL context-loss handling. No scene logic.
2. **`Xyz.tsx`** (`"use client"`) — the scene: geometry, `useMemo` uniforms,
   the `useFrame` loop. No `<Canvas>`, so it can be tested/reasoned about alone.
3. **`shaders.ts`** — every vertex/fragment shader as an exported
   `` /* glsl */ `...` `` constant. Never inline shader strings in the scene file.
4. **`Xyz3D.tsx`** — a tiny `dynamic(() => import("./XyzCanvas"), { ssr: false })`
   wrapper with a CSS `loading` placeholder. This is the only thing pages import.

## Non-negotiables (why each exists)

- **`"use client"`** on the Canvas and scene files. R3F touches `window`/WebGL.
- **Load the Canvas via `next/dynamic` with `ssr: false`.** WebGL cannot render
  on the server; without this the build or first paint crashes. The wrapper's
  `loading` fallback must be a pure-CSS shape (a radial-gradient div) so there is
  never a blank hole while the chunk streams.
- **Always ship a non-WebGL fallback.** Some clients have no WebGL, and browsers
  drop GL contexts under memory pressure. Copy OrbCanvas's `OrbErrorBoundary` +
  `CssFallbackOrb` + `webglcontextlost`/`webglcontextrestored` listeners. A
  finance dashboard must degrade to a tasteful gradient, never a broken canvas.
- **Reuse OrbCanvas's `gl` config** for anything that floats over the dark UI:
  `alpha: true`, `premultipliedAlpha: false`, `powerPreference: "high-performance"`,
  `failIfMajorPerformanceCaveat: false`, and in `onCreated` set
  `gl.setClearColor(0x000000, 0); gl.setClearAlpha(0); scene.background = null;`
  so the scene composites onto the CRM's gradients instead of a black box.
- **Cap `dpr`** at `[1, 1.5]`. Retina at full DPR tanks framerate for no visible
  gain on glow-heavy additive scenes.
- **No inline styles, ever** (see root `CLAUDE.md`). Size and place the canvas
  with Tailwind utilities and `hsl(var(--token))` CSS variables. `--gold`,
  `--gold-glow`, `--teal-accent`, `--gold-shadow` are the brand tokens; the
  plasma identity colours (`#c2410c` warm → `#7fd4ff` cool) live in the scene.

## The render loop

Drive everything from a single `useFrame`. Never call `setState` per frame —
mutate `ref`s and shader `uniforms.*.value` in place. Read `clock.elapsedTime`
for absolute time and the `dt` argument for frame-rate-independent motion.

**Lerp toward state targets, don't snap.** The orb keeps a `currentRef` of live
values and a `STATE_TARGETS` table, then each frame does
`cur.x = THREE.MathUtils.lerp(cur.x, target.x, Math.min(1, dt * k))`. This is
why state changes (idle → thinking) glide instead of popping. Use the same
pattern for any prop- or data-driven scene (agent activity, generation
progress, compliance score): map the data to a target energy, lerp to it.

**Uniforms:** build them once in `useMemo`, clone `THREE.Color`/`Vector3` values
so instances never share mutable objects, and update `.value` in the loop. Give
`points`/instanced geometry an explicit `boundingSphere` and
`frustumCulled={false}` when it extends past its origin, or it will vanish when
the origin leaves view (see the ember and frequency-ring geometry).

## Palette is identity

Colours are defined once at module scope as `THREE.Color` constants and treated
as fixed. State changes energy — intensity, speed, turbulence, displacement —
**not hue**. When you need a new scene to feel part of the family, reach for the
same warm-orange↔electric-blue axis and gold rim, and vary motion to signal
state. A scene that recolours to signal state looks like a different product.

## Performance and safety checklist

- Additive blending (`THREE.AdditiveBlending`, `transparent`, `depthWrite: false`)
  for all glow/energy layers so they sum into light on the dark UI.
- Prefer a few shader-driven meshes and one `points` cloud over many draw calls.
- Keep particle counts modest (the orb uses 160 embers, ~1300 ring points) and
  `useMemo` all geometry so it is built once, not per render.
- `pointer-events-none` on decorative canvases so they never eat clicks.
- After any change, run `npm run lint` and `npx tsc --noEmit`; `@types/three` is
  installed, so type the refs (`useRef<THREE.ShaderMaterial>(null)`).

## More detail

`references/component-template.md` has a copy-paste four-file skeleton with the
Canvas host, fallback, dynamic wrapper and a minimal glow shader already wired
to these conventions. Read it when starting a brand-new scene.
