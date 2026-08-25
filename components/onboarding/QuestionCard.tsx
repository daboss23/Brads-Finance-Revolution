"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, ArrowRight, ChevronLeft, SkipForward, Sparkles } from "lucide-react";
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
  onSkip: () => void;
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
  onSkip,
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
  const hasAnswer = isSelect ? !!value : value.trim().length > 0;

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && field.type !== "textarea") {
      e.preventDefault();
      onContinue();
    }
  }

  const baseInput =
    "w-full rounded-lg glass-card px-4 py-3.5 text-[14.5px] text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all";

  return (
    <div className="onboarding-fade-in space-y-6">
      {/* Section intro — BMK Sarah card pattern */}
      {sectionIntro && (
        <div className="rounded-lg glass-card overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />
            <div className="flex-1 px-5 py-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold">Sarah</p>
              </div>
              <p className="text-[14px] text-foreground/80 leading-relaxed">{sectionIntro}</p>
            </div>
          </div>
        </div>
      )}

      {/* Question counter */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-muted-foreground/60">
          Question {questionNumber} of {totalInSection}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Question */}
      <div>
        <h2 className="text-[27px] font-semibold tracking-tight text-foreground leading-snug mb-2">
          {field.label}
        </h2>
        {field.hint && (
          <p className="text-[13.5px] text-muted-foreground/75 leading-relaxed">{field.hint}</p>
        )}
        {field.optional && !field.hint && (
          <p className="text-[13px] text-muted-foreground/65">Optional — skip if not applicable.</p>
        )}
      </div>

      {/* Input area */}
      <div>
        {/* Select / radio */}
        {isSelect && field.options && (
          <div className="flex flex-col gap-2">
            {field.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className={cn(
                  "w-full text-left px-5 py-3.5 rounded-lg border text-[14px] font-medium transition-all duration-150",
                  value === opt
                    ? "border-gold/55 bg-gold/[0.08] text-gold"
                    : "border-border bg-card text-foreground/85 hover:border-gold/30 hover:text-foreground hover:bg-gold/[0.02]"
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14.5px] text-muted-foreground/65 pointer-events-none">
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
              className={cn(baseInput, "pl-8 pr-14")}
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
              className={cn(baseInput, "resize-none pr-14")}
            />
            <MicBtn isListening={isListening} isSupported={isSupported} onToggle={() => isListening ? stop() : start()} className="absolute right-3 top-3.5" />
            {isListening && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[11.5px] text-gold/80">Listening…</span>
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
              className={cn(baseInput, VOICE_TYPES.has(field.type) ? "pr-14" : "")}
            />
            {VOICE_TYPES.has(field.type) && (
              <MicBtn isListening={isListening} isSupported={isSupported} onToggle={() => isListening ? stop() : start()} className="absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
        )}

        {/* Voice hint */}
        {!isSelect && isSupported !== false && !isListening && (
          <p className="mt-2 text-[12px] text-muted-foreground/55">
            Prefer to speak? Tap the microphone to answer out loud.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {canGoBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded border border-border px-4 py-3 text-[13px] font-medium text-muted-foreground/70 hover:text-foreground hover:border-gold/30 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <button
          onClick={onContinue}
          className="flex-1 flex items-center justify-center gap-2 rounded bg-gold py-3.5 text-[14px] font-semibold text-gold-foreground hover:bg-gold/90 active:scale-[0.99] transition-all"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Skip + XP */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground/55 hover:text-foreground/80 transition-colors py-1"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Pass for now
        </button>
        <span className={cn(
          "text-[12px] font-medium tabular-nums transition-colors",
          hasAnswer ? "text-gold/70" : "text-muted-foreground/45"
        )}>
          +{xpPerQuestion} XP
        </span>
      </div>
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
      title={isListening ? "Stop listening" : "Speak your answer"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border transition-all",
        isListening
          ? "text-gold bg-gold/20 border-gold/45 onboarding-mic-live"
          : "text-gold/80 bg-gold/10 border-gold/30 hover:text-gold hover:bg-gold/20",
        className
      )}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
