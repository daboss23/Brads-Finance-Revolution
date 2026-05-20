"use client";

import { useState, useMemo } from "react";
import { type Client } from "@/lib/data";
import {
  QUESTIONS,
  SECTIONS,
  SECTION_XP_BONUS,
} from "@/lib/onboarding-questions";
import { IntroScreen } from "./IntroScreen";
import { QuestionStep } from "./QuestionStep";
import { SarahPresence } from "./SarahPresence";
import { ProgressRail } from "./ProgressRail";
import { SectionMilestone } from "./SectionMilestone";
import { CompletionCertificate } from "./CompletionCertificate";

type Phase = "intro" | "question" | "section-milestone" | "complete";

function getFirstName(fullName: string): string {
  if (fullName.includes("&")) {
    const parts = fullName.split(" ");
    return parts.slice(0, -1).join(" ");
  }
  return fullName.split(" ")[0];
}

function getSarahMessage(
  questionIndex: number,
  totalQuestions: number,
  sectionName: string,
  sectionTransition: boolean
): string {
  const pct = Math.round((questionIndex / totalQuestions) * 100);

  if (sectionTransition) {
    return SECTIONS.find((s) => s.name === sectionName)?.transitionMessage ?? "";
  }

  if (pct === 0) return "Take your time with each answer — there's no rush.";
  if (pct < 25) return "You're doing well. Keep going.";
  if (pct < 40) return "Great start — most clients complete this in under 15 minutes.";
  if (pct < 55) return "Halfway there. You're building a strong picture for Brad.";
  if (pct < 70) return "You're making excellent progress. Nearly through the essentials.";
  if (pct < 85) return "Almost there — just a few more questions to go.";
  if (pct < 95) return "You're in the final stretch. Brad will have everything he needs.";
  return "Last question. You've done a great job.";
}

export function OnboardingFlow({ client }: { client: Client }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState("");
  const [xp, setXp] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [pendingMilestionSectionIndex, setPendingMilestoneSectionIndex] =
    useState<number | null>(null);
  const [isSectionTransition, setIsSectionTransition] = useState(false);

  const clientFirstName = getFirstName(client.name);
  const currentQuestion = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;

  const questionsInCurrentSection = useMemo(
    () =>
      QUESTIONS.filter((q) => q.sectionIndex === currentQuestion?.sectionIndex),
    [currentQuestion?.sectionIndex]
  );

  const questionNumberInSection = useMemo(() => {
    if (!currentQuestion) return 0;
    return (
      questionsInCurrentSection.findIndex((q) => q.id === currentQuestion.id) +
      1
    );
  }, [currentQuestion, questionsInCurrentSection]);

  const overallPct = Math.round((currentIndex / totalQuestions) * 100);
  const currentSection = SECTIONS[currentQuestion?.sectionIndex ?? 0];

  function handleBegin() {
    setIsSectionTransition(true);
    setPhase("question");
  }

  function handleAnswer() {
    const q = QUESTIONS[currentIndex];
    const answer = currentInput.trim() || answers[q.id] || "";

    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);

    const nextIndex = currentIndex + 1;
    const isLastQuestionInSection =
      nextIndex >= totalQuestions ||
      QUESTIONS[nextIndex]?.sectionIndex !== q.sectionIndex;

    if (isLastQuestionInSection) {
      setXp((prev) => prev + q.xp + SECTION_XP_BONUS);
      setCompletedSections((prev) => [...prev, q.sectionIndex]);
      setPendingMilestoneSectionIndex(q.sectionIndex);

      if (nextIndex >= totalQuestions) {
        setPhase("section-milestone");
      } else {
        setPhase("section-milestone");
        setCurrentIndex(nextIndex);
      }
    } else {
      setXp((prev) => prev + q.xp);
      setCurrentIndex(nextIndex);
      setCurrentInput(newAnswers[QUESTIONS[nextIndex]?.id] ?? "");
      setIsSectionTransition(false);
    }
  }

  function handleMilestoneNext() {
    const nextQuestion = QUESTIONS[currentIndex];
    if (!nextQuestion) {
      setPhase("complete");
      return;
    }
    setCurrentInput(answers[nextQuestion.id] ?? "");
    setIsSectionTransition(true);
    setPendingMilestoneSectionIndex(null);
    setPhase("question");
  }

  const sarahMessage = getSarahMessage(
    currentIndex,
    totalQuestions,
    currentSection?.name ?? "",
    isSectionTransition
  );

  const completedDate = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (phase === "intro") {
    return <IntroScreen clientFirstName={clientFirstName} onBegin={handleBegin} />;
  }

  if (phase === "complete") {
    return (
      <CompletionCertificate
        clientName={client.name}
        xpEarned={xp}
        completedDate={completedDate}
      />
    );
  }

  if (phase === "section-milestone" && pendingMilestionSectionIndex !== null) {
    const milestoneSection = SECTIONS[pendingMilestionSectionIndex];
    const isLastSection = pendingMilestionSectionIndex === SECTIONS.length - 1;
    return (
      <SectionMilestone
        section={milestoneSection}
        sectionsCompleted={completedSections.length}
        totalSections={SECTIONS.length}
        onContinue={handleMilestoneNext}
        isLastSection={isLastSection}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <ProgressRail
        currentSection={currentSection?.shortName ?? ""}
        sectionNumber={(currentQuestion?.sectionIndex ?? 0) + 1}
        totalSections={SECTIONS.length}
        overallPct={overallPct}
        xp={xp}
      />

      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-16 pb-12">
        <div className="w-full max-w-lg">
          <SarahPresence message={sarahMessage} />
          <QuestionStep
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={questionNumberInSection}
            totalInSection={questionsInCurrentSection.length}
            value={currentInput}
            onChange={(val) => {
              setCurrentInput(val);
              setIsSectionTransition(false);
            }}
            onContinue={handleAnswer}
          />
        </div>
      </div>
    </div>
  );
}
