"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  PenLine,
  Play,
  ChevronDown,
} from "lucide-react";
import {
  ACTION_LABELS,
  getAuditTrail,
  type AuditActionType,
  type AuditEntry,
} from "@/lib/compliance/audit-trail";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
}

const ICONS: Record<AuditActionType, React.ElementType> = {
  "check-run": Play,
  "blocker-resolved": CheckCircle2,
  "warning-acknowledged": AlertTriangle,
  "certificate-generated": FileText,
  "sign-off-given": PenLine,
};

const ICON_TONE: Record<AuditActionType, string> = {
  "check-run": "text-blue-accent bg-blue-accent/10 border-blue-accent/30",
  "blocker-resolved": "text-success bg-success/10 border-success/30",
  "warning-acknowledged": "text-warning bg-warning/10 border-warning/30",
  "certificate-generated": "text-gold bg-gold/10 border-gold/30",
  "sign-off-given": "text-gold bg-gold/10 border-gold/35",
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AuditTimeline({ clientId }: Props) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setEntries(getAuditTrail(clientId));
    const id = setInterval(() => setEntries(getAuditTrail(clientId)), 1500);
    return () => clearInterval(id);
  }, [clientId]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-black/25">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Audit Trail
          </h2>
        </div>
        <div className="px-6 py-8 text-center text-[13px] text-muted-foreground/65">
          No compliance actions logged yet. Run a check to begin the audit trail.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 bg-black/25">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Audit Trail
        </h2>
      </div>
      <ul className="px-6 py-5 space-y-4">
        {entries.map((entry, i) => {
          const Icon = ICONS[entry.action];
          const open = expanded.has(entry.id);
          return (
            <li key={entry.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                    ICON_TONE[entry.action]
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {i < entries.length - 1 && (
                  <div className="w-px flex-1 bg-border/45 mt-2" />
                )}
              </div>
              <div className={cn("flex-1 min-w-0", i < entries.length - 1 && "pb-3")}>
                <button
                  onClick={() => toggle(entry.id)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13.5px] font-medium text-foreground">
                      {ACTION_LABELS[entry.action]}
                    </p>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-muted-foreground/60 transition-transform shrink-0",
                        open && "rotate-180"
                      )}
                    />
                  </div>
                  <p className="text-[11.5px] text-muted-foreground/85 mt-0.5">
                    {entry.actor} · {formatTime(entry.timestamp)} · v
                    {entry.complianceVersion}
                  </p>
                </button>
                {open && (
                  <div className="mt-2.5 rounded border border-border/55 bg-[hsl(224,20%,6%)] px-3 py-2.5">
                    <pre className="text-[11.5px] text-muted-foreground/85 leading-relaxed whitespace-pre-wrap break-words">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
