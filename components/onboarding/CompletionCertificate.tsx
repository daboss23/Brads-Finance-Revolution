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
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gold/80 mb-3">
            Financial Discovery · Complete
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground mb-2.5">
            Well done, {firstName}.
          </h1>
          <p className="text-[15px] text-foreground/70 leading-relaxed">
            Brad now has everything he needs to build your financial plan.
            Your planning meeting is the next step.
          </p>
        </div>

        {/* Certificate card */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="h-px bg-gradient-to-r from-gold/50 to-transparent" />

          <div className="px-8 py-10 text-center">
            {/* Newcastle mark */}
            <div className="flex justify-center mb-6">
              <NewcastleEmblem size={48} />
            </div>

            <p className="text-[9px] font-bold tracking-[0.26em] uppercase text-muted-foreground/55 mb-6">
              This certifies that
            </p>

            <p className="text-[27px] font-semibold tracking-tight text-gold mb-1.5">
              {clientFullName}
            </p>
            <p className="text-[14px] text-foreground/65 mb-8">
              has completed their Financial Discovery
            </p>

            {/* Sections */}
            <div className="grid grid-cols-2 gap-2.5 mb-8 text-left">
              {FACT_FIND_SECTIONS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/80" />
                  <span className="text-[12.5px] text-foreground/75">{s.title}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-border mb-6" />

            {/* Stats */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-[24px] font-semibold text-gold tabular-nums">{xpEarned.toLocaleString()}</p>
                <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-muted-foreground/55 mt-1">XP Earned</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-[24px] font-semibold text-foreground/85 tabular-nums">{completionPct}%</p>
                <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-muted-foreground/55 mt-1">Completion</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center flex flex-col items-center gap-1">
                <Calendar className="h-4 w-4 text-foreground/55" />
                <p className="text-[11.5px] text-foreground/65">{completedDate}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-[hsl(224,20%,7%)] px-8 py-4 text-center">
            <p className="text-[11.5px] text-muted-foreground/60">
              Prepared in partnership with{" "}
              <span className="text-foreground/80 font-medium">Brad Lonergan</span>
              {" "}·{" "}
              <span className="text-foreground/80 font-medium">Newcastle Financial Services</span>
            </p>
          </div>
        </div>

        {/* What's next */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-blue-accent/60 via-blue-accent/25 to-transparent" />
            <div className="flex-1 px-6 py-5">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-accent/80 mb-3">
                What happens next
              </p>
              <ul className="space-y-3">
                {[
                  "Brad will review your Financial Discovery over the next 1–2 business days.",
                  "You'll receive a call to confirm your planning meeting.",
                  "Your personalised financial plan will be prepared ahead of that meeting.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-[8px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold/60" />
                    <p className="text-[13.5px] text-foreground/75 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
