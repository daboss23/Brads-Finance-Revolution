"use client";

import { useState } from "react";
import { type Client } from "@/lib/data";
import { SECTIONS, TOTAL_XP } from "@/lib/onboarding-questions";
import { IntroScreen } from "./IntroScreen";
import { SarahChat } from "./SarahChat";
import { CompletionCertificate } from "./CompletionCertificate";

type Phase = "intro" | "chat" | "complete";

export function OnboardingFlow({ client }: { client: Client }) {
  const [phase, setPhase] = useState<Phase>("intro");

  const completedDate = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (phase === "intro") {
    const firstName = client.name.includes("&")
      ? client.name.split(" ").slice(0, -1).join(" ")
      : client.name.split(" ")[0];
    return (
      <IntroScreen
        clientFirstName={firstName}
        onBegin={() => setPhase("chat")}
      />
    );
  }

  if (phase === "complete") {
    return (
      <CompletionCertificate
        clientName={client.name}
        xpEarned={TOTAL_XP}
        completedDate={completedDate}
        sectionsCompleted={SECTIONS.length}
      />
    );
  }

  return (
    <SarahChat
      clientName={client.name}
      onComplete={() => setPhase("complete")}
    />
  );
}
