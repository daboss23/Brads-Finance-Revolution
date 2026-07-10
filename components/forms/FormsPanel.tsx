"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Send,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Mail,
  StickyNote,
  AlertCircle,
} from "lucide-react";
import {
  FORMS,
  PROVIDERS,
  getFormsForStrategies,
  getAllFormEntries,
  getFormEntry,
  setFormEntry,
  type FormId,
  type FormStatus,
  type StrategyKey,
  type FormStatusEntry,
  type ActionedBy,
} from "@/lib/forms";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  strategies: StrategyKey[];
  /**
   * Optional. When provided, each form card lists which of its required
   * fact-find fields are still missing so Brad knows what needs manual
   * completion before sending.
   */
  missingFieldsByForm?: Partial<Record<FormId, string[]>>;
}

const PROVIDER_STYLES: Record<string, string> = {
  MLC: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  AIA: "text-red-300 bg-red-500/10 border-red-500/30",
  AMP: "text-success bg-success/10 border-success/30",
  CFS: "text-purple-300 bg-purple-500/10 border-purple-500/30",
  BT: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  Centrelink: "text-warning bg-warning/10 border-warning/30",
  BMK: "text-gold/90 bg-gold/10 border-gold/30",
};

const STATUS_CONFIG: Record<FormStatus, { label: string; className: string }> = {
  "not-started": {
    label: "Not Started",
    className: "text-muted-foreground/65 bg-white/[0.04] border-border/60",
  },
  generated: {
    label: "Generated",
    className: "text-blue-300/90 bg-blue-500/10 border-blue-500/30",
  },
  sent: {
    label: "Sent",
    className: "text-warning/90 bg-warning/10 border-warning/30",
  },
  completed: {
    label: "Completed",
    className: "text-success/90 bg-success/10 border-success/30",
  },
};

