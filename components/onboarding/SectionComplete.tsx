import { CheckCircle2, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md onboarding-rise">
        <div className="rounded-lg glass-card overflow-hidden">
          {/* BMK accent strip */}
          <div className="h-px bg-gradient-to-r from-gold/50 to-transparent" />

          <div className="px-8 py-10 text-center space-y-7">
            {/* Medal */}
            <div className="flex flex-col items-center gap-3">
              <div className="onboarding-pop flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                <CheckCircle2 className="h-7 w-7 text-gold" strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/80">
                {medal} · Section Complete
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h2 className="text-[26px] font-semibold tracking-tight text-foreground leading-tight">
                {copy.heading}
              </h2>
              <p className="text-[14.5px] text-foreground/70">{copy.sub}</p>
              <p className="text-[13.5px] text-muted-foreground/70 leading-relaxed">{message}</p>
            </div>

            {/* XP badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-5 py-2">
                <span className="text-[15px] font-bold text-gold tabular-nums">+{SECTION_XP_BONUS} XP</span>
                <span className="text-[10px] text-gold/70 font-semibold tracking-[0.12em] uppercase">
                  Section Bonus
                </span>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalSections }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-500",
                    i < sectionsComplete ? "h-2.5 w-2.5 bg-gold" : "h-1.5 w-1.5 bg-border"
                  )}
                />
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 rounded bg-gold py-3.5 text-[14px] font-semibold text-gold-foreground hover:bg-gold/90 active:scale-[0.99] transition-all"
            >
              {isLastSection ? "View your certificate" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
