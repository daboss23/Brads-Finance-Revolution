import { ArrowRight, Sparkles } from "lucide-react";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";
import { FACT_FIND_SECTIONS } from "@/lib/fact-find-flow";

const ESTIMATED_MINUTES = "15–20";

type Props = {
  firstName: string;
  onBegin: () => void;
};

export function IntroScreen({ firstName, onBegin }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[600px] onboarding-fade-in space-y-9">

        {/* Logo */}
        <div className="flex justify-center">
          <NewcastleLogoFull size={64} />
        </div>

        {/* Sarah greeting */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 border border-gold/40 mt-1 shadow-[0_0_20px_-4px_hsl(43_68%_52%_/_0.4)]">
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/80 mb-2.5">
              Sarah · Onboarding Guide
            </p>
            <h1 className="text-[38px] font-semibold tracking-tight text-foreground leading-tight">
              Hi, {firstName}.
            </h1>
            <p className="text-[18px] font-light text-foreground/60 leading-snug mt-1.5">
              I'm Sarah — Brad's onboarding assistant.
            </p>
          </div>
        </div>

        {/* Sarah intro card */}
        <div className="rounded-lg border border-border/80 bg-card overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/70 via-gold/25 to-transparent" />
            <div className="px-7 py-6 space-y-3.5">
              <p className="text-[14px] text-foreground/85 leading-relaxed">
                I'll guide you through your <span className="text-foreground font-medium">Financial Discovery</span> — a short conversation that gives Brad everything he needs to build a plan that's genuinely right for you.
              </p>
              <p className="text-[14px] text-foreground/60 leading-relaxed">
                I'll take you through it one question at a time. Estimates are perfectly fine — we'll refine the details together during your planning meeting.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Sections", value: FACT_FIND_SECTIONS.length.toString() },
            { label: "Est. time", value: `${ESTIMATED_MINUTES} min` },
            { label: "Adviser", value: "Brad Lonergan" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border/70 bg-card px-5 py-5 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/55 mb-2.5">
                {label}
              </p>
              <p className="text-[14px] font-semibold text-foreground/90">{value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onBegin}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold py-4 text-[14px] font-semibold text-gold-foreground hover:bg-gold/90 active:scale-[0.98] transition-all"
        >
          Begin Financial Discovery
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-[12px] text-muted-foreground/45">
          Your information is secure and shared only with your Newcastle Financial Services adviser.
        </p>
      </div>
    </div>
  );
}
