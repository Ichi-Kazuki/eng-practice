"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlagIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { QuestionStem } from "@/components/question-stem";
import { formatSessionTime, useSessionTimer } from "@/components/use-session-timer";
import { cn } from "@/lib/utils";
import { answerMockQuestion, submitMockSection, toggleMockFlag } from "@/app/app/mock/actions";

export type MockRunnerQuestion = {
  id: string;
  stem: string;
  choices: string[];
  questionType: string;
  passage?: { id: string; title: string; body: string } | null;
};

export function MockSectionRunner({
  sessionId,
  sectionLabel,
  timeLimitSec,
  startedAtMs,
  questions,
  initialAnswers,
  initialFlags,
}: {
  sessionId: string;
  sectionLabel: string;
  timeLimitSec: number | null;
  startedAtMs: number;
  questions: MockRunnerQuestion[];
  initialAnswers: Record<string, number>;
  initialFlags: string[];
}) {
  const isStopwatch = timeLimitSec === null;
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set(initialFlags));
  const [timeUpMessage, setTimeUpMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = useCallback(
    async (opts?: { skipConfirm?: boolean }) => {
      if (submittingRef.current) return;
      if (!opts?.skipConfirm) {
        const unansweredCount = questions.length - Object.keys(answers).length;
        const confirmMessage =
          unansweredCount > 0
            ? `未解答の問題が${unansweredCount}問あります。このまま提出しますか？`
            : "提出すると、このセクションの解答は変更できなくなります。よろしいですか？";
        if (!window.confirm(confirmMessage)) return;
      }
      submittingRef.current = true;
      setIsSubmitting(true);
      const result = await submitMockSection(sessionId);
      if (result.done) {
        router.push(`/app/mock/${sessionId}/result`);
      } else {
        router.push(`/app/mock/${sessionId}`);
        router.refresh();
      }
    },
    [answers, questions.length, router, sessionId]
  );

  const timeoutRef = useRef<number | null>(null);
  const timer = useSessionTimer({
    mode: isStopwatch ? "stopwatch" : "fixed",
    timeLimitSec,
    startedAtMs,
    onTimeout: () => {
      setTimeUpMessage(true);
      timeoutRef.current = window.setTimeout(() => void handleSubmit({ skipConfirm: true }), 1500);
    },
  });

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  // タブを閉じる/戻る操作で進行中の模試から離脱しようとした場合に警告する
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const current = questions[index];

  async function handleSelect(choiceIndex: number) {
    if (!current || isSubmitting || timeUpMessage) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choiceIndex }));
    try {
      await answerMockQuestion(sessionId, current.id, choiceIndex);
    } catch {
      // 保存に失敗しても解答自体はローカルに残る
    }
  }

  async function toggleFlag() {
    if (!current || isSubmitting || timeUpMessage) return;
    const questionId = current.id;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
    try {
      await toggleMockFlag(sessionId, questionId);
    } catch {
      // 保存に失敗してもローカルの表示は維持する
    }
  }

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (!current) return null;

  if (timeUpMessage) {
    return (
      <div className="mx-auto max-w-sm py-24 text-center">
        <p className="text-lg font-bold text-foreground">時間切れです</p>
        <p className="mt-2 text-sm text-muted-foreground">自動的に提出されました。少々お待ちください…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-6 mb-6 flex items-center justify-between border-b border-border bg-background px-6 py-3">
        <span className="font-[family-name:var(--font-geist-mono)] text-lg font-bold text-foreground">
          {isStopwatch ? "経過" : "残り"} {formatSessionTime(isStopwatch ? timer.elapsedSec : timer.remainingSec)}
        </span>
        <span className="text-sm text-muted-foreground">{sectionLabel}</span>
      </div>

      <div className="mb-6 grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(10,minmax(0,1fr))]">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined;
          const isFlagged = flagged.has(q.id);
          const isCurrent = i === index;
          const statusLabel = isAnswered ? "解答済み" : "未解答";
          const ariaLabel = `問題${i + 1}、${statusLabel}${isFlagged ? "、見直しフラグあり" : ""}${
            isCurrent ? "、現在表示中" : ""
          }`;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={ariaLabel}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "relative flex aspect-square cursor-pointer items-center justify-center rounded border font-[family-name:var(--font-geist-mono)] text-xs transition-colors hover:border-primary/50",
                isCurrent ? "border-primary ring-2 ring-primary/40" : "border-border",
                isAnswered && "bg-primary/10"
              )}
            >
              {i + 1}
              {isFlagged && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 size-2.5 rounded-full border border-background bg-amber-500"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mb-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          {answeredCount}/{questions.length} 解答済み
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm bg-primary/10" /> 解答済み
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm border border-border" /> 未解答
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-full bg-amber-500" /> 見直しフラグ
        </span>
      </div>

      <div className={cn("grid gap-6", current.passage && "sm:grid-cols-2")}>
        {current.passage && (
          <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-border p-4" lang="en">
            <h3 className="mb-3 font-medium text-foreground">{current.passage.title}</h3>
            <p className="whitespace-pre-line font-[family-name:var(--font-literata)] text-[15px] leading-relaxed text-foreground">
              {current.passage.body}
            </p>
          </div>
        )}

        <div className={cn(!current.passage && "mx-auto w-full max-w-2xl")}>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-[family-name:var(--font-geist-mono)] text-sm text-muted-foreground">
              問題 {index + 1} / {questions.length}
            </span>
            <button
              type="button"
              onClick={() => void toggleFlag()}
              aria-pressed={flagged.has(current.id)}
              className={cn(
                "flex cursor-pointer items-center gap-1 text-xs",
                flagged.has(current.id) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <FlagIcon weight={flagged.has(current.id) ? "fill" : "regular"} className="size-4" />
              見直しフラグ
            </button>
          </div>

          <QuestionStem
            className="text-base leading-relaxed font-medium text-foreground"
            stem={current.stem}
            choices={current.choices}
            questionType={current.questionType}
          />

          <div className="mt-5 space-y-2" role="radiogroup" aria-label="選択肢">
            {current.choices.map((choice, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={answers[current.id] === i}
                onClick={() => handleSelect(i)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  answers[current.id] === i
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary hover:bg-secondary/40"
                )}
              >
                <span className="font-[family-name:var(--font-geist-mono)] font-medium text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-foreground" lang="en">
                  {choice}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                前へ
              </Button>
              <Button
                variant="outline"
                disabled={index === questions.length - 1}
                onClick={() => setIndex((i) => i + 1)}
              >
                次へ
              </Button>
            </div>
            <Button disabled={isSubmitting} onClick={() => void handleSubmit()}>
              {isSubmitting ? "提出中…" : "提出する"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
