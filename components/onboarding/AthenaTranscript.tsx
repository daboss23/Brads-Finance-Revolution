"use client";

import { useEffect, useRef } from "react";

export type TranscriptEntry = {
  index: number;
  role: "user" | "assistant";
  text: string;
};

type Props = {
  entries: TranscriptEntry[];
  /** Text-mode only: the last client answer can be corrected and resent. */
  editableIndex?: number;
  editDisabled?: boolean;
  onEdit?: (index: number) => void;
};

// Scrollback for the session.
//
// Sticks to the bottom while new turns land, but stops following the moment
// the client scrolls up to re-read something, so reviewing an earlier answer
// is not yanked away by Athena's next question.
export function AthenaTranscript({
  entries,
  editableIndex,
  editDisabled,
  onEdit,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [entries]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 48;
  }

  if (entries.length === 0) return null;

  return (
    <div className="mt-6 w-full max-w-[720px] mx-auto">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Conversation transcript"
        className="onboarding-transcript flex max-h-[300px] flex-col gap-3 overflow-y-auto scroll-smooth px-1 py-1"
      >
        {entries.map((entry) =>
          entry.role === "user" ? (
            <div
              key={entry.index}
              className="flex flex-col items-end self-end max-w-[85%]"
            >
              <div className="bg-gold/[0.08] border border-gold/20 rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-[inset_0_1px_0_hsl(44_75%_85%/0.08)]">
                <p className="text-[14px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>
              {onEdit && entry.index === editableIndex && (
                <button
                  type="button"
                  onClick={() => onEdit(entry.index)}
                  disabled={editDisabled}
                  className="mt-1 text-[11px] text-gold/80 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Edit answer
                </button>
              )}
            </div>
          ) : (
            <div
              key={entry.index}
              className="flex flex-col items-start self-start max-w-[85%]"
            >
              <div className="glass-chip rounded-2xl rounded-tl-sm border-foreground/10 px-4 py-2.5">
                <p className="text-[14px] text-foreground/75 leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>
            </div>
          ),
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
        Scroll to review anything you have already said.
      </p>
    </div>
  );
}
