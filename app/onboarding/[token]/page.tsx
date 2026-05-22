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

  function handleComplete(data?: Record<string, unknown>) {
    if (link?.clientId) markFactFindCompleted(link.clientId);
  }

  return <SarahChat clientName={clientName} onComplete={handleComplete} />;
}
