"use client";

import { useRouter } from "next/navigation";
import { SarahChat } from "@/components/onboarding/SarahChat";
import { getLinkByToken } from "@/lib/sarah-data";
import { markFactFindCompleted } from "@/lib/review-store";

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const link = getLinkByToken(params.token);
  const clientName = link?.clientName ?? "there";

  function handleComplete() {
    if (link?.clientId) markFactFindCompleted(link.clientId);
    router.push("/dashboard");
  }

  return (
    <SarahChat
      clientName={clientName}
      clientId={link?.clientId}
      token={params.token}
      onComplete={handleComplete}
    />
  );
}
