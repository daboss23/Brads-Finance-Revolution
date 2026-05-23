"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type Props = {
  state?: OrbState;
  size?: number;
  className?: string;
};

type Vec = { x: number; y: number };

type Bolt = {
  points: Vec[];
  branches: Vec[][];
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
  boltCount: number;
  redrawEvery: number;
  primary: [number, number, number];
  secondary: [number, number, number];
  tip: [number, number, number];
  glowOuter: [number, number, number];
  glowMid: [number, number, number];
  glowFar: [number, number, number];
  coreBrightness: number;
  coreSizeMul: number;
  coreBreathHz: number;
  coreBreathDepth: number;
  glowMul: number;
  glowPulseHz: number;
  rotation: number;
  jitter: number;
  particleRate: number;
  particleMode: number; // 0 idle, 1 vortex thinking, 2 ambient listening, 3 burst speaking
  rippleRate: number;
  waveAlpha: number;
  hueCycle: number; // 0 fixed, 1 cycling speaking
};

const STATES: Record<OrbState, StateConfig> = {
  idle: {
    boltCount: 9,
    redrawEvery: 25,
    primary: [0, 235, 255],
    secondary: [40, 130, 255],
    tip: [255, 255, 255],
    glowOuter: [0, 200, 255],
    glowMid: [0, 100, 200],
    glowFar: [60, 0, 180],
    coreBrightness: 0.85,
    coreSizeMul: 1,
    coreBreathHz: 0.33,
    coreBreathDepth: 0.22,
    glowMul: 1,
    glowPulseHz: 0.4,
    rotation: 0.0006,
    jitter: 0.22,
    particleRate: 0.55,
    particleMode: 0,
    rippleRate: 0,
    waveAlpha: 0,
    hueCycle: 0,
  },
  thinking: {
    boltCount: 12,
    redrawEvery: 12,
    primary: [180, 130, 255],
    secondary: [123, 47, 255],
    tip: [230, 200, 255],
    glowOuter: [140, 60, 255],
    glowMid: [80, 20, 200],
    glowFar: [60, 0, 160],
    coreBrightness: 0.7,
    coreSizeMul: 0.9,
    coreBreathHz: 0.9,
    coreBreathDepth: 0.3,
    glowMul: 1.05,
    glowPulseHz: 0.55,
    rotation: 0.006,
    jitter: 0.24,
    particleRate: 0.9,
    particleMode: 1,
    rippleRate: 0,
    waveAlpha: 0,
    hueCycle: 0,
  },
  listening: {
    boltCount: 11,
    redrawEvery: 10,
    primary: [0, 229, 255],
    secondary: [40, 180, 220],
    tip: [255, 215, 100],
    glowOuter: [0, 220, 230],
    glowMid: [0, 130, 200],
    glowFar: [80, 30, 180],
    coreBrightness: 0.95,
    coreSizeMul: 1.05,
    coreBreathHz: 0.55,
    coreBreathDepth: 0.18,
    glowMul: 1.05,
    glowPulseHz: 0.5,
    rotation: 0.0014,
    jitter: 0.22,
    particleRate: 0.6,
    particleMode: 2,
    rippleRate: 0.022,
    waveAlpha: 0,
    hueCycle: 0,
  },
  speaking: {
    boltCount: 18,
    redrawEvery: 2.5,
    primary: [120, 230, 255],
    secondary: [60, 130, 255],
    tip: [255, 215, 100],
    glowOuter: [0, 220, 255],
    glowMid: [80, 60, 255],
    glowFar: [180, 60, 255],
    coreBrightness: 1.15,
    coreSizeMul: 1.15,
    coreBreathHz: 4,
    coreBreathDepth: 0.22,
    glowMul: 1.2,
    glowPulseHz: 2.4,
    rotation: 0.0025,
    jitter: 0.34,
    particleRate: 2.2,
    particleMode: 3,
    rippleRate: 0,
    waveAlpha: 0.6,
    hueCycle: 1,
  },
};

