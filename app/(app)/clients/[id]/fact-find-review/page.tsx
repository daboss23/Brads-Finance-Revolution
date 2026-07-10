import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { CLIENTS, type SectionStatus } from "@/lib/data";
import { FACT_FIND_SECTIONS } from "@/lib/fact-find-flow";
import { getClientAnswers } from "@/lib/fact-find-answers";
import { getFactFind } from "@/lib/sarah-fact-find-store";
import { sarahToReviewAnswers } from "@/lib/sarah-fact-find-schema";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ReviewInteractive } from "@/components/fact-find-review/ReviewInteractive";
import { ExportButtons } from "@/components/fact-find-review/ExportButtons";
import { EditableFactFindValue } from "@/components/fact-find-review/EditableFactFindValue";
import { CompletionBar } from "@/components/fact-find-review/CompletionBar";
import { ClientTabs } from "@/components/clients/ClientTabs";
import { AgentIntelligencePanel } from "@/components/agents/AgentIntelligencePanel";

// Maps FACT_FIND_SECTIONS ids → the client's factFindSection name
const SECTION_MAP: Record<string, string> = {
  "personal-details": "Personal Details",
  "contact-information": "Personal Details",
  "family-dependants": "Personal Details",
  "employment-income": "Income & Employment",
  "assets": "Assets & Liabilities",
  "liabilities": "Assets & Liabilities",
  "expenses": "Expenses",
  "superannuation": "Superannuation",
  "insurance": "Insurance",
  "goals-objectives": "Goals & Objectives",
};

function getSectionStatus(client: (typeof CLIENTS)[0], sectionId: string): SectionStatus {
  const name = SECTION_MAP[sectionId];
  return client.factFindSections.find((s) => s.name === name)?.status ?? "missing";
}

function sectionHasSarahData(
  sarahAnswers: Record<string, Record<string, string>> | null,
  sectionId: string,
): boolean {
  if (!sarahAnswers) return false;
  const fields = sarahAnswers[sectionId];
  if (!fields) return false;
  return Object.values(fields).some((v) => v && v.trim() !== "");
}

