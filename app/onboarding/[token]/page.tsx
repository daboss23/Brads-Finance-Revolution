"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, X } from "lucide-react";
import { getLinkByToken } from "@/lib/sarah-data";
import { FACT_FIND_SECTIONS, type Field } from "@/lib/fact-find-flow";
import { cn } from "@/lib/utils";

const TOTAL_SECTIONS = FACT_FIND_SECTIONS.length;

export default function OnboardingPage({
  params,
}: {
  params: { token: string };
}) {
  const link = getLinkByToken(params.token);
  const clientName = link?.clientName ?? "there";
  const firstName = clientName.split(" ")[0];

  // step: -1 = welcome, 0..9 = sections, 10 = complete
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveModal, setSaveModal] = useState(false);

  const isWelcome = step === -1;
  const isComplete = step === TOTAL_SECTIONS;
  const currentSection = !isWelcome && !isComplete ? FACT_FIND_SECTIONS[step] : null;
  const progress = isWelcome ? 0 : isComplete ? 100 : Math.round((step / TOTAL_SECTIONS) * 100);

  function next() {
    if (step < TOTAL_SECTIONS) setStep((s) => s + 1);
  }
  function back() {
    if (step > -1) setStep((s) => s - 1);
  }
  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
      <div className="border-b border-border/50 bg-[hsl(224,22%,4%)]">
        {/* Progress bar */}
        {!isWelcome && (
          <progress
            value={progress}
            max={100}
            className={cn("bmk-progress w-full rounded-none", isComplete ? "" : "")}
          />
        )}
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <span className="bmk-letter-pulse text-[22px] font-bold text-gold leading-none">B</span>
            <span className="text-[22px] font-bold text-white/88 leading-none">M</span>
            <span className="bmk-letter-pulse text-[22px] font-bold text-gold leading-none">K</span>
            <div className="ml-2 h-4 w-px bg-border/60" />
            <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground/50 uppercase">
              Financial Services
            </span>
          </div>
          {!isWelcome && !isComplete && (
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-muted-foreground/50">
                Section {step + 1} of {TOTAL_SECTIONS}
              </span>
              <span className="text-[12px] font-medium text-gold tabular-nums">
                {progress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-[660px]">

          {/* WELCOME SCREEN */}
          {isWelcome && (
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mt-1">
                  <Sparkles className="h-4.5 w-4.5 text-gold" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gold mb-2">
                    Sarah · BMK Onboarding Guide
                  </p>
                  <h1 className="text-[36px] font-semibold tracking-tight text-foreground leading-tight">
                    Hi, {firstName}.
                  </h1>
                  <h2 className="text-[24px] font-medium text-muted-foreground/70 leading-snug mt-1">
                    I'm here to guide you through your financial fact find.
                  </h2>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex">
                  <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/60 via-gold/20 to-transparent" />
                  <div className="px-7 py-6 space-y-4">
                    <p className="text-[14px] text-foreground/80 leading-relaxed">
                      This fact find is a crucial first step in building your personalised financial plan with Brad Lonergan and the BMK team. I'll guide you through it step by step — clearly, calmly, and at your own pace.
                    </p>
                    <p className="text-[14px] text-foreground/70 leading-relaxed">
                      There are <strong className="text-foreground/90 font-semibold">{TOTAL_SECTIONS} sections</strong> in total. Most clients complete it in around <strong className="text-foreground/90 font-semibold">15–20 minutes</strong>. You can save your progress at any point and return later using this same link.
                    </p>
                    <p className="text-[14px] text-foreground/70 leading-relaxed">
                      Estimates are perfectly fine — we'll refine everything together during your planning meeting. The goal right now is simply to get a clear picture of your situation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Sections", value: TOTAL_SECTIONS.toString() },
                  { label: "Est. time", value: "15–20 min" },
                  { label: "Adviser", value: "Brad Lonergan" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-border bg-card px-5 py-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45 mb-2">
                      {label}
                    </p>
                    <p className="text-[15px] font-semibold text-foreground/85">{value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={next}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold py-4 text-[14px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors"
              >
                Begin your fact find
                <ChevronRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[12px] text-muted-foreground/40">
                Your information is secure and will only be shared with your BMK adviser.
              </p>
            </div>
          )}

          {/* SECTION SCREEN */}
          {currentSection && (
            <div className="space-y-7">
              {/* Section header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/10 border border-gold/25 shrink-0">
                    <Sparkles className="h-2.5 w-2.5 text-gold" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold/80">
                    Sarah
                  </span>
                </div>
                <h2 className="text-[26px] font-semibold tracking-tight text-foreground leading-tight mb-1">
                  {currentSection.title}
                </h2>
                <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground/40">
                  Section {step + 1} of {TOTAL_SECTIONS}
                </p>
              </div>

              {/* Sarah guidance */}
              <div className="rounded-lg border border-gold/20 bg-gold/[0.04] px-5 py-4">
                <p className="text-[13px] text-foreground/70 leading-relaxed">
                  {currentSection.sarahIntro}
                </p>
              </div>

              {/* Form fields */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-6 py-6 space-y-5">
                  {currentSection.fields.map((field) => (
                    <FormField
                      key={field.id}
                      field={field}
                      value={answers[field.id] ?? ""}
                      onChange={(val) => setAnswer(field.id, val)}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={back}
                  className="inline-flex items-center gap-1.5 rounded border border-border/70 px-5 py-3 text-[13px] font-medium text-muted-foreground/70 hover:text-foreground/85 hover:border-border hover:bg-white/[0.04] transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSaveModal(true)}
                    className="rounded border border-border/50 px-4 py-3 text-[12px] text-muted-foreground/50 hover:text-muted-foreground/70 hover:border-border/70 transition-all"
                  >
                    Save &amp; continue later
                  </button>
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-2 rounded bg-gold px-6 py-3 text-[13px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors"
                  >
                    {step === TOTAL_SECTIONS - 1 ? "Complete" : "Continue"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {FACT_FIND_SECTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-full transition-all",
                      i === step
                        ? "h-1.5 w-4 bg-gold"
                        : i < step
                        ? "h-1.5 w-1.5 bg-gold/40"
                        : "h-1.5 w-1.5 bg-border"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* COMPLETION SCREEN */}
          {isComplete && (
            <div className="space-y-8 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-800/50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
              </div>

              <div>
                <h1 className="text-[32px] font-semibold tracking-tight text-foreground">
                  All done, {firstName}.
                </h1>
                <p className="mt-3 text-[16px] text-muted-foreground/65 leading-relaxed max-w-[480px] mx-auto">
                  Your fact find is complete and has been submitted to{" "}
                  <span className="text-foreground/80 font-medium">Brad Lonergan</span> at BMK Financial Services.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden max-w-[480px] mx-auto">
                <div className="flex">
                  <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/60 via-gold/20 to-transparent" />
                  <div className="px-6 py-5 text-left">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gold mb-2">
                      What happens next
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        "Brad will review your fact find over the next 1–2 business days.",
                        "You'll receive a call to schedule your first planning meeting.",
                        "Your personalised financial plan will be prepared ahead of the meeting.",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold/50" />
                          <p className="text-[13px] text-foreground/70 leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-baseline gap-[1px]">
                  <span className="bmk-letter-pulse text-[28px] font-bold text-gold leading-none">B</span>
                  <span className="text-[28px] font-bold text-white/88 leading-none">M</span>
                  <span className="bmk-letter-pulse text-[28px] font-bold text-gold leading-none">K</span>
                </div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground/40 font-medium">
                  Financial Services
                </p>
                <p className="text-[11px] text-muted-foreground/30 mt-1">
                  Plan · Grow · Prosper
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save & continue modal */}
      {saveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <p className="text-[14px] font-semibold text-foreground">Progress saved</p>
              <button
                onClick={() => setSaveModal(false)}
                className="text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-[13px] text-muted-foreground/70 leading-relaxed">
                Your progress has been saved. Use this link to return and complete your fact find at any time:
              </p>
              <div className="rounded border border-border bg-muted px-4 py-3">
                <p className="text-[12px] text-muted-foreground font-mono break-all">
                  {typeof window !== "undefined" ? window.location.href : ""}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground/45">
                This link is unique to you. Keep it safe — it will take you directly back to where you left off.
              </p>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-border">
              <button
                onClick={() => setSaveModal(false)}
                className="rounded bg-gold px-4 py-2 text-[13px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  const baseInput =
    "w-full rounded border border-border bg-muted px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-[12px] font-semibold text-muted-foreground/70 uppercase tracking-[0.1em]">
          {field.label}
        </label>
        {field.optional && (
          <span className="text-[10px] text-muted-foreground/35 border border-border/50 rounded px-1.5 py-0.5">
            optional
          </span>
        )}
      </div>

      {field.hint && (
        <p className="text-[11px] text-muted-foreground/45 leading-relaxed">
          {field.hint}
        </p>
      )}

      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseInput, "appearance-none cursor-pointer")}
        >
          <option value="" disabled>
            Select an option
          </option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={cn(baseInput, "resize-none")}
        />
      ) : field.type === "currency" ? (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground/50 pointer-events-none">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? "0"}
            className={cn(baseInput, "pl-7")}
          />
        </div>
      ) : (
        <input
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput}
        />
      )}
    </div>
  );
}
