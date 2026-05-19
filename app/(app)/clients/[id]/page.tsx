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
} from "lucide-react";
import { CLIENTS, STATUS_CONFIG, type SectionStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  return (
    <div className="px-8 py-8 max-w-[1100px] mx-auto">
      {/* Back */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-border text-sm font-semibold text-muted-foreground">
            {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {client.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={STATUS_CONFIG[client.status].className}>
                {STATUS_CONFIG[client.status].label}
              </Badge>
              <span className="text-[12px] text-muted-foreground">
                {client.meetingStage}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
            Adviser
          </p>
          <p className="text-sm text-foreground font-medium">{client.adviser}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Contact card */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{client.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{client.mobile}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{client.adviser}</span>
              </div>
              {client.meetingDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">
                    Meeting: {client.meetingDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Next Action */}
          <div className="rounded-lg border border-blue-accent/20 bg-blue-accent/[0.04] p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-blue-accent mb-2">
              Next Action
            </h2>
            <p className="text-sm text-foreground">{client.nextAction}</p>
          </div>

          {/* Adviser notes */}
          {client.notes && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Adviser Notes
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {client.notes}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Activity Timeline
            </h2>
            <div className="space-y-4">
              {[...client.timeline].reverse().map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full mt-1.5 shrink-0",
                        event.type === "adviser"
                          ? "bg-gold"
                          : event.type === "client"
                          ? "bg-blue-accent"
                          : "bg-muted-foreground/40"
                      )}
                    />
                    {i < client.timeline.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-[13px] text-foreground">{event.event}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {event.date} ·{" "}
                      <span className="capitalize">{event.type}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Progress summary */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Fact Find Progress
              </h2>
              <span className="text-2xl font-semibold text-foreground tabular-nums">
                {client.progress}%
              </span>
            </div>
            <progress
              value={client.progress}
              max={100}
              className="bmk-progress w-full mb-2"
            />
            <p className="text-[11px] text-muted-foreground">
              {completeSections} of {total} sections complete
            </p>
          </div>

          {/* Section breakdown */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Section Breakdown
            </h2>
            <div className="space-y-2.5">
              {client.factFindSections.map((section) => (
                <div
                  key={section.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <SectionIcon status={section.status} />
                    <span className="text-[13px] text-foreground">
                      {section.name}
                    </span>
                  </div>
                  <SectionStatusLabel status={section.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Sarah insight */}
          <div className="rounded-lg border border-gold/20 bg-gold/[0.04] p-4">
            <div className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 border border-gold/30 mt-0.5">
                <Sparkles className="h-3 w-3 text-gold" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-gold mb-1">
                  Sarah
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
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
  return <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />;
}

function SectionStatusLabel({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return (
      <span className="text-[11px] text-emerald-500 font-medium">Complete</span>
    );
  if (status === "in-progress")
    return (
      <span className="text-[11px] text-blue-accent font-medium">
        In Progress
      </span>
    );
  return (
    <span className="text-[11px] text-muted-foreground/50">Missing</span>
  );
}

function getSarahInsight(
  progress: number,
  status: string,
  name: string
): string {
  if (status === "complete")
    return `${name.split(" ")[0]}'s fact find is complete. All sections are accounted for — ready to generate the financial plan.`;
  if (status === "ready-for-meeting")
    return `${name.split(" ")[0]} is ${progress}% complete and meeting-ready. Adviser preparation recommended before the scheduled meeting.`;
  if (status === "review-required")
    return `This file requires adviser review before progression. Flag outstanding items and follow up directly with the client.`;
  if (status === "link-sent")
    return `Fact find link has been sent but not yet started. A personal follow-up call typically improves completion rates significantly.`;
  return `${name.split(" ")[0]} is ${progress}% through their fact find. Check the section breakdown and follow up on any stalled areas.`;
}
