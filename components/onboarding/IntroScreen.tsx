import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Props = {
  clientFirstName: string;
  onBegin: () => void;
};

export function IntroScreen({ clientFirstName, onBegin }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg onboarding-fade-in">
        {/* BMK mark */}
        <div className="flex items-baseline gap-[1px] mb-10">
          <span className="bmk-letter-pulse text-[28px] font-bold tracking-tight text-gold leading-none select-none">B</span>
          <span className="text-[28px] font-bold tracking-tight text-white/80 leading-none select-none">M</span>
          <span className="bmk-letter-pulse text-[28px] font-bold tracking-tight text-gold leading-none select-none">K</span>
          <span className="ml-3 text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground/40 self-center">
            Financial Services
          </span>
        </div>

        {/* Sarah avatar + intro */}
        <div className="flex items-start gap-4 mb-10">
          <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mt-0.5">
            <span className="text-[12px] font-bold text-gold tracking-tight">SA</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gold/60 mb-3">
              Sarah · BMK Onboarding Assistant
            </p>
            <h1 className="text-[30px] font-semibold tracking-tight text-foreground leading-tight mb-4">
              Hi, {clientFirstName}.
            </h1>
            <p className="text-[15px] text-muted-foreground/75 leading-relaxed mb-3">
              I&apos;m Sarah — Brad&apos;s onboarding assistant.
            </p>
            <p className="text-[14px] text-muted-foreground/60 leading-relaxed">
              I&apos;ll guide you through your <span className="text-foreground/80 font-medium">Financial Discovery</span> — a short
              conversation that helps Brad build the right plan for you.
            </p>
          </div>
        </div>

        {/* What to expect */}
        <div className="rounded-lg border border-border/60 bg-card px-6 py-5 mb-8 space-y-3">
          {[
            { label: "One question at a time", detail: "Clear, focused, and easy to follow." },
            { label: "10–15 minutes", detail: "Most clients finish in a single sitting." },
            { label: "Type or speak", detail: "Answer by typing or using your voice." },
          ].map(({ label, detail }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/50" />
              <div>
                <span className="text-[13px] font-medium text-foreground/80">{label}</span>
                <span className="text-[13px] text-muted-foreground/50"> — {detail}</span>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onBegin}
          className="w-full bg-gold text-background hover:bg-gold/90 font-semibold text-[14px] py-3.5 h-auto rounded-lg flex items-center justify-center gap-2"
        >
          Begin Financial Discovery
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-[11px] text-muted-foreground/30 mt-4">
          Your responses are confidential and shared only with Brad Lonergan.
        </p>
      </div>
    </div>
  );
}