export default function FactFindReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client) notFound();

  const sampleAnswers = getClientAnswers(client.id);
  const sarahEntry = getFactFind(client.id);
  const sarahAnswers = sarahEntry ? sarahToReviewAnswers(sarahEntry.data) : null;

  // Sarah's collected answers take precedence over sample data when present.
  const answers: Record<string, Record<string, string>> = { ...sampleAnswers };
  if (sarahAnswers) {
    for (const [sec, fields] of Object.entries(sarahAnswers)) {
      const merged = { ...(answers[sec] ?? {}) };
      for (const [k, v] of Object.entries(fields)) {
        if (v && v.trim()) merged[k] = v;
      }
      answers[sec] = merged;
    }
  }

  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const missingSections = FACT_FIND_SECTIONS.filter(
    (s) => getSectionStatus(client, s.id) === "missing"
  );

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">

      {/* Back */}
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {client.name}
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-10 pb-9 border-b border-gold/[0.1]">
        <div>
          <p className="cmd-label text-gold/75 mb-2.5">
            Fact Find Review · Review Cockpit
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
            {client.name}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <Badge className={STATUS_CONFIG[client.status].className}>
              {STATUS_CONFIG[client.status].label}
            </Badge>
            <span className="text-[13px] text-muted-foreground/85">
              {client.progress}% complete
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[13px] text-muted-foreground/85">
              Generated {today}
            </span>
          </div>
        </div>
        <ExportButtons clientId={client.id} />
      </div>

      <ClientTabs clientId={client.id} />

      {/* Completion bar — Sarah's collected progress */}
      <CompletionBar
        percentage={sarahEntry?.data.completionPercentage ?? client.progress}
        missingSections={sarahEntry?.data.missingSections}
        source={sarahEntry ? "sarah" : "manual"}
      />

      {/* Gaps summary — only when there are missing sections */}
      {missingSections.length > 0 && (
        <div className="glass-panel glass-rim-amber mb-8 overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-warning/70 to-warning/20" />
            <div className="px-6 py-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-warning">
                  Incomplete Sections — Follow Up Required
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSections.map((s) => (
                  <span
                    key={s.id}
                    className="glass-chip rounded-md px-2.5 py-1 text-[11px] font-medium text-warning border-warning/30"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:gap-8 items-start">

        {/* Left — section cards */}
        <div className="space-y-5">
          {FACT_FIND_SECTIONS.map((section) => {
            const baseStatus = getSectionStatus(client, section.id);
            // If Sarah collected data for this section, escalate from "missing"
            // so Brad still sees the fields (and can edit them).
            const status: SectionStatus =
              baseStatus === "missing" && sectionHasSarahData(sarahAnswers, section.id)
                ? "in-progress"
                : baseStatus;
            const sectionAnswers = answers[section.id] ?? {};
            const hasAnyAnswer = Object.keys(sectionAnswers).length > 0;

            return (
              <div
                key={section.id}
                className={cn(
                  "glass-panel overflow-hidden",
                  status === "missing"
                    ? "glass-rim-amber"
                    : status === "in-progress"
                    ? "glass-rim-gold"
                    : "glass-rim-emerald"
                )}
              >
                {/* Section header */}
                <div
                  className={cn(
                    "px-6 py-4 border-b flex items-center justify-between",
                    status === "missing"
                      ? "border-warning/20 bg-warning/[0.05]"
                      : status === "in-progress"
                      ? "border-gold/20 bg-gold/[0.04]"
                      : "border-white/[0.06] bg-black/25"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon status={status} />
                    <h2 className="text-[13px] font-semibold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <SectionStatusPill status={status} />
                </div>

                {/* Section body */}
                <div className="px-6 py-5">
                  {status === "missing" ? (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-warning/80 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[14px] text-foreground/85 mb-2">
                          This section was not completed by the client.
                        </p>
                        <p className="text-[12.5px] text-muted-foreground/85">
                          Required fields outstanding:{" "}
                          {section.fields
                            .filter((f) => f.required)
                            .map((f) => f.label)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {section.fields.map((field) => {
                        const value = sectionAnswers[field.id] ?? "";
                        const multiline =
                          field.type === "textarea" || value.length > 60;
                        return (
                          <div key={field.id}>
                            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground/85 mb-1.5">
                              {field.label}
                            </p>
                            <EditableFactFindValue
                              clientId={client.id}
                              sectionId={section.id}
                              fieldId={field.id}
                              initialValue={value === "—" ? "" : value}
                              multiline={multiline}
                            />
                          </div>
                        );
                      })}
                      {status === "in-progress" && !hasAnyAnswer && (
                        <p className="sm:col-span-2 text-[13px] text-gold/70 italic">
                          Partially completed — data being collected.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — interactive checklist, notes, actions */}
        <div className="xl:sticky xl:top-8">
          <AgentIntelligencePanel clientId={client.id} />
          <ReviewInteractive
            clientId={client.id}
            clientName={client.name}
            missingSectionCount={missingSections.length}
          />
        </div>
      </div>
    </div>
  );
}

function SectionIcon({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return <CheckCircle2 className="h-4 w-4 text-success shrink-0" />;
  if (status === "in-progress")
    return <Clock className="h-4 w-4 text-gold shrink-0" />;
  return <AlertTriangle className="h-4 w-4 text-warning shrink-0" />;
}

function SectionStatusPill({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return (
      <span className="glass-chip text-[11px] font-medium text-success border-success/30 rounded-md px-2.5 py-0.5">
        Complete
      </span>
    );
  if (status === "in-progress")
    return (
      <span className="glass-chip text-[11px] font-medium text-gold border-gold/30 rounded-md px-2.5 py-0.5">
        In Progress
      </span>
    );
  return (
    <span className="glass-chip text-[11px] font-medium text-warning border-warning/30 rounded-md px-2.5 py-0.5">
      Missing
    </span>
  );
}
