"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Pencil, Save, X } from "lucide-react";
import type { SoaDocument, SoaSectionContent } from "@/lib/soa/soa-template";
import { updateSection } from "@/lib/soa/soa-store";
import { recordEdit } from "@/lib/soa/voice-learner";
import { cn } from "@/lib/utils";

interface Props {
  doc: SoaDocument;
  section: SoaSectionContent;
  strategies: string[];
  onChange: (next: SoaDocument) => void;
}

export function SoaSection({ doc, section, strategies, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.body);
  const [comment, setComment] = useState(section.comment ?? "");

  function save() {
    if (draft !== section.body) {
      recordEdit({
        clientId: doc.clientId,
        sectionId: section.id,
        before: section.body,
        after: draft,
        strategies: strategies as never,
      });
    }
    const next = updateSection(doc.clientId, section.id, {
      body: draft,
      reviewed: true,
      comment,
    });
    if (next) onChange(next);
    setEditing(false);
  }

  function cancel() {
    setDraft(section.body);
    setEditing(false);
  }

  function toggleReviewed() {
    const next = updateSection(doc.clientId, section.id, {
      reviewed: !section.reviewed,
    });
    if (next) onChange(next);
  }

  function toggleApproved() {
    const approved = !section.approved;
    const next = updateSection(doc.clientId, section.id, {
      approved,
      reviewed: approved ? true : section.reviewed,
    });
    if (next) onChange(next);
  }

  const flagged = section.needsReview && !section.reviewed;

  return (
    <article
      id={`section-${section.id}`}
      className={cn(
        "rounded-lg border bg-card overflow-hidden",
        flagged
          ? "border-warning/35"
          : section.approved
          ? "border-success/30"
          : "border-border",
      )}
    >
      <header
        className={cn(
          "px-6 py-4 border-b flex items-center justify-between gap-4",
          flagged
            ? "border-warning/25 bg-warning/[0.05]"
            : section.approved
            ? "border-success/20 bg-success/[0.03]"
            : "border-border/60 bg-black/25",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
              flagged
                ? "bg-warning/[0.15] text-warning"
                : section.approved
                ? "bg-success/15 text-success"
                : "bg-muted text-muted-foreground/85",
            )}
          >
            {section.number}
          </div>
          <h3 className="text-[14px] font-semibold text-foreground truncate">
            {section.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {flagged && (
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-warning bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-2.5 w-2.5" />
              Review needed
            </span>
          )}
          {section.reviewed && !flagged && (
            <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-success bg-success/10 border border-success/25">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Reviewed
            </span>
          )}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 btn-glass rounded px-2 py-1 text-[11px] font-medium text-foreground/75 hover:text-foreground hover:border-border/90 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )}
        </div>
      </header>

      <div className="px-7 py-6">
        {section.needsReview && section.reviewReason && !section.reviewed && (
          <p className="text-[12px] text-warning/90 mb-4 leading-relaxed">
            Why this is flagged: {section.reviewReason}
          </p>
        )}
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.max(6, draft.split("\n").length + 2)}
              className="w-full rounded border border-border bg-background p-3 text-[13.5px] text-foreground leading-relaxed focus:border-gold/50 focus:outline-none font-sans"
            />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment (optional)"
              className="w-full rounded border border-border bg-background px-3 py-2 text-[12.5px] text-foreground placeholder:text-muted-foreground/55 focus:border-gold/50 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={save}
                className="inline-flex items-center gap-1.5 rounded border border-gold/35 bg-gold/5 px-3 py-1.5 text-[12px] font-medium text-gold hover:border-gold/55 transition-colors"
              >
                <Save className="h-3 w-3" />
                Save and mark reviewed
              </button>
              <button
                onClick={cancel}
                className="inline-flex items-center gap-1.5 btn-glass rounded px-3 py-1.5 text-[12px] font-medium text-foreground/75 hover:text-foreground hover:border-border/90 transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {section.body.split(/\n+/).filter(Boolean).map((p, i) => (
              <p
                key={i}
                className="text-[13.5px] text-foreground/85 leading-relaxed whitespace-pre-wrap"
              >
                {p}
              </p>
            ))}
            {section.comment && (
              <p className="text-[12px] text-muted-foreground/70 italic border-l-2 border-border/60 pl-3 mt-3">
                Brad's note: {section.comment}
              </p>
            )}
          </div>
        )}
      </div>

      <footer className="px-7 py-3 border-t border-border/40 bg-[hsl(224,20%,6%)] flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-[12px] text-foreground/80 cursor-pointer">
          <input
            type="checkbox"
            checked={section.reviewed}
            onChange={toggleReviewed}
            className="h-3.5 w-3.5 rounded border border-border bg-muted accent-gold cursor-pointer"
          />
          Reviewed
        </label>
        <label className="inline-flex items-center gap-2 text-[12px] text-foreground/80 cursor-pointer">
          <input
            type="checkbox"
            checked={section.approved}
            onChange={toggleApproved}
            className="h-3.5 w-3.5 rounded border border-border bg-muted accent-gold cursor-pointer"
          />
          Approve section
        </label>
        <span className="ml-auto text-[10.5px] tracking-[0.15em] uppercase text-muted-foreground/60">
          Confidence: {section.confidence}
        </span>
      </footer>
    </article>
  );
}
