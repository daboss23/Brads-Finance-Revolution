import { CheckCircle2, Calendar } from "lucide-react";
import { NewcastleEmblem } from "@/components/logo/newcastle-logo";
import { FACT_FIND_SECTIONS } from "@/lib/fact-find-flow";

const TOTAL_POSSIBLE_XP = FACT_FIND_SECTIONS.reduce(
  (sum, s) => sum + s.fields.length * 25 + 100,
  0
);

type Props = {
  clientFullName: string;
  xpEarned: number;
  completedDate: string;
};

export function CompletionCertificate({ clientFullName, xpEarned, completedDate }: Props) {
  const firstName = clientFullName.includes("&")
    ? clientFullName.split(" ").slice(0, -1).join(" ")
    : clientFullName.split(" ")[0];

  const completionPct = Math.min(100, Math.round((xpEarned / TOTAL_POSSIBLE_XP) * 100));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl onboarding-fade-in space-y-8">

        {/* Header */}
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold/70 mb-3">
            Financial Discovery · Complete
          </p>
          <h1 className="text-[34px] font-semibold tracking-tight text-foreground mb-2">
            Well done, {firstName}.
          </h1>
          <p className="text-[15px] text-foreground/60 leading-relaxed">
            Brad now has everything he needs to build your financial plan.
            Your planning meeting is the next step.
          </p>
        </div>

        {/* Certificate card */}
        <div className="rounded-xl border border-gold/25 bg-card overflow-hidden shadow-[0_0_60px_-12px_hsl(43_68%_52%_/_0.2)]">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <div className="px-8 py-10 text-center">
            {/* Newcastle mark */}
            <div className="flex justify-center mb-6">
              <div className="onboarding-pop">
                <NewcastleEmblem size={52} />
              </div>
            </div>

            <p className="text-[9px] font-bold tracking-[0.28em] uppercase text-muted-foreground/45 mb-6">
              This certifies that
            </p>

            <p className="text-[28px] font-semibold tracking-tight text-gold mb-1.5">
              {clientFullName}
            </p>
            <p className="text-[14px] text-foreground/55 mb-8">
              has completed their Financial Discovery
            </p>

            {/* Sections */}
            <div className="grid grid-cols-2 gap-2.5 mb-8 text-left">
              {FACT_FIND_SECTIONS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
                  <span className="text-[12px] text-foreground/65">{s.title}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

            {/* Stats */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-[24px] font-bold text-gold tabular-nums">{xpEarned.toLocaleString()}</p>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40 mt-0.5">XP Earned</p>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div className="text-center">
                <p className="text-[24px] font-bold text-foreground/80 tabular-nums">{completionPct}%</p>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40 mt-0.5">Completion</p>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div className="text-center flex flex-col items-center gap-1">
                <Calendar className="h-4 w-4 text-foreground/50" />
                <p className="text-[11px] text-foreground/55">{completedDate}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 bg-card px-8 py-4 text-center">
            <p className="text-[11px] text-muted-foreground/45">
              Prepared in partnership with{" "}
              <span className="text-foreground/65 font-medium">Brad Lonergan</span>
              {" "}·{" "}
              <span className="text-foreground/65 font-medium">Newcastle Financial Services</span>
            </p>
          </div>

          <div className="h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        </div>

        {/* What's next */}
        <div className="rounded-lg border border-border/60 bg-card px-6 py-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-accent/70 mb-3">
            What happens next
          </p>
          <ul className="space-y-3">
            {[
              "Brad will review your Financial Discovery over the next 1–2 business days.",
              "You'll receive a call to confirm your planning meeting.",
              "Your personalised financial plan will be prepared ahead of that meeting.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold/50" />
                <p className="text-[13px] text-foreground/65 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
