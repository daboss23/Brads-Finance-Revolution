import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { type Section } from "@/lib/onboarding-questions";
import { SECTION_XP_BONUS } from "@/lib/onboarding-questions";
import { cn } from "@/lib/utils";

type Props = {
  section: Section;
  sectionsCompleted: number;
  totalSections: number;
  onContinue: () => void;
  isLastSection?: boolean;
};

const MILESTONE_COPY: Record<number, { heading: string; sub: string }> = {
  1: { heading: "Strong start.", sub: "The foundation is in place." },
  2: { heading: "Great momentum.", sub: "You're making real progress." },
  3: { heading: "Halfway there.", sub: "You're well past the midpoint." },
  4: { heading: "Excellent work.", sub: "More than halfway through." },
  5: { heading: "Nearly there.", sub: "Just two sections remaining." },
  6: { heading: "Final section.", sub: "The most important one." },
  7: { heading: "Complete.", sub: "Your Financial Discovery is done." },
};

export function SectionMilestone({
  section,
  sectionsCompleted,
  totalSections,
  onContinue,
  isLastSection,
}: Props) {
  const copy = MILESTONE_COPY[sectionsCompleted] ?? { heading: "Section complete.", sub: "" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg onboarding-fade-in text-center">
        {/* Medal */}
        <div className="inline-flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mb-3">
            <CheckCircle2 className="h-7 w-7 text-gold" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold/60">
            {section.medalLabel} · Section Complete
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-[28px] font-semibold tracking-tight text-foreground mb-2">
          {copy.heading}
        </h2>
        <p className="text-[15px] text-muted-foreground/60 mb-2">{copy.sub}</p>
        <p className="text-[13px] text-muted-foreground/50 mb-8">
          {section.completionMessage}
        </p>

        {/* XP earned */}
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/20 px-5 py-2 mb-10">
          <span className="text-[15px] font-semibold text-gold">+{SECTION_XP_BONUS} XP</span>
          <span className="text-[11px] text-gold/50 font-medium">Section Bonus</span>
        </div>

        {/* Section progress dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i < sectionsCompleted
                  ? "h-2 w-2 bg-gold"
                  : "h-1.5 w-1.5 bg-border"
              )}
            />
          ))}
        </div>

        {!isLastSection && (
          <>
            <p className="text-[12px] text-muted-foreground/40 mb-4">
              Next: {section.transitionMessage}
            </p>
            <Button
              onClick={onContinue}
              className="w-full bg-gold text-background hover:bg-gold/90 font-semibold text-[13.5px] py-3 h-auto rounded-lg flex items-center justify-center gap-2"
            >
              Continue to next section
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {isLastSection && (
          <Button
            onClick={onContinue}
            className="w-full bg-gold text-background hover:bg-gold/90 font-semibold text-[13.5px] py-3 h-auto rounded-lg flex items-center justify-center gap-2"
          >
            View your completion certificate
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
