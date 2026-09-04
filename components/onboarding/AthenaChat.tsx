"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Mic, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/lib/hooks/use-audio-recorder";
import { Button } from "@/components/ui/button";
import { AthenaIntroScreen } from "@/components/onboarding/AthenaIntroScreen";
import { AthenaStage } from "@/components/onboarding/AthenaStage";
import { AthenaTranscript } from "@/components/onboarding/AthenaTranscript";
import { AthenaSessionComplete } from "@/components/onboarding/AthenaSessionComplete";
import { useTranscriptCapture } from "@/lib/hooks/use-transcript-capture";
import { timeAwayLabel, type AthenaResumeState } from "@/lib/athena/resume";
import type { OrbState } from "@/components/orb/OrbCanvas";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Markers the client never sees. They exist to give Athena a user turn to
// answer, because the Messages API needs one to respond to and the client has
// not typed anything yet. Filtered out of the transcript and of everything the
// practice stores.
const START = "[START]";
const RESUME = "[RESUME]";
const CONTROL_MESSAGES: readonly string[] = [START, RESUME];

// Rebuilds the conversation Athena needs to see from the turns the practice
// kept. The leading control turn matters: the Messages API requires the first
// message to be a user message, and a restored history opens with Athena
// asking whether the client can hear her.
function messagesFromTurns(resume: AthenaResumeState): Message[] {
  return [
    { role: "user", content: START },
    ...resume.turns.map((t) => ({
      role: (t.role === "user" ? "user" : "assistant") as Message["role"],
      content: t.message,
    })),
  ];
}

