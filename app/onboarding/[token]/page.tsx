"use client";

import { SarahChat } from "@/components/onboarding/SarahChat";
import { getLinkByToken } from "@/lib/sarah-data";

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  const link = getLinkByToken(params.token);
  const clientName = link?.clientName ?? "Friend";

  return <SarahChat clientName={clientName} onComplete={() => {}} />;
}
