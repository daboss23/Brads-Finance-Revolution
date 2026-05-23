"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type Props = {
  state?: OrbState;
  size?: number;
  className?: string;
};

type Bolt = {
  points: Array<{ x: number; y: number }>;
  branches: Array<Array<{ x: number; y: number }>>;
  angle: number;
  targetAngle: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

type Ripple = { r: number; alpha: number };

type StateConfig = {
  boltCount: number;
  redrawEvery: number;
  coreAlpha: number;
  glowAlpha: number;
  glowRadiusMul: number;
  primary: [number, number, number];
  accent: [number, number, number];
  tip: [number, number, number];
  rotateSpeed: number;
  jitter: number;
  particleRate: number;
  particleMode: number; // 0 idle drift, 1 vortex, 2 ambient, 3 burst
  rippleRate: number;
  waveAlpha: number; // frequency wave lines
  coreBreathHz: number;
  coreBreathDepth: number;
  glowPulseHz: number;
  hueCycle: number; // 0 fixed, 1 cycling
};

const STATES: Record<OrbState, StateConfig> = {
  idle: {
    boltCount: 2.5,
    redrawEvery: 20,
    coreAlpha: 0.55,
    glowAlpha: 0.35,
    glowRadiusMul: 1.55,
    primary: [80, 180, 255],
    accent: [40, 100, 220],
    tip: [255, 200, 120],
    rotateSpeed: 0.0006,
    jitter: 0.16,
    particleRate: 0.25,
    particleMode: 0,
    rippleRate: 0,
    waveAlpha: 0,
    coreBreathHz: 0.18,
    coreBreathDepth: 0.18,
    glowPulseHz: 0.33,
    hueCycle: 0,
  },
  thinking: {
    boltCount: 5.5,
    redrawEvery: 10,
    coreAlpha: 0.65,
    glowAlpha: 0.55,
    glowRadiusMul: 1.5,
    primary: [200, 140, 255],
    accent: [140, 80, 230],
    tip: [255, 180, 220],
    rotateSpeed: 0.006,
    jitter: 0.2,
    particleRate: 0.6,
    particleMode: 1,
    rippleRate: 0,
    waveAlpha: 0,
    coreBreathHz: 0.9,
    coreBreathDepth: 0.28,
    glowPulseHz: 0.5,
    hueCycle: 0,
  },
  listening: {
    boltCount: 4.5,
    redrawEvery: 8,
    coreAlpha: 0.78,
    glowAlpha: 0.55,
    glowRadiusMul: 1.55,
    primary: [80, 230, 220],
    accent: [40, 180, 200],
    tip: [255, 215, 140],
    rotateSpeed: 0.0014,
    jitter: 0.22,
    particleRate: 0.35,
    particleMode: 2,
    rippleRate: 0.018,
    waveAlpha: 0,
    coreBreathHz: 0.5,
    coreBreathDepth: 0.12,
    glowPulseHz: 0.4,
    hueCycle: 0,
  },
  speaking: {
    boltCount: 11,
    redrawEvery: 2.5,
    coreAlpha: 1,
    glowAlpha: 0.9,
    glowRadiusMul: 1.7,
    primary: [120, 220, 255],
    accent: [60, 130, 255],
    tip: [255, 190, 90],
    rotateSpeed: 0.0025,
    jitter: 0.32,
    particleRate: 1.6,
    particleMode: 3,
    rippleRate: 0,
    waveAlpha: 0.55,
    coreBreathHz: 4,
    coreBreathDepth: 0.2,
    glowPulseHz: 2.4,
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
    coreAlpha: lerp(a.coreAlpha, b.coreAlpha, t),
    glowAlpha: lerp(a.glowAlpha, b.glowAlpha, t),
    glowRadiusMul: lerp(a.glowRadiusMul, b.glowRadiusMul, t),
    primary: lerpColor(a.primary, b.primary, t),
    accent: lerpColor(a.accent, b.accent, t),
    tip: lerpColor(a.tip, b.tip, t),
    rotateSpeed: lerp(a.rotateSpeed, b.rotateSpeed, t),
    jitter: lerp(a.jitter, b.jitter, t),
    particleRate: lerp(a.particleRate, b.particleRate, t),
    particleMode: t < 0.5 ? a.particleMode : b.particleMode,
    rippleRate: lerp(a.rippleRate, b.rippleRate, t),
    waveAlpha: lerp(a.waveAlpha, b.waveAlpha, t),
    coreBreathHz: lerp(a.coreBreathHz, b.coreBreathHz, t),
    coreBreathDepth: lerp(a.coreBreathDepth, b.coreBreathDepth, t),
    glowPulseHz: lerp(a.glowPulseHz, b.glowPulseHz, t),
    hueCycle: lerp(a.hueCycle, b.hueCycle, t),
  };
}

function midpointDisplace(
  start: { x: number; y: number },
  end: { x: number; y: number },
  displacement: number,
  depth: number
): Array<{ x: number; y: number }> {
  if (depth <= 0) return [start, end];
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
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

function generateBolt(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  jitter: number
): Bolt {
  const end = {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
  const start = { x: cx, y: cy };
  const points = midpointDisplace(start, end, radius * jitter, 5);
  const branches: Array<Array<{ x: number; y: number }>> = [];
  const branchCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < branchCount; i++) {
    const t = 0.3 + Math.random() * 0.5;
    const idx = Math.floor(points.length * t);
    const from = points[idx];
    const branchAngle = angle + (Math.random() - 0.5) * 1.4;
    const branchLen = radius * (0.2 + Math.random() * 0.35);
    const bEnd = {
      x: from.x + Math.cos(branchAngle) * branchLen,
      y: from.y + Math.sin(branchAngle) * branchLen,
    };
    branches.push(midpointDisplace(from, bEnd, branchLen * jitter, 3));
  }
  return { points, branches, angle, targetAngle: angle };
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
}

function hueShift(c: [number, number, number], shift: number): [number, number, number] {
  // simple channel rotation toward cycling palette: cyan -> aqua -> purple -> white -> gold
  const palette: Array<[number, number, number]> = [
    [120, 220, 255], // cyan
    [80, 240, 220], // aqua
    [190, 140, 255], // purple
    [255, 255, 255], // white
    [255, 200, 120], // gold
  ];
  const total = palette.length;
  const f = ((shift % 1) + 1) % 1;
  const idx = f * total;
  const i0 = Math.floor(idx) % total;
  const i1 = (i0 + 1) % total;
  const tt = idx - Math.floor(idx);
  return lerpColor(palette[i0], palette[i1], tt) as [number, number, number];
}

export function SarahOrb({ state = "idle", size = 320, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetStateRef = useRef<OrbState>(state);
  const prevStateRef = useRef<OrbState>(state);
  const transitionStartRef = useRef<number>(performance.now());
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
    const radius = size * 0.42;

    let bolts: Bolt[] = [];
    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    let frame = 0;
    let rotation = 0;
    let lastRedrawFrame = 0;
    let lastRippleFrame = 0;
    const startTs = performance.now();

    function currentCfg(now: number): StateConfig {
      const elapsed = now - transitionStartRef.current;
      const t = Math.min(1, Math.max(0, elapsed / TRANSITION_MS));
      const eased = easeInOut(t);
      const prev = STATES[prevStateRef.current];
      const target = STATES[targetStateRef.current];
      return interpConfig(prev, target, eased);
    }

    function regenerateBolts(cfg: StateConfig) {
      const count = Math.max(1, Math.round(cfg.boltCount));
      const next: Bolt[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5 + rotation;
        next.push(
          generateBolt(cx, cy, radius * (0.85 + Math.random() * 0.15), angle, cfg.jitter)
        );
      }
      bolts = next;
    }

    function spawnParticle(cfg: StateConfig) {
      const a = Math.random() * Math.PI * 2;
      if (cfg.particleMode === 1) {
        // vortex: spawn at edge, swirl inward
        const r = radius * (0.9 + Math.random() * 0.2);
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: -Math.cos(a) * 0.4 + -Math.sin(a) * 0.6,
          vy: -Math.sin(a) * 0.4 + Math.cos(a) * 0.6,
          life: 0,
          maxLife: 90,
        });
      } else if (cfg.particleMode === 3) {
        // burst outward fast
        const speed = 1.6 + Math.random() * 1.4;
        particles.push({
          x: cx + Math.cos(a) * radius * 0.2,
          y: cy + Math.sin(a) * radius * 0.2,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          maxLife: 50,
        });
      } else if (cfg.particleMode === 2) {
        // ambient gentle within sphere
        const r = radius * Math.random();
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: Math.cos(a) * 0.15,
          vy: Math.sin(a) * 0.15,
          life: 0,
          maxLife: 110,
        });
      } else {
        // idle slow outward drift
        const r = radius * (0.2 + Math.random() * 0.4);
        particles.push({
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
          vx: Math.cos(a) * 0.25,
          vy: Math.sin(a) * 0.25,
          life: 0,
          maxLife: 160,
        });
      }
    }

    function updateParticles(cfg: StateConfig) {
      // spawn
      let toSpawn = cfg.particleRate;
      while (toSpawn > 0) {
        if (toSpawn >= 1 || Math.random() < toSpawn) spawnParticle(cfg);
        toSpawn -= 1;
      }
      // update
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (cfg.particleMode === 1) {
          // vortex tangential acceleration toward centre
          const dx = cx - p.x;
          const dy = cy - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx += (dx / d) * 0.03;
          p.vy += (dy / d) * 0.03;
          // slight tangential swirl
          p.vx += (-dy / d) * 0.02;
          p.vy += (dx / d) * 0.02;
        }
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }
    }

    function drawBoltPath(
      points: Array<{ x: number; y: number }>,
      width: number,
      color: string
    ) {
      if (!ctx || points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    function render() {
      if (!ctx) return;
      const now = performance.now();
      const elapsedSec = (now - startTs) / 1000;
      const cfg = currentCfg(now);
      rotation += cfg.rotateSpeed;

      // colour cycling for speaking
      const primary =
        cfg.hueCycle > 0.01
          ? lerpColor(cfg.primary, hueShift(cfg.primary, elapsedSec * 0.35), cfg.hueCycle)
          : cfg.primary;
      const accent =
        cfg.hueCycle > 0.01
          ? lerpColor(cfg.accent, hueShift(cfg.accent, elapsedSec * 0.35 + 0.2), cfg.hueCycle)
          : cfg.accent;

      // breathing factors
      const breath =
        1 +
        Math.sin(elapsedSec * Math.PI * 2 * cfg.coreBreathHz) * cfg.coreBreathDepth;
      const glowPulse =
        1 + Math.sin(elapsedSec * Math.PI * 2 * cfg.glowPulseHz) * 0.15;

      ctx.clearRect(0, 0, size, size);

      // Outer atmospheric glow
      const glowR = radius * cfg.glowRadiusMul * glowPulse;
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, glowR);
      glow.addColorStop(0, rgba(primary, 0.25 * cfg.glowAlpha * glowPulse));
      glow.addColorStop(0.5, rgba(accent, 0.12 * cfg.glowAlpha));
      glow.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      // Sphere base
      const base = ctx.createRadialGradient(
        cx - radius * 0.2,
        cy - radius * 0.25,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      base.addColorStop(0, "rgba(20,30,55,0.95)");
      base.addColorStop(0.55, "rgba(8,12,28,0.92)");
      base.addColorStop(1, "rgba(0,0,0,0.98)");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = base;
      ctx.fill();

      // Clip to sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.98, 0, Math.PI * 2);
      ctx.clip();

      ctx.globalCompositeOperation = "lighter";

      // Frequency wave lines (speaking)
      if (cfg.waveAlpha > 0.02) {
        const waves = 3;
        for (let w = 0; w < waves; w++) {
          ctx.beginPath();
          const amp = radius * 0.18 * (1 - w * 0.25);
          const freq = 0.05 + w * 0.02;
          const phase = elapsedSec * (4 + w * 1.5);
          const yOff = (w - (waves - 1) / 2) * radius * 0.18;
          for (let x = -radius; x <= radius; x += 2) {
            const y = Math.sin(x * freq + phase) * amp * Math.cos((x / radius) * 1.4);
            const px = cx + x;
            const py = cy + yOff + y;
            if (x === -radius) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = rgba(primary, cfg.waveAlpha * (0.4 - w * 0.08));
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Ripple rings (listening)
      if (cfg.rippleRate > 0.001) {
        if (frame - lastRippleFrame > 1 / Math.max(cfg.rippleRate, 0.001)) {
          ripples.push({ r: radius * 0.2, alpha: 0.55 });
          lastRippleFrame = frame;
        }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 0.8;
        r.alpha -= 0.006;
        if (r.alpha <= 0 || r.r > radius) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(primary, r.alpha);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        const lifeT = p.life / p.maxLife;
        const a = (1 - lifeT) * 0.7;
        const r = 1.2 + (1 - lifeT) * 1.4;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grad.addColorStop(0, rgba(primary, a));
        grad.addColorStop(1, rgba(primary, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bolts
      for (const bolt of bolts) {
        drawBoltPath(bolt.points, 6, rgba(accent, 0.18));
        drawBoltPath(bolt.points, 3, rgba(primary, 0.55));
        drawBoltPath(bolt.points, 1.2, rgba([255, 255, 255], 0.9));

        const tip = bolt.points[bolt.points.length - 1];
        const tipGrad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 14);
        tipGrad.addColorStop(0, rgba(cfg.tip, 0.95));
        tipGrad.addColorStop(1, rgba(cfg.tip, 0));
        ctx.fillStyle = tipGrad;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 14, 0, Math.PI * 2);
        ctx.fill();

        for (const branch of bolt.branches) {
          drawBoltPath(branch, 3, rgba(accent, 0.25));
          drawBoltPath(branch, 1.5, rgba(primary, 0.6));
          drawBoltPath(branch, 0.8, rgba([255, 255, 255], 0.7));
        }
      }

      // Breathing core
      const coreR = radius * 0.35 * breath;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, rgba([255, 255, 255], cfg.coreAlpha));
      core.addColorStop(0.3, rgba(primary, 0.7 * cfg.coreAlpha));
      core.addColorStop(1, rgba(primary, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Rim highlight
      const rim = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, rgba(primary, 0.35));
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      updateParticles(cfg);

      const interval = Math.max(1, Math.round(cfg.redrawEvery));
      if (frame - lastRedrawFrame >= interval) {
        regenerateBolts(cfg);
        lastRedrawFrame = frame;
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
