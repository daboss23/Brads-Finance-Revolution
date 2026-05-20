"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, ArrowRight, ChevronLeft } from "lucide-react";
import { type Field } from "@/lib/fact-find-flow";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

type Props = {
  field: Field;
  sectionIntro: string | null;
  questionNumber: number;
  totalInSection: number;
  value: string;
  onChange: (val: string) => void;
  onContinue: () => void;
  onBack: () => void;
  canGoBack: boolean;
  xpPerQuestion: number;
};

const VOICE_TYPES = new Set(["text", "email", "tel", "number", "currency", "textarea"]);

export function QuestionCard({
  field,
  sectionIntro,
  questionNumber,
  totalInSection,
  value,
  onChange,
  onContinue,
  onBack,
  canGoBack,
  xpPerQuestion,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, isSupported, start, stop } = useSpeechRecognition(onChange);

  useEffect(() => {
    const t = setTimeout(() => {
      if (field.type === "textarea") textareaRef.current?.focus();
      else if (field.type !== "select" && field.type !== "radio") inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [field.id, field.type]);

  const isSelect = field.type === "select" || field.type === "radio";
  const canContinue = isSelect ? !!value : value.trim().length > 0;

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && canContinue && field.type !== "textarea") {
      e.preventDefault();
      onContinue();
    }
  }

  const baseInput =
    "w-full rounded-lg border border-border/60 bg-card px-4 py-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/15 transition-all";

  return (
    <div className="onboarding-fade-in space-y-6">
      {/* Section intro — only on first question of each section */}
      {sectionIntro && (
        <div className="rounded-lg border border-gold/15 bg-gold/[0.03] px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
              <span className="text-[7px] font-bold text-gold">SA</span>
            </div>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gold/60">Sarah</span>
          </div>
          <p className="text-[13px] text-muted-foreground/65 leading-relaxed">{sectionIntro}</p>
        </div>
      )}

      {/* Question counter */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/30">
          {questionNumber} of {totalInSection}
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {/* Question */}
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground leading-snug mb-1.5">
          {field.label}
        </h2>
        {field.hint && (
          <p className="text-[13px] text-muted-foreground/50 leading-relaxed">{field.hint}</p>
        )}
        {field.optional && !field.hint && (
          <p className="text-[12px] text-muted-foreground/35">Optional — skip if not applicable.</p>
        )}
      </div>

      {/* Input area */}
      <div>
        {/* Select / radio — option cards */}
        {isSelect && field.options && (
          <div className="flex flex-col gap-2">
            {field.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className={cn(
                  "w-full text-left px-5 py-3.5 rounded-lg border text-[13.5px] font-medium transition-all duration-150",
                  value === opt
                    ? "border-gold/50 bg-gold/[0.07] text-gold"
                    : "border-border/60 bg-card text-foreground/70 hover:border-border hover:text-foreground/85 hover:bg-card-elevated"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Currency */}
        {field.type === "currency" && (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground/45 pointer-events-none">
              $
            </span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKey}
              placeholder={field.placeholder ?? "0"}
              className={cn(baseInput, "pl-8 pr-12")}
            />
            <MicBtn isListening={isListening} isSupported={isSupported} onToggle={() => isListening ? stop() : start()} className="absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        )}

        {/* Textarea */}
        {field.type === "textarea" && (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={cn(baseInput, "resize-none pr-12")}
            />
            <MicBtn isListening={isListening} isSupported={isSupported} onToggle={() => isListening ? stop() : start()} className="absolute right-3 top-3.5" />
            {isListening && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[11px] text-gold/60">Listening…</span>
              </div>
            )}
          </div>
        )}

        {/* Text / email / tel / number / date */}
        {!isSelect && field.type !== "currency" && field.type !== "textarea" && (
          <div className="relative">
            <input
              ref={inputRef}
              type={field.type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKey}
              placeholder={field.placeholder}
              className={cn(baseInput, VOICE_TYPES.has(field.type) ? "pr-12" : "")}
            />
            {VOICE_TYPES.has(field.type) && (
              <MicBtn isListening={isListening} isSupported={isSupported} onToggle={() => isListening ? stop() : start()} className="absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {canGoBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 px-4 py-3 text-[13px] font-medium text-muted-foreground/55 hover:text-foreground/75 hover:border-border transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gold py-3 text-[13.5px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/25">
        +{xpPerQuestion} XP
      </p>
    </div>
  );
}

function MicBtn({
  isListening,
  isSupported,
  onToggle,
  className,
}: {
  isListening: boolean;
  isSupported: boolean | null;
  onToggle: () => void;
  className?: string;
}) {
  if (isSupported === false) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isListening ? "Stop" : "Speak your answer"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-all",
        isListening
          ? "text-gold bg-gold/15 ring-1 ring-gold/30"
          : "text-muted-foreground/35 hover:text-muted-foreground/60 hover:bg-muted/50",
        className
      )}
    >
      {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
    </button>
  );
}
