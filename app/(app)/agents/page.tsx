import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Mic,
  Network,
} from "lucide-react";
import Link from "next/link";
import { listRuntimeBlueprints } from "@/lib/agent-system";
import { ACTIVE_WORKFLOW_AGENTS, AGENTS } from "@/lib/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAgentTelemetry } from "@/lib/agents/events";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Agents - Newcastle Command Centre",
};

const CHAIN: { name: string; role: string }[] = [
  { name: "Sarah", role: "Client Discovery" },
  { name: "Beacon", role: "Fact Find Structuring" },
  { name: "Guardian", role: "Compliance & Risk" },
  { name: "Scribe", role: "Meeting Intelligence" },
  { name: "Orion", role: "Evidence Assembly" },
  { name: "ATLAS", role: "Strategy & SOA Synthesis" },
];

export default function AgentsPage() {
  const telemetry = getAgentTelemetry();
  const runtimeBlueprints = listRuntimeBlueprints();
  const latestByAgent = new Map(telemetry.map((event) => [event.agentId, event]));
  const autoRunnable = runtimeBlueprints.filter((agent) => agent.autoRunModes.length > 0).length;
  const visibleAgents = AGENTS.filter((agent) => agent.id !== "cipher");
  const nexus = visibleAgents.find((agent) => agent.id === "nexus");
  const chainAgents = visibleAgents.filter((agent) => agent.id !== "nexus");

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      <header className="mb-8 grid gap-6 xl:grid-cols-[1fr_360px] xl:items-end">
        <PageHeader
          overline="Command Layer"
          title="Agent Command Centre"
          subtitle="Sarah opens discovery, then Beacon, Guardian, Scribe, Orion and ATLAS carry each file through structuring, compliance, meeting prep, evidence and final SOA synthesis. Nexus watches the wiring underneath."
        />
        <div className="glass-panel p-5">
          <p className="cmd-label text-gold/85">System intelligence</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Summary label="Agents in registry" value={visibleAgents.length} />
            <Summary label="Workflow agents" value={ACTIVE_WORKFLOW_AGENTS.length} />
            <Summary label="Runtime modules" value={runtimeBlueprints.length} />
            <Summary label="Auto-runnable" value={autoRunnable} />
          </div>
        </div>
      </header>

      {/* Intelligence chain */}
      <section className="glass-panel edge-gold mb-8 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-black/25 px-6 py-4">
          <div>
            <p className="cmd-label text-gold/85">Intelligence chain</p>
            <p className="mt-1.5 text-[12.5px] leading-5 text-muted-foreground/75">
              One source of truth maps the client journey from discovery to
              signed SOA.
            </p>
          </div>
          <Link
            href="/soa"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground/70 transition hover:text-gold"
          >
            Open SOA pipeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
            {CHAIN.map((step, index) => (
              <div key={step.name} className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-lg border px-3 py-2 leading-tight",
                    step.name === "ATLAS"
                      ? "border-gold/35 bg-gold/[0.08] shadow-[0_0_24px_-14px_hsl(var(--gold)/0.8)]"
                      : "border-white/[0.09] bg-black/25",
                  )}
                >
                  <span
                    className={cn(
                      "block font-semibold",
                      step.name === "ATLAS" ? "text-gold" : "text-foreground/85",
                    )}
                  >
                    {step.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground/60">
                    {step.role}
                  </span>
                </span>
                {index < CHAIN.length - 1 && (
                  <ChevronRight className="size-3.5 text-gold/40" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-blue-accent/25 bg-blue-accent/[0.06] px-4 py-3 lg:max-w-[260px]">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-blue-accent/30 bg-blue-accent/10 text-blue-accent">
              <Network className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-foreground">Nexus</p>
              <p className="text-[10.5px] leading-4 text-muted-foreground/65">
                Integrations & system health, beside the chain
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {[...chainAgents, ...(nexus ? [nexus] : [])].map((agent) => (
          <div key={agent.id} className="space-y-3">
            <AgentCard agent={agent} featured={agent.id === "atlas"} />
            <div className="glass-panel p-4">
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4 text-gold" />
                <p className="cmd-label text-gold/85">Execution profile</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-foreground">Trigger</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground/68">
                      {agent.trigger}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase",
                      latestByAgent.get(agent.id)?.status === "success"
                        ? "border-success/25 bg-success/10 text-success"
                        : "border-white/[0.09] bg-white/[0.03] text-muted-foreground",
                    )}
                  >
                    {latestByAgent.get(agent.id)?.status ?? "idle"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-foreground">
                      Execution mode
                    </p>
                    <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground/68">
                      {agent.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/[0.09] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                    {agent.id === "sarah"
                      ? "Session"
                      : agent.id === "nexus"
                        ? "Deterministic"
                        : "AI"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="glass-panel mt-8 p-6">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-gold" />
          <p className="cmd-label text-gold/85">Platform support modules</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SupportModuleCard
            name="Sarah"
            role="Client discovery intake"
            detail="Collects the fact find and feeds the rest of the system."
          />
          <SupportModuleCard
            name="Nexus"
            role="Integration health"
            detail="Tracks environment readiness for Vercel, providers and future integrations."
          />
          <SupportModuleCard
            name="Telemetry"
            role="Run history"
            detail="Captures cache, model and runtime history across the underlying modules."
          />
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
      <p className="text-[22px] font-semibold leading-none text-foreground tabular-nums">{value}</p>
      <p className="mt-2 cmd-label text-muted-foreground/55">{label}</p>
    </div>
  );
}

function SupportModuleCard({
  name,
  role,
  detail,
}: {
  name: string;
  role: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        <p className="text-[12.5px] font-semibold text-foreground">{name}</p>
      </div>
      <p className="mt-2 text-[11.5px] font-medium text-gold/85">{role}</p>
      <p className="mt-2 text-[11.5px] leading-5 text-muted-foreground/68">{detail}</p>
    </div>
  );
}
