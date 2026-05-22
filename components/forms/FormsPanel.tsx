"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Send,
  CheckCircle2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  FORMS,
  getFormsForStrategies,
  getAllFormStatuses,
  setFormStatus,
  type FormId,
  type FormStatus,
  type StrategyKey,
} from "@/lib/forms";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  strategies: StrategyKey[];
}

const PROVIDER_STYLES: Record<string, string> = {
  MLC: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  AIA: "text-red-400 bg-red-500/10 border-red-500/25",
  AMP: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
};

const STATUS_CONFIG: Record<FormStatus, { label: string; className: string }> = {
  "not-started": {
    label: "Not Started",
    className: "text-muted-foreground/50 bg-muted/50 border-border/60",
  },
  generated: {
    label: "Generated",
    className: "text-blue-400/80 bg-blue-500/10 border-blue-500/25",
  },
  sent: {
    label: "Sent",
    className: "text-amber-400/80 bg-amber-500/10 border-amber-500/25",
  },
  completed: {
    label: "Completed",
    className: "text-emerald-400/80 bg-emerald-500/10 border-emerald-500/25",
  },
};

export function FormsPanel({ clientId, strategies }: Props) {
  const requiredForms = getFormsForStrategies(strategies);
  const [statuses, setStatuses] = useState<Partial<Record<FormId, FormStatus>>>({});
  const [generating, setGenerating] = useState<FormId | null>(null);

  useEffect(() => {
    setStatuses(getAllFormStatuses(clientId));
  }, [clientId]);

  function updateStatus(formId: FormId, status: FormStatus) {
    setFormStatus(clientId, formId, status);
    setStatuses((prev) => ({ ...prev, [formId]: status }));
  }

  async function triggerDownload(formId: FormId): Promise<boolean> {
    const res = await fetch(`/api/forms/${clientId}/${formId}`);
    if (!res.ok) return false;
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
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
      <div className="rounded-lg border border-border bg-card px-8 py-14 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/25 mx-auto mb-4" />
        <p className="text-[13px] text-muted-foreground/55">
          No forms required — no strategy has been selected for this client.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requiredForms.map((form) => {
        const status      = statuses[form.id] ?? "not-started";
        const isGenerating = generating === form.id;
        const sc          = STATUS_CONFIG[status];

        return (
          <div
            key={form.id}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <div className="px-6 py-5 flex items-center justify-between gap-6">
              {/* Left: icon + info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border bg-muted/50">
                  <FileText className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase shrink-0",
                        PROVIDER_STYLES[form.provider]
                      )}
                    >
                      {form.provider}
                    </span>
                    <h3 className="text-[13px] font-semibold text-foreground truncate">
                      {form.name}
                    </h3>
                  </div>
                  <p className="text-[12px] text-muted-foreground/50 truncate">
                    {form.description}
                  </p>
                </div>
              </div>

              {/* Right: status + actions */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={cn(
                    "rounded border px-2.5 py-1 text-[11px] font-medium",
                    sc.className
                  )}
                >
                  {sc.label}
                </span>

                {status === "not-started" && (
                  <button
                    onClick={() => handleGenerate(form.id)}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 rounded border border-gold/35 bg-gold/5 px-3.5 py-2 text-[12px] font-medium text-gold/80 hover:text-gold hover:border-gold/55 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    Generate
                  </button>
                )}

                {status === "generated" && (
                  <>
                    <button
                      onClick={() => handleDownload(form.id)}
                      className="inline-flex items-center gap-2 rounded border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground/70 hover:text-foreground transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => updateStatus(form.id, "sent")}
                      className="inline-flex items-center gap-2 rounded border border-amber-500/30 bg-amber-500/5 px-3.5 py-2 text-[12px] font-medium text-amber-400/80 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Mark Sent
                    </button>
                  </>
                )}

                {status === "sent" && (
                  <>
                    <button
                      onClick={() => handleDownload(form.id)}
                      className="inline-flex items-center gap-2 rounded border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground/70 hover:text-foreground transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => updateStatus(form.id, "completed")}
                      className="inline-flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2 text-[12px] font-medium text-emerald-400/80 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Complete
                    </button>
                  </>
                )}

                {status === "completed" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <button
                      onClick={() => handleDownload(form.id)}
                      className="inline-flex items-center gap-2 rounded border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground/70 hover:text-foreground transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
