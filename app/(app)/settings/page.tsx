import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Database,
  KeyRound,
  Mic,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { listAgentDefinitions } from "@/lib/agents/registry";
import { cn } from "@/lib/utils";

const usageMode = "balanced";

const providerRows = [
  {
    group: "AI Provider",
    icon: Bot,
    rows: [
      { label: "Anthropic", connected: Boolean(process.env.ANTHROPIC_API_KEY), detail: "Sarah and future agent JSON provider" },
      { label: "OpenAI", connected: Boolean(process.env.OPENAI_API_KEY), detail: "Optional future structured JSON provider" },
      { label: "Selected mode", connected: true, detail: "Mock-first with safe fallback" },
    ],
  },
  {
    group: "Voice Provider",
    icon: Mic,
    rows: [
      { label: "ElevenLabs", connected: Boolean(process.env.ELEVENLABS_API_KEY), detail: "Current Sarah voice path" },
      { label: "OpenAI voice", connected: Boolean(process.env.OPENAI_VOICE_API_KEY), detail: "Placeholder for future voice option" },
    ],
  },
  {
    group: "Database",
    icon: Database,
    rows: [
      { label: "Current mode", connected: true, detail: "Mock/local repository interfaces" },
      { label: "Supabase/Postgres", connected: Boolean(process.env.DATABASE_URL), detail: "Ready to replace repositories later" },
    ],
  },
  {
    group: "Integrations",
    icon: KeyRound,
    rows: [
      { label: "Xplan", connected: Boolean(process.env.XPLAN_API_KEY), detail: "Future client data mapping" },
      { label: "DocuSign", connected: Boolean(process.env.DOCUSIGN_CLIENT_ID), detail: "Future signature workflow" },
      { label: "Email/SMS", connected: Boolean(process.env.EMAIL_PROVIDER_API_KEY), detail: "Future follow-up delivery" },
      { label: "Knowledge Base", connected: true, detail: "Local SOA/compliance corpus active" },
    ],
  },
];

export default function SettingsPage() {
  const agents = listAgentDefinitions();

  return (
    <div className="max-w-[1180px] px-8 py-12 lg:px-10">
      <div className="mb-10 border-b border-border/60 pb-7">
        <div className="mb-3 flex items-center gap-3">
          <SettingsIcon className="h-3.5 w-3.5 text-muted-foreground/85" />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/85">
            Settings
          </p>
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
          Platform Configuration
        </h1>
        <p className="mt-3 max-w-[720px] text-[13px] leading-relaxed text-muted-foreground/85">
          Provider health, integration readiness and agent usage controls for
          Newcastle Financial Services. The current agent layer is mock-first
          and cache-first, so the platform remains usable without API keys.
        </p>
      </div>

      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        {providerRows.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.group} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-[15px] font-semibold text-foreground">{section.group}</h2>
              </div>
              <div className="space-y-3">
                {section.rows.map((row) => (
                  <StatusRow key={row.label} {...row} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mb-8 rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Agent Usage Mode</h2>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              Default is Balanced: Beacon, Guardian, Scribe and Orion can auto-run after workflow events.
              ATLAS stays manual so Brad reviews the final strategy synthesis deliberately.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {["conservative", "balanced", "high intelligence"].map((mode) => (
            <div
              key={mode}
              className={cn(
                "rounded-lg border px-4 py-3",
                mode === usageMode
                  ? "border-gold/35 bg-gold/10 text-gold"
                  : "border-border/70 bg-white/[0.025] text-muted-foreground/75",
              )}
            >
              <p className="text-[13px] font-semibold capitalize">{mode}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h2 className="text-[15px] font-semibold text-foreground">Agents</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-lg border border-border/70 bg-white/[0.025] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{agent.name}</p>
                  <p className="mt-1 text-[11.5px] text-muted-foreground/65">
                    {agent.costLevel} cost. {agent.usesAI ? "AI gated" : "No AI by default"}.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-300">
                  Enabled
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/settings/knowledge-base"
        className="group block rounded-lg border border-border bg-card p-6 transition-colors hover:border-gold/40"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
            <Database className="h-4 w-4 text-gold" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-foreground">Knowledge Base</h2>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/55 transition-colors group-hover:text-gold" />
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground/85">
              Upload completed SOA documents so the engine learns Brad&apos;s voice and reasoning.
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function StatusRow({
  label,
  detail,
  connected,
}: {
  label: string;
  detail: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 bg-white/[0.025] px-4 py-3">
      <div>
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-[11.5px] text-muted-foreground/65">{detail}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase",
          connected
            ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
            : "border-amber-400/25 bg-amber-500/10 text-amber-300",
        )}
      >
        {connected ? "Ready" : "Mock"}
      </span>
    </div>
  );
}
