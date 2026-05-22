"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { SarahOrb, type OrbState } from "./SarahOrb";

// ── Types ────────────────────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; content: string };

type DisplayMessage = {
  id: string;
  from: "sarah" | "client";
  text: string;
};

const MILESTONES = [
  { id: "personal", label: "Personal" },
  { id: "family", label: "Family" },
  { id: "income", label: "Income" },
  { id: "assets", label: "Assets" },
  { id: "super", label: "Super" },
  { id: "insurance", label: "Insurance" },
  { id: "goals", label: "Goals" },
] as const;

type MilestoneId = (typeof MILESTONES)[number]["id"];

type Props = {
  clientName: string;
  clientToken: string;
  onComplete: (data?: Record<string, unknown>) => void;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function parseSectionMarkers(text: string): MilestoneId[] {
  return Array.from(text.matchAll(/\[SECTION-COMPLETE:(\w+)\]/g))
    .map((m) => m[1] as MilestoneId)
    .filter((id) => MILESTONES.some((m) => m.id === id));
}

function stripHidden(text: string): string {
  return text
    .replace(/\[SECTION-COMPLETE:[^\]]*\]?/g, "")
    .replace(/<fact-find-complete>[\s\S]*?(<\/fact-find-complete>|$)/g, "")
    .trim();
}

const sessionKey = (token: string) => `bmk-sarah-v2-${token}`;

// ── Component ─────────────────────────────────────────────────────────────────

