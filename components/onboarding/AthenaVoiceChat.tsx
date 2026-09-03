"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";
import type { OrbState } from "@/components/orb/OrbCanvas";
import {
  FACT_FIND_PARAM,
  SUBMIT_FACT_FIND_TOOL,
  parseSubmittedFactFind,
  type SubmitFactFindParams,
} from "@/lib/athena/fact-find-tool";

const OrbCanvas = dynamic(() => import("@/components/orb/OrbCanvas"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  clientName: string;
  clientId?: string;
  token: string;
  onComplete: (factFindData?: Record<string, unknown>) => void;
};

function firstNameOf(name: string): string {
  if (!name) return "there";
  if (name.includes("&")) return name.split(" ").slice(0, -1).join(" ");
  return name.split(" ")[0];
}

function AthenaSession({ clientName, clientId, token, onComplete }: Props) {
  const [phase, setPhase] = useState<"intro" | "live" | "complete">("intro");
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [lastAnswer, setLastAnswer] = useState("");

  // The tool can fire more than once if the agent retries after a parse error.
  // Only the first accepted submission is persisted.
  const submittedRef = useRef(false);

  const submitFactFind = useCallback(
    async (params: SubmitFactFindParams): Promise<string> => {
      const parsed = parseSubmittedFactFind(params);
      if (!parsed.ok) {
        console.error("[Athena] fact find rejected:", parsed.reason);
        return `The submission was not accepted: ${parsed.reason} Please call ${SUBMIT_FACT_FIND_TOOL} again with ${FACT_FIND_PARAM} as a single valid JSON object.`;
      }

      if (submittedRef.current) return "Already received. Thank you.";
      submittedRef.current = true;

      if (!clientId) {
        console.warn("[Athena] no clientId, fact find not persisted");
        return "Received.";
      }

      try {
        const res = await fetch("/api/complete-fact-find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, token, data: parsed.data }),
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.error("[Athena] complete-fact-find failed:", res.status, detail);
          submittedRef.current = false;
          return "That did not save. Please try once more.";
        }
      } catch (e) {
        console.error("[Athena] complete-fact-find threw:", e);
        submittedRef.current = false;
        return "That did not save. Please try once more.";
      }

      setPhase("complete");
      setTimeout(() => onComplete(parsed.data as unknown as Record<string, unknown>), 2200);
      return "Received and saved. You can close the session warmly now.";
    },
    [clientId, token, onComplete],
  );

  const conversation = useConversation({
    clientTools: { [SUBMIT_FACT_FIND_TOOL]: submitFactFind },
    onConnect: () => {
      setConnecting(false);
      setErrorMsg(null);
    },
    onDisconnect: () => {
      if (!submittedRef.current) setPhase("intro");
    },
    onError: (message: unknown) => {
      console.error("[Athena] conversation error:", message);
      setConnecting(false);
      setErrorMsg(
        "Athena lost connection. Check your internet and start the session again.",
      );
      setPhase("intro");
    },
    onMessage: ({ message, source }) => {
      const text = message?.trim();
      if (!text) return;
      if (source === "ai") setSubtitle(text);
      else setLastAnswer(text);
    },
  });

  const { status, isSpeaking, isMuted, setMuted, startSession, endSession } =
    conversation;

  const orbState: OrbState = useMemo(() => {
    if (connecting || status === "connecting") return "thinking";
    if (status !== "connected") return "idle";
    return isSpeaking ? "speaking" : "listening";
  }, [connecting, status, isSpeaking]);

  async function handleStart() {
    setErrorMsg(null);
    setConnecting(true);
    try {
      // Prompt for the microphone before opening the socket so a denial is a
      // clear message rather than a session that connects and hears nothing.
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setConnecting(false);
      setErrorMsg(
        "Athena needs microphone access to run the session. Allow it in your browser, then start again.",
      );
      return;
    }

    try {
      const res = await fetch("/api/athena/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = (await res.json()) as { signedUrl?: string; error?: string };
      if (!res.ok || !payload.signedUrl) {
        throw new Error(payload.error ?? `Session request failed (${res.status}).`);
      }

      setPhase("live");
      startSession({
        signedUrl: payload.signedUrl,
        connectionType: "websocket",
        dynamicVariables: { client_first_name: firstNameOf(clientName) },
      });
    } catch (e: unknown) {
      console.error("[Athena] start failed:", e);
      setConnecting(false);
      setErrorMsg(
        e instanceof Error ? e.message : "Could not start the session.",
      );
    }
  }

  async function handleEnd() {
    try {
      await endSession();
    } catch (e) {
      console.error("[Athena] endSession failed:", e);
    }
  }

  if (phase === "intro") {
    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-start overflow-hidden bg-background px-6 py-10 text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,hsl(var(--gold)/0.09),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,hsl(var(--gold-shadow)/0.22),transparent_60%)]" />

        <div className="glass-panel glass-panel-elevated glass-grain relative z-10 flex w-full max-w-[640px] flex-col items-center rounded-[32px] px-8 pb-8 pt-4 text-center sm:px-10">
          <div className="mb-2">
            <NewcastleLogoFull size={220} />
          </div>
          <h1 className="mb-3 text-3xl font-light tracking-wide text-foreground md:text-5xl">
            Financial Discovery Session
          </h1>
          <p className="max-w-[520px] text-lg leading-relaxed text-foreground/70">
            A relaxed conversation with Athena, your discovery assistant, so Brad
            can prepare properly for your meeting.
          </p>

          <div className="gold-rule my-6 w-full max-w-[420px]" />

          <ul className="mb-7 grid w-full max-w-[460px] gap-2.5 text-left">
            {[
              "Athena speaks with you, so find a quiet spot and use headphones if you have them.",
              "Talk normally. You can interrupt her at any time.",
              "Rough answers are perfectly fine. Brad will refine the detail with you.",
              "No advice is given in this session. It is discovery only.",
              "Your information is handled securely and reviewed personally by Brad.",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-foreground/65"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold/70" />
                {line}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleStart}
            disabled={connecting}
            className="onboarding-cta-shine btn-gold relative overflow-hidden rounded-xl px-12 py-5 text-[16px] font-bold uppercase tracking-[0.05em] transition-[filter] hover:brightness-105 disabled:opacity-60"
          >
            {connecting ? "Connecting..." : "Begin My Financial Discovery"}
          </button>

          <div className="mt-4 flex min-h-[36px] items-center justify-center px-4">
            {errorMsg && (
              <p className="max-w-[440px] text-center text-[12.5px] leading-relaxed text-destructive/85">
                {errorMsg}
              </p>
            )}
          </div>

          <p className="max-w-[440px] text-[12px] leading-relaxed text-muted-foreground/60">
            Shared only with your Newcastle Financial Services adviser. You can
            stop at any time.
          </p>

          <details className="mt-4 w-full max-w-[460px] text-left">
            <summary className="cursor-pointer text-[12px] text-muted-foreground/60 underline underline-offset-2 hover:text-muted-foreground">
              How your personal information is collected and used
            </summary>
            <div className="mt-2 space-y-2 rounded-xl bg-foreground/[0.03] p-4 text-[12px] leading-relaxed text-muted-foreground/70">
              <p>
                Newcastle Financial Services (BMK Financial Services, AFSL
                authorisation via Charter Financial Planning, AFSL 234665)
                collects the personal and financial information you share in this
                session to prepare your financial advice, meet legal obligations
                under the Corporations Act 2001 (Cth), and verify your identity
                where required.
              </p>
              <p>
                This session is a voice conversation. Your speech is transcribed
                and processed by our voice technology provider, which stores and
                processes data outside Australia. Your information is encrypted in
                storage, is reviewed only by your adviser and their support staff,
                and is disclosed only to product providers you ask us to deal
                with, our licensee for compliance purposes, or where the law
                requires it. It is not sold or used for marketing without your
                consent.
              </p>
              <p>
                You may request access to or correction of your information at any
                time, or make a privacy complaint, by contacting Brad Lonergan. If
                unresolved, you can contact the Office of the Australian
                Information Commissioner (oaic.gov.au). Providing information is
                optional, but without it we may not be able to give you
                appropriate advice.
              </p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,hsl(var(--gold)/0.06),transparent_50%),radial-gradient(circle_at_50%_95%,hsl(var(--gold-shadow)/0.18),transparent_55%)]" />

      <header className="relative flex shrink-0 flex-col items-center px-6 pt-4">
        <NewcastleLogoFull size={180} />
        <h1 className="-mt-2 text-center text-3xl font-light tracking-wide text-foreground md:text-5xl">
          Financial Discovery Session
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={
              status === "connected"
                ? "status-live h-2.5 w-2.5 rounded-full bg-success text-success shadow-[0_0_8px_hsl(var(--success)/0.7)]"
                : "h-2.5 w-2.5 rounded-full bg-muted-foreground/40"
            }
          />
          <span className="text-[13px] tracking-wide text-foreground/55">
            {status === "connected"
              ? isSpeaking
                ? "Athena is speaking"
                : "Athena is listening"
              : "Connecting to Athena"}
          </span>
        </div>
      </header>

      <main className="relative mt-8 flex shrink-0 flex-col items-center px-6">
        <div className="glass-panel glass-panel-elevated relative flex w-full max-w-[720px] flex-col items-center overflow-hidden rounded-[28px] p-8 sm:p-12">
          <span
            className="pointer-events-none absolute inset-x-14 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(44_75%_84%/0.35),transparent)]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(55%_28%_at_50%_0%,hsl(46_85%_93%/0.045),transparent_75%)]"
            aria-hidden
          />
          <OrbCanvas
            state={orbState}
            className="h-[220px] w-[220px] shrink-0 md:h-[320px] md:w-[320px]"
          />

          <div className="mx-auto mt-6 flex min-h-[80px] w-full max-w-[680px] items-start justify-center px-4">
            <p className="max-w-[680px] whitespace-pre-wrap text-center text-[18px] leading-relaxed text-foreground/78">
              {subtitle ||
                (status === "connected" ? "" : "Connecting, one moment.")}
            </p>
          </div>
        </div>

        {lastAnswer && phase === "live" && (
          <div className="mx-auto mt-6 flex w-full max-w-[500px] flex-col items-end">
            <div className="rounded-2xl rounded-tr-sm border border-gold/20 bg-gold/[0.08] px-4 py-2.5 shadow-[inset_0_1px_0_hsl(44_75%_85%/0.08)]">
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/85">
                {lastAnswer}
              </p>
            </div>
          </div>
        )}
      </main>

      {phase === "live" && (
        <div className="mt-8 shrink-0 px-5 pb-8">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setMuted(!isMuted)}
              disabled={status !== "connected"}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              className="btn-glass inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isMuted ? (
                <MicOff className="h-5 w-5 text-destructive/80" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleEnd}
              disabled={status !== "connected"}
              className="btn-glass inline-flex h-14 items-center justify-center gap-2 rounded-full px-6 text-[14px] text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            >
              <PhoneOff className="h-4 w-4" />
              End session
            </button>

            {status === "connecting" && (
              <Loader2 className="h-5 w-5 animate-spin text-foreground/40" />
            )}
          </div>

          <div className="mt-3 flex h-5 items-center justify-center">
            {isMuted && (
              <p className="text-center text-[11px] leading-tight text-foreground/50">
                Your microphone is muted. Athena cannot hear you.
              </p>
            )}
          </div>
        </div>
      )}

      {phase === "complete" && (
        <div className="onboarding-rise relative flex shrink-0 flex-col items-center px-6 py-8">
          <div className="glass-panel glass-rim-emerald glass-grain flex w-full max-w-[520px] flex-col items-center gap-3 rounded-[24px] px-8 py-8 text-center">
            <span
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(158_60%_75%/0.35),transparent)]"
              aria-hidden
            />
            <div className="glass-chip flex items-center gap-2 rounded-full border-success/30 px-5 py-2.5 text-[13px] text-success shadow-[0_0_28px_-12px_hsl(var(--success)/0.6)]">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_0_hsl(var(--success)/0.8)]" />
              Financial Discovery complete
            </div>
            <p className="max-w-[440px] text-center text-[13px] leading-relaxed text-foreground/70">
              Thank you. Brad will personally review everything you have shared
              and be fully prepared for your meeting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AthenaVoiceChat(props: Props) {
  return (
    <ConversationProvider>
      <AthenaSession {...props} />
    </ConversationProvider>
  );
}
