import { CheckCircle2, ArrowRight } from "lucide-react";
import { FACT_FIND_SECTIONS } from "@/lib/fact-find-flow";
import { cn } from "@/lib/utils";

const SECTION_XP_BONUS = 100;

const MEDAL_LABELS: Record<string, string> = {
  "personal-details": "Foundation",
  "contact-information": "Connected",
  "family-dependants": "Family",
  "employment-income": "Earnings",
  assets: "Portfolio",
  liabilities: "Clarity",
  expenses: "Lifestyle",
  superannuation: "Future",
  insurance: "Protected",
  "goals-objectives": "Vision",
};

const COMPLETION_MESSAGES: Record<string, string> = {
  "personal-details": "Personal details locked in. A strong start.",
  "contact-information": "Contact details complete. Brad can reach you easily now.",
  "family-dependants": "Family profile captured. This shapes your protection strategy.",
  "employment-income": "Income picture complete. You're building real momentum.",
  assets: "Assets mapped. You're past the halfway mark.",
  liabilities: "Liabilities clear. Your full financial picture is forming.",
  expenses: "Expenses noted. Brad can see your lifestyle clearly now.",
  superannuation: "Superannuation captured. One of your most valuable assets is on record.",
  insurance: "Protection profile complete. Just one section to go.",
  "goals-objectives": "Vision captured. Your Financial Discovery is complete.",
};

const MILESTONE_HEADINGS: Record<number, { heading: string; sub: string }> = {
  1: { heading: "Good start.", sub: "The foundation is in place." },
  2: { heading: "Well done.", sub: "Two sections complete." },
  3: { heading: "Strong progress.", sub: "You're nearly a third of the way through." },
  4: { heading: "Excellent work.", sub: "You're approaching the midpoint." },
  5: { heading: "Halfway there.", sub: "The most detailed sections are behind you." },
  6: { heading: "More than halfway.", sub: "Four sections to go." },
  7: { heading: "Great momentum.", sub: "You're well into the second half." },
  8: { heading: "Nearly there.", sub: "Just two sections remaining." },
  9: { heading: "Final section.", sub: "The most important one." },
  10: { heading: "Complete.", sub: "Your Financial Discovery is done." },
};

type Props = {
  sectionId: string;
  sectionsComplete: number;
  totalSections: number;
  isLastSection: boolean;
  onContinue: () => void;
};

export function SectionComplete({
  sectionId,
  sectionsComplete,
  totalSections,
  isLastSection,
  onContinue,
}: Props) {
  const medal = MEDAL_LABELS[sectionId] ?? "Complete";
  const message = COMPLETION_MESSAGES[sectionId] ?? "Section complete.";
  const copy = MILESTONE_HEADINGS[sectionsComplete] ?? { heading: "Section complete.", sub: "" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center space-y-8">

        {/* Medal */}
        <div className="flex flex-col items-center gap-4 onboarding-rise">
          <div className="relative flex items-center justify-center">
            {/* Glow ring */}
            <div className="onboarding-ring absolute h-28 w-28 rounded-full border border-gold/25 bg-gold/[0.04]" />
            {/* Medal circle */}
            <div className="onboarding-pop relative flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 border border-gold/40 shadow-[0_0_40px_-8px_hsl(43_68%_52%_/_0.35)]">
              <CheckCircle2 className="h-9 w-9 text-gold" strokeWidth={1.75} />
            </div>
          </div>
          <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-gold/70">
            {medal} · Section Complete
          </span>
        </div>

        {/* Heading */}
        <div className="onboarding-rise onboarding-delay-1 space-y-2">
          <h2 className="text-[34px] font-semibold tracking-tight text-foreground leading-tight">
            {copy.heading}
          </h2>
          <p className="text-[16px] text-foreground/60">{copy.sub}</p>
          <p className="text-[14px] text-foreground/50 mt-1">{message}</p>
        </div>

        {/* XP badge */}
        <div className="onboarding-rise onboarding-delay-2 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-gold/12 border border-gold/30 px-6 py-2.5 shadow-[0_0_24px_-4px_hsl(43_68%_52%_/_0.25)]">
            <span className="text-[18px] font-bold text-gold tabular-nums">+{SECTION_XP_BONUS} XP</span>
            <span className="text-[11px] text-gold/60 font-semibold tracking-[0.1em] uppercase">Section Bonus</span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="onboarding-rise onboarding-delay-3 flex items-center justify-center gap-2.5">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-500",
                i < sectionsComplete
                  ? "h-2.5 w-2.5 bg-gold shadow-[0_0_8px_hsl(43_68%_52%_/_0.5)]"
                  : "h-1.5 w-1.5 bg-border/60"
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="onboarding-rise onboarding-delay-4">
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold py-4 text-[14px] font-semibold text-gold-foreground hover:bg-gold/90 active:scale-[0.98] transition-all"
          >
            {isLastSection ? "View your certificate" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
