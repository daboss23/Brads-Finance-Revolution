"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { SoaDocument } from "@/lib/soa/soa-template";
import { setStatus } from "@/lib/soa/soa-store";
import { logAudit } from "@/lib/compliance/audit-trail";
import { cn } from "@/lib/utils";

interface Props {
  doc: SoaDocument;
  onChange: (next: SoaDocument) => void;
}

export function SoaReviewPanel({ doc, onChange }: Props) {
  const [sending, setSending] = useState(false);

  const flagged = doc.sections.filter((s) => s.needsReview && !s.reviewed);
  const reviewedCount = doc.sections.filter((s) => s.reviewed).length;
  const approvedCount = doc.sections.filter((s) => s.approved).length;
  const allApproved = approvedCount === doc.sections.length;

  const ringColor = useMemo(() => {
    if (doc.complianceScore >= 85) return "stroke-[hsl(var(--success))]";
    if (doc.complianceScore >= 60) return "stroke-[hsl(var(--warning))]";
    return "stroke-red-400";
  }, [doc.complianceScore]);

  function downloadPdf() {
    const a = document.createElement("a");
    a.href = `/api/soa/${doc.clientId}/pdf`;
    a.download = `${doc.clientName.replace(/\s+/g, "-")}-soa.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function sendViaDocuSign() {
    if (!allApproved) return;
    setSending(true);
    setTimeout(() => {
      const next = setStatus(doc.clientId, "sent");
      if (next) onChange(next);
      logAudit(doc.clientId, "sign-off-given", "Brad", {
        action: "SOA sent to client",
        channel: "DocuSign (stub)",
        sectionCount: doc.sections.length,
      });
      setSending(false);
    }, 800);
  }

  return (
    <div className="space-y-5">

      {/* Score and certificate */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-black/25 flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-gold" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Compliance
          </h3>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3 px-5 py-5 items-center">
          <div>
            <p className="text-[12px] text-muted-foreground/85">Certificate</p>
            <p className="text-[13px] text-foreground font-medium truncate">
              {doc.complianceCertificateId}
            </p>
            <p className="text-[11px] text-muted-foreground/65 mt-1">
              Score {doc.complianceScore} / 100
            </p>
          </div>
          <Ring score={doc.complianceScore} ringColor={ringColor} />
        </div>
      </div>

      {/* Flagged items */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-black/25 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Flagged for Brad
          </h3>
          <span className="text-[11px] text-muted-foreground/65 tabular-nums">
            {flagged.length}
          </span>
        </div>
        <ul className="px-5 py-3 space-y-2.5 max-h-[260px] overflow-y-auto">
          {flagged.length === 0 && (
            <li className="text-[12.5px] text-success/85 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All flagged items have been reviewed.
            </li>
          )}
          {flagged.map((s) => (
            <li key={s.id}>
              <a
                href={`#section-${s.id}`}
                className="block rounded -m-1 p-2 hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-warning mt-1 shrink-0" />
                  <div>
                    <p className="text-[12.5px] font-medium text-foreground">
                      §{s.number} {s.title}
                    </p>
                    {s.reviewReason && (
                      <p className="text-[11.5px] text-muted-foreground/80 mt-0.5 leading-snug">
                        {s.reviewReason}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Approval progress */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-black/25">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Approval Progress
          </h3>
        </div>
        <div className="px-5 py-5 space-y-3">
          <ProgressRow
            label="Reviewed"
            value={reviewedCount}
            total={doc.sections.length}
            tone="amber"
          />
          <ProgressRow
            label="Approved"
            value={approvedCount}
            total={doc.sections.length}
            tone="emerald"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-black/25">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Actions
          </h3>
        </div>
        <div className="px-5 py-5 space-y-2.5">
          <button
            onClick={downloadPdf}
            className="w-full inline-flex items-center justify-center gap-2 btn-glass rounded px-3 py-2 text-[12px] font-medium text-foreground/80 hover:text-foreground hover:border-border/90 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download as PDF
          </button>
          <button
            onClick={sendViaDocuSign}
            disabled={!allApproved || sending || doc.status === "sent"}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded border px-3 py-2 text-[12px] font-medium transition-colors",
              allApproved && doc.status !== "sent"
                ? "border-gold/45 bg-gold/10 text-gold hover:border-gold/65"
                : "border-border bg-card text-muted-foreground/55 cursor-not-allowed",
            )}
            title={
              !allApproved
                ? "Approve every section before sending"
                : doc.status === "sent"
                ? "SOA already sent"
                : "Send via DocuSign"
            }
          >
            <Send className="h-3.5 w-3.5" />
            {sending
              ? "Sending…"
              : doc.status === "sent"
              ? "Sent"
              : "Send via DocuSign"}
          </button>
          {!allApproved && (
            <p className="text-[11px] text-muted-foreground/65 leading-relaxed">
              Approve every section to unlock sending. DocuSign integration is a stub for now and will be wired in Phase 5.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Ring({ score, ringColor }: { score: number; ringColor: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          strokeWidth="6"
          fill="none"
          className="stroke-border/55"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          className={ringColor}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[16px] font-semibold tabular-nums text-foreground">
          {score}
        </span>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "amber" | "emerald";
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12px] text-foreground/85">{label}</p>
        <p className="text-[11.5px] text-muted-foreground/85 tabular-nums">
          {value} / {total}
        </p>
      </div>
      <progress
        value={pct}
        max={100}
        className={cn(
          "bmk-progress w-full",
          tone === "amber" ? "bmk-progress-amber" : "bmk-progress-emerald",
        )}
      />
    </div>
  );
}
