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
      <div className="w-full max-w-lg onboarding-fade-in text-center space-y-7">

        {/* Medal */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/25">
            <CheckCircle2 className="h-7 w-7 text-gold" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold/55">
            {medal} · Section Complete
          </span>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-[28px] font-semibold tracking-tight text-foreground">
            {copy.heading}
          </h2>
          <p className="text-[15px] text-muted-foreground/55 mt-1">{copy.sub}</p>
          <p className="text-[13px] text-muted-foreground/45 mt-2">{message}</p>
        </div>

        {/* XP badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/20 px-5 py-2">
          <span className="text-[15px] font-semibold text-gold">+{SECTION_XP_BONUS} XP</span>
          <span className="text-[11px] text-gold/45 font-medium">Section Bonus</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i < sectionsComplete ? "h-2 w-2 bg-gold" : "h-1.5 w-1.5 bg-border"
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold py-3.5 text-[13.5px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors"
        >
          {isLastSection ? "View your certificate" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