type Props = {
  clientName: string;
  clientId?: string;
  token?: string;
  onComplete: (factFindData?: Record<string, unknown>) => void;
  /**
   * Set when this session is a failover from the live agent. The client has
   * already pressed begin once, so skip the intro rather than asking twice.
   */
  autoStart?: boolean;
  /**
   * A conversation this client started earlier and did not finish. When set,
   * the session restores it and asks the next question instead of the first.
   */
  resume?: AthenaResumeState | null;
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

class AthenaSessionError extends Error {
  constructor(
    message: string,
    readonly code: string | null,
  ) {
    super(message);
    this.name = "AthenaSessionError";
  }
}

// Turns a provider failure into something a client can act on.
//
// The old copy said "Athena could not connect" for everything, which sent
// clients to press reconnect against a failure no amount of reconnecting
// fixes, and told the adviser nothing. A configuration or billing fault is
// the practice's to fix and the client should be told to stop trying; a
// dropped request genuinely is worth retrying. The provider's own wording
// never reaches the screen, only the console.
function clientFacingError(e: unknown): string {
  const code = e instanceof AthenaSessionError ? e.code : null;
  if (code?.startsWith("anthropic_credential_")) {
    return "Athena is offline for maintenance right now. Nothing you have entered is lost. Please contact Brad Lonergan at Newcastle Financial Services and he will send you a fresh link.";
  }
  const message = e instanceof Error ? e.message : String(e);
  if (/credit balance|insufficient credit|quota/i.test(message)) {
    return "Athena is offline for maintenance right now. Nothing you have entered is lost. Please contact Brad Lonergan at Newcastle Financial Services and he will send you a fresh link.";
  }
  return "That did not reach Athena. Check your connection and press reconnect, and she will pick up where you left off.";
}

export function AthenaChat({
  clientName,
  clientId,
  token,
  onComplete,
  autoStart = false,
  resume = null,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(() =>
    resume ? messagesFromTurns(resume) : [],
  );
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(autoStart);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // The text session has no ElevenLabs call behind it, so it names its own
  // record. Stable for the life of the session so every flush merges into one
  // transcript rather than scattering across many.
  // A resumed session writes back into the record it is continuing, so the
  // practice ends up with one growing transcript rather than a pile of
  // fragments that each look like a client who gave up.
  const conversationIdRef = useRef<string | null>(resume?.conversationId ?? null);
  if (conversationIdRef.current === null && typeof window !== "undefined") {
    conversationIdRef.current = `text-${crypto.randomUUID()}`;
  }
  const startedAtRef = useRef(resume?.startedAt ?? new Date().toISOString());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const voiceAudioContextRef = useRef<AudioContext | null>(null);
  const voiceAnalyserRef = useRef<AnalyserNode | null>(null);
  const voiceLevelRef = useRef(0);

  const {
    isRecording,
    isTranscribing,
    error: recorderError,
    audioLevelRef: clientSpeechLevelRef,
    toggle,
  } = useAudioRecorder((text) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
    setTimeout(() => inputRef.current?.focus(), 50);
  });

  const orbState: OrbState = isPlayingAudio
    ? "speaking"
    : isStreaming || isLoadingVoice
      ? "thinking"
      : isRecording
        ? "listening"
        : "idle";
  const orbSignalRef = isRecording ? clientSpeechLevelRef : voiceLevelRef;
  const connectionLabel = errorMsg
    ? "Athena needs to reconnect"
    : isStreaming || isLoadingVoice
      ? "Athena is connecting"
      : "Athena is ready";

  useEffect(() => {
    if (!hasStarted) return;
    if (!resume) {
      sendToAthena([{ role: "user", content: START }]);
      return;
    }
    // The restored history ends wherever the client stopped, which is usually
    // mid question. The marker gives Athena a turn to answer so she can welcome
    // them back and ask the next thing, rather than the client landing on a
    // silent screen holding a question they already read.
    sendToAthena([...messagesFromTurns(resume), { role: "user", content: RESUME }]);
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
      cleanupVoiceAnalyser();
    };
  }, []);

  function cleanupVoiceAnalyser() {
    if (voiceAnalyserRef.current) {
      try {
        voiceAnalyserRef.current.disconnect();
      } catch {
        // The node may already be disconnected during browser teardown.
      }
      voiceAnalyserRef.current = null;
    }
    if (voiceAudioContextRef.current) {
      void voiceAudioContextRef.current.close();
      voiceAudioContextRef.current = null;
    }
    voiceLevelRef.current = 0;
  }

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
    cleanupVoiceAnalyser();
    setIsPlayingAudio(false);
  }

  async function playAthenaVoice(text: string, showSubtitle: boolean) {
    const cleaned = text.trim();
    if (!cleaned) return;
    stopAudioPlayback();

    setIsLoadingVoice(true);
    try {
      const res = await fetch("/api/athena/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleaned }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        console.error("[AthenaChat] voice route failed", res.status, errBody);
        if (showSubtitle) {
          setCurrentSubtitle(cleaned);
          setVisibleWordCount(cleaned.split(/\s+/).length);
        }
        return;
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        console.error("[AthenaChat] voice route returned empty audio");
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

      let voiceAnalyserBuffer: Uint8Array<ArrayBuffer> | null = null;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const context = new AudioCtx();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.72;
        source.connect(analyser);
        analyser.connect(context.destination);
        voiceAudioContextRef.current = context;
        voiceAnalyserRef.current = analyser;
        voiceAnalyserBuffer = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      } catch (e) {
        console.warn("[AthenaChat] voice analyser unavailable:", e);
      }

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
          if (voiceAnalyserRef.current && voiceAnalyserBuffer) {
            voiceAnalyserRef.current.getByteTimeDomainData(voiceAnalyserBuffer);
            let sumSq = 0;
            for (let i = 0; i < voiceAnalyserBuffer.length; i++) {
              const sample = (voiceAnalyserBuffer[i] - 128) / 128;
              sumSq += sample * sample;
            }
            const rms = Math.sqrt(sumSq / voiceAnalyserBuffer.length);
            const nextLevel = Math.min(1, Math.max(0, (rms - 0.012) / 0.16));
            voiceLevelRef.current +=
              (nextLevel - voiceLevelRef.current) *
              (nextLevel > voiceLevelRef.current ? 0.42 : 0.14);
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      };

      audio.onplay = () => {
        setIsPlayingAudio(true);
        void voiceAudioContextRef.current?.resume();
        startSync();
      };
      audio.onended = () => {
        if (showSubtitle) setVisibleWordCount(words.length);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        cleanupVoiceAnalyser();
        setIsPlayingAudio(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
      };
      audio.onerror = (e) => {
        console.error("[AthenaChat] audio playback error:", e, audio.error);
        cleanupVoiceAnalyser();
        setIsPlayingAudio(false);
        if (showSubtitle) setVisibleWordCount(words.length);
      };

      try {
        await audio.play();
      } catch (e) {
        console.warn("[AthenaChat] autoplay blocked, falling back to text-only:", e);
        if (showSubtitle) setVisibleWordCount(words.length);
        setIsPlayingAudio(false);
      }
    } catch (e) {
      console.error("[AthenaChat] playAthenaVoice fatal:", e);
      if (showSubtitle) {
        setCurrentSubtitle(cleaned);
        setVisibleWordCount(cleaned.split(/\s+/).length);
      }
    } finally {
      setIsLoadingVoice(false);
    }
  }

  async function sendToAthena(apiMessages: Message[]) {
    setIsStreaming(true);
    setErrorMsg(null);
    setCurrentSubtitle("");
    setVisibleWordCount(0);
    stopAudioPlayback();

    let full = "";
    try {
      const res = await fetch("/api/athena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          clientName,
          // Suppresses the audio check and the greeting for the whole resumed
          // session, not just its first turn: the opening sequence is in the
          // history and running it again is what makes a returning client
          // answer everything twice.
          resumed: Boolean(resume),
          timeAway: resume ? timeAwayLabel(resume.lastActivityAt) : undefined,
        }),
      });

      if (!res.body) throw new Error(`No response body (status ${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamError: string | null = null;
      let streamErrorCode: string | null = null;
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
              streamErrorCode = parsed.code ?? null;
              console.error("[Athena API error]", parsed);
            }
            if (parsed.text) {
              full += parsed.text;
            }
          } catch (e) {
            console.warn("[Athena] parse skip:", data, e);
          }
        }
      }

      if (streamError && !full) {
        throw new AthenaSessionError(streamError, streamErrorCode);
      }

      const factFindData = parseFactFindData(full);
      const athenaMessage: Message = { role: "assistant", content: full };
      setMessages([...apiMessages, athenaMessage]);

      setIsStreaming(false);

      const spoken = stripFactFindTag(full);
      if (spoken) {
        // Athena turn number = number of prior assistant messages + 1.
        // 1 = audio check (show subtitle), 2 = full greeting (NO subtitle),
        // 3+ = normal (show subtitle).
        //
        // A resumed session has no greeting to suppress: its second turn is
        // the welcome back and the next question, which the client needs to
        // read. Counting turns alone would silence exactly that message for
        // anyone who left early in their first visit.
        const athenaTurnNumber =
          apiMessages.filter((m) => m.role === "assistant").length + 1;
        const showSubtitle = Boolean(resume) || athenaTurnNumber !== 2;
        await playAthenaVoice(spoken, showSubtitle);
      }

      if (factFindData) {
        setIsComplete(true);
        void flushTranscript(true);
        if (clientId && token) {
          fetch("/api/complete-fact-find", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, token, data: factFindData }),
          })
            .then((r) => r.json())
            .then((j) => console.log("[AthenaChat] fact find webhook:", j))
            .catch((e) =>
              console.error("[AthenaChat] fact find webhook failed:", e),
            );
        } else {
          console.warn("[AthenaChat] skipping webhook, missing clientId/token");
        }
        setTimeout(() => onComplete(factFindData), 1800);
      }
    } catch (e: unknown) {
      console.error("[Athena] request failed:", e);
      setErrorMsg(clientFacingError(e));
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
    sendToAthena(updatedMessages);
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
    setInput(CONTROL_MESSAGES.includes(target.content) ? "" : target.content);

    const lastAthena = [...trimmed].reverse().find((m) => m.role === "assistant");
    if (lastAthena) {
      const text = stripFactFindTag(lastAthena.content);
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

  const transcript = useMemo(
    () =>
      messages
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => !CONTROL_MESSAGES.includes(m.content))
        .map(({ m, i }) => ({
          index: i,
          role: m.role,
          text: m.role === "assistant" ? stripFactFindTag(m.content) : m.content,
        }))
        .filter((entry) => entry.text.length > 0),
    [messages],
  );

  const captureTurns = useMemo(
    () =>
      transcript.map((entry) => ({
        role: (entry.role === "user" ? "user" : "agent") as "user" | "agent",
        message: entry.text,
      })),
    [transcript],
  );

  const { flush: flushTranscript } = useTranscriptCapture({
    token,
    conversationId: conversationIdRef.current,
    threadId: resume?.threadId,
    source: "text",
    turns: captureTurns,
    startedAt: startedAtRef.current,
  });

  const lastUserIndex = useMemo(() => {
    for (let i = transcript.length - 1; i >= 0; i -= 1) {
      if (transcript[i].role === "user") return transcript[i].index;
    }
    return -1;
  }, [transcript]);

  const inputDisabled = isStreaming || isLoadingVoice || isPlayingAudio;

  if (!hasStarted) {
    return (
      <AthenaIntroScreen
        mode="text"
        resuming={resume ? { answerCount: resume.answerCount } : undefined}
        onBegin={() => setHasStarted(true)}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground">
      {/* Ambient depth — warm gold horizon over near black */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,hsl(var(--gold)/0.06),transparent_50%),radial-gradient(circle_at_50%_95%,hsl(var(--gold-shadow)/0.18),transparent_55%)]" />

      <AthenaStage
        orbState={orbState}
        signalRef={orbSignalRef}
        statusLabel={connectionLabel}
        hasError={Boolean(errorMsg)}
        belowPanel={
          <AthenaTranscript
            entries={transcript}
            editableIndex={lastUserIndex}
            editDisabled={isStreaming}
            onEdit={handleEditAnswer}
          />
        }
      >
        {errorMsg ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-[680px] text-[14px] text-destructive/85">
              {errorMsg}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                sendToAthena(
                  messages.length > 0
                    ? messages
                    : [{ role: "user", content: START }],
                )
              }
              className="border-destructive/30 text-foreground hover:border-destructive/55"
            >
              Reconnect Athena
            </Button>
          </div>
        ) : (
          <p className="text-[18px] leading-relaxed max-w-[680px] whitespace-pre-wrap text-foreground/78 text-center">
            {visibleSubtitle}
            {(isStreaming || isLoadingVoice) && (
              <span className="inline-block w-1 h-4 bg-gold/60 ml-1 align-middle animate-pulse" />
            )}
          </p>
        )}
      </AthenaStage>

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
                className="glass-input w-full rounded-2xl px-5 py-4 text-[15px] text-foreground placeholder:text-foreground/40 resize-none disabled:opacity-40 leading-relaxed min-h-[56px] max-h-[140px]"
              />
            </div>

            <button
              type="button"
              onClick={toggle}
              disabled={inputDisabled || isTranscribing}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className="btn-gold relative h-14 w-14 shrink-0 inline-flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="btn-glass h-14 w-14 shrink-0 inline-flex items-center justify-center rounded-full text-foreground transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Reserved slot so recorder errors don't push the layout */}
          <div className="h-5 mt-2 flex items-center justify-center">
            {recorderError && (
              <p className="text-[11px] text-destructive/80 max-w-[500px] text-center leading-tight">
                {recorderError}
              </p>
            )}
          </div>
        </div>
      )}

      {isComplete && <AthenaSessionComplete />}
    </div>
  );
}
