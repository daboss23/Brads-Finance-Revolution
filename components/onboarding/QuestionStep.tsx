"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, ArrowRight } from "lucide-react";
import { type Question } from "@/lib/onboarding-questions";
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

type Props = {
  question: Question;
  questionNumber: number;
  totalInSection: number;
  value: string;
  onChange: (val: string) => void;
  onContinue: () => void;
};

export function QuestionStep({
  question,
  questionNumber,
  totalInSection,
  value,
  onChange,
  onContinue,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedOption, setSelectedOption] = useState(value);

  const { isListening, isSupported, start, stop } = useSpeechRecognition((text) => {
    onChange(text);
  });

  useEffect(() => {
    setSelectedOption(value);
  }, [question.id, value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (question.type === "textarea") textareaRef.current?.focus();
      else if (question.type === "text") inputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [question.id, question.type]);

  function handleSelectOption(opt: string) {
    setSelectedOption(opt);
    onChange(opt);
  }

  function handleMic() {
    if (isListening) stop();
    else start();
  }

  const canContinue = question.type === "select" ? !!selectedOption : value.trim().length > 0;

  return (
    <div className="onboarding-fade-in">
      {/* Question counter */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/35">
          {questionNumber} of {totalInSection}
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {/* Question text */}
      <h2 className="text-[22px] font-semibold tracking-tight text-foreground leading-snug mb-2">
        {question.text}
      </h2>

      {question.subtext && (
        <p className="text-[13px] text-muted-foreground/55 mb-7 leading-relaxed">
          {question.subtext}
        </p>
      )}

      {!question.subtext && <div className="mb-7" />}

      {/* Select options */}
      {question.type === "select" && question.options && (
        <div className="flex flex-col gap-2 mb-8">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelectOption(opt)}
              className={cn(
                "w-full text-left px-5 py-3.5 rounded-lg border text-[13.5px] font-medium transition-all duration-200",
                selectedOption === opt
                  ? "border-gold/60 bg-gold/[0.08] text-gold"
                  : "border-border/60 bg-card text-foreground/70 hover:border-border hover:text-foreground/90 hover:bg-card-elevated"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Text input */}
      {question.type === "text" && (
        <div className="relative mb-8">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            onKeyDown={(e) => e.key === "Enter" && canContinue && onContinue()}
            className="w-full glass-card/60 rounded-lg px-5 py-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all pr-14"
          />
          <MicButton
            isListening={isListening}
            isSupported={isSupported}
            onClick={handleMic}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      )}

      {/* Textarea input */}
      {question.type === "textarea" && (
        <div className="relative mb-8">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={3}
            className="w-full glass-card/60 rounded-lg px-5 py-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none pr-14"
          />
          <MicButton
            isListening={isListening}
            isSupported={isSupported}
            onClick={handleMic}
            className="absolute right-3 top-3.5"
          />
          {isListening && (
            <div className="flex items-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[11px] text-gold/70">Listening…</span>
            </div>
          )}
        </div>
      )}

      {/* Continue */}
      <Button
        onClick={onContinue}
        disabled={!canContinue}
        className="w-full bg-gold text-background hover:bg-gold/90 font-semibold text-[13.5px] py-3 h-auto rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-30"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* XP hint */}
      <p className="text-center text-[11px] text-muted-foreground/30 mt-3">
        +{question.xp} XP for this answer
      </p>
    </div>
  );
}

function MicButton({
  isListening,
  isSupported,
  onClick,
  className,
}: {
  isListening: boolean;
  isSupported: boolean | null;
  onClick: () => void;
  className?: string;
}) {
  if (isSupported === false) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      title={isListening ? "Stop recording" : "Speak your answer"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200",
        isListening
          ? "text-gold bg-gold/15 ring-1 ring-gold/30"
          : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-muted/50",
        className
      )}
    >
      {isListening ? (
        <MicOff className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
