import { CLIENTS } from "@/lib/data";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage({
  params,
}: {
  params: { clientId: string };
}) {
  const client = CLIENTS.find((c) => c.id === params.clientId);
  if (!client) return null;

  return <OnboardingFlow client={client} />;
}
