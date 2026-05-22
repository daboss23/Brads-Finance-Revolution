"use client";

import { getLinkByToken } from "@/lib/sarah-data";
import { SarahChat } from "@/components/onboarding/SarahChat";

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  const link = getLinkByToken(params.token);
  const clientName = link?.clientName ?? "there";

  return (
    <SarahChat
      clientName={clientName}
      onComplete={() => {
        // fact-find data is handled server-side via the sarah API
      }}
    />
  );
}
