import { Cpu, Activity, ShieldAlert, Zap, ArrowRight } from "lucide-react";
import { AGENTS, getAgent } from "@/lib/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { TelemetryRing } from "@/components/ui/telemetry-ring";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Agent Command Centre — BMK",
};

const FLOW = [
  { step: "Fact Find", tone: "muted" },
  { step: "NOVA Brief", tone: "blue" },
  { step: "VANTA Check", tone: "orange" },
  { step: "ORION SOA Draft", tone: "gold" },
  { step: "Brad Review", tone: "gold-solid" },
  { step: "Client Send", tone: "muted" },
  { step: "PULSE Follow Up", tone: "emerald" },
] as const;

const FLOW_TONE: Record<string, string> = {
  muted: "border-white/[0.08] bg-white/[0.02] text-muted-foreground/70",
  blue: "border-blue-accent/25 bg-blue-accent/[0.06] text-blue-accent",
  orange: "border-orange-500/25 bg-orange-500/[0.06] text-orange-300",
  gold: "border-gold/25 bg-gold/[0.07] text-gold",
  "gold-solid": "border-gold/40 bg-gold/[0.14] text-gold",
  emerald: "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300",
};

export default function AgentsPage() {
  const online = AGENTS.filter((a) => a.status !== "blocked").length;
  const blocked = AGENTS.filter((a) => a.status === "blocked").length;
  const completed = AGENTS.reduce((s, a) => s + a.completedToday, 0);
  const avgLoad = Math.round(AGENTS.reduce((s, a) => s + a.workload, 0) / AGENTS.length);
  const avgConfidence = Math.round(
    AGENTS.reduce((s, a) => s + a.confidence, 0) / AGENTS.length
  );

  const orion = getAgent("orion")!;
  const inputs = AGENTS.filter((a) => a.id !== "orion");

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
      {/* Hero */}
      <header className="mb-10">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="status-live h-1.5 w-1.5 rounded-full bg-gold text-gold" />
          <p className="cmd-label text-muted-foreground/60">BMK Command Centre · Live</p>
        </div>
        <h1 className="text-[30px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[34px]">
          Agent Command Centre
        </h1>
        <p className="mt-4 max-w-[660px] text-[14px] leading-relaxed tracking-tight text-muted-foreground/80">
          Four agents run the advice line. NOVA researches the client, VANTA guards
          compliance, ORION assembles the final SOA draft, and PULSE keeps the pipeline
          moving. Brad remains the final human approver on every file.
        </p>
      </header>

      {/* Fleet telemetry */}
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        <StatTile label="Agents Online" value={online} icon={Activity} tone="blue" />
        <StatTile label="Blocked Items" value={blocked} icon={ShieldAlert} tone="orange" />
        <StatTile label="Cleared Today" value={completed} icon={Zap} tone="emerald" />
        <StatTile label="Fleet Load" value={avgLoad} suffix="%" icon={Cpu} tone="gold" />
      </section>

      {/* Assembly line */}
      <section className="glass-panel mb-8 overflow-hidden">
        <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="cmd-label mb-5 text-gold/85">Advice Assembly Line</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
              {FLOW.map((f, i) => (
                <div key={f.step} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-[12px] font-medium tracking-tight",
                      FLOW_TONE[f.tone]
                    )}
                  >
                    {f.step}
                  </span>
                  {i < FLOW.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-3 border-t border-white/[0.06] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <TelemetryRing value={avgConfidence} size={104} stroke={8} tone="gold" />
            <p className="cmd-label text-muted-foreground/55">Fleet Confidence</p>
          </div>
        </div>
      </section>

      {/* Input agents */}
      <section className="mb-6">
        <p className="cmd-label mb-4 text-muted-foreground/55">Intelligence & Momentum</p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {inputs.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      {/* ORION — featured final assembly */}
      <section className="mb-12">
        <p className="cmd-label mb-4 text-gold/70">Final Assembly</p>
        <AgentCard agent={orion} featured />
      </section>

      {/* Future modules */}
      <section>
        <p className="cmd-label mb-4 text-muted-foreground/45">Specialist Modules · Coming Later</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: "ECHO", role: "Transcripts & notes" },
            { name: "ATLAS", role: "Data mapping" },
            { name: "CIPHER", role: "Document intelligence" },
            { name: "NEXUS", role: "Integrations" },
          ].map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-white/[0.05] bg-white/[0.012] px-4 py-3.5"
            >
              <p className="text-[12px] font-bold tracking-tight text-muted-foreground/55">
                {m.name}
              </p>
              <p className="mt-1 text-[11.5px] tracking-tight text-muted-foreground/40">
                {m.role}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const TILE_TONE: Record<string, { text: string; soft: string; glow: string; edge: string }> = {
  blue: { text: "text-blue-accent", soft: "bg-blue-accent/12", glow: "from-blue-accent/50", edge: "edge-blue" },
  orange: { text: "text-orange-300", soft: "bg-orange-500/12", glow: "from-orange-400/50", edge: "edge-orange" },
  emerald: { text: "text-emerald-300", soft: "bg-emerald-500/12", glow: "from-emerald-500/50", edge: "edge-emerald" },
  gold: { text: "text-gold", soft: "bg-gold/12", glow: "from-gold/50", edge: "edge-gold" },
};

function StatTile({
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
  tone: keyof typeof TILE_TONE;
}) {
  const t = TILE_TONE[tone];
  return (
    <div className="glass-panel glass-hover overflow-hidden">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", t.glow)} />
      <div className="px-6 pt-5 pb-5">
        <div className="mb-5 flex items-start justify-between">
          <p className="cmd-label max-w-[110px] leading-snug text-muted-foreground/65">{label}</p>
          <div className={cn("grid h-8 w-8 place-items-center rounded-full", t.soft)}>
            <Icon className={cn("h-[14px] w-[14px]", t.text)} />
          </div>
        </div>
        <p className="text-[38px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {value}
          {suffix && <span className="text-[20px] text-muted-foreground/55">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
