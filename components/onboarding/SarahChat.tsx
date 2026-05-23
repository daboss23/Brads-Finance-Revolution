"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { SarahOrb, type OrbState } from "./SarahOrb";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  clientName: string;
  onComplete: (factFindData?: Record<string, unknown>) => void;
};

function getFirstName(fullName: string): string {
  if (fullName.includes("&")) {
    return fullName.split(" ").slice(0, -1).join(" ");
  }
  return fullName.split(" ")[0];
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

export function SarahChat({ clientName, onComplete }: Props) {
  const firstName = getFirstName(clientName);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = useRef(false);

  const { isListening, isSupported, start, stop } = useSpeechRecognition(
    (text) => setInput(text)
  );

  // Word-by-word reveal of subtitle
  useEffect(() => {
    if (!currentSubtitle) {
      setVisibleWordCount(0);
      return;
    }
    const words = currentSubtitle.split(/\s+/);
    if (visibleWordCount >= words.length) return;
    const timer = setTimeout(() => {
      setVisibleWordCount((n) => Math.min(n + 1, words.length));
    }, 70);
    return () => clearTimeout(timer);
  }, [currentSubtitle, visibleWordCount]);

  const orbState: OrbState = isStreaming
    ? "speaking"
    : isListening
      ? "listening"
      : "idle";

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    sendToSarah([{ role: "user", content: "[START]" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendToSarah(apiMessages: Message[]) {
    setIsStreaming(true);
    setErrorMsg(null);
    setCurrentSubtitle("");
    setVisibleWordCount(0);

    try {
      const res = await fetch("/api/sarah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, clientName }),
      });

      if (!res.body) throw new Error(`No response body (status ${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
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
              setCurrentSubtitle(stripFactFindTag(full));
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

      if (factFindData) {
        setIsComplete(true);
        setTimeout(() => onComplete(factFindData), 1800);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[Sarah] request failed:", e);
      setErrorMsg(msg);
      setCurrentSubtitle("Sorry, I ran into a problem. Please try again.");
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

  function handleMic() {
    if (isListening) stop();
    else start();
  }

  const words = currentSubtitle ? currentSubtitle.split(/\s+/) : [];
  const visibleSubtitle = words.slice(0, visibleWordCount).join(" ");

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="shrink-0 flex items-center justify-between px-6 py-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gold/70">
          Sarah · BMK Financial Services
        </p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-white/40">Online</span>
        </div>
      </div>

      {/* Orb stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <SarahOrb state={orbState} size={340} />

        {/* Subtitle */}
        <div className="mt-10 max-w-3xl text-center min-h-[6rem]">
          {errorMsg ? (
            <p className="text-[15px] text-red-400/90">
              {errorMsg}
            </p>
          ) : (
            <p className="text-[28px] md:text-[32px] leading-snug text-white font-light tracking-tight whitespace-pre-wrap">
              {visibleSubtitle}
              {isStreaming && (
                <span className="inline-block w-1.5 h-7 bg-white/70 ml-1 align-middle animate-pulse" />
              )}
            </p>
          )}
        </div>
      </div>

      {/* Input bar — mic ALWAYS visible */}
      {!isComplete && (
        <div className="shrink-0 px-5 py-5">
          <div className="flex items-end gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? "Sarah is speaking…" : "Type or tap the mic to speak…"}
                disabled={isStreaming}
                rows={1}
                className="w-full bg-white/5 border border-white/15 rounded-2xl px-5 py-4 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none disabled:opacity-40 leading-relaxed min-h-[56px] max-h-[140px]"
              />
            </div>

            {/* Mic button — gold, persistent, red pulsing ring while listening */}
            <button
              type="button"
              onClick={handleMic}
              disabled={isSupported === false}
              aria-label={isListening ? "Stop listening" : "Start listening"}
              className={cn(
                "relative shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-background transition-all hover:bg-gold/90 disabled:opacity-30 disabled:cursor-not-allowed",
                isListening && "ring-red-500"
              )}
            >
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full ring-2 ring-red-500 animate-ping" />
                  <span className="absolute inset-0 rounded-full ring-2 ring-red-500/70" />
                </>
              )}
              <Mic className="h-5 w-5 relative z-10" />
            </button>

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              aria-label="Send"
              className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {isSupported === false && (
            <p className="text-center text-[11px] text-white/40 mt-3">
              Voice input is not supported in this browser.
            </p>
          )}
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
