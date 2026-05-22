"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { SarahOrb, type OrbState } from "./SarahOrb";

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

export function SarahChat({ clientName, onComplete }: Props) {
  const firstName = getFirstName(clientName);
  const [messages, setMessages] = useState<Message[]>([]);
  const [display, setDisplay] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isListening, isSupported, start, stop } = useSpeechRecognition(
    (text) => setInput(text)
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [display, streamingText]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    sendToSarah([{ role: "user", content: "[START]" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }

  async function speakText(text: string) {
    stopAudio();
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
      audioRef.current = audio;
      setOrbState("speaking");

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setOrbState("idle");
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setOrbState("idle");
      };

      await audio.play();
    } catch {
      setOrbState("idle");
    }
  }

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

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

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
            // ignore partial chunk parse errors
          }
        }
      }

      const factFindData = parseFactFindData(full);
      const displayText = stripFactFindTag(full);

      const sarahMessage: Message = { role: "assistant", content: full };
      const updatedMessages = [...apiMessages, sarahMessage];
      setMessages(updatedMessages);

      setDisplay((prev) => [
        ...prev,
        { id: `sarah-${Date.now()}`, from: "sarah", text: displayText },
      ]);
      setStreamingText("");

      if (factFindData) {
        setIsComplete(true);
        speakText(displayText).finally(() => {
          setTimeout(() => onComplete(factFindData), 1800);
        });
      } else {
        speakText(displayText);
      }
    } catch {
      setDisplay((prev) => [
        ...prev,
        {
          id: `sarah-err-${Date.now()}`,
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

  function handleSubmit() {
    const text = input.trim();
    if (!text || isStreaming) return;

    stopAudio();

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

  function handleMic() {
    if (isListening) {
      stop();
      setOrbState(isStreaming ? "thinking" : "idle");
    } else {
      start();
      setOrbState("listening");
    }
  }

  const orbLabel =
    orbState === "thinking"
      ? "Sarah is thinking…"
      : orbState === "speaking"
      ? "Sarah is speaking…"
      : orbState === "listening"
      ? "Listening…"
      : "Sarah is ready";

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Header */}
      <div className="shrink-0 border-b border-border px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-foreground/90 leading-none">Sarah</p>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5 tracking-wide">
            BMK Financial Services · Financial Discovery
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-muted-foreground/50">Online</span>
        </div>
      </div>

      {/* Orb */}
      <div className="shrink-0 flex flex-col items-center pt-6 pb-2">
        <SarahOrb state={orbState} />
        <p className="mt-3 text-[11px] text-muted-foreground/40 tracking-wide">
          {orbLabel}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
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

        {/* Typing indicator */}
        {isStreaming && !streamingText && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
              <span className="text-[10px] font-bold text-gold">SA</span>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce sarah-dot-delay-1" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce sarah-dot-delay-2" />
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-[12px] text-emerald-500/80 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Financial Discovery complete
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="shrink-0 border-t border-border px-5 py-4">
          <div className="flex items-end gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? "Sarah is thinking…" : "Type your answer…"}
                disabled={isStreaming}
                rows={1}
                className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 pr-12 text-[14px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none disabled:opacity-40 leading-relaxed min-h-12 max-h-[120px]"
              />
              {isSupported !== false && (
                <button
                  type="button"
                  onClick={handleMic}
                  disabled={isStreaming}
                  className={cn(
                    "absolute right-3 bottom-3 flex h-7 w-7 items-center justify-center rounded-md transition-all",
                    isListening
                      ? "text-gold bg-gold/15 ring-1 ring-gold/30"
                      : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/50"
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
              disabled={!input.trim() || isStreaming}
              className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-background transition-all hover:bg-gold/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[11px] text-gold/70">Listening…</span>
            </div>
          )}
          <p className="text-center text-[10px] text-muted-foreground/25 mt-2">
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
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mt-0.5">
          <span className="text-[10px] font-bold text-gold">SA</span>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold/50 mb-1.5">
            Sarah
          </p>
          <div
            className={cn(
              "bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3",
              isStreaming && "border-gold/20"
            )}
          >
            <p className="text-[14px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
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
    <div className="flex items-start gap-3 max-w-[85%] ml-auto flex-row-reverse">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/60 mt-0.5">
        <span className="text-[10px] font-bold text-muted-foreground/70">
          {firstName.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground/40 mb-1.5 text-right">
          {firstName}
        </p>
        <div className="bg-gold/[0.08] border border-gold/20 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-[14px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
}
