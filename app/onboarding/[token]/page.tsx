"use client";

import { useRouter } from "next/navigation";
import { SarahChat } from "@/components/onboarding/SarahChat";
import { LinkUnavailable } from "@/components/onboarding/LinkUnavailable";
import { validateOnboardingToken } from "@/lib/security/onboarding-access";
import { markFactFindCompleted } from "@/lib/review-store";

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const access = validateOnboardingToken(params.token);

  if (!access.ok) {
    return <LinkUnavailable reason={access.reason} />;
  }

  const link = access.link;
  const clientName = link.clientName;

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
