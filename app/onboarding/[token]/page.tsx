"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SarahChat } from "@/components/onboarding/SarahChat";
import { getLinkByToken } from "@/lib/sarah-data";
import { markFactFindCompleted } from "@/lib/review-store";

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

  useEffect(() => {
    if (demoLink) return;
    void fetch(`/api/onboarding/${encodeURIComponent(params.token)}`)
      .then((r) => r.json())
      .then((data: TokenCheck) => setCheck(data))
      .catch(() => setCheck({ valid: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  function handleComplete() {
    if (check?.clientId) markFactFindCompleted(check.clientId);
    router.push("/dashboard");
  }

  if (!check) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background text-foreground/60">
        <p className="text-sm tracking-wide">Preparing your session…</p>
      </div>
    );
  }

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

  return (
    <SarahChat
      clientName={check.clientName ?? "there"}
      clientId={check.clientId}
      token={params.token}
      onComplete={handleComplete}
    />
  );
}
