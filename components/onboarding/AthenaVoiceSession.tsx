"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AthenaIntroScreen } from "@/components/onboarding/AthenaIntroScreen";
import { AthenaStage } from "@/components/onboarding/AthenaStage";
import {
  AthenaTranscript,
  type TranscriptEntry,
} from "@/components/onboarding/AthenaTranscript";
import { AthenaSessionComplete } from "@/components/onboarding/AthenaSessionComplete";
import { useTranscriptCapture } from "@/lib/hooks/use-transcript-capture";
import { firstNameOf } from "@/lib/athena/client-name";
import { resumeContextFor, type AthenaResumeState } from "@/lib/athena/resume";
import type { OrbState } from "@/components/orb/OrbCanvas";

type Props = {
  clientName: string;
  clientId?: string;
  token?: string;
  onComplete: (factFindData?: Record<string, unknown>) => void;
  /**
   * Called when the live agent cannot be reached at all. The page drops to the
   * Anthropic text session rather than leaving the client on a dead screen.
   */
  onUnavailable: (reason: string) => void;
  /**
   * A conversation this client started earlier and did not finish.
   *
   * Restoring it on the voice path takes two things. The turns are seeded into
   * this component so the client sees their history and so the live writer
   * keeps growing one record instead of starting a second one. The agent gets
   * the same history through dynamic variables, because a resumed call is a new
   * call and ElevenLabs remembers nothing of the last one.
   */
  resume?: AthenaResumeState | null;
};

// Athena's live discovery session, spoken through the ElevenLabs agent.
//
// The agent holds the conversation: the ten discovery areas, the Australian
// voice, the guardrails and the closing tool call are all configured on
// ElevenLabs and versioned there. This component's whole job is to open the
// socket, keep the client oriented while it runs, and land the finished fact
// find in the encrypted store.
//
// It deliberately does not touch Anthropic. That is the point of preferring
// this path: the agent runs its own model, so a discovery session no longer
// stops when the practice's Anthropic balance does.
export function AthenaVoiceSession(props: Props) {
  return (
    <ConversationProvider>
      <VoiceSession {...props} />
    </ConversationProvider>
  );
}

type Phase = "intro" | "connecting" | "live" | "complete" | "failed";

