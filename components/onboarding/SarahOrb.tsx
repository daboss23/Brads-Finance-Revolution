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
};

const STATE_CONFIG: Record<
  OrbState,
  {
    boltCount: [number, number];
    redrawEvery: number;
    coreAlpha: number;
    glowAlpha: number;
    primary: [number, number, number];
    accent: [number, number, number];
    tip: [number, number, number];
    rotateSpeed: number;
    jitter: number;
  }
> = {
  idle: {
    boltCount: [2, 3],
    redrawEvery: 18,
    coreAlpha: 0.55,
    glowAlpha: 0.35,
    primary: [80, 180, 255],
    accent: [40, 100, 220],
    tip: [255, 200, 120],
    rotateSpeed: 0.0008,
    jitter: 0.18,
  },
  speaking: {
    boltCount: [8, 12],
    redrawEvery: 3,
    coreAlpha: 1,
    glowAlpha: 0.85,
    primary: [120, 220, 255],
    accent: [60, 130, 255],
    tip: [255, 190, 90],
    rotateSpeed: 0.002,
    jitter: 0.32,
  },
  listening: {
    boltCount: [4, 5],
    redrawEvery: 8,
    coreAlpha: 0.75,
    glowAlpha: 0.55,
    primary: [80, 230, 220],
    accent: [40, 180, 200],
    tip: [180, 255, 220],
    rotateSpeed: 0.0012,
    jitter: 0.22,
  },
  thinking: {
    boltCount: [6, 6],
    redrawEvery: 6,
    coreAlpha: 0.8,
    glowAlpha: 0.6,
    primary: [200, 140, 255],
    accent: [140, 80, 230],
    tip: [255, 180, 220],
    rotateSpeed: 0.006,
    jitter: 0.2,
  },
};

function midpointDisplace(
  start: { x: number; y: number },
  end: { x: number; y: number },
  displacement: number,
  depth: number
): Array<{ x: number; y: number }> {
  if (depth <= 0) return [start, end];
  const mid = {
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

  return { points, branches, angle };
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

export function SarahOrb({ state = "idle", size = 320, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OrbState>(state);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
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
    let frame = 0;
    let rotation = 0;

    function regenerateBolts() {
      const cfg = STATE_CONFIG[stateRef.current];
      const [min, max] = cfg.boltCount;
      const count = min + Math.floor(Math.random() * (max - min + 1));
      bolts = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4 + rotation;
        bolts.push(generateBolt(cx, cy, radius * (0.85 + Math.random() * 0.15), angle, cfg.jitter));
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
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    function render() {
      if (!ctx) return;
      const cfg = STATE_CONFIG[stateRef.current];
      rotation += cfg.rotateSpeed;

      ctx.clearRect(0, 0, size, size);

      // Outer atmospheric glow
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.55);
      glow.addColorStop(0, rgba(cfg.primary, 0.25 * cfg.glowAlpha));
      glow.addColorStop(0.5, rgba(cfg.accent, 0.12 * cfg.glowAlpha));
      glow.addColorStop(1, rgba(cfg.accent, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      // Sphere base — dark gradient
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

      // Clip to sphere for bolts
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.98, 0, Math.PI * 2);
      ctx.clip();

      ctx.globalCompositeOperation = "lighter";

      for (const bolt of bolts) {
        drawBoltPath(bolt.points, 6, rgba(cfg.accent, 0.18));
        drawBoltPath(bolt.points, 3, rgba(cfg.primary, 0.55));
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
          drawBoltPath(branch, 3, rgba(cfg.accent, 0.25));
          drawBoltPath(branch, 1.5, rgba(cfg.primary, 0.6));
          drawBoltPath(branch, 0.8, rgba([255, 255, 255], 0.7));
        }
      }

      // Bright core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.35);
      core.addColorStop(0, rgba([255, 255, 255], cfg.coreAlpha));
      core.addColorStop(0.3, rgba(cfg.primary, 0.7 * cfg.coreAlpha));
      core.addColorStop(1, rgba(cfg.primary, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      // Sphere rim highlight
      const rim = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, rgba(cfg.primary, 0.35));
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      frame++;
      if (frame % cfg.redrawEvery === 0) regenerateBolts();

      rafRef.current = requestAnimationFrame(render);
    }

    regenerateBolts();
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
