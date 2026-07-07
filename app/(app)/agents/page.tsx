import { Activity, AlertTriangle, CheckCircle2, Cpu } from "lucide-react";
import { AgentCard } from "@/components/agents/AgentCard";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Agents - BMK Command Centre",
};

const ASSEMBLY_STEPS = [
  "Fact Find",
  "NOVA Brief",
  "VANTA Check",
  "ORION SOA Draft",
  "Brad Review",
  "Client Send",
];

export default function AgentsPage() {
  const active = AGENTS.filter(
    (agent) => agent.status === "active" || agent.status === "monitoring",
  ).length;
  const blocked = AGENTS.filter((agent) => agent.status === "blocked").length;
  const completed = AGENTS.reduce((sum, agent) => sum + agent.completedToday, 0);
  const avgLoad = Math.round(
    AGENTS.reduce((sum, agent) => sum + agent.workload, 0) /
      Math.max(AGENTS.length, 1),
  );
  const finalAssemblyAgent = AGENTS.find((agent) => agent.id === "orion");
  const supportingAgents = AGENTS.filter((agent) => agent.id !== "orion");

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 xl:px-14 xl:py-12">
      <header className="mb-10">
        <p className="cmd-label mb-4 text-muted-foreground/60">
          BMK Command Centre
        </p>
        <h1 className="text-[34px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[46px]">
          Agent Command Centre
        </h1>
        <p className="mt-4 max-w-[680px] text-[14px] leading-7 tracking-tight text-muted-foreground/80">
          Four specialist agents move every advice file from fact find to signed
          advice. NOVA researches, VANTA guards compliance, ORION assembles the
          SOA, and PULSE keeps the pipeline in motion. Brad remains the final
          approver.
        </p>
      </header>

      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        <SummaryCard label="Agents Online" value={active} icon={Activity} tone="blue" />
        <SummaryCard label="Blocked Items" value={blocked} icon={AlertTriangle} tone="orange" />
        <SummaryCard label="Tasks Cleared Today" value={completed} icon={CheckCircle2} tone="emerald" />
        <SummaryCard label="Average Load" value={avgLoad} suffix="%" icon={Cpu} tone="gold" />
      </section>

      <section className="mb-10 rounded-xl border border-border/70 bg-card px-6 py-6 sm:px-8">
        <p className="cmd-label mb-5 text-gold/85">Advice Assembly Line</p>
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] tracking-tight">
          {ASSEMBLY_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-md border px-3 py-1.5 font-medium",
                  index >= ASSEMBLY_STEPS.length - 2
                    ? "border-gold/30 bg-gold/[0.07] text-gold"
                    : "border-border/70 bg-white/[0.03] text-foreground/80",
                )}
              >
                {step}
              </span>
              {index < ASSEMBLY_STEPS.length - 1 && (
                <span className="text-muted-foreground/40">-&gt;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {finalAssemblyAgent && (
        <section className="mb-6">
          <AgentCard agent={finalAssemblyAgent} featured />
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {supportingAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </section>
    </div>
  );
}

const TONE: Record<string, { text: string; soft: string; glow: string }> = {
  blue: {
    text: "text-blue-accent",
    soft: "bg-blue-accent/12",
    glow: "from-blue-accent/50",
  },
  orange: {
    text: "text-orange-300",
    soft: "bg-orange-500/12",
    glow: "from-orange-400/50",
  },
  emerald: {
    text: "text-emerald-300",
    soft: "bg-emerald-500/12",
    glow: "from-emerald-500/50",
  },
  gold: {
    text: "text-gold",
    soft: "bg-gold/12",
    glow: "from-gold/50",
  },
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
    <div className="glass-panel glass-hover overflow-hidden">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", t.glow)} />
      <div className="px-5 py-5 sm:px-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <p className="cmd-label max-w-[120px] leading-snug text-muted-foreground/70">
            {label}
          </p>
          <div className={cn("grid h-9 w-9 place-items-center rounded-lg", t.soft)}>
            <Icon className={cn("h-4 w-4", t.text)} />
          </div>
        </div>
        <p className="text-[30px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
          {value}
          {suffix && <span className="text-[18px] text-muted-foreground/65">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
