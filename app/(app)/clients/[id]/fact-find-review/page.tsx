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
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ReviewInteractive } from "@/components/fact-find-review/ReviewInteractive";
import { ExportButtons } from "@/components/fact-find-review/ExportButtons";

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

export default function FactFindReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client) notFound();

  const answers = getClientAnswers(client.id);
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const missingSections = FACT_FIND_SECTIONS.filter(
    (s) => getSectionStatus(client, s.id) === "missing"
  );

  return (
    <div className="px-14 py-12">

      {/* Back */}
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/55 hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {client.name}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-10 pb-9 border-b border-border/60">
        <div>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground/45 mb-2">
            Fact Find Review
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
            {client.name}
          </h1>
          <div className="flex items-center gap-3 mt-2.5">
            <Badge className={STATUS_CONFIG[client.status].className}>
              {STATUS_CONFIG[client.status].label}
            </Badge>
            <span className="text-[12px] text-muted-foreground/50">
              {client.progress}% complete
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-[12px] text-muted-foreground/50">
              Generated {today}
            </span>
          </div>
        </div>
        <ExportButtons clientId={client.id} />
      </div>

      {/* Gaps summary — only when there are missing sections */}
      {missingSections.length > 0 && (
        <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/5 overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-red-500/70 to-red-500/20" />
            <div className="px-6 py-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-red-400">
                  Incomplete Sections — Follow Up Required
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSections.map((s) => (
                  <span
                    key={s.id}
                    className="rounded px-2.5 py-1 text-[11px] font-medium text-red-300 bg-red-500/10 border border-red-500/25"
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
      <div className="grid grid-cols-[1fr_340px] gap-8 items-start">

        {/* Left — section cards */}
        <div className="space-y-5">
          {FACT_FIND_SECTIONS.map((section) => {
            const status = getSectionStatus(client, section.id);
            const sectionAnswers = answers[section.id] ?? {};
            const hasAnyAnswer = Object.keys(sectionAnswers).length > 0;

            return (
              <div
                key={section.id}
                className={cn(
                  "rounded-lg border bg-card overflow-hidden",
                  status === "missing"
                    ? "border-red-500/25"
                    : status === "in-progress"
                    ? "border-amber-500/25"
                    : "border-border"
                )}
              >
                {/* Section header */}
                <div
                  className={cn(
                    "px-6 py-4 border-b flex items-center justify-between",
                    status === "missing"
                      ? "border-red-500/20 bg-red-500/[0.04]"
                      : status === "in-progress"
                      ? "border-amber-500/20 bg-amber-500/[0.03]"
                      : "border-border/60 bg-[hsl(224,20%,7%)]"
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
                      <AlertTriangle className="h-4 w-4 text-red-400/70 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] text-red-300/80 mb-2">
                          This section was not completed by the client.
                        </p>
                        <p className="text-[11px] text-muted-foreground/50">
                          Required fields outstanding:{" "}
                          {section.fields
                            .filter((f) => f.required)
                            .map((f) => f.label)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {section.fields.map((field) => {
                        const value = sectionAnswers[field.id];
                        const isMissing = !value || value === "—";
                        return (
                          <div key={field.id}>
                            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground/45 mb-1">
                              {field.label}
                            </p>
                            <p
                              className={cn(
                                "text-[13px] leading-snug",
                                isMissing
                                  ? "text-muted-foreground/35 italic"
                                  : "text-foreground/85"
                              )}
                            >
                              {value ?? "—"}
                            </p>
                          </div>
                        );
                      })}
                      {status === "in-progress" && !hasAnyAnswer && (
                        <p className="col-span-2 text-[13px] text-amber-300/70 italic">
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
        <div className="sticky top-8">
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
    return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
  if (status === "in-progress")
    return <Clock className="h-4 w-4 text-amber-400 shrink-0" />;
  return <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />;
}

function SectionStatusPill({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return (
      <span className="text-[11px] font-medium text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/25 rounded px-2.5 py-0.5">
        Complete
      </span>
    );
  if (status === "in-progress")
    return (
      <span className="text-[11px] font-medium text-amber-400/80 bg-amber-500/10 border border-amber-500/25 rounded px-2.5 py-0.5">
        In Progress
      </span>
    );
  return (
    <span className="text-[11px] font-medium text-red-400/80 bg-red-500/10 border border-red-500/25 rounded px-2.5 py-0.5">
      Missing
    </span>
  );
}
