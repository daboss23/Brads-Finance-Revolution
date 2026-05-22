"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { SarahOrb, type OrbState } from "./SarahOrb";
import { NewcastleEmblem } from "@/components/logo/newcastle-logo";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type DisplayMessage = {
  id: string;
  from: "sarah" | "client";
  text: string;
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

function getOrbState(
  isStreaming: boolean,
  streamingText: string,
  isListening: boolean,
  isSpeakingAudio: boolean
): OrbState {
  if (isListening) return "listening";
  if (isSpeakingAudio) return "speaking";
  if (isStreaming && !streamingText) return "thinking";
  if (isStreaming) return "speaking";
  return "idle";
}

function getStatusText(state: OrbState): string {
  switch (state) {
    case "speaking": return "Sarah is speaking";
    case "listening": return "Sarah is listening";
    case "thinking": return "Sarah is thinking";
    default: return "Sarah is ready";
  }
}

export function SarahChat({ clientName, onComplete }: Props) {
  const firstName = getFirstName(clientName);
  const [messages, setMessages] = useState<Message[]>([]);
  const [display, setDisplay] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = useRef(false);

  const { isListening, isSupported, start, stop } = useSpeechRecognition(
    (text) => setInput(text)
  );

  const orbState = getOrbState(isStreaming, streamingText, isListening, isSpeakingAudio);
  const statusText = getStatusText(orbState);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [display, streamingText]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    sendToSarah([{ role: "user", content: "[START]" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function playVoice(text: string) {
    try {
      const res = await fetch("/api/sarah/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setIsSpeakingAudio(true);
      await new Promise<void>((resolve) => {
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
        audio.play().catch(() => { URL.revokeObjectURL(url); resolve(); });
      });
    } catch {
      // voice is non-fatal
    } finally {
      setIsSpeakingAudio(false);
    }
  }

  async function sendToSarah(apiMessages: Message[]) {
    setIsStreaming(true);
    setIsSpeakingAudio(false);
    setStreamingText("");

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

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue;
          }

          if (parsed.error) throw new Error(String(parsed.error));
          if (typeof parsed.text === "string") {
            full += parsed.text;
            setStreamingText(full);
          }
        }
      }

      if (!full) throw new Error("No response received");

      const factFindData = parseFactFindData(full);
      const displayText = stripFactFindTag(full);

      const sarahMessage: Message = { role: "assistant", content: full };
      setMessages([...apiMessages, sarahMessage]);

      setDisplay((prev: DisplayMessage[]) => [
        ...prev,
        { id: `sarah-${Date.now()}`, from: "sarah", text: displayText },
      ]);
      setStreamingText("");

      if (displayText) await playVoice(displayText);

      if (factFindData) {
        setIsComplete(true);
        setTimeout(() => onComplete(factFindData), 1800);
      }
    } catch {
      setStreamingText("");
      setDisplay((prev: DisplayMessage[]) => [
        ...prev,
        {
          id: `sarah-err-${Date.now()}`,
          from: "sarah",
          text: "I'm having trouble connecting right now. Please refresh and try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      setIsSpeakingAudio(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSubmit() {
    const text = input.trim();
    if (!text || isStreaming || isSpeakingAudio) return;

    const clientMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, clientMsg];

    setDisplay((prev: DisplayMessage[]) => [
      ...prev,
      { id: `client-${Date.now()}`, from: "client", text },
    ]);
    setInput("");
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

  const inputDisabled = isStreaming || isSpeakingAudio;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header: logo + headline ── */}
      <div className="shrink-0 flex flex-col items-center pt-8 pb-5 px-6 border-b border-slate-100">
        <div className="flex items-center gap-4 mb-5">
          <NewcastleEmblem size={48} />
          <div>
            <p className="font-light tracking-[0.36em] text-slate-700 uppercase text-sm leading-none">
              Newcastle
            </p>
            <div className="h-px bg-gold/60 my-2" />
            <p className="font-semibold tracking-[0.26em] text-slate-500 uppercase text-[10px] leading-none">
              Financial Services
            </p>
          </div>
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-800 tracking-tight text-center leading-snug">
          Your Financial Discovery Session
        </h1>
        <p className="mt-2 text-slate-500 text-[14px] md:text-[15px] leading-relaxed text-center max-w-md">
          Hi {firstName} — Sarah will guide you through a short conversation so Brad can make the most of your time together.
        </p>
      </div>

      {/* ── Orb + status ── */}
      <div className="shrink-0 flex flex-col items-center pt-7 pb-5">
        <SarahOrb state={orbState} />
        <p className="mt-4 text-[13px] text-slate-400 font-medium tracking-wide">
          {statusText}
        </p>
      </div>

      {/* ── Transcript ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-xl mx-auto w-full space-y-4">

          {display.map((msg) => (
            <ChatBubble key={msg.id} message={msg} firstName={firstName} />
          ))}

          {/* Streaming bubble */}
          {isStreaming && streamingText && (
            <ChatBubble
              message={{ id: "streaming", from: "sarah", text: streamingText }}
              firstName={firstName}
              isStreaming
            />
          )}

          {/* Thinking indicator */}
          {isStreaming && !streamingText && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500">SA</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
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
      </div>

      {/* ── Input ── */}
      {!isComplete && (
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4">
          <div className="flex items-end gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={inputDisabled ? "Sarah is responding…" : "Type your answer…"}
                disabled={inputDisabled}
                rows={1}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-12 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all resize-none disabled:opacity-40 leading-relaxed min-h-12 max-h-[120px]"
              />
              {isSupported !== false && (
                <button
                  type="button"
                  onClick={handleMic}
                  disabled={inputDisabled}
                  className={cn(
                    "absolute right-3 bottom-3 flex h-7 w-7 items-center justify-center rounded-md transition-all",
                    isListening
                      ? "text-amber-600 bg-amber-50 ring-1 ring-amber-200"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {isListening ? (
                    <MicOff className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || inputDisabled}
              className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-white transition-all hover:bg-gold/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] text-amber-600">Listening…</span>
            </div>
          )}

          <p className="text-center text-[10px] text-slate-400 mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}

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
      <div className="flex items-start gap-3 max-w-[88%]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 mt-0.5">
          <span className="text-[10px] font-bold text-slate-500">SA</span>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-1.5">
            Sarah
          </p>
          <div
            className={cn(
              "bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3",
              isStreaming && "border-gold/30"
            )}
          >
            <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {message.text}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-gold/70 ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-[88%] ml-auto flex-row-reverse">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 mt-0.5">
        <span className="text-[10px] font-bold text-slate-500">
          {firstName.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-1.5 text-right">
          {firstName}
        </p>
        <div className="bg-amber-50 border border-amber-200/70 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
}
