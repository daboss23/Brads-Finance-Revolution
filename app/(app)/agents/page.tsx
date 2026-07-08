import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  FileSignature,
  Gauge,
  Mic,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { AgentRunButton } from "@/components/agents/AgentRunButton";
import { listAgentDefinitions } from "@/lib/agents/registry";
import { getAgentTelemetry } from "@/lib/agents/events";
import type { AgentDefinition, AgentId, CostLevel } from "@/lib/agents/types";
import { CLIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Agents - BMK Command Centre",
};

const ICONS: Record<AgentId, React.ElementType> = {
  sarah: Mic,
  beacon: RadioTower,
  guardian: ShieldCheck,
  scribe: Activity,
  orion: Sparkles,
  atlas: FileSignature,
  cipher: Zap,
  nexus: Database,
};

const COST_META: Record<CostLevel, string> = {
  none: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  low: "border-blue-accent/25 bg-blue-accent/10 text-blue-accent",
  medium: "border-gold/30 bg-gold/10 text-gold",
  high: "border-orange-400/35 bg-orange-500/10 text-orange-300",
};

const FLOW_LABELS = [
  "Sarah",
  "Beacon",
  "Guardian",
  "Scribe",
  "Orion",
  "Atlas",
  "Cipher",
  "Nexus",
];

export default function AgentsPage() {
  const agents = listAgentDefinitions();
  const telemetry = getAgentTelemetry();
  const latestByAgent = new Map(telemetry.map((event) => [event.agentId, event]));
  const processedClients = CLIENTS.filter((client) => client.progress > 0).length;
  const mockMode = !process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY;

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 xl:px-14 xl:py-12">
      <header className="mb-10 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <p className="cmd-label mb-4 text-muted-foreground/60">Agent Infrastructure</p>
          <h1 className="text-[34px] font-semibold leading-[1.05] text-foreground sm:text-[46px]">
            BMK Agent Command Centre
          </h1>
          <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-muted-foreground/80">
            The platform now has a lightweight agent layer for fact-find structuring,
            compliance checks, meeting intelligence, adviser-only strategy support,
            SOA input preparation, follow-ups and integration health.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-5">
          <p className="cmd-label text-gold/85">System intelligence</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Summary label="Agents" value={agents.length} />
            <Summary label="Processed" value={processedClients} />
            <Summary label="Mode" value={mockMode ? "Mock" : "Live"} />
            <Summary label="Runs" value={telemetry.length} />
          </div>
        </div>
      </header>

      <section className="mb-10 rounded-xl border border-border/70 bg-card px-6 py-6 sm:px-8">
        <p className="cmd-label mb-5 text-gold/85">Actual Flow</p>
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          {FLOW_LABELS.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-border/70 bg-white/[0.03] px-3 py-1.5 font-medium text-foreground/80">
                {step}
              </span>
              {index < FLOW_LABELS.length - 1 && (
                <span className="text-muted-foreground/40">-&gt;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {agents.map((agent) => (
          <AgentSystemCard
            key={agent.id}
            agent={agent}
            lastRun={latestByAgent.get(agent.id)}
            demoClientId={CLIENTS[0]?.id}
          />
        ))}
      </section>
    </div>
  );
}

function AgentSystemCard({
  agent,
  lastRun,
  demoClientId,
}: {
  agent: AgentDefinition;
  lastRun?: ReturnType<typeof getAgentTelemetry>[number];
  demoClientId?: string;
}) {
  const Icon = ICONS[agent.id];
  const runnable = agent.id !== "sarah";
  const clientScoped = !["cipher", "nexus"].includes(agent.id);

  return (
    <article className="glass-panel glass-hover overflow-hidden">
      <div className="grid gap-5 p-6 md:grid-cols-[auto_1fr_auto]">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[20px] font-semibold text-foreground">{agent.name}</h2>
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase", COST_META[agent.costLevel])}>
              {agent.costLevel} cost
            </span>
            <span className="rounded-full border border-border/70 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">
              {agent.usesAI ? "AI gated" : "Deterministic"}
            </span>
          </div>
          <p className="mt-1 text-[13px] font-medium text-gold/85">{agent.role}</p>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-muted-foreground/82">
            {agent.description}
          </p>
          <p className="mt-3 text-[12px] leading-5 text-muted-foreground/62">
            Trigger: {agent.trigger}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          {runnable ? (
            <AgentRunButton
              agentId={agent.id}
              clientId={clientScoped ? demoClientId : undefined}
              label={clientScoped ? "Run demo client" : "Refresh"}
            />
          ) : (
            <span className="rounded-md border border-border/70 bg-white/[0.03] px-3 py-2 text-[11px] text-muted-foreground">
              Runs in onboarding
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-white/[0.06] bg-white/[0.06] md:grid-cols-4">
        <TelemetryCell
          icon={lastRun?.status === "error" ? AlertTriangle : CheckCircle2}
          label="Health"
          value={lastRun?.status ?? "idle"}
          tone={lastRun?.status === "error" ? "orange" : "emerald"}
        />
        <TelemetryCell icon={Gauge} label="Cached" value={lastRun ? (lastRun.cached ? "yes" : "fresh") : "none"} />
        <TelemetryCell icon={Cpu} label="Duration" value={lastRun?.durationMs !== undefined ? `${lastRun.durationMs}ms` : "n/a"} />
        <TelemetryCell icon={Activity} label="Model" value={lastRun?.model ?? (agent.usesAI ? "mock-agent-v1" : "deterministic")} />
      </div>
    </article>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-white/[0.03] p-3">
      <p className="text-[22px] font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-2 cmd-label text-muted-foreground/55">{label}</p>
    </div>
  );
}

function TelemetryCell({
  icon: Icon,
  label,
  value,
  tone = "gold",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "gold" | "emerald" | "orange";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "orange"
      ? "text-orange-300"
      : "text-gold";
  return (
    <div className="bg-card px-5 py-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", color)} />
        <p className="cmd-label text-muted-foreground/45">{label}</p>
      </div>
      <p className="truncate text-[12.5px] font-medium text-foreground/82">{value}</p>
    </div>
  );
}
