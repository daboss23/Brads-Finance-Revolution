"use client";

import { useMemo, useState } from "react";
import { getLinkByToken } from "@/lib/sarah-data";
import { FACT_FIND_SECTIONS, type Field } from "@/lib/fact-find-flow";
import { ProgressHeader } from "./ProgressHeader";
import { IntroScreen } from "./IntroScreen";
import { QuestionCard } from "./QuestionCard";
import { SectionComplete } from "./SectionComplete";
import { CompletionCertificate } from "./CompletionCertificate";

const XP_PER_QUESTION = 25;
const XP_SECTION_BONUS = 100;

type FlatQuestion = {
  globalIndex: number;
  sectionIndex: number;
  sectionId: string;
  sectionTitle: string;
  fieldIndexInSection: number;
  totalFieldsInSection: number;
  isFirstInSection: boolean;
  isLastInSection: boolean;
  field: Field;
};

const FLAT_QUESTIONS: FlatQuestion[] = FACT_FIND_SECTIONS.flatMap((section, si) =>
  section.fields.map((field, fi) => ({
    globalIndex: FACT_FIND_SECTIONS.slice(0, si).reduce((sum, s) => sum + s.fields.length, 0) + fi,
    sectionIndex: si,
    sectionId: section.id,
    sectionTitle: section.title,
    fieldIndexInSection: fi,
    totalFieldsInSection: section.fields.length,
    isFirstInSection: fi === 0,
    isLastInSection: fi === section.fields.length - 1,
    field,
  }))
);

const TOTAL_QUESTIONS = FLAT_QUESTIONS.length;

function getFirstName(fullName: string): string {
  if (fullName.includes("&")) return fullName.split(" ").slice(0, -1).join(" ");
  return fullName.split(" ")[0];
}

function getSarahMessage(pct: number): string {
  if (pct === 0) return "Take your time — I'll guide you through each question clearly.";
  if (pct < 15) return "Good start. Keep going — this builds quickly.";
  if (pct < 30) return "You're making real progress. Most clients finish in under 20 minutes.";
  if (pct < 50) return "Nearly halfway there. You're doing great.";
  if (pct < 65) return "Halfway through your Financial Discovery. Excellent work.";
  if (pct < 80) return "The most detailed sections are behind you now.";
  if (pct < 90) return "Nearly there. Just a few questions remaining.";
  return "Final section — you're almost done.";
}

type Phase = "intro" | "question" | "section-complete" | "complete";

type Props = { token: string };

export function OnboardingFlow({ token }: Props) {
  const link = getLinkByToken(token);
  const clientFullName = link?.clientName ?? "there";
  const firstName = getFirstName(clientFullName);

  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [xp, setXp] = useState(0);
  const [sectionsComplete, setSectionsComplete] = useState(0);
  const [justCompletedSectionId, setJustCompletedSectionId] = useState<string | null>(null);

  const current = FLAT_QUESTIONS[qIndex];
  const overallPct = Math.round((qIndex / TOTAL_QUESTIONS) * 100);
  const sarahMessage = getSarahMessage(overallPct);

  const sectionIntro = useMemo(() => {
    if (!current?.isFirstInSection) return null;
    return FACT_FIND_SECTIONS[current.sectionIndex]?.sarahIntro ?? null;
  }, [current?.sectionIndex, current?.isFirstInSection]);

  function handleBegin() {
    setInput(answers[FLAT_QUESTIONS[0].field.id] ?? "");
    setPhase("question");
  }

  function handleContinue() {
    const q = current;
    const answer = input.trim();

    // Save answer
    setAnswers((prev) => ({ ...prev, [q.field.id]: answer }));

    const nextIndex = qIndex + 1;

    if (q.isLastInSection) {
      // Award question XP + section bonus
      setXp((prev) => prev + XP_PER_QUESTION + XP_SECTION_BONUS);
      setSectionsComplete((prev) => prev + 1);
      setJustCompletedSectionId(q.sectionId);
      // Advance index now so SectionComplete knows where to go
      setQIndex(nextIndex);
      setPhase("section-complete");
    } else {
      setXp((prev) => prev + XP_PER_QUESTION);
      setQIndex(nextIndex);
      setInput(answers[FLAT_QUESTIONS[nextIndex]?.field.id] ?? "");
    }
  }

  function handleBack() {
    if (qIndex === 0) {
      setPhase("intro");
      return;
    }
    const prevIndex = qIndex - 1;
    setQIndex(prevIndex);
    setInput(answers[FLAT_QUESTIONS[prevIndex].field.id] ?? "");
  }

  function handleSectionContinue() {
    if (qIndex >= TOTAL_QUESTIONS) {
      setPhase("complete");
    } else {
      setInput(answers[FLAT_QUESTIONS[qIndex].field.id] ?? "");
      setPhase("question");
    }
  }

  const completedDate = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (phase === "intro") {
    return <IntroScreen firstName={firstName} onBegin={handleBegin} />;
  }

  if (phase === "complete") {
    return (
      <CompletionCertificate
        clientFullName={clientFullName}
        xpEarned={xp}
        completedDate={completedDate}
      />
    );
  }

  if (phase === "section-complete" && justCompletedSectionId) {
    const isLastSection = qIndex >= TOTAL_QUESTIONS;
    return (
      <SectionComplete
        sectionId={justCompletedSectionId}
        sectionsComplete={sectionsComplete}
        totalSections={FACT_FIND_SECTIONS.length}
        isLastSection={isLastSection}
        onContinue={handleSectionContinue}
      />
    );
  }

  if (phase === "question" && current) {
    return (
      <div className="min-h-screen flex flex-col">
        <ProgressHeader
          sectionName={current.sectionTitle}
          sectionNumber={current.sectionIndex + 1}
          totalSections={FACT_FIND_SECTIONS.length}
          overallPct={overallPct}
          xp={xp}
        />

        <div className="flex-1 flex items-center justify-center px-6 pt-20 pb-12">
          <div className="w-full max-w-lg">
            {/* Sarah message */}
            <div className="flex items-start gap-3 mb-8">
              <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 border border-gold/25 mt-0.5">
                <span className="text-[9px] font-bold text-gold">SA</span>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gold/55 mb-1">
                  Sarah · BMK Onboarding
                </p>
                <p className="text-[13px] text-muted-foreground/65 leading-relaxed">
                  {sarahMessage}
                </p>
              </div>
            </div>

            <QuestionCard
              key={`${current.sectionId}-${current.fieldIndexInSection}`}
              field={current.field}
              sectionIntro={sectionIntro}
              questionNumber={current.fieldIndexInSection + 1}
              totalInSection={current.totalFieldsInSection}
              value={input}
              onChange={(val) => setInput(val)}
              onContinue={handleContinue}
              onBack={handleBack}
              canGoBack={qIndex > 0}
              xpPerQuestion={XP_PER_QUESTION}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
