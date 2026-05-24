"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowRight, Mic, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/lib/hooks/use-audio-recorder";
import type { OrbState } from "@/components/orb/OrbCanvas";

const OrbCanvas = dynamic(() => import("@/components/orb/OrbCanvas"), {
  ssr: false,
  loading: () => null,
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  clientName: string;
  onComplete: (factFindData?: Record<string, unknown>) => void;
};

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

export function SarahChat({ clientName, onComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const { isRecording, isTranscribing, error: recorderError, toggle } = useAudioRecorder(
    (text) => {
      setInput((prev) => (prev ? `${prev} ${text}` : text));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  );

  const orbState: OrbState = isPlayingAudio
    ? "speaking"
    : isStreaming || isLoadingVoice
      ? "thinking"
      : isRecording
        ? "listening"
        : "idle";

  useEffect(() => {
    if (!hasStarted) return;
    sendToSarah([{ role: "user", content: "[START]" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  function stopAudioPlayback() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlayingAudio(false);
  }

  async function playSarahVoice(text: string, showSubtitle: boolean) {
    const cleaned = text.trim();
    if (!cleaned) return;
    stopAudioPlayback();

    setIsLoadingVoice(true);
    try {
      const res = await fetch("/api/sarah/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleaned }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error("[SarahChat] voice route failed", res.status, errBody);
        if (showSubtitle) {
          setCurrentSubtitle(cleaned);
          setVisibleWordCount(cleaned.split(/\s+/).length);
        }
        return;
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        console.error("[SarahChat] voice route returned empty audio");
        if (showSubtitle) {
          setCurrentSubtitle(cleaned);
          setVisibleWordCount(cleaned.split(/\s+/).length);
        }
        return;
      }

      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.preload = "auto";

      const words = cleaned.split(/\s+/);
      if (showSubtitle) {
        setCurrentSubtitle(cleaned);
        setVisibleWordCount(0);
      } else {
        setCurrentSubtitle("");
        setVisibleWordCount(0);
      }

      const startSync = () => {
        const tick = () => {
          if (!audioRef.current) return;
          const dur = audioRef.current.duration;
          const t = audioRef.current.currentTime;
          if (showSubtitle && dur && isFinite(dur) && dur > 0) {
            const ratio = Math.min(1, t / dur);
            const n = Math.min(words.length, Math.ceil(ratio * words.length));
            setVisibleWordCount(n);
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      };

      audio.onplay = () => {
        setIsPlayingAudio(true);
        startSync();
      };
      audio.onended = () => {
        if (showSubtitle) setVisibleWordCount(words.length);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        setIsPlayingAudio(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
      };
      audio.onerror = (e) => {
        console.error("[SarahChat] audio playback error:", e, audio.error);
        setIsPlayingAudio(false);
        if (showSubtitle) setVisibleWordCount(words.length);
      };

      try {
        await audio.play();
      } catch (e) {
        console.warn("[SarahChat] autoplay blocked, falling back to text-only:", e);
        if (showSubtitle) setVisibleWordCount(words.length);
        setIsPlayingAudio(false);
      }
    } catch (e) {
      console.error("[SarahChat] playSarahVoice fatal:", e);
      if (showSubtitle) {
        setCurrentSubtitle(cleaned);
        setVisibleWordCount(cleaned.split(/\s+/).length);
      }
    } finally {
      setIsLoadingVoice(false);
    }
  }

  async function sendToSarah(apiMessages: Message[]) {
    setIsStreaming(true);
    setErrorMsg(null);
    setCurrentSubtitle("");
    setVisibleWordCount(0);
    stopAudioPlayback();

    let full = "";
    try {
      const res = await fetch("/api/sarah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, clientName }),
      });

      if (!res.body) throw new Error(`No response body (status ${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamError: string | null = null;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              streamError = parsed.error;
              console.error("[Sarah API error]", parsed);
            }
            if (parsed.text) {
              full += parsed.text;
            }
          } catch (e) {
            console.warn("[Sarah] parse skip:", data, e);
          }
        }
      }

      if (streamError && !full) {
        throw new Error(streamError);
      }

      const factFindData = parseFactFindData(full);
      const sarahMessage: Message = { role: "assistant", content: full };
      setMessages([...apiMessages, sarahMessage]);

      setIsStreaming(false);

      const spoken = stripFactFindTag(full);
      if (spoken) {
        // Sarah turn number = number of prior assistant messages + 1.
        // 1 = audio check (show subtitle), 2 = full greeting (NO subtitle),
        // 3+ = normal (show subtitle).
        const sarahTurnNumber =
          apiMessages.filter((m) => m.role === "assistant").length + 1;
        const showSubtitle = sarahTurnNumber !== 2;
        await playSarahVoice(spoken, showSubtitle);
      }

      if (factFindData) {
        setIsComplete(true);
        setTimeout(() => onComplete(factFindData), 1800);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[Sarah] request failed:", e);
      setErrorMsg(msg);
      setCurrentSubtitle("Sorry, I ran into a problem. Please try again.");
      setVisibleWordCount(8);
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const clientMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, clientMsg];

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

  function handleEditAnswer(userIdx: number) {
    if (isStreaming) return;
    const target = messages[userIdx];
    if (!target || target.role !== "user") return;

    stopAudioPlayback();
    const trimmed = messages.slice(0, userIdx);
    setMessages(trimmed);
    setInput(target.content === "[START]" ? "" : target.content);

    const lastSarah = [...trimmed].reverse().find((m) => m.role === "assistant");
    if (lastSarah) {
      const text = stripFactFindTag(lastSarah.content);
      setCurrentSubtitle(text);
      setVisibleWordCount(text.split(/\s+/).length);
    } else {
      setCurrentSubtitle("");
      setVisibleWordCount(0);
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const visibleSubtitle = useMemo(() => {
    if (!currentSubtitle) return "";
    return currentSubtitle.split(/\s+/).slice(0, visibleWordCount).join(" ");
  }, [currentSubtitle, visibleWordCount]);

  const pastUserAnswers = messages
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.role === "user" && m.content !== "[START]");

  const recentAnswers = pastUserAnswers.slice(-1);

  const inputDisabled = isStreaming || isLoadingVoice || isPlayingAudio;

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/newcastle-logo.png"
            alt="Newcastle Financial Services"
            width={64}
            height={64}
            priority
            unoptimized
            className="h-16 w-16 object-cover object-left"
          />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[16px] tracking-[0.32em] uppercase text-white font-light">
              Newcastle
            </span>
            <span className="text-[10px] tracking-[0.24em] uppercase text-white/55 font-semibold mt-1.5">
              Financial Services
            </span>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-wide text-white text-center mb-4">
          Financial Discovery Session
        </h1>
        <p className="text-lg text-white/70 text-center max-w-[520px] mb-10 leading-relaxed">
          Sarah will guide you through a short conversation so Brad can prepare
          for your meeting. Make sure your sound is on.
        </p>
        <button
          type="button"
          onClick={() => setHasStarted(true)}
          className="px-8 py-4 rounded-full bg-gold text-background text-[15px] font-semibold tracking-wide hover:bg-gold/90 transition-colors"
        >
          Begin My Financial Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header: logo lockup + headline + status — tight stack */}
      <header className="shrink-0 flex flex-col items-center pt-6 px-6">
        <div className="flex items-center gap-2.5">
          <Image
            src="/newcastle-logo.png"
            alt="Newcastle Financial Services"
            width={64}
            height={64}
            priority
            unoptimized
            className="h-16 w-16 object-cover object-left"
          />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[12px] tracking-[0.32em] uppercase text-white font-light">
              Newcastle
            </span>
            <span className="text-[8px] tracking-[0.24em] uppercase text-white/55 font-semibold mt-1">
              Financial Services
            </span>
          </div>
        </div>
        <h1 className="mt-6 text-3xl md:text-5xl font-light tracking-wide text-white text-center">
          Financial Discovery Session
        </h1>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-white/40 tracking-wide">
            Sarah is online
          </span>
        </div>
      </header>

      {/* Orb + subtitle + recent answer — natural stack, no flex-1 dead space */}
      <main className="shrink-0 flex flex-col items-center px-6 mt-8">
        <div className="bg-[#1c1c1e] rounded-[28px] p-12 w-full max-w-[720px] flex flex-col items-center shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_60px_rgba(50,100,255,0.06)]">
          <OrbCanvas
            state={orbState}
            className="w-[220px] h-[220px] md:w-[320px] md:h-[320px] shrink-0"
          />

          <div className="mt-6 w-full flex items-start justify-center px-4 min-h-[80px] max-w-[680px] mx-auto">
            {errorMsg ? (
              <p className="text-[14px] text-red-400/85 max-w-[680px] text-center">
                {errorMsg}
              </p>
            ) : (
              <p className="text-[18px] leading-relaxed max-w-[680px] whitespace-pre-wrap text-white/75 text-center">
                {visibleSubtitle}
                {(isStreaming || isLoadingVoice) && (
                  <span className="inline-block w-1 h-4 bg-white/50 ml-1 align-middle animate-pulse" />
                )}
              </p>
            )}
          </div>
        </div>

        {recentAnswers.length > 0 && (
          <div className="mt-6 w-full max-w-[500px] mx-auto flex flex-col items-end gap-2">
            {recentAnswers.map(({ m, i }) => (
              <div key={i} className="flex flex-col items-end max-w-full">
                <div className="bg-gold/[0.08] border border-gold/20 rounded-2xl rounded-tr-sm px-4 py-2.5">
                  <p className="text-[14px] text-white/85 leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditAnswer(i)}
                  disabled={isStreaming}
                  className="mt-1 text-[11px] text-gold/80 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Edit answer
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Input bar — close below subtitle/answer, fixed-height to prevent shake */}
      {!isComplete && (
        <div className="shrink-0 px-5 mt-8 pb-5">
          <div className="flex items-end gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                disabled={inputDisabled}
                rows={1}
                className="w-full bg-white/5 border border-white/40 rounded-2xl px-5 py-4 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all resize-none disabled:opacity-40 leading-relaxed min-h-[56px] max-h-[140px]"
              />
            </div>

            <button
              type="button"
              onClick={toggle}
              disabled={inputDisabled || isTranscribing}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              style={{ width: 56, height: 56 }}
              className="relative shrink-0 inline-flex items-center justify-center rounded-full bg-gold text-background transition-colors hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRecording && (
                <>
                  <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-red-500 animate-ping" />
                  <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-red-500/70" />
                </>
              )}
              {isTranscribing ? (
                <Loader2 className="h-5 w-5 relative z-10 animate-spin" />
              ) : (
                <Mic className="h-5 w-5 relative z-10" />
              )}
            </button>

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || inputDisabled}
              aria-label="Send"
              style={{ width: 56, height: 56 }}
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Reserved slot so recorder errors don't push the layout */}
          <div className="h-5 mt-2 flex items-center justify-center">
            {recorderError && (
              <p className="text-[11px] text-red-400/80 max-w-[500px] text-center leading-tight">
                {recorderError}
              </p>
            )}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="shrink-0 flex justify-center py-8">
          <div className="flex items-center gap-2 text-[13px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Financial Discovery complete
          </div>
        </div>
      )}
    </div>
  );
}
