import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  Sparkles,
  ClipboardList,
  FileText,
} from "lucide-react";
import { CLIENTS, STATUS_CONFIG, type SectionStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { checkCompliance } from "@/lib/compliance/compliance-checker";
import { ClientTabs } from "@/components/clients/ClientTabs";
import {
  PipelineStagesClient,
  SoaGateClient,
} from "@/components/compliance/SoaGateClient";

export default function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client) notFound();

  const completeSections = client.factFindSections.filter(
    (s) => s.status === "complete"
  ).length;
  const total = client.factFindSections.length;
  const factFindComplete = completeSections === total;
  const complianceResult = checkCompliance(client.id);

  return (
    <div className="px-14 py-12">

      {/* Back */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-8 border-b border-border/60">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-border text-[14px] font-bold text-muted-foreground/70 tracking-tight">
            {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-foreground">
              {client.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={STATUS_CONFIG[client.status].className}>
                {STATUS_CONFIG[client.status].label}
              </Badge>
              <span className="text-[12px] text-muted-foreground/85">
                {client.meetingStage}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[12px] text-muted-foreground/85">
                Updated {client.lastActivity}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/75 mb-1.5">
              Adviser
            </p>
            <p className="text-[13px] font-medium text-foreground/80">{client.adviser}</p>
          </div>
          <Link
            href={`/clients/${client.id}/forms`}
            className="inline-flex items-center gap-2 rounded border border-border bg-card px-4 py-2.5 text-[12px] font-medium text-foreground/70 hover:text-foreground hover:border-border/80 transition-colors whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5" />
            Strategies
          </Link>
          <Link
            href={`/clients/${client.id}/fact-find-review`}
            className="inline-flex items-center gap-2 rounded border border-gold/35 bg-gold/5 px-4 py-2.5 text-[12px] font-medium text-gold/80 hover:text-gold hover:border-gold/55 transition-colors whitespace-nowrap"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Review Fact Find
          </Link>
        </div>
      </div>

      <ClientTabs clientId={client.id} />

      <div className="grid grid-cols-[1fr_380px] gap-8">
        {/* Left */}
        <div className="space-y-6">

          {/* SOA gate */}
          <SoaGateClient clientId={client.id} result={complianceResult} />

          {/* Contact */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 bg-[hsl(224,20%,7%)]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Contact Information
              </h2>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-5">
              <div className="flex items-center gap-3">
                <Mail className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" />
                <span className="text-[13px] text-foreground/80">{client.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" />
                <span className="text-[13px] text-foreground/80">{client.mobile}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" />
                <span className="text-[13px] text-foreground/80">{client.adviser}</span>
              </div>
              {client.meetingDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/75 shrink-0" />
                  <span className="text-[13px] text-foreground/80">{client.meetingDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next action */}
          <div className="rounded-lg border border-blue-accent/25 bg-blue-accent/[0.04] overflow-hidden">
            <div className="flex">
              <div className="w-[3px] shrink-0 bg-gradient-to-b from-blue-accent/60 to-blue-accent/15" />
              <div className="px-6 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-accent/80 mb-2.5">
                  Next Action
                </p>
                <p className="text-[14px] text-foreground/80 leading-relaxed">{client.nextAction}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border/60 bg-[hsl(224,20%,7%)]">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Adviser Notes
                </h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-[13px] text-muted-foreground/70 leading-relaxed">
                  {client.notes}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 bg-[hsl(224,20%,7%)]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Activity Timeline
              </h2>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-5">
                {[...client.timeline].reverse().map((event, i, arr) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mt-[5px] shrink-0",
                          event.type === "adviser"
                            ? "bg-gold"
                            : event.type === "client"
                            ? "bg-blue-accent"
                            : "bg-border"
                        )}
                      />
                      {i < arr.length - 1 && (
                        <div className="w-px flex-1 bg-border/50 mt-2" />
                      )}
                    </div>
                    <div className={cn(i < arr.length - 1 ? "pb-5" : "")}>
                      <p className="text-[13px] text-foreground/80 leading-snug">{event.event}</p>
                      <p className="text-[11px] text-muted-foreground/85 mt-1">
                        {event.date}&nbsp;·&nbsp;
                        <span className="capitalize">{event.type}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">

          {/* Pipeline stages */}
          <PipelineStagesClient
            clientId={client.id}
            factFindComplete={factFindComplete}
            factFindProgress={client.progress}
            result={complianceResult}
          />

          {/* Progress */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 bg-[hsl(224,20%,7%)]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Fact Find Progress
              </h2>
            </div>
            <div className="px-6 py-7">
              <p className="text-[56px] font-semibold tracking-tight text-foreground leading-none tabular-nums mb-5">
                {client.progress}%
              </p>
              <progress
                value={client.progress}
                max={100}
                className="bmk-progress w-full mb-3"
              />
              <p className="text-[12px] text-muted-foreground">
                {completeSections} of {total} sections complete
              </p>
            </div>
          </div>

          {/* Section breakdown */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 bg-[hsl(224,20%,7%)]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Section Breakdown
              </h2>
            </div>
            <div className="px-6 py-3">
              {client.factFindSections.map((section, i) => (
                <div
                  key={section.name}
                  className={cn(
                    "flex items-center justify-between py-3.5",
                    i < client.factFindSections.length - 1 && "border-b border-border/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon status={section.status} />
                    <span className="text-[13px] text-foreground/80">{section.name}</span>
                  </div>
                  <SectionStatusLabel status={section.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Sarah */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex">
              <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/60 via-gold/25 to-transparent" />
              <div className="px-5 py-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/25">
                    <Sparkles className="h-3 w-3 text-gold" />
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase">
                    Sarah
                  </p>
                </div>
                <p className="text-[13px] text-muted-foreground/65 leading-relaxed">
                  {getSarahInsight(client.progress, client.status, client.name)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionIcon({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
  if (status === "in-progress")
    return <Clock className="h-4 w-4 text-blue-accent shrink-0" />;
  return <Circle className="h-4 w-4 text-muted-foreground/25 shrink-0" />;
}

function SectionStatusLabel({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return <span className="text-[12px] text-emerald-500/80 font-medium">Complete</span>;
  if (status === "in-progress")
    return <span className="text-[12px] text-blue-accent/80 font-medium">In Progress</span>;
  return <span className="text-[12px] text-muted-foreground/35">Missing</span>;
}

function getSarahInsight(progress: number, status: string, name: string): string {
  const first = name.split(" ")[0];
  if (status === "complete")
    return `${first}'s fact find is complete. All sections accounted for — ready to generate the financial plan.`;
  if (status === "ready-for-meeting")
    return `${first} is ${progress}% complete and meeting-ready. Adviser preparation is recommended before the scheduled meeting.`;
  if (status === "review-required")
    return `This file requires adviser review before it can progress. Flag outstanding items and follow up directly with the client.`;
  if (status === "link-sent")
    return `Fact find link has been sent but not started. A personal follow-up call typically improves completion rates significantly.`;
  return `${first} is ${progress}% through their fact find. Check the section breakdown and follow up on any stalled areas.`;
}
