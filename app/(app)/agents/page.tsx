import { Cpu, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Agents — BMK Command Centre",
};

export default function AgentsPage() {
  const active = AGENTS.filter((a) => a.status === "active" || a.status === "monitoring").length;
  const blocked = AGENTS.filter((a) => a.status === "blocked").length;
  const completed = AGENTS.reduce((sum, a) => sum + a.completedToday, 0);
  const avgLoad = Math.round(AGENTS.reduce((sum, a) => sum + a.workload, 0) / AGENTS.length);

  return (
    <div className="px-10 py-12">
      {/* Header */}
      <header className="mb-11">
        <p className="text-[10px] font-semibold tracking-[0.26em] uppercase text-muted-foreground/60 mb-4">
          BMK Command Centre
        </p>
        <h1 className="text-[34px] font-semibold tracking-tight text-foreground leading-[1.05]">
          Agent Command Centre
        </h1>
        <p className="mt-4 text-[14px] text-muted-foreground/80 tracking-tight max-w-[640px]">
          Four core agents move every file from fact find to signed advice. NOVA researches,
          VANTA guards compliance, ORION drafts the SOA, and PULSE keeps the pipeline in motion.
          Brad remains the final approver.
        </p>
      </header>

      {/* Fleet summary */}
      <section className="grid grid-cols-4 gap-5 mb-10">
        <SummaryCard label="Agents Online" value={active} icon={Activity} tone="blue" />
        <SummaryCard label="Blocked Items" value={blocked} icon={AlertTriangle} tone="orange" />
        <SummaryCard label="Tasks Cleared Today" value={completed} icon={CheckCircle2} tone="emerald" />
        <SummaryCard label="Average Load" value={avgLoad} suffix="%" icon={Cpu} tone="gold" />
      </section>

      {/* Flow rail */}
      <section className="mb-10 rounded-xl border border-border/70 bg-card px-8 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/85 mb-5">
          Advice Assembly Line
        </p>
        <div className="flex items-center gap-2 flex-wrap text-[12.5px] tracking-tight">
          {["Fact Find", "NOVA Brief", "VANTA Check", "ORION SOA Draft", "Brad Review", "Client Send"].map(
            (step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-3 py-1.5 font-medium",
                    i === arr.length - 2 || i === arr.length - 1
                      ? "border-gold/30 bg-gold/[0.07] text-gold"
                      : "border-border/70 bg-white/[0.03] text-foreground/80"
                  )}
                >
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-muted-foreground/40">→</span>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {/* Agent cards */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </section>

      {/* Future modules */}
      <section className="mt-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/50 mb-4">
          Specialist Modules — Coming Later
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "ECHO", role: "Transcripts and meeting notes" },
            { name: "ATLAS", role: "Data mapping" },
            { name: "CIPHER", role: "Document intelligence" },
            { name: "NEXUS", role: "Integrations" },
          ].map((m) => (
            <div
              key={m.name}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-white/[0.015] px-4 py-3"
            >
              <span className="text-[12px] font-bold tracking-tight text-muted-foreground/55">
                {m.name}
              </span>
              <span className="text-[11.5px] text-muted-foreground/45 tracking-tight">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const TONE: Record<string, { text: string; bg: string; accent: string }> = {
  blue: { text: "text-blue-accent", bg: "bg-blue-accent/12", accent: "from-blue-accent/50" },
  orange: { text: "text-orange-300", bg: "bg-orange-500/12", accent: "from-orange-400/50" },
  emerald: { text: "text-emerald-300", bg: "bg-emerald-500/12", accent: "from-emerald-500/50" },
  gold: { text: "text-gold", bg: "bg-gold/12", accent: "from-gold/50" },
};

function SummaryCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  tone: keyof typeof TONE;
}) {
  const t = TONE[tone];
  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", t.accent)} />
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-start justify-between mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 max-w-[120px] leading-snug">
            {label}
          </p>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full shrink-0", t.bg)}>
            <Icon className={cn("h-[14px] w-[14px]", t.text)} />
          </div>
        </div>
        <p className="text-[40px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
          {value}
          {suffix && <span className="text-[22px] text-muted-foreground/60">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
