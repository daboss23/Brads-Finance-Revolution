import Link from "next/link";
import {
  FileSignature,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";
import {
  getPipelineMetrics,
  getAllPipelineRows,
  PIPELINE_STAGE_LABELS,
  STAGE_TONE,
} from "@/lib/soa/soa-pipeline";
import { getStats as getVoiceStats } from "@/lib/soa/voice-learner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SoaDashboardPage() {
  const metrics = getPipelineMetrics();
  const rows = getAllPipelineRows();
  const voice = getVoiceStats();

  return (
    <div className="px-10 py-12 max-w-[1280px]">

      {/* Header */}
      <header className="mb-12 pb-8 border-b border-border/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
            <FileSignature className="h-4 w-4 text-gold" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/90">
            Statements of Advice
          </p>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          The plan engine
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground/85 leading-relaxed max-w-[640px]">
          Every SOA is generated on top of the fact find, scored by the compliance engine and reviewed by Brad before it leaves the building.
        </p>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-4 gap-5 mb-12">
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

      {/* Voice learning */}
      <section className="mb-12 rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex">
          <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/65 via-gold/25 to-transparent" />
          <div className="flex-1 px-7 py-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/90">
                Voice Learning
              </p>
            </div>
            <p className="text-[14px] text-foreground/85 leading-relaxed mb-5 max-w-[640px]">
              Every section Brad edits trains the engine to write more like him. Voice calibrates at fifty meaningful edits.
            </p>
            <div className="grid grid-cols-4 gap-6">
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
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
            Client SOA Pipeline
          </h2>
          <span className="text-[12px] text-muted-foreground/75 tabular-nums">
            {rows.length} clients
          </span>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/85 bg-[hsl(224,20%,7%)]">
                <th className="px-6 py-3 font-bold">Client</th>
                <th className="px-6 py-3 font-bold">Stage</th>
                <th className="px-6 py-3 font-bold">Compliance</th>
                <th className="px-6 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((row) => (
                <tr key={row.client.id} className="hover:bg-white/[0.02]">
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
    iconBg: "bg-amber-400/12",
    iconColor: "text-amber-300",
    accent: "from-amber-400/50",
  },
  emerald: {
    iconBg: "bg-emerald-500/12",
    iconColor: "text-emerald-300",
    accent: "from-emerald-500/50",
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
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", t.accent)} />
      <div className="px-6 pt-6 pb-7">
        <div className="flex items-start justify-between mb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70 leading-snug max-w-[140px]">
            {label}
          </p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shrink-0",
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
