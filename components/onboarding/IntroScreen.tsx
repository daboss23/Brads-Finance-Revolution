"use client";

import { ArrowRight, Clock, Keyboard, Mic, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";
import { SarahOrb } from "./SarahOrb";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Private & Secure" },
  { icon: Mic, label: "Voice or Text" },
  { icon: Clock, label: "Takes 10–15 Minutes" },
  { icon: UserCheck, label: "Reviewed by Brad" },
];

const MILESTONES = [
  "Getting Started",
  "Financial Position",
  "Goals & Priorities",
  "Final Details",
];

type Props = {
  firstName: string;
  onBegin: () => void;
};

export function IntroScreen({ firstName, onBegin }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 md:py-12">
      <div className="w-full max-w-[880px] onboarding-fade-in flex flex-col gap-10 md:gap-12">

        {/* Top brand bar */}
        <header className="flex items-center justify-between gap-4">
          <NewcastleLogoFull size={44} />
          <p className="cmd-label text-muted-foreground/70">Secure Client Onboarding</p>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <p className="cmd-label text-gold">Financial Discovery Session</p>
            <h1 className="text-[34px] md:text-[42px] font-semibold tracking-tight leading-[1.05] text-foreground">
              Welcome, {firstName}.
            </h1>
            <p className="text-[18px] font-light text-foreground/80 leading-snug">
              Meet Sarah, Brad&apos;s AI onboarding assistant.
            </p>
            <p className="max-w-[46ch] text-[14.5px] text-muted-foreground leading-relaxed">
              Sarah will guide you through the discovery, gather the key details, and help
              Brad prepare for a more focused first conversation.
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <SarahOrb state="idle" size={230} />
          </div>
        </section>

        {/* Trust strip */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-card/60 px-4 py-3"
            >
              <Icon className="h-4 w-4 shrink-0 text-gold" />
              <span className="text-[12px] font-medium text-foreground/85">{label}</span>
            </div>
          ))}
        </section>

        {/* Progress milestones */}
        <section aria-label="Session milestones">
          <div className="gold-rule mb-5" />
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MILESTONES.map((label, i) => (
              <li key={label} className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-[10px] font-semibold text-gold">
                  {i + 1}
                </span>
                <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Main session card */}
        <section className="glass-panel edge-gold rounded-xl p-7 md:p-9 space-y-7">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <div className="space-y-2">
              <p className="cmd-label text-gold">Sarah · Onboarding Guide</p>
              <p className="text-[15px] text-foreground/85 leading-relaxed">
                Hi {firstName}, I&apos;m Sarah. I&apos;ll take you through a short guided
                conversation, one question at a time. Estimates are perfectly fine and you can
                pause whenever you like. Everything you share goes straight to Brad so your
                first meeting starts well ahead.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onBegin}
              className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-lg py-4 text-[14.5px] font-semibold"
            >
              <Mic className="h-4 w-4" />
              Begin My Financial Discovery
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onBegin}
              className="btn-glass flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-[13.5px] font-medium"
            >
              <Keyboard className="h-4 w-4" />
              Type instead
            </button>
          </div>

          <p className="text-center text-[12px] text-muted-foreground/70">
            You can skip any question and save your progress to continue later.
          </p>
        </section>

        {/* Reassurance footer */}
        <footer className="pb-4">
          <p className="text-center text-[12.5px] text-muted-foreground/60">
            Your responses are securely captured to help Brad prepare for your conversation.
          </p>
        </footer>
      </div>
    </div>
  );
}