const TRANSITION_MS = 800;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function interpConfig(a: StateConfig, b: StateConfig, t: number): StateConfig {
  return {
    boltCount: lerp(a.boltCount, b.boltCount, t),
    redrawEvery: lerp(a.redrawEvery, b.redrawEvery, t),
    primary: lerpColor(a.primary, b.primary, t),
    secondary: lerpColor(a.secondary, b.secondary, t),
    tip: lerpColor(a.tip, b.tip, t),
    glowOuter: lerpColor(a.glowOuter, b.glowOuter, t),
    glowMid: lerpColor(a.glowMid, b.glowMid, t),
    glowFar: lerpColor(a.glowFar, b.glowFar, t),
    coreBrightness: lerp(a.coreBrightness, b.coreBrightness, t),
    coreSizeMul: lerp(a.coreSizeMul, b.coreSizeMul, t),
    coreBreathHz: lerp(a.coreBreathHz, b.coreBreathHz, t),
    coreBreathDepth: lerp(a.coreBreathDepth, b.coreBreathDepth, t),
    glowMul: lerp(a.glowMul, b.glowMul, t),
    glowPulseHz: lerp(a.glowPulseHz, b.glowPulseHz, t),
    rotation: lerp(a.rotation, b.rotation, t),
    jitter: lerp(a.jitter, b.jitter, t),
    particleRate: lerp(a.particleRate, b.particleRate, t),
    particleMode: t < 0.5 ? a.particleMode : b.particleMode,
    rippleRate: lerp(a.rippleRate, b.rippleRate, t),
    waveAlpha: lerp(a.waveAlpha, b.waveAlpha, t),
    hueCycle: lerp(a.hueCycle, b.hueCycle, t),
  };
}

function midpointDisplace(start: Vec, end: Vec, displacement: number, depth: number): Vec[] {
  if (depth <= 0) return [start, end];
  const mid: Vec = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const off = (Math.random() - 0.5) * displacement;
  mid.x += nx * off;
  mid.y += ny * off;
  const left = midpointDisplace(start, mid, displacement / 2, depth - 1);
  const right = midpointDisplace(mid, end, displacement / 2, depth - 1);
  return [...left.slice(0, -1), ...right];
}

function generateBolt(cx: number, cy: number, radius: number, angle: number, jitter: number): Bolt {
  const reach = radius * (0.75 + Math.random() * 0.25);
  const end: Vec = { x: cx + Math.cos(angle) * reach, y: cy + Math.sin(angle) * reach };
  const start: Vec = { x: cx, y: cy };
  const points = midpointDisplace(start, end, reach * jitter, 6);

  const branches: Vec[][] = [];
  const branchCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < branchCount; i++) {
    const t = 0.3 + Math.random() * 0.55;
    const idx = Math.max(1, Math.floor(points.length * t));
    const from = points[idx];
    const branchAngle = angle + (Math.random() - 0.5) * 1.6;
    const branchLen = reach * (0.18 + Math.random() * 0.35);
    const bEnd: Vec = {
      x: from.x + Math.cos(branchAngle) * branchLen,
      y: from.y + Math.sin(branchAngle) * branchLen,
    };
    branches.push(midpointDisplace(from, bEnd, branchLen * jitter, 4));
  }
  return { points, branches };
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
}

