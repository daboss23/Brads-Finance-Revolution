"use client";

import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  return <OnboardingFlow token={params.token} />;
}
