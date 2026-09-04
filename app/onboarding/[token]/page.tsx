"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AthenaChat } from "@/components/onboarding/AthenaChat";
import { getLinkByToken } from "@/lib/athena-data";
import { markFactFindCompleted } from "@/lib/review-store";
import { fetchResumeState, type AthenaResumeState } from "@/lib/athena/resume";
import type { AthenaSessionMode } from "@/app/api/athena/session-mode/route";

// The ConvAI SDK is a large dependency and only the voice path needs it.
// Loading it behind the mode decision keeps the text fallback light, which
// matters because clients open these links on phones on home connections.
const AthenaVoiceSession = dynamic(
  () =>
    import("@/components/onboarding/AthenaVoiceSession").then(
      (m) => m.AthenaVoiceSession,
    ),
  { ssr: false, loading: () => <SessionLoading /> },
);

function SessionLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background text-foreground/60">
      <p className="text-sm tracking-wide">Preparing your session…</p>
    </div>
  );
}

interface TokenCheck {
  valid: boolean;
  clientId?: string;
  clientName?: string;
}

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const demoLink = getLinkByToken(params.token);
  // Demo tokens resolve instantly; real client tokens resolve via the
  // server, which checks the encrypted client store.
  const [check, setCheck] = useState<TokenCheck | null>(
    demoLink
      ? { valid: true, clientId: demoLink.clientId, clientName: demoLink.clientName }
      : null,
  );
  // Which Athena this client gets. Voice is the live ElevenLabs agent and is
  // preferred because it runs its own model, so it keeps working when the
  // practice's Anthropic balance does not.
  const [mode, setMode] = useState<AthenaSessionMode | null>(null);
  // True when the text session is a failover, not the client's first screen.
  const [failedOverFromVoice, setFailedOverFromVoice] = useState(false);
  // The conversation this client already started, if there is one. Undefined
  // means the lookup has not answered yet, null means there is nothing to pick
  // up. Both sessions have to mount already knowing, because a session that
  // starts and then discovers a history has already said hello.
  const [resume, setResume] = useState<AthenaResumeState | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (demoLink) return;
    void fetch(`/api/onboarding/${encodeURIComponent(params.token)}`)
      .then((r) => r.json())
      .then((data: TokenCheck) => setCheck(data))
      .catch(() => setCheck({ valid: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  useEffect(() => {
    void fetchResumeState(params.token).then(setResume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  useEffect(() => {
    void fetch("/api/athena/session-mode")
      .then((r) => r.json())
      .then((data: { mode?: AthenaSessionMode }) => setMode(data.mode ?? "text"))
      // A failed probe must not strand the client: the text session can still
      // report its own failure honestly if it is also down.
      .catch(() => setMode("text"));
  }, []);

  function handleComplete() {
    if (check?.clientId) markFactFindCompleted(check.clientId);
    router.push("/dashboard");
  }

  if (!check || !mode || resume === undefined) return <SessionLoading />;

  if (!check.valid) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6">
        <div className="glass-panel glass-panel-elevated max-w-[420px] rounded-[28px] px-8 py-10 text-center">
          <h1 className="text-xl font-light tracking-wide text-foreground">
            This link isn&apos;t active
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground/60">
            Your discovery link may have expired or been mistyped. Please
            contact Brad Lonergan at Newcastle Financial Services for a fresh
            link.
          </p>
        </div>
      </div>
    );
  }

  if (mode === "voice") {
    return (
      <AthenaVoiceSession
        clientName={check.clientName ?? "there"}
        clientId={check.clientId}
        token={params.token}
        resume={resume}
        onComplete={handleComplete}
        onUnavailable={(reason) => {
          // The live agent was configured but would not open. Drop to the
          // text session rather than showing the client a dead end.
          console.error("[onboarding] voice session unavailable:", reason);
          setFailedOverFromVoice(true);
          setMode("text");
        }}
      />
    );
  }

  return (
    <AthenaChat
      clientName={check.clientName ?? "there"}
      clientId={check.clientId}
      token={params.token}
      resume={resume}
      onComplete={handleComplete}
      autoStart={failedOverFromVoice}
    />
  );
}