function cyclePalette(t: number): [number, number, number] {
  const palette: Array<[number, number, number]> = [
    [0, 255, 255],
    [120, 220, 255],
    [180, 120, 255],
    [255, 255, 255],
    [255, 215, 100],
  ];
  const total = palette.length;
  const f = ((t % 1) + 1) % 1;
  const idx = f * total;
  const i0 = Math.floor(idx) % total;
  const i1 = (i0 + 1) % total;
  const tt = idx - Math.floor(idx);
  return lerpColor(palette[i0], palette[i1], tt) as [number, number, number];
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
    const radius = size * 0.4; // sphere is 80% of canvas; canvas leaves room for glow

    let bolts: Bolt[] = [];
    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    let frame = 0;
    let rotation = 0;
    let lastRedraw = 0;
    let lastRipple = 0;
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

    function regenerateBolts(cfg: StateConfig) {
      const count = Math.max(2, Math.round(cfg.boltCount));
      const next: Bolt[] = [];
      for (let i = 0; i < count; i++) {
        const angle =
          (i / count) * Math.PI * 2 + Math.random() * 0.6 + rotation;
        next.push(generateBolt(cx, cy, radius, angle, cfg.jitter));
      }
      bolts = next;
    }

    function spawnParticle(cfg: StateConfig) {
      const a = Math.random() * Math.PI * 2;
      const sizePx = 0.8 + Math.random() * 1.4;
      if (cfg.particleMode === 1) {
        const r = radius * (0.95 + Math.random() * 0.2);
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: -Math.cos(a) * 0.4 - Math.sin(a) * 0.6,
          vy: -Math.sin(a) * 0.4 + Math.cos(a) * 0.6,
          life: 0,
          maxLife: 90,
          size: sizePx,
        });
      } else if (cfg.particleMode === 3) {
        const speed = 1.8 + Math.random() * 1.6;
        particles.push({
          x: cx + Math.cos(a) * radius * 0.18,
          y: cy + Math.sin(a) * radius * 0.18,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          maxLife: 55,
          size: sizePx,
        });
      } else if (cfg.particleMode === 2) {
        const r = radius * Math.random();
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: Math.cos(a) * 0.18,
          vy: Math.sin(a) * 0.18,
          life: 0,
          maxLife: 120,
          size: sizePx,
        });
      } else {
        const r = radius * (0.15 + Math.random() * 0.5);
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: Math.cos(a) * 0.28,
          vy: Math.sin(a) * 0.28,
          life: 0,
          maxLife: 170,
          size: sizePx,
        });
      }
    }

    function updateParticles(cfg: StateConfig) {
      let toSpawn = cfg.particleRate;
      while (toSpawn > 0) {
        if (toSpawn >= 1 || Math.random() < toSpawn) spawnParticle(cfg);
        toSpawn -= 1;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (cfg.particleMode === 1) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / d) * 0.035;
          p.vy += (dy / d) * 0.035;
          p.vx += (-dy / d) * 0.025;
          p.vy += (dx / d) * 0.025;
        }
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }
    }

    function drawPath(points: Vec[], width: number, color: string, blur: number, shadow: string) {
      if (!ctx || points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = blur;
      ctx.shadowColor = shadow;
      ctx.stroke();
    }

    function render() {
      if (!ctx) return;
      const now = performance.now();
      const elapsedSec = (now - startTs) / 1000;
      const cfg = currentCfg(now);
      rotation += cfg.rotation;

      const primary =
        cfg.hueCycle > 0.01
          ? lerpColor(cfg.primary, cyclePalette(elapsedSec * 0.45), cfg.hueCycle)
          : cfg.primary;
      const secondary =
        cfg.hueCycle > 0.01
          ? lerpColor(cfg.secondary, cyclePalette(elapsedSec * 0.45 + 0.3), cfg.hueCycle)
          : cfg.secondary;
      const tipColor = cfg.tip;

      const breath =
        1 +
        Math.sin(elapsedSec * Math.PI * 2 * cfg.coreBreathHz) *
          cfg.coreBreathDepth;
      const glowPulse =
        1 +
        Math.sin(elapsedSec * Math.PI * 2 * cfg.glowPulseHz) * 0.18;

      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;

      // Outer atmospheric glow (drawn OUTSIDE the sphere clip, layered radial gradients)
      const glowR1 = radius * 1.05 * cfg.glowMul * glowPulse;
      const g1 = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, glowR1);
      g1.addColorStop(0, rgba(cfg.glowOuter, 0.22));
      g1.addColorStop(1, rgba(cfg.glowOuter, 0));
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, size, size);

      const glowR2 = radius * 1.25 * cfg.glowMul * glowPulse;
      const g2 = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, glowR2);
      g2.addColorStop(0, rgba(cfg.glowMid, 0.18));
      g2.addColorStop(1, rgba(cfg.glowMid, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, size, size);

      const glowR3 = radius * 1.5 * cfg.glowMul * glowPulse;
      const g3 = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, glowR3);
      g3.addColorStop(0, rgba(cfg.glowFar, 0.1));
      g3.addColorStop(1, rgba(cfg.glowFar, 0));
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, size, size);

      // === Sphere clip ===
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Sphere base radial gradient (centre #1a3a6e, mid #0a1a4a, edge fade)
      const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      base.addColorStop(0, "rgba(26,58,110,1)");
      base.addColorStop(0.55, "rgba(10,26,74,1)");
      base.addColorStop(1, "rgba(2,4,18,0.6)");
      ctx.fillStyle = base;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.globalCompositeOperation = "lighter";

      // Frequency wave lines (speaking)
      if (cfg.waveAlpha > 0.02) {
        const waves = 3;
        for (let w = 0; w < waves; w++) {
          ctx.beginPath();
          const amp = radius * 0.16 * (1 - w * 0.22);
          const freq = 0.045 + w * 0.018;
          const phase = elapsedSec * (4.5 + w * 1.6);
          const yOff = (w - (waves - 1) / 2) * radius * 0.18;
          for (let x = -radius; x <= radius; x += 2) {
            const env = Math.cos((x / radius) * 1.4);
            const y = Math.sin(x * freq + phase) * amp * env;
            const px = cx + x;
            const py = cy + yOff + y;
            if (x === -radius) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = rgba(primary, cfg.waveAlpha * (0.5 - w * 0.1));
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = rgba(primary, 0.8);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Ripple rings (listening)
      if (cfg.rippleRate > 0.001) {
        if (frame - lastRipple > 1 / Math.max(cfg.rippleRate, 0.001)) {
          ripples.push({ r: radius * 0.15, alpha: 0.6 });
          lastRipple = frame;
        }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 0.9;
        r.alpha -= 0.006;
        if (r.alpha <= 0 || r.r > radius * 1.05) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(primary, r.alpha);
        ctx.lineWidth = 1.4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = rgba(primary, 0.7);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Particles
      for (const p of particles) {
        const lifeT = p.life / p.maxLife;
        const a = (1 - lifeT) * 0.85;
        const r = p.size;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0, rgba([150, 220, 255], a));
        grad.addColorStop(0.4, rgba(primary, a * 0.55));
        grad.addColorStop(1, rgba(primary, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lightning bolts — three passes (wide soft glow, mid colour, bright white core)
      const shadowCol = rgba(primary, 1);
      for (const bolt of bolts) {
        drawPath(bolt.points, 7, rgba(secondary, 0.18), 18, shadowCol);
        drawPath(bolt.points, 2.5, rgba(primary, 0.95), 15, shadowCol);
        drawPath(bolt.points, 1.1, rgba([255, 255, 255], 0.95), 8, shadowCol);

        const tip = bolt.points[bolt.points.length - 1];
        const tipGrad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 16);
        tipGrad.addColorStop(0, rgba(tipColor, 0.95));
        tipGrad.addColorStop(1, rgba(tipColor, 0));
        ctx.fillStyle = tipGrad;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 16, 0, Math.PI * 2);
        ctx.fill();

        for (const branch of bolt.branches) {
          drawPath(branch, 3, rgba(secondary, 0.2), 12, shadowCol);
          drawPath(branch, 1, rgba(primary, 0.75), 8, shadowCol);
          drawPath(branch, 0.6, rgba([255, 255, 255], 0.75), 4, shadowCol);
        }
      }
      ctx.shadowBlur = 0;

      // Bright core — feels like a star
      const coreR = 20 * cfg.coreSizeMul * breath;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5);
      core.addColorStop(0, rgba([255, 255, 255], Math.min(1, cfg.coreBrightness)));
      core.addColorStop(0.35, rgba(primary, 0.75 * cfg.coreBrightness));
      core.addColorStop(1, rgba(primary, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Soft inner rim shimmer (keeps the sphere edge looking like plasma, not a hard line)
      const rim = ctx.createRadialGradient(cx, cy, radius * 0.78, cx, cy, radius);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, rgba(primary, 0.35));
      ctx.fillStyle = rim;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
      // === end sphere clip ===

      updateParticles(cfg);

      const interval = Math.max(1, Math.round(cfg.redrawEvery));
      if (frame - lastRedraw >= interval) {
        regenerateBolts(cfg);
        lastRedraw = frame;
      }
      frame++;
      rafRef.current = requestAnimationFrame(render);
    }

    regenerateBolts(STATES[targetStateRef.current]);
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
