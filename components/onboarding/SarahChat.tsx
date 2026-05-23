"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrbState = "idle" | "speaking" | "listening" | "thinking";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Particle = {
  angle: number;
  dist: number;
  speed: number;
  size: number;
  color: string;
  maxDist: number;
};

type Props = {
  clientName: string;
  onComplete: (factFindData?: Record<string, unknown>) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTICLE_COLORS = ["#00ffff", "#7b2fff", "#00e5ff", "#ffffff", "#ffd700"];
const INACTIVITY_MS = 5 * 60 * 1000;

const CW = 800;
const CH = 800;
const CX = CW / 2;
const CY = CH / 2;
const R = 240;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFirstName(name: string): string {
  if (name.includes("&")) return name.split(" ").slice(0, -1).join(" ");
  return name.split(" ")[0];
}

function parseFactFindData(text: string): Record<string, unknown> | null {
  const match = text.match(/<fact-find-complete>([\s\S]*?)<\/fact-find-complete>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

function stripFactFindTag(text: string): string {
  return text.replace(/<fact-find-complete>[\s\S]*?<\/fact-find-complete>/, "").trim();
}

// ─── Particle helpers ─────────────────────────────────────────────────────────

function initParticles(): Particle[] {
  return Array.from({ length: 60 }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: 20 + Math.random() * R * 0.85,
    speed: 0.3 + Math.random() * 0.9,
    size: 0.8 + Math.random() * 2.4,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    maxDist: R * (0.65 + Math.random() * 0.75),
  }));
}

// ─── Canvas drawing ───────────────────────────────────────────────────────────

function drawOrb(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  t: number,
  state: OrbState
) {
  ctx.clearRect(0, 0, CW, CH);

  const speedMult =
    state === "speaking" ? 2.8
    : state === "listening" ? 1.4
    : state === "thinking" ? 0.8
    : 0.45;

  const pulse = (Math.sin(t * 0.0025 * speedMult) + 1) / 2;
  const breathe = Math.sin(t * 0.0007 * speedMult) * 0.06;

  // 1. Outer halo — bleeds into black background
  {
    const hg = ctx.createRadialGradient(CX, CY, R * 0.5, CX, CY, R * 2.1);
    if (state === "thinking") {
      hg.addColorStop(0, `rgba(123,47,255,${0.22 * (0.7 + pulse * 0.3)})`);
      hg.addColorStop(0.5, "rgba(10,10,60,0.08)");
      hg.addColorStop(1, "rgba(0,0,0,0)");
    } else if (state === "listening") {
      hg.addColorStop(0, `rgba(0,229,255,${0.18 * (0.7 + pulse * 0.3)})`);
      hg.addColorStop(0.4, `rgba(255,215,0,${0.08 * (0.7 + pulse * 0.3)})`);
      hg.addColorStop(1, "rgba(0,0,0,0)");
    } else if (state === "speaking") {
      hg.addColorStop(0, `rgba(0,255,255,${0.30 * (0.6 + pulse * 0.4)})`);
      hg.addColorStop(0.35, `rgba(123,47,255,${0.15 * (0.6 + pulse * 0.4)})`);
      hg.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      hg.addColorStop(0, `rgba(0,229,255,${0.10 * (0.6 + pulse * 0.4)})`);
      hg.addColorStop(0.5, "rgba(123,47,255,0.04)");
      hg.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, CW, CH);
  }

  // 2. Listening ripple rings — expanding outward
  if (state === "listening") {
    for (let i = 0; i < 3; i++) {
      const phase = (t * 0.0009 + i * 0.34) % 1;
      const rr = R * (0.7 + phase * 1.1);
      ctx.beginPath();
      ctx.arc(CX, CY, rr, 0, Math.PI * 2);
      ctx.strokeStyle = "#00e5ff";
      ctx.globalAlpha = (1 - phase) * 0.55;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 2; i++) {
      const phase = (t * 0.0006 + i * 0.5) % 1;
      const rr = R * (0.5 + phase * 0.8);
      ctx.beginPath();
      ctx.arc(CX, CY, rr, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffd700";
      ctx.globalAlpha = (1 - phase) * 0.30;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // 3. Thinking spiral — cyan sparks rotate inward
  if (state === "thinking") {
    for (let i = 0; i < 100; i++) {
      const a = i * 0.16 + t * -0.0012;
      const d = (i / 100) * R * 0.9;
      const sx = CX + Math.cos(a) * d;
      const sy = CY + Math.sin(a) * d;
      ctx.globalAlpha = 0.12 + (i / 100) * 0.55;
      ctx.fillStyle = i % 3 === 0 ? "#00ffff" : "#7b2fff";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // 4. Energy rings — ellipses rotating at different speeds and directions
  const rings = [
    { spd: 0.18, col: "#00ffff", opa: 0.65, rx: 0.84, ry: 0.30, off: 0 },
    { spd: -0.13, col: "#7b2fff", opa: 0.55, rx: 0.78, ry: 0.25, off: Math.PI / 3 },
    { spd: 0.24, col: "#00e5ff", opa: 0.42, rx: 0.74, ry: 0.34, off: Math.PI / 5 },
    { spd: -0.29, col: "#ffd700", opa: 0.32, rx: 0.68, ry: 0.22, off: (2 * Math.PI) / 3 },
    { spd: 0.16, col: "#ffffff", opa: 0.20, rx: 0.90, ry: 0.29, off: Math.PI / 2 },
  ];

  for (const { spd, col, opa, rx, ry, off } of rings) {
    const angle = t * 0.001 * spd * speedMult + off;
    const extraPulse = state === "speaking" ? pulse * 0.1 : 0;
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(
      0, 0,
      R * (rx + breathe * 0.4 + extraPulse),
      R * (ry + breathe * 0.15),
      0, 0, Math.PI * 2
    );
    ctx.strokeStyle = col;
    ctx.globalAlpha = opa * (state === "idle" ? 0.65 : 1);
    ctx.lineWidth = state === "speaking" ? 2 : 1.5;
    ctx.shadowColor = col;
    ctx.shadowBlur = state === "speaking" ? 8 : 3;
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // 5. Orb body — soft radial gradient, no hard edges
  {
    const bodyR = R * (1 + breathe);
    const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, bodyR);
    if (state === "thinking") {
      bg.addColorStop(0, "rgba(210,190,255,0.95)");
      bg.addColorStop(0.15, "rgba(123,47,255,0.80)");
      bg.addColorStop(0.42, "rgba(55,15,155,0.45)");
      bg.addColorStop(0.72, "rgba(10,10,46,0.22)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
    } else if (state === "listening") {
      bg.addColorStop(0, "rgba(255,255,255,0.96)");
      bg.addColorStop(0.14, "rgba(0,229,255,0.85)");
      bg.addColorStop(0.42, "rgba(0,155,210,0.48)");
      bg.addColorStop(0.72, "rgba(10,10,46,0.22)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      const spBoost = state === "speaking" ? 0.08 : 0;
      bg.addColorStop(0, `rgba(255,255,255,${0.93 + spBoost})`);
      bg.addColorStop(0.14, `rgba(0,229,255,${0.86 + spBoost})`);
      bg.addColorStop(0.42, `rgba(0,175,255,${0.48 + spBoost * 0.2})`);
      bg.addColorStop(0.72, "rgba(10,10,46,0.22)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(CX, CY, bodyR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Frequency wave — heartbeat/sound lines through the orb
  {
    const amp =
      state === "speaking" ? 50 + pulse * 28
      : state === "listening" ? 20 + pulse * 10
      : state === "thinking" ? 12 + pulse * 6
      : 9 + pulse * 5;

    const freq = state === "speaking" ? 3.6 : state === "listening" ? 2.6 : 2.2;
    const wspd = t * 0.003 * speedMult;
    const wcolor = state === "listening" ? "#ffd700" : state === "thinking" ? "#7b2fff" : "#00ffff";
    const walpha = state === "idle" ? 0.40 : 0.88;

    ctx.save();
    ctx.beginPath();
    for (let x = CX - R; x <= CX + R; x += 2) {
      const rel = (x - CX) / R;
      const fade = Math.max(0, 1 - Math.pow(rel * 1.15, 4));
      const y = CY + Math.sin(rel * Math.PI * freq + wspd) * amp * fade;
      x === CX - R ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = wcolor;
    ctx.globalAlpha = walpha;
    ctx.lineWidth = state === "speaking" ? 2.5 : 1.5;
    ctx.shadowColor = wcolor;
    ctx.shadowBlur = state === "speaking" ? 12 : 5;
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Second wave (speaking only)
    if (state === "speaking") {
      ctx.save();
      ctx.beginPath();
      for (let x = CX - R; x <= CX + R; x += 2) {
        const rel = (x - CX) / R;
        const fade = Math.max(0, 1 - Math.pow(rel * 1.15, 4));
        const y = CY + Math.sin(rel * Math.PI * (freq + 1.1) + wspd * 1.4 + Math.PI * 0.55) * amp * 0.52 * fade;
        x === CX - R ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#7b2fff";
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#7b2fff";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  // 7. Prismatic flares — light rays when speaking
  if (state === "speaking" && Math.sin(t * 0.007) > 0.65) {
    const fAlpha = (Math.sin(t * 0.007) - 0.65) / 0.35;
    const fLen = R * (0.5 + pulse * 0.3);
    const fAngle = t * 0.002;
    ctx.save();
    ctx.translate(CX, CY);
    for (let i = 0; i < 6; i++) {
      const a = fAngle + (i * Math.PI) / 3;
      const fg = ctx.createLinearGradient(
        0, 0,
        Math.cos(a) * fLen, Math.sin(a) * fLen
      );
      fg.addColorStop(0, "rgba(255,255,255,0.7)");
      fg.addColorStop(0.4, "rgba(0,255,255,0.35)");
      fg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = fAlpha * 0.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * fLen, Math.sin(a) * fLen);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // 8. Particles — sparks floating outward
  const pSpeed =
    state === "speaking" ? 2.8
    : state === "listening" ? 1.1
    : state === "thinking" ? 0.5
    : 0.35;

  for (const p of particles) {
    p.dist += p.speed * pSpeed;
    if (p.dist > p.maxDist) {
      p.dist = 15 + Math.random() * 60;
      p.angle = Math.random() * Math.PI * 2;
    }
    const fadeIn = Math.min(p.dist / 40, 1);
    const fadeOut = Math.max(1 - (p.dist / p.maxDist - 0.65) / 0.35, 0);
    const alpha = fadeIn * Math.min(fadeOut, 0.85);
    if (alpha <= 0.02) continue;
    const px = CX + Math.cos(p.angle) * p.dist;
    const py = CY + Math.sin(p.angle) * p.dist;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // 9. Core bright centre
  {
    const coreR = R * (0.18 + breathe * 0.5 + pulse * 0.05);
    const cAlpha = state === "idle" ? 0.65 + pulse * 0.2 : 0.82 + pulse * 0.18;
    const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreR);
    cg.addColorStop(0, `rgba(255,255,255,${cAlpha})`);
    cg.addColorStop(0.35, `rgba(180,240,255,${cAlpha * 0.65})`);
    cg.addColorStop(0.7, "rgba(0,229,255,0.3)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = state === "speaking" ? 22 : 10;
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(CX, CY, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ─── SarahOrb canvas component ────────────────────────────────────────────────

function SarahOrb({ state }: { state: OrbState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<OrbState>(state);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const startRef = useRef(Date.now());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    particlesRef.current = initParticles();

    function frame() {
      const t = Date.now() - startRef.current;
      drawOrb(ctx!, particlesRef.current, t, stateRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      className="w-[280px] h-[280px] md:w-[400px] md:h-[400px]"
    />
  );
}

// ─── Completion view ──────────────────────────────────────────────────────────

function CompletionView({ firstName }: { firstName: string }) {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-9 w-9 text-emerald-400"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 className="text-3xl font-light text-white mb-3">
          All done, {firstName}!
        </h2>
        <p className="text-white/50 text-lg leading-relaxed max-w-sm">
          Brad will review everything you have shared and be fully prepared for your meeting. We will be in touch very soon.
        </p>
      </div>
    </div>
  );
}

// ─── Main SarahChat component ─────────────────────────────────────────────────

export function SarahChat({ clientName, onComplete }: Props) {
  const firstName = getFirstName(clientName);

  const [messages, setMessages] = useState<Message[]>([]);
  const [sarahDisplayText, setSarahDisplayText] = useState("");
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [input, setInput] = useState("");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const hasStarted = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  function startInactivityTimer() {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      const checkIn = `Still there ${firstName}? Take your time, I am right here whenever you are ready.`;
      setSarahDisplayText(checkIn);
      setSubtitleVisible(true);
      setOrbState("speaking");
      setMessages((prev) => {
        const updated = [...prev, { role: "assistant" as const, content: checkIn }];
        messagesRef.current = updated;
        return updated;
      });
      setTimeout(() => setOrbState("idle"), 3500);
    }, INACTIVITY_MS);
  }

  function clearInactivityTimer() {
    clearTimeout(inactivityTimerRef.current);
  }

  function startMic() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    recognitionRef.current?.stop();

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-AU";

    r.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      setInput(final || interim);
    };

    r.onerror = () => {
      setIsListening(false);
      setOrbState((prev: OrbState) => (prev === "listening" ? "idle" : prev));
    };

    r.onend = () => {
      setIsListening(false);
      setOrbState((prev: OrbState) => (prev === "listening" ? "idle" : prev));
    };

    r.start();
    recognitionRef.current = r;
    setIsListening(true);
    setOrbState("listening");
  }

  function stopMic() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setOrbState((prev: OrbState) => (prev === "listening" ? "idle" : prev));
  }

  function toggleMic() {
    if (isStreaming) return;
    if (isListening) stopMic();
    else startMic();
  }

  async function sendToSarah(apiMessages: Message[]) {
    setIsStreaming(true);
    setOrbState("thinking");
    setSarahDisplayText("");
    setSubtitleVisible(true);
    clearInactivityTimer();

    try {
      const res = await fetch("/api/sarah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, clientName }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      setOrbState("speaking");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              full += parsed.text;
              setSarahDisplayText(stripFactFindTag(full));
            }
            if (parsed.error) {
              console.error("[Sarah stream error]", parsed.error);
            }
          } catch {
            // partial SSE chunk
          }
        }
      }

      const factFindData = parseFactFindData(full);
      const cleanText = stripFactFindTag(full);

      if (!cleanText && !factFindData) {
        setSarahDisplayText(
          "I am sorry, I am having a little trouble right now. Please try sending your message again."
        );
      } else {
        const sarahMsg: Message = { role: "assistant", content: full };
        const updatedMessages = [...apiMessages, sarahMsg];
        setMessages(updatedMessages);
        messagesRef.current = updatedMessages;
        setSarahDisplayText(cleanText);

        if (factFindData) {
          setIsComplete(true);
          setTimeout(() => onComplete(factFindData), 3500);
        } else {
          startInactivityTimer();
        }
      }
    } catch (err) {
      console.error("[SarahChat]", err);
      setSarahDisplayText(
        "I am sorry, I am having a little trouble connecting right now. Please try again."
      );
    } finally {
      setIsStreaming(false);
      setOrbState("idle");
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || isStreaming) return;
    if (isListening) stopMic();

    setSubtitleVisible(false);
    clearInactivityTimer();

    const clientMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messagesRef.current, clientMsg];
    setInput("");
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;

    setTimeout(() => sendToSarah(updatedMessages), 350);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // Kick off Sarah's opening message on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    sendToSarah([{ role: "user", content: "[START]" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(inactivityTimerRef.current);
      recognitionRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isComplete) {
    return <CompletionView firstName={firstName} />;
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Logo + headline */}
      <div className="shrink-0 flex flex-col items-center pt-8 pb-2">
        <NewcastleLogoFull size={52} />
        <h1 className="mt-5 text-[26px] md:text-[32px] font-light text-white tracking-tight">
          Financial Discovery Session
        </h1>
      </div>

      {/* Orb + subtitle zone */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 min-h-0">
        <SarahOrb state={orbState} />

        {/* Subtitle — Sarah's current words appear here */}
        <div
          className={cn(
            "max-w-[600px] w-full text-center transition-opacity duration-700",
            subtitleVisible && sarahDisplayText ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-white text-lg md:text-xl leading-relaxed">
            {sarahDisplayText}
            {isStreaming && (
              <span className="inline-block w-0.5 h-5 bg-white/55 ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 md:px-8 pb-8 pt-2">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          {/* Mic button — large, gold, always visible */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={isStreaming}
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-300 disabled:opacity-40",
              isListening
                ? "bg-gold ring-4 ring-gold/40 animate-pulse"
                : "bg-gold hover:bg-gold/90 active:scale-95"
            )}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic className="h-6 w-6 text-black" />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? "Sarah is speaking..."
                : "Type your answer or tap the mic..."
            }
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-[14px] text-white text-[15px] placeholder:text-white/25 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none disabled:opacity-30 leading-relaxed"
          />

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-black transition-all hover:bg-gold/90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>

        {isListening && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[13px] text-gold/70">
              Listening... speak now
            </span>
          </div>
        )}

        <p className="text-center text-[11px] text-white/20 mt-3">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