function VoiceSession({
  clientName,
  clientId,
  token,
  onComplete,
  onUnavailable,
  resume = null,
}: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [entries, setEntries] = useState<TranscriptEntry[]>(() =>
    (resume?.turns ?? []).map((t, index) => ({
      index,
      role: t.role === "user" ? "user" : "assistant",
      text: t.message,
    })),
  );
  const [caption, setCaption] = useState("");
  // ElevenLabs' own id for this call. Sharing it means the live writer and the
  // post-call webhook land on one record rather than two half records.
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | undefined>(undefined);

  const signalRef = useRef(0);
  const nextIndexRef = useRef(resume?.turns.length ?? 0);
  // Read inside the animation frame loop, which must not re-subscribe on
  // every speaking/listening flip.
  const isSpeakingRef = useRef(false);
  // Guards the completion handoff: the agent is told to retry a rejected
  // submission, and a retry after a success must not fire onComplete twice.
  const completedRef = useRef(false);

  const appendEntry = useCallback((role: TranscriptEntry["role"], text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setEntries((prev) => [
      ...prev,
      { index: nextIndexRef.current++, role, text: trimmed },
    ]);
  }, []);

  const turns = useMemo(
    () =>
      entries.map((e) => ({
        role: (e.role === "user" ? "user" : "agent") as "user" | "agent",
        message: e.text,
      })),
    [entries],
  );

  const { flush: flushTranscript } = useTranscriptCapture({
    token,
    conversationId,
    threadId: resume?.threadId,
    source: "live",
    turns,
    startedAt,
  });

  // Sends the finished fact find to the same encrypted store the text session
  // writes to. The agent waits on the string this returns, and its prompt
  // tells it to correct and resend whatever a rejection names, so every
  // failure path has to say what was wrong in plain terms.
  const submitFactFind = useCallback(
    async ({ fact_find_json }: { fact_find_json?: unknown }) => {
      if (typeof fact_find_json !== "string") {
        return "Not accepted: fact_find_json must be a single JSON object serialised as a string.";
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(fact_find_json) as Record<string, unknown>;
      } catch {
        return "Not accepted: fact_find_json was not valid JSON. Resend the object on its own with no code fences and no commentary.";
      }

      if (!clientId || !token) {
        // Nothing the agent can fix by resending, so do not invite a retry.
        console.error("[AthenaVoice] cannot submit: missing clientId or token");
        return "Accepted.";
      }

      try {
        const res = await fetch("/api/complete-fact-find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, token, data: parsed }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.error("[AthenaVoice] fact find rejected", res.status, detail);
          return `Not accepted: the server returned ${res.status}. Resend the same object once.`;
        }
      } catch (e) {
        console.error("[AthenaVoice] fact find submission failed:", e);
        return "Not accepted: the submission did not reach the server. Resend the same object once.";
      }

      if (!completedRef.current) {
        completedRef.current = true;
        setPhase("complete");
        // Mark the transcript finished rather than abandoned. Not awaited: the
        // agent is holding the conversation open on this tool's reply.
        void flushTranscript(true);
        setTimeout(() => onComplete(parsed), 2400);
      }
      return "Accepted.";
    },
    [clientId, token, onComplete, flushTranscript],
  );

  // Every turn the client and Athena exchange, in the store's own shape. This
  // is what gets written while the session runs, so a client who stops at
  // question six still leaves their answers in the practice's own record.

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      setPhase("live");
      setErrorMsg(null);
      setConversationId(conversationId);
      setStartedAt(new Date().toISOString());
    },
    onDisconnect: (details) => {
      // A completed session ends on the agent's own terms, so only surface a
      // disconnect the client has not already been thanked for.
      if (completedRef.current) return;
      if (details.reason === "error") {
        setErrorMsg(details.message);
        setPhase("failed");
      } else {
        setPhase((p) => (p === "complete" ? p : "failed"));
      }
    },
    onError: (message) => {
      console.error("[AthenaVoice] session error:", message);
      setErrorMsg(message);
      setPhase("failed");
    },
    onMessage: ({ message, source }) => {
      appendEntry(source === "user" ? "user" : "assistant", message);
      if (source !== "user") setCaption(message);
    },
  });

  const { status, isSpeaking, endSession, getInputVolume, getOutputVolume } =
    conversation;

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Feed the orb from whichever side of the call is making sound.
  useEffect(() => {
    if (status !== "connected") {
      signalRef.current = 0;
      return;
    }
    let raf = 0;
    const tick = () => {
      let level = 0;
      try {
        level = isSpeakingRef.current ? getOutputVolume() : getInputVolume();
      } catch {
        // The session can be torn down between frames.
      }
      const target = Math.min(1, Math.max(0, level));
      // Rise fast so the orb catches the start of a word, fall slower so it
      // does not strobe between syllables.
      signalRef.current +=
        (target - signalRef.current) * (target > signalRef.current ? 0.45 : 0.12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, getInputVolume, getOutputVolume]);

  // Never leave a socket and a live microphone open behind a closed tab.
  //
  // Held through a ref so this runs on unmount and only on unmount. Depending
  // on the SDK's callback identity here would risk tearing down a live call
  // mid-answer if that identity ever changed between renders.
  const endSessionRef = useRef(endSession);
  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);
  useEffect(() => () => endSessionRef.current(), []);

  const begin = useCallback(async () => {
    setPhase("connecting");
    setErrorMsg(null);

    // Reach the agent before touching the microphone. If the live session is
    // down the client falls through to the text one having never been asked
    // for a permission that turned out not to be needed.
    let signedUrl: string;
    try {
      const res = await fetch(
        `/api/athena/signed-url?token=${encodeURIComponent(token ?? "")}`,
      );
      const body = (await res.json().catch(() => ({}))) as {
        signedUrl?: string;
        error?: string;
      };
      if (!res.ok || !body.signedUrl) {
        // The live agent is unreachable, not the client's problem to solve.
        // Hand the session to the text fallback instead.
        onUnavailable(body.error ?? `signed-url returned ${res.status}`);
        return;
      }
      signedUrl = body.signedUrl;
    } catch (e) {
      onUnavailable(e instanceof Error ? e.message : String(e));
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // A refused microphone is the client's to resolve, not a reason to
      // switch sessions: the live agent is up and they may want to allow it.
      setErrorMsg(
        "Athena needs your microphone for a spoken session. Allow microphone access in your browser, then press reconnect.",
      );
      setPhase("failed");
      return;
    }

    // The agent's opening line is "Hi {{client_first_name}}!" and its
    // completion tool is keyed to the client file, so both variables have to
    // be on the wire before the first word is spoken.
    //
    // is_resumed and resume_context are the same information the text session
    // puts in its system prompt. They only change what the client hears once
    // the ElevenLabs agent prompt reads them (see docs/athena-resume.md); until
    // then a returning voice client still has their answers saved and shown,
    // and the agent simply starts from the top. Passing variables the prompt
    // does not reference is harmless, so this ships ahead of that change
    // rather than waiting on it.
    conversation.startSession({
      signedUrl,
      connectionType: "websocket",
      dynamicVariables: {
        client_first_name: firstNameOf(clientName),
        client_id: clientId ?? "",
        is_resumed: resume ? "true" : "false",
        resume_context: resume ? resumeContextFor(resume.turns) : "",
      },
      clientTools: { submit_fact_find: submitFactFind },
    });
  }, [
    clientName,
    clientId,
    token,
    conversation,
    submitFactFind,
    onUnavailable,
    resume,
  ]);

  if (phase === "intro") {
    return (
      <AthenaIntroScreen
        mode="voice"
        resuming={resume ? { answerCount: resume.answerCount } : undefined}
        onBegin={begin}
      />
    );
  }

  const orbState: OrbState =
    phase === "connecting"
      ? "thinking"
      : isSpeaking
        ? "speaking"
        : status === "connected"
          ? "listening"
          : "idle";

  const statusLabel =
    phase === "failed"
      ? "Athena needs to reconnect"
      : phase === "complete"
        ? "Financial Discovery complete"
        : phase === "connecting"
          ? "Athena is connecting"
          : isSpeaking
            ? "Athena is speaking"
            : "Athena is listening";

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,hsl(var(--gold)/0.06),transparent_50%),radial-gradient(circle_at_50%_95%,hsl(var(--gold-shadow)/0.18),transparent_55%)]" />

      <AthenaStage
        orbState={orbState}
        signalRef={signalRef}
        statusLabel={statusLabel}
        hasError={phase === "failed"}
        belowPanel={<AthenaTranscript entries={entries} />}
      >
        {phase === "failed" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-[680px] text-[14px] text-destructive/85">
              {errorMsg ??
                "The connection to Athena dropped. Press reconnect and she will pick up where you left off."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={begin}
              className="border-destructive/30 text-foreground hover:border-destructive/55"
            >
              Reconnect Athena
            </Button>
          </div>
        ) : phase === "connecting" ? (
          <p className="flex items-center gap-2 text-[15px] text-foreground/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting you to Athena
          </p>
        ) : (
          <p className="text-[18px] leading-relaxed max-w-[680px] whitespace-pre-wrap text-foreground/78 text-center">
            {caption}
          </p>
        )}
      </AthenaStage>

      {phase === "live" && (
        <div className="shrink-0 px-5 mt-8 pb-5 flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => conversation.setMuted(!conversation.isMuted)}
            aria-pressed={conversation.isMuted}
            className="gap-2 rounded-full px-5"
          >
            {conversation.isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {conversation.isMuted ? "Microphone off" : "Microphone on"}
          </Button>
          <p className="text-[12px] text-muted-foreground/60 text-center max-w-[420px] leading-relaxed">
            Just speak naturally. You can interrupt Athena at any time, and you
            can say you would rather skip a question.
          </p>
        </div>
      )}

      {phase === "complete" && <AthenaSessionComplete />}
    </div>
  );
}
