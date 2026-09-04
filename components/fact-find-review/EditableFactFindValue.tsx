"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "bmk-crm-fact-find-edits-v1";

type EditMap = Record<string, Record<string, Record<string, string>>>;

function loadEdits(): EditMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as EditMap;
  } catch {
    return {};
  }
}

function persistEdit(
  clientId: string,
  sectionId: string,
  fieldId: string,
  value: string,
) {
  const all = loadEdits();
  all[clientId] = all[clientId] ?? {};
  all[clientId][sectionId] = all[clientId][sectionId] ?? {};
  all[clientId][sectionId][fieldId] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

interface Props {
  clientId: string;
  sectionId: string;
  fieldId: string;
  initialValue: string;
  multiline?: boolean;
  /**
   * True when this value was read out of a session the client never finished,
   * rather than confirmed by them completing it. Marked on screen, because an
   * adviser has to be able to tell the two apart at a glance before quoting a
   * number back to a client. Brad editing the field is what confirms it.
   */
  unconfirmed?: boolean;
}

export function EditableFactFindValue({
  clientId,
  sectionId,
  fieldId,
  initialValue,
  multiline,
  unconfirmed = false,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue);
  // An edited field is one Brad has looked at and stood behind, so it stops
  // carrying the unconfirmed marking.
  const [confirmed, setConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Hydrate from saved edits once mounted.
  useEffect(() => {
    const edits = loadEdits();
    const saved = edits[clientId]?.[sectionId]?.[fieldId];
    if (typeof saved === "string") {
      setValue(saved);
      setDraft(saved);
      setConfirmed(true);
    }
  }, [clientId, sectionId, fieldId]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const next = draft.trim();
    setValue(next);
    persistEdit(clientId, sectionId, fieldId, next);
    setConfirmed(true);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
            }}
            rows={3}
            className="flex-1 bg-white/5 border border-gold/40 rounded px-2 py-1.5 text-[14px] text-foreground focus:outline-none focus:border-gold resize-y"
          />
        ) : (
          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            className="flex-1 bg-white/5 border border-gold/40 rounded px-2 py-1 text-[14px] text-foreground focus:outline-none focus:border-gold"
          />
        )}
        <button
          type="button"
          onClick={commit}
          aria-label="Save"
          className="shrink-0 p-1 rounded text-success hover:bg-success/10"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={cancel}
          aria-label="Cancel"
          className="shrink-0 p-1 rounded text-muted-foreground hover:bg-white/5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const empty = !value || value === "—";
  const showUnconfirmed = unconfirmed && !confirmed && !empty;

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title={
        showUnconfirmed
          ? "Read from an unfinished session and not confirmed by the client. Edit to confirm."
          : undefined
      }
      className={cn(
        "group inline-flex items-start gap-1.5 text-left text-[14px] leading-snug",
        empty
          ? "text-warning/85 italic"
          : "text-foreground/90 hover:text-gold transition-colors",
      )}
    >
      <span
        className={cn(
          showUnconfirmed &&
            "decoration-dotted underline underline-offset-4 decoration-gold/50",
        )}
      >
        {empty ? "Not collected" : value}
      </span>
      {showUnconfirmed && (
        <span className="mt-[3px] shrink-0 rounded border border-gold/30 px-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-gold/70">
          Unconfirmed
        </span>
      )}
      <Pencil className="h-3 w-3 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
    </button>
  );
}
