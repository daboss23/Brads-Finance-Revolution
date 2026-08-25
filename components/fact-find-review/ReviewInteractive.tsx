"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  getCheckedSections,
  setCheckedSections,
  getNotes,
  setNotes,
  isBradReviewed,
  markBradReviewed,
} from "@/lib/review-store";

const CHECKLIST = [
  { id: "personal", label: "Personal details & contact confirmed" },
  { id: "family", label: "Family situation and dependants noted" },
  { id: "income", label: "Employment and income documented" },
  { id: "assets", label: "Assets inventoried and valued" },
  { id: "liabilities", label: "Liabilities checked and recorded" },
  { id: "expenses", label: "Monthly expenses captured" },
  { id: "super", label: "Superannuation fund(s) confirmed" },
  { id: "insurance", label: "Insurance cover assessed" },
  { id: "goals", label: "Goals and risk profile understood" },
  { id: "gaps", label: "Gaps identified and follow-ups noted" },
];

type Props = {
  clientId: string;
  clientName: string;
  missingSectionCount: number;
};

export function ReviewInteractive({ clientId, clientName, missingSectionCount }: Props) {
  const [checked, setChecked] = useState<string[]>([]);
  const [notes, setNotesState] = useState("");
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    setChecked(getCheckedSections(clientId));
    setNotesState(getNotes(clientId));
    setReviewed(isBradReviewed(clientId));
  }, [clientId]);

  const toggleCheck = useCallback(
    (id: string, isChecked: boolean) => {
      const next = isChecked ? [...checked, id] : checked.filter((c) => c !== id);
      setChecked(next);
      setCheckedSections(clientId, next);
    },
    [checked, clientId]
  );

  const handleNotes = useCallback(
    (value: string) => {
      setNotesState(value);
      setNotes(clientId, value);
    },
    [clientId]
  );

  const handleMarkReviewed = useCallback(() => {
    const next = !reviewed;
    setReviewed(next);
    markBradReviewed(clientId, next);
  }, [reviewed, clientId]);

  const allChecked = checked.length === CHECKLIST.length;
  const progress = Math.round((checked.length / CHECKLIST.length) * 100);

  return (
    <div className="space-y-4">

      {/* Checklist */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-black/25 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
            Adviser Checklist
          </h3>
          <span className="text-[11px] text-muted-foreground/50 tabular-nums">
            {checked.length}/{CHECKLIST.length}
          </span>
        </div>

        <div className="px-5 py-4">
          {/* Progress bar */}
          <div className="mb-4">
            <progress value={progress} max={100} className="bmk-progress w-full" />
          </div>

          <div className="space-y-3">
            {CHECKLIST.map((item) => (
              <Checkbox
                key={item.id}
                label={item.label}
                checked={checked.includes(item.id)}
                onChange={(e) => toggleCheck(item.id, e.target.checked)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 bg-black/25">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
            Adviser Notes
          </h3>
        </div>
        <div className="px-5 py-4">
          <Textarea
            placeholder="Add anything missing, follow-up items, or review notes…"
            value={notes}
            onChange={(e) => handleNotes(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Incomplete warning */}
      {missingSectionCount > 0 && (
        <p className="text-[11px] text-red-400/70 px-1 leading-relaxed">
          {missingSectionCount} section{missingSectionCount !== 1 ? "s" : ""} incomplete — follow up with client before marking reviewed.
        </p>
      )}

      {/* Mark as reviewed */}
      <Button
        onClick={handleMarkReviewed}
        className={
          reviewed
            ? "w-full bg-success/90 hover:bg-success text-white"
            : "w-full bg-gold hover:bg-gold/90 text-background font-semibold"
        }
        disabled={!allChecked && !reviewed}
      >
        {reviewed ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Marked as Brad Reviewed
          </>
        ) : (
          <>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            {allChecked ? "Mark as Brad Reviewed" : `Complete checklist to mark reviewed`}
          </>
        )}
      </Button>

      {reviewed && (
        <p className="text-[11px] text-success/70 text-center">
          Pipeline updated — {clientName.split(" ")[0]}'s card shows Brad Reviewed
        </p>
      )}
    </div>
  );
}
