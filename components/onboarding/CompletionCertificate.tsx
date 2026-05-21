import { CheckCircle2, Calendar } from "lucide-react";
import { SECTIONS, TOTAL_XP } from "@/lib/onboarding-questions";

type Props = {
  clientName: string;
  xpEarned: number;
  completedDate: string;
  sectionsCompleted?: number;
};

export function CompletionCertificate({ clientName, xpEarned, completedDate, sectionsCompleted }: Props) {
  const pct = Math.round((xpEarned / TOTAL_XP) * 100);
  const completedCount = sectionsCompleted ?? SECTIONS.length;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl onboarding-fade-in">
        {/* Header copy */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold/60 mb-3">
            Financial Discovery · Complete
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground mb-3">
            Well done, {clientName.split(" ")[0]}.
          </h1>
          <p className="text-[14px] text-muted-foreground/60 leading-relaxed">
            Brad now has everything he needs to build your financial plan.
            Your planning meeting is the next step.
          </p>
        </div>

        {/* Certificate card */}
        <div className="rounded-xl border border-gold/25 bg-card overflow-hidden mb-8">
          {/* Gold top bar */}
          <div className="h-[3px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <div className="px-8 py-10 text-center">
            {/* BMK monogram */}
            <div className="flex items-baseline justify-center gap-[1px] mb-6">
              <span className="bmk-letter-pulse text-[22px] font-bold tracking-tight text-gold leading-none select-none">B</span>
              <span className="text-[22px] font-bold tracking-tight text-white/70 leading-none select-none">M</span>
              <span className="bmk-letter-pulse text-[22px] font-bold tracking-tight text-gold leading-none select-none">K</span>
            </div>

            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground/40 mb-8">
              This certifies that
            </p>

            <p className="text-[26px] font-semibold tracking-tight text-gold mb-2">
              {clientName}
            </p>
            <p className="text-[13px] text-muted-foreground/50 mb-8">
              has completed their Financial Discovery
            </p>

            {/* Sections completed */}
            <div className="grid grid-cols-2 gap-2 mb-8 text-left">
              {SECTIONS.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${i < completedCount ? "text-emerald-400/70" : "text-muted-foreground/20"}`} />
                  <span className="text-[12px] text-muted-foreground/60">{s.name}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

            {/* Stats row */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-[20px] font-semibold text-gold tabular-nums">{xpEarned.toLocaleString()}</p>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/35 mt-0.5">XP Earned</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="text-center">
                <p className="text-[20px] font-semibold text-foreground/70 tabular-nums">
                  {pct}%
                </p>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/35 mt-0.5">Completion</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="text-center flex flex-col items-center">
                <Calendar className="h-4 w-4 text-foreground/50 mb-0.5" />
                <p className="text-[11px] text-muted-foreground/50">{completedDate}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 px-8 py-4 bg-card-elevated/50 text-center">
            <p className="text-[11px] text-muted-foreground/40">
              Prepared in partnership with{" "}
              <span className="text-muted-foreground/60 font-medium">Brad Lonergan</span>
              {" "}·{" "}
              <span className="text-muted-foreground/60 font-medium">BMK Financial Services, Newcastle NSW</span>
            </p>
          </div>

          {/* Gold bottom bar */}
          <div className="h-[3px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        </div>

        {/* Next step */}
        <div className="rounded-lg border border-border/50 bg-card px-6 py-5">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-blue-accent/60 mb-2">
            What happens next
          </p>
          <p className="text-[13.5px] text-muted-foreground/70 leading-relaxed">
            Brad will review your Financial Discovery and reach out to confirm your planning
            meeting. You don&apos;t need to do anything else right now.
          </p>
        </div>
      </div>
    </div>
  );
}
