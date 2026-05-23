"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type Props = {
  state?: OrbState;
  size?: number;
  className?: string;
};

type Tendril = {
  baseAngle: number;
  length: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  color: [number, number, number];
  alpha: number;
  thickness: number;
  branchOffsets: Array<{ at: number; angle: number; length: number }>;
  segCount: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

type Ripple = { r: number; alpha: number };

type StateConfig = {
  tendrilCount: number;
  tendrilLengthMin: number;
  tendrilLengthMax: number;
  swayAmp: number;
  swaySpeed: number;
  curlBias: number; // negative = curl inward (thinking), 0 = neutral, positive = reach outward
  paletteWeights: [number, number, number, number]; // cyan, purple, pale, white
  hueCycle: number;
  coreRadius: number;
  coreBreathHz: number;
  coreBreathDepth: number;
  coreDark: number; // 1 = black void, 0 = lighter
  coronaCyan: number;
  coronaPurple: number;
  coronaBlue: number;
  particleRate: number;
  particleMode: number; // 0 outward, 1 inward, 2 outward fast
  rippleEverySec: number;
  regenEveryFrames: number;
};

const STATES: Record<OrbState, StateConfig> = {
  idle: {
    tendrilCount: 16,
    tendrilLengthMin: 110,
    tendrilLengthMax: 180,
    swayAmp: 0.16,
    swaySpeed: 0.6,
    curlBias: 0,
    paletteWeights: [0.55, 0.18, 0.22, 0.05],
    hueCycle: 0,
    coreRadius: 50,
    coreBreathHz: 0.4,
    coreBreathDepth: 0.08,
    coreDark: 1,
    coronaCyan: 0.3,
    coronaPurple: 0.15,
    coronaBlue: 0.08,
    particleRate: 0.55,
    particleMode: 0,
    rippleEverySec: 0,
    regenEveryFrames: 240,
  },
  thinking: {
    tendrilCount: 18,
    tendrilLengthMin: 95,
    tendrilLengthMax: 150,
    swayAmp: 0.28,
    swaySpeed: 1.2,
    curlBias: -0.35,
    paletteWeights: [0.1, 0.68, 0.18, 0.04],
    hueCycle: 0,
    coreRadius: 58,
    coreBreathHz: 0.9,
    coreBreathDepth: 0.16,
    coreDark: 1.1,
    coronaCyan: 0.18,
    coronaPurple: 0.35,
    coronaBlue: 0.05,
    particleRate: 0.75,
    particleMode: 1,
    rippleEverySec: 0,
    regenEveryFrames: 140,
  },
  listening: {
    tendrilCount: 18,
    tendrilLengthMin: 140,
    tendrilLengthMax: 220,
    swayAmp: 0.22,
    swaySpeed: 0.9,
    curlBias: 0.2,
    paletteWeights: [0.55, 0.08, 0.25, 0.12],
    hueCycle: 0,
    coreRadius: 52,
    coreBreathHz: 0.55,
    coreBreathDepth: 0.12,
    coreDark: 1,
    coronaCyan: 0.42,
    coronaPurple: 0.12,
    coronaBlue: 0.1,
    particleRate: 0.65,
    particleMode: 0,
    rippleEverySec: 1.5,
    regenEveryFrames: 180,
  },
  speaking: {
    tendrilCount: 22,
    tendrilLengthMin: 130,
    tendrilLengthMax: 230,
    swayAmp: 0.42,
    swaySpeed: 2.6,
    curlBias: 0.15,
    paletteWeights: [0.32, 0.32, 0.18, 0.18],
    hueCycle: 1,
    coreRadius: 55,
    coreBreathHz: 3.6,
    coreBreathDepth: 0.18,
    coreDark: 0.9,
    coronaCyan: 0.55,
    coronaPurple: 0.4,
    coronaBlue: 0.18,
    particleRate: 2.1,
    particleMode: 2,
    rippleEverySec: 0.5,
    regenEveryFrames: 90,
  },
};

const TRANSITION_MS = 600;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerp4(
  a: [number, number, number, number],
  b: [number, number, number, number],
  t: number
): [number, number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function interpConfig(a: StateConfig, b: StateConfig, t: number): StateConfig {
  return {
    tendrilCount: lerp(a.tendrilCount, b.tendrilCount, t),
    tendrilLengthMin: lerp(a.tendrilLengthMin, b.tendrilLengthMin, t),
    tendrilLengthMax: lerp(a.tendrilLengthMax, b.tendrilLengthMax, t),
    swayAmp: lerp(a.swayAmp, b.swayAmp, t),
    swaySpeed: lerp(a.swaySpeed, b.swaySpeed, t),
    curlBias: lerp(a.curlBias, b.curlBias, t),
    paletteWeights: lerp4(a.paletteWeights, b.paletteWeights, t),
    hueCycle: lerp(a.hueCycle, b.hueCycle, t),
    coreRadius: lerp(a.coreRadius, b.coreRadius, t),
    coreBreathHz: lerp(a.coreBreathHz, b.coreBreathHz, t),
    coreBreathDepth: lerp(a.coreBreathDepth, b.coreBreathDepth, t),
    coreDark: lerp(a.coreDark, b.coreDark, t),
    coronaCyan: lerp(a.coronaCyan, b.coronaCyan, t),
    coronaPurple: lerp(a.coronaPurple, b.coronaPurple, t),
    coronaBlue: lerp(a.coronaBlue, b.coronaBlue, t),
    particleRate: lerp(a.particleRate, b.particleRate, t),
    particleMode: t < 0.5 ? a.particleMode : b.particleMode,
    rippleEverySec: lerp(a.rippleEverySec, b.rippleEverySec, t),
    regenEveryFrames: lerp(a.regenEveryFrames, b.regenEveryFrames, t),
  };
}

const PALETTE: Array<[number, number, number, number]> = [
  // r, g, b, baseAlpha
  [100, 220, 255, 0.9], // cyan
  [150, 100, 255, 0.75], // purple
  [200, 240, 255, 0.55], // pale blue
  [255, 255, 255, 0.95], // white
];

function pickColor(weights: [number, number, number, number]): {
  rgb: [number, number, number];
  alpha: number;
} {
  const total = weights[0] + weights[1] + weights[2] + weights[3];
  let r = Math.random() * total;
  for (let i = 0; i < 4; i++) {
    if (r < weights[i]) {
      const c = PALETTE[i];
      return { rgb: [c[0], c[1], c[2]], alpha: c[3] };
    }
    r -= weights[i];
  }
  const c = PALETTE[0];
  return { rgb: [c[0], c[1], c[2]], alpha: c[3] };
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
}

function cyclePalette(t: number): [number, number, number] {
  const stops: Array<[number, number, number]> = [
    [0, 220, 255],
    [120, 220, 255],
    [180, 120, 255],
    [255, 255, 255],
    [255, 215, 100],
  ];
  const f = ((t % 1) + 1) % 1;
  const idx = f * stops.length;
  const i0 = Math.floor(idx) % stops.length;
  const i1 = (i0 + 1) % stops.length;
  const tt = idx - Math.floor(idx);
  return [
    lerp(stops[i0][0], stops[i1][0], tt),
    lerp(stops[i0][1], stops[i1][1], tt),
    lerp(stops[i0][2], stops[i1][2], tt),
  ];
}

function generateTendril(cfg: StateConfig): Tendril {
  const baseAngle = Math.random() * Math.PI * 2;
  const length = lerp(cfg.tendrilLengthMin, cfg.tendrilLengthMax, Math.random());
  const { rgb, alpha } = pickColor(cfg.paletteWeights);
  const branchOffsets: Tendril["branchOffsets"] = [];
  const branchCount = Math.random() < 0.6 ? 1 : Math.random() < 0.4 ? 2 : 0;
  for (let i = 0; i < branchCount; i++) {
    branchOffsets.push({
      at: 0.35 + Math.random() * 0.45,
      angle: (Math.random() - 0.5) * 1.2,
      length: length * (0.35 + Math.random() * 0.35),
    });
  }
  return {
    baseAngle,
    length,
    swayAmp: cfg.swayAmp * (0.7 + Math.random() * 0.7),
    swaySpeed: cfg.swaySpeed * (0.6 + Math.random() * 0.9),
    phase: Math.random() * Math.PI * 2,
    color: rgb,
    alpha: alpha * (0.7 + Math.random() * 0.4),
    thickness: 0.8 + Math.random() * 1.2,
    branchOffsets,
    segCount: 7,
  };
}

export function SarahOrb({ state = "idle", size = 500, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetStateRef = useRef<OrbState>(state);
  const prevStateRef = useRef<OrbState>(state);
  const transitionStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (state !== targetStateRef.current) {
      prevStateRef.current = targetStateRef.current;
      targetStateRef.current = state;
      transitionStartRef.current = performance.now();
    }
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;

    let tendrils: Tendril[] = [];
    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    let frame = 0;
    let lastRegen = 0;
    let lastRippleSec = -1;
    const startTs = performance.now();
    transitionStartRef.current = startTs;

    function currentCfg(now: number): StateConfig {
      const elapsed = now - transitionStartRef.current;
      const t = Math.min(1, Math.max(0, elapsed / TRANSITION_MS));
      const eased = easeInOut(t);
      return interpConfig(
        STATES[prevStateRef.current],
        STATES[targetStateRef.current],
        eased
      );
    }

    function regenerate(cfg: StateConfig) {
      const count = Math.max(4, Math.round(cfg.tendrilCount));
      tendrils = [];
      for (let i = 0; i < count; i++) {
        const t = generateTendril(cfg);
        t.baseAngle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        tendrils.push(t);
      }
    }

    function buildPolyline(
      t: Tendril,
      cfg: StateConfig,
      time: number,
      coreEdge: number,
      hueCycledOverride?: [number, number, number]
    ): { points: Array<{ x: number; y: number }>; color: [number, number, number]; alpha: number } {
      const N = t.segCount;
      const pts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const r = coreEdge + u * t.length;
        const sway =
          Math.sin(time * t.swaySpeed + t.phase + u * 1.6) * t.swayAmp * u;
        const curl = cfg.curlBias * u * 0.5;
        const angle = t.baseAngle + sway + curl;
        pts.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
        });
      }
      const color = hueCycledOverride ?? t.color;
      return { points: pts, color, alpha: t.alpha };
    }

    function drawSmoothPath(
      points: Array<{ x: number; y: number }>,
      width: number,
      color: string,
      blur: number,
      shadow: string
    ) {
      if (!ctx || points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      // Smooth through midpoints (quadratic curves through anchors)
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = blur;
      ctx.shadowColor = shadow;
      ctx.stroke();
    }

    function drawTendril(
      t: Tendril,
      cfg: StateConfig,
      time: number,
      coreEdge: number,
      hueShifted?: [number, number, number]
    ) {
      const built = buildPolyline(t, cfg, time, coreEdge, hueShifted);
      const pts = built.points;
      const c = built.color;
      const a = built.alpha;
      const shadow = rgba(c, 1);

      // Fade-along-length: draw in two halves with tapering line width and alpha.
      // Pass 1: wide soft glow
      drawSmoothPath(pts, 6 * t.thickness, rgba(c, a * 0.18), 22, shadow);
      // Pass 2: mid colour
      drawSmoothPath(pts, 2.5 * t.thickness, rgba(c, a * 0.85), 14, shadow);
      // Pass 3: bright core
      drawSmoothPath(pts, 0.9 * t.thickness, rgba([255, 255, 255], a * 0.85), 6, shadow);

      // Branches
      for (const b of t.branchOffsets) {
        const atIdx = Math.max(1, Math.floor((pts.length - 1) * b.at));
        const from = pts[atIdx];
        const parentAng = Math.atan2(
          pts[atIdx].y - pts[atIdx - 1].y,
          pts[atIdx].x - pts[atIdx - 1].x
        );
        const branchAngle =
          parentAng + b.angle + Math.sin(time * t.swaySpeed * 1.3 + t.phase) * 0.15;
        const bN = 5;
        const bPts: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < bN; i++) {
          const u = i / (bN - 1);
          const r = u * b.length;
          const sway = Math.sin(time * t.swaySpeed * 1.4 + t.phase + i) * 0.18 * u;
          const ang = branchAngle + sway;
          bPts.push({
            x: from.x + Math.cos(ang) * r,
            y: from.y + Math.sin(ang) * r,
          });
        }
        drawSmoothPath(bPts, 3 * t.thickness, rgba(c, a * 0.22), 14, shadow);
        drawSmoothPath(bPts, 1.1 * t.thickness, rgba(c, a * 0.7), 8, shadow);
        drawSmoothPath(bPts, 0.5 * t.thickness, rgba([255, 255, 255], a * 0.7), 4, shadow);
      }
    }

    function spawnParticle(cfg: StateConfig, coreEdge: number) {
      const a = Math.random() * Math.PI * 2;
      const size = 0.8 + Math.random() * 2.2;
      if (cfg.particleMode === 1) {
        const r = coreEdge + Math.random() * 160;
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: -Math.cos(a) * (0.35 + Math.random() * 0.4),
          vy: -Math.sin(a) * (0.35 + Math.random() * 0.4),
          life: 0,
          maxLife: 110,
          size,
        });
      } else if (cfg.particleMode === 2) {
        const speed = 2 + Math.random() * 2;
        particles.push({
          x: cx + Math.cos(a) * coreEdge,
          y: cy + Math.sin(a) * coreEdge,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          maxLife: 60,
          size,
        });
      } else {
        const speed = 0.4 + Math.random() * 0.5;
        particles.push({
          x: cx + Math.cos(a) * coreEdge,
          y: cy + Math.sin(a) * coreEdge,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          maxLife: 160,
          size,
        });
      }
    }

    function updateParticles(cfg: StateConfig, coreEdge: number) {
      let toSpawn = cfg.particleRate;
      while (toSpawn > 0) {
        if (toSpawn >= 1 || Math.random() < toSpawn) spawnParticle(cfg, coreEdge);
        toSpawn -= 1;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }
    }

    function render() {
      if (!ctx) return;
      const now = performance.now();
      const elapsedSec = (now - startTs) / 1000;
      const cfg = currentCfg(now);

      const breath =
        1 +
        Math.sin(elapsedSec * Math.PI * 2 * cfg.coreBreathHz) *
          cfg.coreBreathDepth;
      const coreEdge = cfg.coreRadius * breath;

      ctx.clearRect(0, 0, size, size);
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";

      // Corona glow rings — drawn first so tendrils sit on top
      ctx.globalCompositeOperation = "lighter";

      const coronaCyan = ctx.createRadialGradient(cx, cy, coreEdge * 0.9, cx, cy, coreEdge * 1.9);
      coronaCyan.addColorStop(0, `rgba(0,200,255,${cfg.coronaCyan})`);
      coronaCyan.addColorStop(1, "rgba(0,200,255,0)");
      ctx.fillStyle = coronaCyan;
      ctx.fillRect(0, 0, size, size);

      const coronaPurple = ctx.createRadialGradient(cx, cy, coreEdge * 1, cx, cy, coreEdge * 2.6);
      coronaPurple.addColorStop(0, `rgba(150,50,255,${cfg.coronaPurple})`);
      coronaPurple.addColorStop(1, "rgba(150,50,255,0)");
      ctx.fillStyle = coronaPurple;
      ctx.fillRect(0, 0, size, size);

      const coronaBlue = ctx.createRadialGradient(cx, cy, coreEdge * 1.1, cx, cy, coreEdge * 3.4);
      coronaBlue.addColorStop(0, `rgba(0,100,200,${cfg.coronaBlue})`);
      coronaBlue.addColorStop(1, "rgba(0,100,200,0)");
      ctx.fillStyle = coronaBlue;
      ctx.fillRect(0, 0, size, size);

      // Ripples
      if (cfg.rippleEverySec > 0.001) {
        const period = cfg.rippleEverySec;
        const sec = elapsedSec;
        if (Math.floor(sec / period) > lastRippleSec) {
          ripples.push({ r: coreEdge, alpha: 0.55 });
          lastRippleSec = Math.floor(sec / period);
        }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 1.1;
        r.alpha -= 0.0055;
        if (r.alpha <= 0 || r.r > size * 0.55) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba([100, 220, 255], r.alpha);
        ctx.lineWidth = 1.3;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(100,220,255,0.8)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Particles
      for (const p of particles) {
        const lifeT = p.life / p.maxLife;
        const a = (1 - lifeT) * 0.85;
        const r = p.size;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0, rgba([220, 245, 255], a));
        grad.addColorStop(0.5, rgba([100, 220, 255], a * 0.55));
        grad.addColorStop(1, "rgba(100,220,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tendrils — speaking palette cycles
      const cycledColor: [number, number, number] | undefined =
        cfg.hueCycle > 0.01 ? cyclePalette(elapsedSec * 0.45) : undefined;

      for (const t of tendrils) {
        const useHue =
          cycledColor && Math.random() < cfg.hueCycle ? cycledColor : undefined;
        drawTendril(t, cfg, elapsedSec, coreEdge, useHue);
      }
      ctx.shadowBlur = 0;

      // Dark void core (drawn LAST, on top, so tendrils appear to emerge from its rim)
      ctx.globalCompositeOperation = "source-over";
      const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreEdge);
      voidGrad.addColorStop(0, `rgba(5,5,16,${cfg.coreDark})`);
      voidGrad.addColorStop(0.7, `rgba(5,5,16,${cfg.coreDark * 0.85})`);
      voidGrad.addColorStop(1, "rgba(5,5,16,0)");
      ctx.fillStyle = voidGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreEdge * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // Bright rim around the void to make it pop
      ctx.globalCompositeOperation = "lighter";
      const rimGrad = ctx.createRadialGradient(cx, cy, coreEdge * 0.95, cx, cy, coreEdge * 1.15);
      rimGrad.addColorStop(0, "rgba(0,0,0,0)");
      rimGrad.addColorStop(0.5, "rgba(120,220,255,0.35)");
      rimGrad.addColorStop(1, "rgba(120,220,255,0)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreEdge * 1.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      updateParticles(cfg, coreEdge);

      const regenInterval = Math.max(40, Math.round(cfg.regenEveryFrames));
      if (frame - lastRegen >= regenInterval || tendrils.length === 0) {
        regenerate(cfg);
        lastRegen = frame;
      }

      frame++;
      rafRef.current = requestAnimationFrame(render);
    }

    regenerate(STATES[targetStateRef.current]);
    render();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn("block", className)}
    />
  );
}