export function SarahChat({ clientName, clientToken, onComplete }: Props) {
  const firstName = getFirstName(clientName);

  const [messages, setMessages] = useState<Message[]>([]);
  const [display, setDisplay] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<MilestoneId>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStarted = useRef(false);
  const isMutedRef = useRef(false);

  const { isListening, isSupported, start: startListening, stop: stopListening } =
    useSpeechRecognition((text) => setInput(text));

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [display, streamingText]);

  // Sync muted ref for use inside async callbacks
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Update orb when mic changes
  useEffect(() => {
    if (isListening) {
      setOrbState("listening");
    } else if (orbState === "listening") {
      setOrbState("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  // Session init — runs once on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    try {
      const saved = localStorage.getItem(sessionKey(clientToken));
      if (saved) {
        const {
          messages: savedMsgs,
          display: savedDisplay,
          sections,
        } = JSON.parse(saved);

        if (Array.isArray(savedMsgs) && savedMsgs.length > 1) {
          setDisplay(savedDisplay ?? []);
          setCompletedSections(new Set(sections ?? []));
          const lastSection = (sections as string[] ?? []).slice(-1)[0] ?? "start";
          const resumeMsgs: Message[] = [
            ...savedMsgs,
            { role: "user", content: `[RESUME:${lastSection}]` },
          ];
          sendToSarah(resumeMsgs);
          return;
        }
      }
    } catch {
      // ignore storage errors
    }

    sendToSarah([{ role: "user", content: "[START]" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save session on every meaningful update
  useEffect(() => {
    if (messages.length < 2) return;
    try {
      localStorage.setItem(
        sessionKey(clientToken),
        JSON.stringify({
          messages: messages.slice(-60),
          display: display.slice(-40),
          sections: Array.from(completedSections),
        })
      );
    } catch {
      // ignore
    }
  }, [messages, display, completedSections, clientToken]);

  // ── Voice playback ─────────────────────────────────────────────────────────

  async function playVoice(text: string) {
    if (isMutedRef.current || !text.trim()) return;

    try {
      audioRef.current?.pause();
      setOrbState("speaking");

      const res = await fetch("/api/sarah/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 3000) }),
      });

      if (!res.ok) {
        setOrbState("idle");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setOrbState("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setOrbState("idle");
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch {
      setOrbState("idle");
    }
  }

  // ── Core send ──────────────────────────────────────────────────────────────

  async function sendToSarah(apiMessages: Message[]) {
    setIsStreaming(true);
    setStreamingText("");
    setOrbState("thinking");

    try {
      const res = await fetch("/api/sarah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, clientName }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              full += parsed.text;
              setStreamingText(full);
            }
          } catch {
            // ignore partial chunks
          }
        }
      }

      const factFindData = parseFactFindData(full);
      const newSections = parseSectionMarkers(full);
      const displayText = stripHidden(full);

      const sarahMsg: Message = { role: "assistant", content: full };
      setMessages([...apiMessages, sarahMsg]);

      setDisplay((prev) => [
        ...prev,
        { id: `sarah-${Date.now()}`, from: "sarah", text: displayText },
      ]);

      setStreamingText("");

      if (newSections.length > 0) {
        setCompletedSections((prev) => new Set([...Array.from(prev), ...newSections]));
      }

      if (factFindData) {
        setIsComplete(true);
        setTimeout(() => onComplete(factFindData), 2200);
      }

      // Play voice without blocking input
      if (displayText && !factFindData) {
        playVoice(displayText);
      }
    } catch {
      setDisplay((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          from: "sarah",
          text: "Sorry, I ran into a problem. Please refresh and try again.",
        },
      ]);
      setStreamingText("");
      setOrbState("idle");
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSubmit() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const clientMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, clientMsg];

    setDisplay((prev) => [
      ...prev,
      { id: `client-${Date.now()}`, from: "client", text },
    ]);
    setInput("");
    setMessages(updatedMessages);
    sendToSarah(updatedMessages);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function handleVoiceToggle() {
    if (isVoiceOn) {
      audioRef.current?.pause();
      setOrbState("idle");
    }
    setIsVoiceOn((v) => !v);
    setIsMuted((v) => !v);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Orb header */}
      <div className="shrink-0 flex flex-col items-center pt-10 pb-4 px-6 relative">
        <SarahOrb state={orbState} isVoiceOn={isVoiceOn} onToggleVoice={handleVoiceToggle} />

        {/* Mute button */}
        <button
          onClick={() => setIsMuted((m) => {
            isMutedRef.current = !m;
            if (!m) audioRef.current?.pause();
            return !m;
          })}
          className="absolute top-10 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
          title={isMuted ? "Unmute Sarah" : "Mute Sarah"}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {/* BMK label */}
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-slate-400">
            Sarah
          </p>
          <p className="text-[10px] text-slate-400/70 tracking-wide">
            BMK Financial Services · Financial Discovery
          </p>
        </div>
      </div>

      {/* Progress rail */}
      <div className="shrink-0 flex items-center justify-center gap-0 px-4 pb-4 overflow-x-auto">
        {MILESTONES.map((m, i) => {
          const done = completedSections.has(m.id);
          return (
            <div key={m.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-500",
                    done
                      ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                      : "bg-slate-300"
                  )}
                />
                <span
                  className={cn(
                    "text-[9px] font-semibold tracking-wide uppercase transition-colors duration-500",
                    done ? "text-cyan-500" : "text-slate-400",
                    "hidden sm:block"
                  )}
                >
                  {m.label}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-semibold tracking-wide uppercase transition-colors duration-500 sm:hidden",
                    done ? "text-cyan-500" : "text-slate-400"
                  )}
                >
                  {m.label.slice(0, 3)}
                </span>
              </div>
              {i < MILESTONES.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px w-5 sm:w-8 transition-all duration-500",
                    done ? "bg-cyan-300/70" : "bg-slate-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="shrink-0 h-px bg-slate-100 mx-4" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
        {display.map((msg) => (
          <ChatBubble key={msg.id} message={msg} firstName={firstName} />
        ))}

        {/* Streaming bubble */}
        {isStreaming && streamingText && (
          <ChatBubble
            message={{
              id: "streaming",
              from: "sarah",
              text: stripHidden(streamingText),
            }}
            firstName={firstName}
            isStreaming
          />
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingText && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500">SA</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-[12px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Financial Discovery complete
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 pt-4 pb-6 max-w-2xl mx-auto w-full">
          {/* Text input row */}
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? "Sarah is responding…" : "Type your answer…"}
                disabled={isStreaming}
                rows={1}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all resize-none disabled:opacity-40 leading-relaxed"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-white transition-all hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Large mic button */}
          {isSupported !== false && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleMicToggle}
                disabled={isStreaming}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed",
                  isListening
                    ? "bg-amber-400 text-white sarah-large-mic-listening"
                    : "bg-white border-2 border-slate-200 text-slate-500 hover:border-amber-400 hover:text-amber-500"
                )}
                aria-label={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
              <p className="text-[10px] text-slate-400">
                {isListening ? "Tap to stop" : "Tap to speak"}
              </p>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-300 mt-3">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────────────────

function ChatBubble({
  message,
  firstName,
  isStreaming = false,
}: {
  message: DisplayMessage;
  firstName: string;
  isStreaming?: boolean;
}) {
  if (message.from === "sarah") {
    return (
      <div className={cn("flex items-start gap-3 max-w-[88%]", !isStreaming && "sarah-msg-enter")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 mt-0.5">
          <span className="text-[10px] font-bold text-slate-500">SA</span>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-1.5">
            Sarah
          </p>
          <div
            className={cn(
              "bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm",
              isStreaming ? "border-amber-200/60" : "border-slate-100"
            )}
          >
            <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {message.text}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-[88%] ml-auto flex-row-reverse client-msg-enter">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 border border-amber-200 mt-0.5">
        <span className="text-[10px] font-bold text-amber-600">
          {firstName.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-1.5 text-right">
          {firstName}
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
}
