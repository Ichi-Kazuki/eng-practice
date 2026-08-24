"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { QuestionStem } from "@/components/question-stem";
import { cn } from "@/lib/utils";

export type ResultQuestion = {
  id: string;
  stem: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  questionType: string;
  typeLabel?: string;
  selectedIndex: number | null;
  isCorrect?: boolean;
  passage?: { id: string; title: string; body: string } | null;
};

export type ResultSection = {
  id: string;
  label?: string;
  questions: ResultQuestion[];
};

type ResultStatus = "correct" | "incorrect" | "unanswered";

function getResultStatus(question: ResultQuestion): ResultStatus {
  if (question.selectedIndex === null) return "unanswered";
  return (question.isCorrect ?? question.selectedIndex === question.correctIndex) ? "correct" : "incorrect";
}

function statusLabel(status: ResultStatus) {
  switch (status) {
    case "correct":
      return "正解";
    case "incorrect":
      return "不正解";
    case "unanswered":
      return "未解答";
  }
}

function StatusMark({ status, className }: { status: ResultStatus; className?: string }) {
  if (status === "correct") {
    return <CheckCircleIcon weight="fill" className={cn("size-4 text-success", className)} aria-hidden="true" />;
  }
  if (status === "incorrect") {
    return <XCircleIcon weight="fill" className={cn("size-4 text-destructive", className)} aria-hidden="true" />;
  }
  return <span className={cn("text-[10px] font-medium leading-none text-muted-foreground", className)}>未解答</span>;
}

function StatusLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <CheckCircleIcon weight="fill" className="size-3.5 text-success" aria-hidden="true" />
        正解
      </span>
      <span className="flex items-center gap-1.5">
        <XCircleIcon weight="fill" className="size-3.5 text-destructive" aria-hidden="true" />
        不正解
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-flex size-3.5 items-center justify-center rounded border border-border" aria-hidden="true" />
        未解答
      </span>
    </div>
  );
}

export function ResultQuestionReview({
  sections,
  className,
}: {
  sections: ResultSection[];
  className?: string;
}) {
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const questionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToQuestion = useCallback((questionId: string) => {
    window.requestAnimationFrame(() => {
      const element = questionRefs.current[questionId];
      if (!element) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  }, []);

  function openFromNavigator(questionId: string) {
    setOpenQuestionId(questionId);
    scrollToQuestion(questionId);
  }

  function toggleQuestion(questionId: string) {
    setOpenQuestionId((current) => (current === questionId ? null : questionId));
  }

  return (
    <div className={cn("space-y-8", className)}>
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.label ? `${section.id}-label` : undefined}>
          {section.label && (
            <h3 id={`${section.id}-label`} className="text-sm font-medium text-foreground">
              {section.label}
            </h3>
          )}

          <nav
            className={cn(section.label ? "mt-2" : "")}
            aria-label={`${section.label ?? "問題"}の問題番号ナビゲーター`}
          >
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {section.questions.map((question, questionIndex) => {
                const status = getResultStatus(question);
                const isCurrent = openQuestionId === question.id;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => openFromNavigator(question.id)}
                    aria-label={`問題${questionIndex + 1}、${statusLabel(status)}${isCurrent ? "、現在表示中" : ""}`}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-controls={`result-question-${question.id}`}
                    className={cn(
                      "flex aspect-square min-h-12 cursor-pointer flex-col items-center justify-center gap-1 rounded border font-[family-name:var(--font-geist-mono)] text-xs transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      status === "correct" && "border-success bg-success/10 text-success",
                      status === "incorrect" && "border-destructive bg-destructive/10 text-destructive",
                      status === "unanswered" && "border-border text-muted-foreground",
                      isCurrent && "border-primary ring-2 ring-primary/40"
                    )}
                  >
                    <span>{questionIndex + 1}</span>
                    <StatusMark status={status} />
                  </button>
                );
              })}
            </div>
            <StatusLegend />
          </nav>

          <div className="mt-4 space-y-3">
            {section.questions.map((question, questionIndex) => {
              const status = getResultStatus(question);
              const isOpen = openQuestionId === question.id;
              const selectedIndex = question.selectedIndex;

              return (
                <article
                  key={question.id}
                  id={`result-question-${question.id}`}
                  ref={(element) => {
                    questionRefs.current[question.id] = element;
                  }}
                  className={cn(
                    "scroll-mt-6 rounded-lg border border-border",
                    isOpen && "border-primary/40 ring-1 ring-primary/15"
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`result-question-content-${question.id}`}
                    onClick={() => toggleQuestion(question.id)}
                    className="flex w-full cursor-pointer items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="w-7 shrink-0 font-[family-name:var(--font-geist-mono)] text-xs text-muted-foreground">
                      {questionIndex + 1}
                    </span>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 text-xs font-medium",
                        status === "correct" && "text-success",
                        status === "incorrect" && "text-destructive",
                        status === "unanswered" && "text-muted-foreground"
                      )}
                    >
                      {status !== "unanswered" && <StatusMark status={status} className="size-5" />}
                      <span className={status === "unanswered" ? undefined : "sr-only sm:not-sr-only"}>
                        {statusLabel(status)}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground" lang="en">
                      {question.stem}
                    </span>
                    {question.typeLabel && (
                      <span className="shrink-0 text-xs text-muted-foreground">{question.typeLabel}</span>
                    )}
                    <span className="shrink-0 text-xs text-muted-foreground" aria-hidden="true">
                      {isOpen ? "閉じる" : "開く"}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`result-question-content-${question.id}`}
                      className="border-t border-border p-4"
                    >
                      <div className={cn("grid gap-6", question.passage && "sm:grid-cols-2")}>
                        {question.passage && (
                          <div className="rounded-lg border border-border p-4 sm:max-h-[32rem] sm:overflow-y-auto" lang="en">
                            <h4 className="mb-3 font-medium text-foreground">{question.passage.title}</h4>
                            <p className="whitespace-pre-line font-[family-name:var(--font-literata)] text-[15px] leading-relaxed text-foreground">
                              {question.passage.body}
                            </p>
                          </div>
                        )}

                        <div className={cn(!question.passage && "mx-auto w-full max-w-2xl")}>
                          <QuestionStem
                            className="text-sm leading-relaxed text-foreground"
                            stem={question.stem}
                            choices={question.choices}
                            questionType={question.questionType}
                          />

                          <div className="mt-4 space-y-1.5">
                            {question.choices.map((choice, choiceIndex) => {
                              const isSelected = selectedIndex === choiceIndex;
                              const isCorrectChoice = choiceIndex === question.correctIndex;
                              return (
                                <div
                                  key={choiceIndex}
                                  className={cn(
                                    "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                                    isCorrectChoice && "border-success bg-success/10",
                                    isSelected && !isCorrectChoice && "border-destructive bg-destructive/10",
                                    !isSelected && !isCorrectChoice && "border-border opacity-60"
                                  )}
                                >
                                  <span className="font-[family-name:var(--font-geist-mono)] font-medium text-muted-foreground">
                                    {String.fromCharCode(65 + choiceIndex)}
                                  </span>
                                  <span className="flex-1 text-foreground" lang="en">
                                    {choice}
                                  </span>
                                  {isCorrectChoice && (
                                    <CheckCircleIcon weight="fill" className="size-4 shrink-0 text-success" aria-hidden="true" />
                                  )}
                                  {isSelected && !isCorrectChoice && (
                                    <XCircleIcon weight="fill" className="size-4 shrink-0 text-destructive" aria-hidden="true" />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {question.explanation && (
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{question.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
