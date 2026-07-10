import Link from "next/link";
import {
  FileSignature,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  RadioTower,
  ShieldCheck,
  PenLine,
  Orbit,
  ChevronRight,
} from "lucide-react";
import {
  getPipelineMetrics,
  getAllPipelineRows,
  PIPELINE_STAGE_LABELS,
  STAGE_TONE,
} from "@/lib/soa/soa-pipeline";
import { getStats as getVoiceStats } from "@/lib/soa/voice-learner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SYNTHESIS_CHAIN = [
  { name: "Beacon", role: "Fact Find Structuring", icon: RadioTower },
  { name: "Guardian", role: "Compliance & Risk", icon: ShieldCheck },
  { name: "Scribe", role: "Meeting Intelligence", icon: PenLine },
  { name: "Orion", role: "Evidence Assembly", icon: Orbit },
  { name: "ATLAS", role: "Strategy & SOA Synthesis", icon: FileSignature },
];

export default function SoaDashboardPage() {
  const metrics = getPipelineMetrics();
  const rows = getAllPipelineRows();
  const voice = getVoiceStats();

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      <PageHeader
        overline="Statements of Advice"
        title="SOA Production Engine"
        subtitle="Every SOA is built on the fact find, screened by Guardian, evidenced by Orion and synthesised by ATLAS before Brad signs it off."
      />

      {/* KPI cards */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="In Generation"
          value={metrics.inGeneration}
          icon={Sparkles}
          tone="blue"
        />
        <KpiCard
          label="Awaiting Brad Review"
          value={metrics.awaitingReview}
          icon={Clock}
          tone="amber"
        />
        <KpiCard
          label="Approved · Ready to Send"
          value={metrics.approvedReady}
          icon={CheckCircle2}
          tone="emerald"
        />
        <KpiCard
          label="Signed This Month"
          value={metrics.signedThisMonth}
          icon={Send}
          tone="gold"
        />
      </section>

      {/* ATLAS synthesis chain */}
      <section className="glass-panel edge-gold mb-8 overflow-hidden">
        <div className="border-b border-white/[0.06] bg-black/25 px-6 py-4">
          <p className="cmd-label text-gold/85">ATLAS Synthesis Line</p>
          <p className="mt-1.5 text-[12.5px] leading-5 text-muted-foreground/75 max-w-[680px]">
            Each draft moves along the intelligence line. ATLAS is the final
            synthesis layer — it writes the strategy in Brad&apos;s voice only
            after every upstream agent has cleared the file.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-5 py-5">
          {SYNTHESIS_CHAIN.map((agent, i) => {
            const Icon = agent.icon;
            const isAtlas = agent.name === "ATLAS";
            return (
              <div key={agent.name} className="flex min-w-0 flex-1 basis-[210px] items-center gap-2">
                <div
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3.5 py-3",
                    isAtlas
                      ? "border-gold/35 bg-gold/[0.08] shadow-[inset_0_1px_0_hsl(44_75%_85%/0.1),0_0_30px_-16px_hsl(var(--gold)/0.7)]"
                      : "border-white/[0.08] bg-black/25",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg border",
                      isAtlas
                        ? "border-gold/40 bg-gold/15 text-gold"
                        : "border-white/[0.1] bg-white/[0.04] text-teal-accent",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[12.5px] font-semibold", isAtlas ? "text-gold" : "text-foreground")}>
                      {agent.name}
                    </p>
                    <p className="truncate text-[10.5px] text-muted-foreground/65">
                      {agent.role}
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-gold/40" />
              </div>
            );
          })}
          <div className="flex min-w-0 flex-1 basis-[190px] items-center gap-3 rounded-xl border border-success/30 bg-success/[0.07] px-3.5 py-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-success/35 bg-success/10 text-success">
              <FileSignature className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-success">SOA Draft</p>
              <p className="truncate text-[10.5px] text-muted-foreground/65">Ready for Brad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Voice learning */}
      <section className="glass-panel mb-8 overflow-hidden">
        <div className="flex">
          <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/65 via-gold/25 to-transparent" />
          <div className="flex-1 px-7 py-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <p className="cmd-label text-gold/90">
                Voice Learning · Brad Style Calibration
              </p>
            </div>
            <p className="text-[14px] text-foreground/85 leading-relaxed mb-5 max-w-[640px]">
              Every section Brad edits trains the engine to write more like him.
              Voice calibrates at fifty meaningful edits.
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <VoiceStat label="Plans generated" value={String(voice.plansGenerated)} />
              <VoiceStat label="Edits recorded" value={String(voice.editsRecorded)} />
              <VoiceStat
                label="Voice match"
                value={`${voice.voiceMatchScore}%`}
              />
              <VoiceStat
                label="Plans until calibrated"
                value={String(voice.estimatedPlansUntilCalibrated)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
            Client SOA Pipeline
          </h2>
          <span className="text-[12px] text-muted-foreground/75 tabular-nums">
            {rows.length} clients
          </span>
        </div>
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/70 bg-black/30">
                  <th className="px-6 py-3.5 font-bold">Client</th>
                  <th className="px-6 py-3.5 font-bold">Stage</th>
                  <th className="px-6 py-3.5 font-bold">Compliance</th>
                  <th className="px-6 py-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rows.map((row) => (
                  <tr key={row.client.id} className="hover:bg-gold/[0.04] transition-colors">
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/clients/${row.client.id}`}
                        className="text-[13px] font-medium text-foreground hover:text-gold transition-colors"
                      >
                        {row.client.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                        {row.client.meetingStage}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge className={cn(STAGE_TONE[row.stage])}>
                        {PIPELINE_STAGE_LABELS[row.stage]}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[12.5px] text-foreground/80 tabular-nums">
                        {row.soa
                          ? `${row.soa.complianceScore} / 100`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {row.stage === "soa-in-progress" ||
                      row.stage === "compliance" ||
                      row.stage === "fact-find" ? (
                        <Link
                          href={`/clients/${row.client.id}/soa/generate`}
                          className="inline-flex items-center gap-1.5 text-[12px] text-gold/85 hover:text-gold transition-colors"
                        >
                          Generate
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/clients/${row.client.id}/soa`}
                          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/85 hover:text-foreground transition-colors"
                        >
                          Open
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

const TONE_STYLES: Record<
  string,
  { iconBg: string; iconColor: string; accent: string }
> = {
  blue: {
    iconBg: "bg-blue-accent/12",
    iconColor: "text-blue-accent",
    accent: "from-blue-accent/50",
  },
  amber: {
    iconBg: "bg-warning/[0.12]",
    iconColor: "text-warning",
    accent: "from-warning/50",
  },
  emerald: {
    iconBg: "bg-success/[0.12]",
    iconColor: "text-success",
    accent: "from-success/50",
  },
  gold: {
    iconBg: "bg-gold/12",
    iconColor: "text-gold",
    accent: "from-gold/50",
  },
};

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: keyof typeof TONE_STYLES;
}) {
  const t = TONE_STYLES[tone];
  return (
    <div className="glass-panel glass-hover overflow-hidden">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", t.accent)} />
      <div className="px-6 pt-5 pb-6">
        <div className="flex items-start justify-between mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70 leading-snug max-w-[140px]">
            {label}
          </p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shrink-0 border border-white/[0.08]",
              t.iconBg,
            )}
          >
            <Icon className={cn("h-[15px] w-[15px]", t.iconColor)} />
          </div>
        </div>
        <p className="text-[44px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

function VoiceStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/80 mb-1.5">
        {label}
      </p>
      <p className="text-[22px] font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}
