"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { FlagIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { QuestionStem } from "@/components/question-stem";
import { formatSessionTime, useSessionTimer } from "@/components/use-session-timer";
import { cn } from "@/lib/utils";
import { answerMockQuestion, setMockFlag, submitMockSection } from "@/app/app/mock/actions";

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
  const [submitError, setSubmitError] = useState(false);
  const [answerSaveError, setAnswerSaveError] = useState(false);
  const [flagSaveError, setFlagSaveError] = useState(false);
  const submittingRef = useRef(false);
  const answerWriteQueueRef = useRef<Promise<void>>(Promise.resolve());
  const failedAnswersRef = useRef(new Map<string, number>());
  const failedFlagRef = useRef<{ questionId: string; flagged: boolean } | null>(null);
  const pendingWritesRef = useRef(0);

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
      setSubmitError(false);
      await answerWriteQueueRef.current;
      if (failedAnswersRef.current.size > 0 || failedFlagRef.current) {
        setSubmitError(true);
        setIsSubmitting(false);
        submittingRef.current = false;
        return;
      }
      try {
        const result = await submitMockSection(sessionId);
        if (result.done) {
          router.push(`/app/mock/${sessionId}/result`);
        } else {
          router.push(`/app/mock/${sessionId}`);
          router.refresh();
        }
      } catch {
        setSubmitError(true);
        setIsSubmitting(false);
        submittingRef.current = false;
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
      if (
        !submittingRef.current &&
        pendingWritesRef.current === 0 &&
        failedAnswersRef.current.size === 0 &&
        !failedFlagRef.current
      ) {
        return;
      }
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const current = questions[index];
  const choiceRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleChoiceKeyDown(event: KeyboardEvent<HTMLButtonElement>, choiceIndex: number) {
    if (!current) return;
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (choiceIndex + 1) % current.choices.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (choiceIndex - 1 + current.choices.length) % current.choices.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = current.choices.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    choiceRefs.current[nextIndex]?.focus();
    void handleSelect(nextIndex);
  }

  const persistAnswer = useCallback(
    (questionId: string, choiceIndex: number) => {
      pendingWritesRef.current += 1;
      const write = answerWriteQueueRef.current.then(async () => {
        try {
          await answerMockQuestion(sessionId, questionId, choiceIndex);
          failedAnswersRef.current.delete(questionId);
        } catch (error) {
          failedAnswersRef.current.set(questionId, choiceIndex);
          throw error;
        } finally {
          pendingWritesRef.current -= 1;
        }
      });
      answerWriteQueueRef.current = write.catch(() => undefined);
      return write;
    },
    [sessionId]
  );

  const persistFlag = useCallback(
    (questionId: string, nextFlagged: boolean) => {
      pendingWritesRef.current += 1;
      const write = answerWriteQueueRef.current.then(async () => {
        try {
          await setMockFlag(sessionId, questionId, nextFlagged);
          failedFlagRef.current = null;
        } catch (error) {
          failedFlagRef.current = { questionId, flagged: nextFlagged };
          throw error;
        } finally {
          pendingWritesRef.current -= 1;
        }
      });
      answerWriteQueueRef.current = write.catch(() => undefined);
      return write;
    },
    [sessionId]
  );

  async function handleSelect(choiceIndex: number) {
    if (!current || isSubmitting || submittingRef.current || timeUpMessage) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choiceIndex }));
    try {
      await persistAnswer(current.id, choiceIndex);
      setAnswerSaveError(failedAnswersRef.current.size > 0);
    } catch {
      setAnswerSaveError(true);
    }
  }

  async function retryFailedAnswers() {
    const pendingAnswers = [...failedAnswersRef.current.entries()];
    await Promise.allSettled(pendingAnswers.map(([questionId, choiceIndex]) => persistAnswer(questionId, choiceIndex)));
    setAnswerSaveError(failedAnswersRef.current.size > 0);
  }

  async function toggleFlag() {
    if (!current || isSubmitting || timeUpMessage) return;
    const questionId = current.id;
    const nextFlagged = !flagged.has(questionId);
    setFlagged((prev) => {
      const next = new Set(prev);
      if (nextFlagged) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
    try {
      await persistFlag(questionId, nextFlagged);
      setFlagSaveError(false);
    } catch {
      setFlagSaveError(true);
    }
  }

  async function retryFailedFlag() {
    const failedFlag = failedFlagRef.current;
    if (!failedFlag) return;
    try {
      await persistFlag(failedFlag.questionId, failedFlag.flagged);
      setFlagSaveError(false);
    } catch {
      setFlagSaveError(true);
    }
  }

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (!current) return null;

  if (timeUpMessage) {
    return (
      <div className="mx-auto max-w-sm py-24 text-center">
        <p className="text-lg font-bold text-foreground" role="status" aria-live="assertive">
          時間切れです
        </p>
        <p className="mt-2 text-sm text-muted-foreground">自動提出を処理しています。保存に失敗した場合は再試行してください。</p>
        {(answerSaveError || flagSaveError) && (
          <div className="mt-4 space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-left" role="alert">
            <p className="text-sm text-destructive">
              {answerSaveError && flagSaveError
                ? "解答と見直しフラグを保存できませんでした。"
                : answerSaveError
                  ? "解答を保存できませんでした。"
                  : "見直しフラグを保存できませんでした。"}
            </p>
            <div className="flex flex-wrap gap-2">
              {answerSaveError && (
                <Button variant="outline" size="sm" onClick={() => void retryFailedAnswers()} disabled={isSubmitting}>
                  解答を再保存
                </Button>
              )}
              {flagSaveError && (
                <Button variant="outline" size="sm" onClick={() => void retryFailedFlag()} disabled={isSubmitting}>
                  フラグを再保存
                </Button>
              )}
            </div>
          </div>
        )}
        {submitError && (
          <>
            <p className="mt-3 text-sm text-destructive" role="alert">
              提出に失敗しました。通信状態を確認して、もう一度お試しください。
            </p>
            <Button className="mt-4" onClick={() => void handleSubmit({ skipConfirm: true })} disabled={isSubmitting}>
              {isSubmitting ? "再提出中…" : "再提出する"}
            </Button>
          </>
        )}
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
          <div className="rounded-lg border border-border p-4 sm:max-h-[32rem] sm:overflow-y-auto" lang="en">
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
                tabIndex={answers[current.id] === i || (answers[current.id] === undefined && i === 0) ? 0 : -1}
                ref={(element) => {
                  choiceRefs.current[i] = element;
                }}
                onKeyDown={(event) => handleChoiceKeyDown(event, i)}
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

          {(answerSaveError || flagSaveError) && (
            <div className="mt-4 space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3" role="alert">
              <p className="text-sm text-destructive">
                {answerSaveError && flagSaveError
                  ? "解答と見直しフラグを保存できませんでした。"
                  : answerSaveError
                    ? "解答を保存できませんでした。"
                    : "見直しフラグを保存できませんでした。"}
              </p>
              <div className="flex flex-wrap gap-2">
                {answerSaveError && (
                  <Button variant="outline" size="sm" onClick={() => void retryFailedAnswers()}>
                    解答を再保存
                  </Button>
                )}
                {flagSaveError && (
                  <Button variant="outline" size="sm" onClick={() => void retryFailedFlag()}>
                    フラグを再保存
                  </Button>
                )}
              </div>
            </div>
          )}

          {submitError && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              提出に失敗しました。保存状態を確認してから、もう一度提出してください。
            </p>
          )}

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
