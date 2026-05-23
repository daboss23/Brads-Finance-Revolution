"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { SarahOrb, type OrbState } from "./SarahOrb";
import { NewcastleEmblem } from "@/components/logo/newcastle-logo";

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

function detectIsChrome(): boolean {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent;
  const vendor = navigator.vendor || "";
  const isEdge = /Edg\//.test(ua);
  const isOpera = /OPR\//.test(ua) || /Opera/.test(ua);
  const isBrave = (navigator as unknown as { brave?: unknown }).brave !== undefined;
  const isChromium = /Chrome\//.test(ua) && /Google Inc/.test(vendor);
  return isChromium && !isEdge && !isOpera && !isBrave;
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
  const [isChrome, setIsChrome] = useState<boolean>(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = useRef(false);

  const { isListening, isSupported, start, stop } = useSpeechRecognition(
    (text) => setInput(text)
  );

  useEffect(() => {
    setIsChrome(detectIsChrome());
  }, []);

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

  // Rewind: remove the user message at userIdx and any following assistant reply,
  // put the user's text back in the input box.
  function handleEditAnswer(userIdx: number) {
    if (isStreaming) return;
    const target = messages[userIdx];
    if (!target || target.role !== "user") return;

    const trimmed = messages.slice(0, userIdx);
    setMessages(trimmed);
    setInput(target.content === "[START]" ? "" : target.content);

    // Restore last Sarah subtitle if any
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

  // Past user answers (skip the synthetic [START])
  const pastUserAnswers = messages
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.role === "user" && m.content !== "[START]");

  const recentAnswers = pastUserAnswers.slice(-3);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Top header: logo + headline */}
      <header className="shrink-0 flex flex-col items-center pt-8 pb-2 px-6">
        <NewcastleEmblem size={56} className="mb-3" />
        <h1 className="text-[26px] md:text-[30px] font-light tracking-tight text-white">
          Financial Discovery Session
        </h1>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-white/40 tracking-wide">
            Sarah is online
          </span>
        </div>
      </header>

      {/* Orb stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        <SarahOrb state={orbState} size={320} />

        {/* Subtitle: closed-caption style */}
        <div
          className="mt-8 w-full text-center min-h-[5rem] px-4"
        >
          {errorMsg ? (
            <p className="text-[14px] text-red-400/85 mx-auto max-w-[500px]">
              {errorMsg}
            </p>
          ) : (
            <p className="text-[18px] leading-relaxed mx-auto max-w-[500px] whitespace-pre-wrap text-white/75">
              {visibleSubtitle}
              {isStreaming && (
                <span className="inline-block w-1 h-4 bg-white/50 ml-1 align-middle animate-pulse" />
              )}
            </p>
          )}
        </div>

        {/* Recent client answers with edit-back */}
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
      </div>

      {/* Input bar */}
      {!isComplete && (
        <div className="shrink-0 px-5 py-5">
          <div className="flex items-end gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? "Sarah is speaking…" : "Type your answer…"}
                disabled={isStreaming}
                rows={1}
                className="w-full bg-white/5 border border-white/15 rounded-2xl px-5 py-4 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none disabled:opacity-40 leading-relaxed min-h-[56px] max-h-[140px]"
              />
            </div>

            {/* Mic button: only show when Chrome AND supported */}
            {isChrome && isSupported !== false && (
              <button
                type="button"
                onClick={handleMic}
                aria-label={isListening ? "Stop listening" : "Start listening"}
                className="relative shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-background transition-all hover:bg-gold/90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full ring-2 ring-red-500 animate-ping" />
                    <span className="absolute inset-0 rounded-full ring-2 ring-red-500/70" />
                  </>
                )}
                <Mic className="h-5 w-5 relative z-10" />
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              aria-label="Send"
              className="shrink-0 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {!isChrome && (
            <p className="text-center text-[11px] text-white/40 mt-3 max-w-[500px] mx-auto leading-relaxed">
              For the best experience including voice, please open this link in Google Chrome.
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
