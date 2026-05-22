"use client";

import { SarahChat } from "@/components/onboarding/SarahChat";
import { getLinkByToken } from "@/lib/sarah-data";
import { markFactFindCompleted } from "@/lib/review-store";

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  const link = getLinkByToken(params.token);
  const clientName = link?.clientName ?? "there";

  function handleComplete(factFindData?: Record<string, unknown>) {
    if (link?.clientId) {
      markFactFindCompleted(link.clientId);
    }
    // Trigger completion webhook (fire-and-forget)
    fetch("/api/complete-fact-find", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: link?.clientId,
        clientName,
        token: params.token,
        factFindData,
      }),
    }).catch(() => {});
  }

  return (
    <SarahChat
      clientName={clientName}
      clientToken={params.token}
      onComplete={handleComplete}
    />
  );
}
