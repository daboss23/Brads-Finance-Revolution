"use client";

import { useEffect, useRef } from "react";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

interface OrbParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

interface Props {
  state: OrbState;
}

const PARTICLE_COLORS = ["#00ffff", "#00e5ff", "#7b2fff", "#ffffff", "#00c8b4"];

export function SarahOrb({ state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OrbState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const SIZE = canvas.offsetWidth || 240;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;

    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    // Reassign with explicit non-nullable type so narrowing persists inside rAF closures
    const ctx: CanvasRenderingContext2D = ctxRaw;
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const R = SIZE * 0.42;

    const particles: OrbParticle[] = [];
    let frame = 0;
    let rafId: number;
    let spawnTick = 0;

    function spawnParticles(count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spawnR = R * 0.2 * Math.random();
        const speed = 0.35 + Math.random() * 0.9;
        particles.push({
          x: cx + Math.cos(angle) * spawnR,
          y: cy + Math.sin(angle) * spawnR,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 55 + Math.random() * 65,
          radius: 0.7 + Math.random() * 1.5,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
    }

    const rings = [
      { r: R * 0.58, angularSpeed: 0.009, phase: 0.0, rgb: "0,255,255", dots: 36 },
      { r: R * 0.76, angularSpeed: -0.006, phase: 2.1, rgb: "123,47,255", dots: 28 },
      { r: R * 0.90, angularSpeed: 0.007, phase: 4.2, rgb: "0,229,255", dots: 22 },
    ];

    function draw() {
      const s = stateRef.current;
      const t = frame / 60;

      ctx.clearRect(0, 0, SIZE, SIZE);

      const ringMult = s === "speaking" ? 3 : s === "thinking" ? 2.5 : s === "listening" ? 1.5 : 1;
      const pulseAmp = s === "speaking" ? 0.22 : s === "listening" ? 0.13 : s === "thinking" ? 0.16 : 0.07;
      const pulseFreq = s === "speaking" ? 5.5 : s === "thinking" ? 3.5 : 2.0;
      const coreR = R * (0.30 + Math.sin(t * pulseFreq) * pulseAmp);
      const glowAlpha = s === "speaking" ? 0.90 : s === "thinking" ? 0.72 : s === "listening" ? 0.78 : 0.55;
      const haloRgb = s === "listening" ? "0,229,255" : s === "thinking" ? "123,47,255" : "0,255,255";

      // Spawn particles
      spawnTick++;
      const spawnRate = s === "thinking" ? 6 : s === "speaking" ? 4 : s === "listening" ? 2 : 1;
      if (spawnTick % Math.max(1, Math.round(7 / spawnRate)) === 0) {
        spawnParticles(1);
      }

      // ── Outer halo
      const haloAlpha = 0.10 + Math.sin(t * 1.4) * 0.035;
      const halo = ctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R * 1.55);
      halo.addColorStop(0, `rgba(${haloRgb},${(haloAlpha + 0.07).toFixed(3)})`);
      halo.addColorStop(1, `rgba(${haloRgb},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // ── Base sphere
      const base = ctx.createRadialGradient(cx - R * 0.08, cy - R * 0.08, 0, cx, cy, R);
      base.addColorStop(0, "#1c2b50");
      base.addColorStop(0.55, "#0c1730");
      base.addColorStop(1, "#040c1c");
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // ── Listening ripple rings
      if (s === "listening") {
        for (let i = 0; i < 3; i++) {
          const phase = (t * 0.65 + i * 0.333) % 1;
          const rR = R * (1.0 + phase * 0.9);
          const alpha = (1 - phase) * 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,229,255,${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // ── Rotating energy rings
      rings.forEach((ring) => {
        const baseAngle = frame * ring.angularSpeed * ringMult + ring.phase;
        const pulse = 1 + Math.sin(t * 2.8 + ring.phase) * (s === "speaking" ? 0.10 : 0.03);
        const rr = ring.r * pulse;
        const dotAlphaBase = s === "idle" ? 0.22 : 0.48;
        for (let i = 0; i < ring.dots; i++) {
          const a = baseAngle + (i / ring.dots) * Math.PI * 2;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;
          const alpha = dotAlphaBase * (0.38 + Math.sin(a * 2.4 + t) * 0.38);
          ctx.beginPath();
          ctx.arc(x, y, 1.0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ring.rgb},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      });

      // ── Frequency waves (speaking)
      if (s === "speaking") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.87, 0, Math.PI * 2);
        ctx.clip();
        for (let li = 0; li < 5; li++) {
          const yo = cy + (li - 2) * R * 0.14;
          const amp = R * 0.09 * Math.abs(Math.sin(t * 1.6 + li * 0.85));
          ctx.beginPath();
          ctx.moveTo(cx - R * 0.52, yo);
          for (let xi = 0; xi <= 52; xi++) {
            const xp = cx - R * 0.52 + (xi / 52) * R * 1.04;
            const yp = yo + amp * Math.sin(xi * 0.34 + frame * 0.13 + li * 1.2);
            ctx.lineTo(xp, yp);
          }
          ctx.strokeStyle = `rgba(0,255,255,${(0.09 + li * 0.045).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        if (p.life >= p.maxLife || dist > R * 1.05) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = (1 - p.life / p.maxLife) * 0.88;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── Core sphere
      const coreGrad = ctx.createRadialGradient(
        cx - coreR * 0.22, cy - coreR * 0.22, coreR * 0.04,
        cx, cy, coreR
      );
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.22, `rgba(0,255,255,${glowAlpha.toFixed(3)})`);
      coreGrad.addColorStop(0.6, s === "thinking" ? "rgba(123,47,255,0.48)" : "rgba(0,200,180,0.32)");
      coreGrad.addColorStop(1, "rgba(10,10,46,0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Core bloom
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.4);
      bloom.addColorStop(0, `rgba(0,255,255,${(glowAlpha * 0.42).toFixed(3)})`);
      bloom.addColorStop(0.45, `rgba(0,255,255,${(glowAlpha * 0.07).toFixed(3)})`);
      bloom.addColorStop(1, "rgba(0,255,255,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // ── Specular highlight
      const hl = ctx.createRadialGradient(
        cx - coreR * 0.4, cy - coreR * 0.4, 0,
        cx - coreR * 0.4, cy - coreR * 0.4, coreR * 0.68
      );
      hl.addColorStop(0, "rgba(255,255,255,0.52)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.arc(cx - coreR * 0.4, cy - coreR * 0.4, coreR * 0.68, 0, Math.PI * 2);
      ctx.fill();

      frame++;
      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-[240px] h-[240px] md:w-[300px] md:h-[300px]"
    />
  );
}