export function FormsPanel({
  clientId,
  strategies,
  missingFieldsByForm,
}: Props) {
  const requiredForms = getFormsForStrategies(strategies);
  const [entries, setEntries] = useState<Partial<Record<FormId, FormStatusEntry>>>(
    {},
  );
  const [generating, setGenerating] = useState<FormId | null>(null);
  const [openNotesFor, setOpenNotesFor] = useState<FormId | null>(null);

  useEffect(() => {
    setEntries(getAllFormEntries(clientId));
  }, [clientId]);

  function refresh() {
    setEntries(getAllFormEntries(clientId));
  }

  function updateStatus(formId: FormId, status: FormStatus, actionedBy: ActionedBy = "Brad") {
    setFormEntry(clientId, formId, { status, actionedBy });
    refresh();
  }

  function updateNotes(formId: FormId, notes: string) {
    const current = getFormEntry(clientId, formId);
    setFormEntry(clientId, formId, { notes, status: current.status });
    refresh();
  }

  async function triggerDownload(formId: FormId): Promise<boolean> {
    const res = await fetch(`/api/forms/${clientId}/${formId}`);
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formId}-${clientId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  async function handleGenerate(formId: FormId) {
    setGenerating(formId);
    try {
      const ok = await triggerDownload(formId);
      if (ok) updateStatus(formId, "generated");
    } catch (e) {
      console.error("Generate error:", e);
    } finally {
      setGenerating(null);
    }
  }

  async function handleDownload(formId: FormId) {
    await triggerDownload(formId);
  }

  if (requiredForms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-card/30 px-8 py-10 text-center">
        <FileText className="h-7 w-7 text-muted-foreground/45 mx-auto mb-3" />
        <p className="text-[13.5px] text-muted-foreground/85">
          No forms attached to this strategy yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requiredForms.map((form) => {
        const entry = entries[form.id] ?? {
          status: "not-started" as FormStatus,
          updatedAt: "",
        };
        const sc = STATUS_CONFIG[entry.status];
        const isGenerating = generating === form.id;
        const provider = PROVIDERS[form.provider];
        const missing = missingFieldsByForm?.[form.id] ?? [];
        const mailto = `mailto:${provider.email}?subject=${encodeURIComponent(
          `${provider.name} — ${form.name}`,
        )}&body=${encodeURIComponent(
          `Hi ${provider.team},\n\nPlease find attached the ${form.name} for our client.\n\nThanks,\nBrad Lonergan\nNewcastle Financial Services (AFSL 234665)\nbrad@bmkfs.com.au`,
        )}`;

        return (
          <div
            key={form.id}
            className="rounded-lg border border-border/70 bg-card overflow-hidden"
          >
            <div className="px-5 py-4 flex items-center justify-between gap-5">
              {/* Left: icon + info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/70 bg-white/[0.03]">
                  <FileText className="h-4 w-4 text-muted-foreground/55" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase shrink-0",
                        PROVIDER_STYLES[form.provider],
                      )}
                    >
                      {provider.name}
                    </span>
                    <h3 className="text-[14.5px] font-semibold text-foreground truncate tracking-tight">
                      {form.name}
                    </h3>
                  </div>
                  <p className="text-[13px] text-muted-foreground/90 truncate">
                    {form.description}
                  </p>
                  <p className="text-[12px] text-muted-foreground/75 mt-1 truncate">
                    Send to: {provider.team} · {provider.email}
                  </p>
                  {missing.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-warning text-[12px]">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {missing.length} field{missing.length === 1 ? "" : "s"} missing, fill manually
                      </span>
                    </div>
                  )}
                  {entry.updatedAt && (
                    <p className="text-[11.5px] text-muted-foreground/70 mt-1.5">
                      {sc.label} {timeAgo(entry.updatedAt)}
                      {entry.actionedBy ? ` by ${entry.actionedBy}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: status + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "rounded border px-2.5 py-1 text-[11.5px] font-medium tracking-tight",
                    sc.className,
                  )}
                >
                  {sc.label}
                </span>

                {entry.status === "not-started" && (
                  <button
                    onClick={() => handleGenerate(form.id)}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 rounded-md border border-gold/35 bg-gold/[0.05] px-3 py-1.5 text-[12.5px] font-medium text-gold/85 hover:text-gold hover:border-gold/55 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    Generate
                  </button>
                )}

                {entry.status === "generated" && (
                  <>
                    <button
                      onClick={() => handleDownload(form.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-3 py-1.5 text-[12.5px] font-medium text-foreground/75 hover:text-foreground transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <a
                      href={mailto}
                      onClick={() => updateStatus(form.id, "sent")}
                      className="inline-flex items-center gap-1.5 rounded-md border border-warning/35 bg-warning/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-warning/85 hover:text-warning transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </a>
                  </>
                )}

                {entry.status === "sent" && (
                  <>
                    <button
                      onClick={() => handleDownload(form.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-3 py-1.5 text-[12.5px] font-medium text-foreground/75 hover:text-foreground transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => updateStatus(form.id, "completed")}
                      className="inline-flex items-center gap-1.5 rounded-md border border-success/35 bg-success/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-success/90 hover:text-success transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Complete
                    </button>
                  </>
                )}

                {entry.status === "completed" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <button
                      onClick={() => handleDownload(form.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-3 py-1.5 text-[12.5px] font-medium text-foreground/75 hover:text-foreground transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setOpenNotesFor((id) => (id === form.id ? null : form.id))
                  }
                  aria-label="Notes"
                  className={cn(
                    "inline-flex items-center justify-center h-8 w-8 rounded-md border transition-colors",
                    openNotesFor === form.id || entry.notes
                      ? "border-gold/40 text-gold/80 bg-gold/[0.06]"
                      : "border-border/70 text-muted-foreground/55 hover:text-foreground",
                  )}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {openNotesFor === form.id && (
              <div className="px-5 pb-4 border-t border-border/55 pt-3">
                <textarea
                  defaultValue={entry.notes ?? ""}
                  onBlur={(e) => updateNotes(form.id, e.target.value)}
                  rows={3}
                  placeholder={`Internal notes for ${form.name}...`}
                  className="w-full bg-white/[0.03] border border-border/70 rounded-md px-3 py-2 text-[12.5px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/40 resize-y leading-relaxed"
                />
                <p className="text-[10.5px] text-muted-foreground/45 mt-1.5">
                  Saved automatically when you click out of the box.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function timeAgo(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
