"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { QuestionStem } from "@/components/question-stem";
import { useSessionTimer, formatSessionTime } from "@/components/use-session-timer";
import type { PracticeTimerMode } from "@/lib/practice-config";
import { cn } from "@/lib/utils";

export type RunnerQuestion = {
  id: string;
  stem: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  questionType: string;
};

export type RunnerItem = {
  question: RunnerQuestion;
  passage?: { id: string; title: string; body: string } | null;
};

type RunnerPhase = "running" | "submitting" | "result";

export function QuestionRunner({
  items,
  mode,
  mockSessionId,
  timerMode = "none",
  timeLimitSec = null,
  sectionLabel,
  backHref,
  backLabel,
}: {
  items: RunnerItem[];
  mode: "practice" | "mock";
  mockSessionId?: string;
  timerMode?: PracticeTimerMode;
  timeLimitSec?: number | null;
  sectionLabel?: string;
  backHref: string;
  backLabel: string;
}) {
  const isDeferred = timerMode === "stopwatch" || timerMode === "fixed";
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<RunnerPhase>("running");
  const [submissionError, setSubmissionError] = useState(false);
  const [answerError, setAnswerError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const submitHandlerRef = useRef<(options?: { skipConfirm?: boolean; timedOut?: boolean }) => void>(() => undefined);
  const submissionRef = useRef(false);

  const handleSubmit = useCallback(
    async (options?: { skipConfirm?: boolean; timedOut?: boolean }) => {
      if (
        !isDeferred ||
        (phase !== "running" && !(phase === "result" && submissionError)) ||
        submissionRef.current
      ) return;

      if (!options?.skipConfirm) {
        const unansweredCount = items.length - Object.keys(selections).length;
        const confirmMessage =
          unansweredCount > 0
            ? `未解答の問題が${unansweredCount}問あります。このまま提出しますか？`
            : "提出すると、解答を変更できなくなります。よろしいですか？";
        if (!window.confirm(confirmMessage)) return;
      }

      submissionRef.current = true;
      setPhase("submitting");
      setSubmissionError(false);
      if (options?.timedOut) setTimedOut(true);

      try {
        const response = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            mockSessionId,
            answers: selections,
          }),
        });
        if (!response.ok) throw new Error("attempts request failed");
      } catch {
        setSubmissionError(true);
        submissionRef.current = false;
      } finally {
        setPhase("result");
      }
    }, [isDeferred, items.length, mockSessionId, mode, phase, selections, submissionError]);

  useEffect(() => {
    submitHandlerRef.current = handleSubmit;
  }, [handleSubmit]);

  const timer = useSessionTimer({
    mode: timerMode,
    timeLimitSec,
    running: phase === "running",
    onTimeout: () => submitHandlerRef.current({ skipConfirm: true, timedOut: true }),
  });

  const isFinished = !isDeferred && index >= items.length;
  const current = items[index];
  const selectedIndex = current ? selections[current.question.id] : undefined;
  const hasAnswered = selectedIndex !== undefined;
  const choiceRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const correctCount = useMemo(
    () => items.filter((item) => selections[item.question.id] === item.question.correctIndex).length,
    [items, selections]
  );

  async function handleSelect(choiceIndex: number) {
    if (!current || phase !== "running") return;
    if (!isDeferred && hasAnswered) return;

    const questionId = current.question.id;
    setAnswerError(false);
    setSelections((prev) => ({ ...prev, [questionId]: choiceIndex }));
    if (isDeferred) return;

    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          selectedIndex: choiceIndex,
          mode,
          mockSessionId,
        }),
      });
      if (!response.ok) throw new Error("attempt save failed");
    } catch {
      setSelections((prev) => {
        if (prev[questionId] !== choiceIndex) return prev;
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      setAnswerError(true);
      // 即時フィードバック型は今回の解答を取り消し、保存失敗を明示する
    }
  }

  function handleChoiceKeyDown(event: KeyboardEvent<HTMLButtonElement>, choiceIndex: number) {
    if (!current) return;
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (choiceIndex + 1) % current.question.choices.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (choiceIndex - 1 + current.question.choices.length) % current.question.choices.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = current.question.choices.length - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    choiceRefs.current[nextIndex]?.focus();
    void handleSelect(nextIndex);
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">問題がありません。</p>;
  }

  if (isFinished) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-lg font-bold text-foreground">演習完了</h2>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-3xl font-bold text-foreground">
          {correctCount} / {items.length}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">正答</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => location.reload()}>
            もう一度解く
          </Button>
          <Button render={<Link href={backHref} />}>{backLabel}</Button>
        </div>
      </div>
    );
  }

  if (isDeferred && phase === "result") {
    return (
      <PracticeResult
        items={items}
        selections={selections}
        correctCount={correctCount}
        elapsedSec={timer.elapsedSec}
        timedOut={timedOut}
        submissionError={submissionError}
        onRetry={() => void handleSubmit({ skipConfirm: true })}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  if (isDeferred && phase === "submitting") {
    return (
      <div className="mx-auto max-w-sm py-24 text-center">
        <p className="text-lg font-bold text-foreground">{timedOut ? "時間切れです" : "採点中です"}</p>
        <p className="mt-2 text-sm text-muted-foreground">解答を保存しています。少々お待ちください…</p>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        {isDeferred ? (
          <div
            className="sticky top-0 z-10 -mx-1 flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
          >
            <span className="font-[family-name:var(--font-geist-mono)] text-lg font-bold text-foreground">
              {timerMode === "fixed" ? "残り" : "経過"} {timer.formattedTime}
            </span>
            {sectionLabel && <span className="text-xs text-muted-foreground">{sectionLabel}</span>}
          </div>
        ) : (
          <span />
        )}
        <Link href={backHref} className="shrink-0 hover:text-foreground hover:underline">
          {backLabel}
        </Link>
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
              問題 {index + 1} / {items.length}
            </span>
            {isDeferred && (
              <span className="text-xs text-muted-foreground">
                {Object.keys(selections).length}/{items.length} 解答済み
              </span>
            )}
          </div>

          <QuestionStem
            className="text-base leading-relaxed font-medium text-foreground"
            stem={current.question.stem}
            choices={current.question.choices}
            questionType={current.question.questionType}
          />

          <div className="mt-5 space-y-2" role="radiogroup" aria-label="選択肢">
            {current.question.choices.map((choice, i) => {
              const isSelected = selectedIndex === i;
              const isCorrectChoice = i === current.question.correctIndex;
              const showFeedback = !isDeferred && hasAnswered;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected || (!hasAnswered && i === 0) ? 0 : -1}
                  ref={(element) => {
                    choiceRefs.current[i] = element;
                  }}
                  onKeyDown={(event) => handleChoiceKeyDown(event, i)}
                  disabled={phase !== "running" || (!isDeferred && hasAnswered)}
                  onClick={() => void handleSelect(i)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    !showFeedback && !isSelected && "cursor-pointer border-border hover:border-primary hover:bg-secondary/40",
                    !showFeedback && isSelected && "cursor-pointer border-primary bg-primary/10 ring-1 ring-primary/20",
                    showFeedback && isCorrectChoice && "border-success bg-success/10",
                    showFeedback && isSelected && !isCorrectChoice && "border-destructive bg-destructive/10",
                    showFeedback && !isSelected && !isCorrectChoice && "border-border opacity-60"
                  )}
                >
                  <span className="font-[family-name:var(--font-geist-mono)] font-medium text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-foreground" lang="en">
                    {choice}
                  </span>
                  {isDeferred && isSelected && (
                    <CheckCircleIcon className="size-5 shrink-0 text-primary" weight="fill" aria-hidden="true" />
                  )}
                  {showFeedback && isCorrectChoice && (
                    <CheckCircleIcon className="size-5 shrink-0 text-success" weight="fill" />
                  )}
                  {showFeedback && isSelected && !isCorrectChoice && (
                    <XCircleIcon className="size-5 shrink-0 text-destructive" weight="fill" />
                  )}
                </button>
              );
            })}
          </div>

          {answerError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              解答の保存に失敗しました。もう一度選択してください。
            </p>
          )}

          {!isDeferred && hasAnswered && (
            <div className="mt-5 rounded-md bg-secondary/50 p-4">
              <p className="text-sm font-medium text-foreground">
                {selectedIndex === current.question.correctIndex ? "正解" : "不正解"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.question.explanation}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            {isDeferred ? (
              <div className="flex gap-2">
                <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                  前へ
                </Button>
                <Button
                  variant="outline"
                  disabled={index === items.length - 1}
                  onClick={() => setIndex((i) => i + 1)}
                >
                  次へ
                </Button>
              </div>
            ) : (
              <span />
            )}
            <Button
              disabled={isDeferred ? phase !== "running" : !hasAnswered}
              onClick={() => (isDeferred ? void handleSubmit() : setIndex((i) => i + 1))}
            >
              {isDeferred ? "提出する" : "次の問題へ"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeResult({
  items,
  selections,
  correctCount,
  elapsedSec,
  timedOut,
  submissionError,
  onRetry,
  backHref,
  backLabel,
}: {
  items: RunnerItem[];
  selections: Record<string, number>;
  correctCount: number;
  elapsedSec: number;
  timedOut: boolean;
  submissionError: boolean;
  onRetry: () => void;
  backHref: string;
  backLabel: string;
}) {
  const unansweredCount = items.length - Object.keys(selections).length;

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-lg font-bold text-foreground">演習結果</h2>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-3xl font-bold text-foreground">
          {correctCount} / {items.length}
        </p>
        <div className="mt-3 flex justify-center gap-4 text-sm text-muted-foreground">
          <span>正答 {correctCount}問</span>
          <span>未解答 {unansweredCount}問</span>
          <span>所要時間 {formatSessionTime(elapsedSec)}</span>
        </div>
        {timedOut && (
          <p className="mt-3 text-sm font-medium text-destructive" role="status">
            時間切れのため自動提出しました。
          </p>
        )}
        {submissionError && (
          <div className="mt-3 space-y-2" role="alert">
            <p className="text-sm text-destructive">保存に失敗しました。通信状態を確認して再試行してください。</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              保存を再試行
            </Button>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => location.reload()}>
            もう一度解く
          </Button>
          <Button render={<Link href={backHref} />}>{backLabel}</Button>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <h3 className="text-lg font-bold text-foreground">問題ごとの結果</h3>
        <div className="mt-3 space-y-3">
          {items.map((item, itemIndex) => {
            const selected = selections[item.question.id];
            const isAnswered = selected !== undefined;
            const isCorrect = isAnswered && selected === item.question.correctIndex;
            return (
              <details key={item.question.id} className="rounded-lg border border-border">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                  <span className="w-7 shrink-0 font-[family-name:var(--font-geist-mono)] text-xs text-muted-foreground">
                    {itemIndex + 1}
                  </span>
                  {isAnswered ? (
                    isCorrect ? (
                      <CheckCircleIcon weight="fill" className="size-5 shrink-0 text-success" />
                    ) : (
                      <XCircleIcon weight="fill" className="size-5 shrink-0 text-destructive" />
                    )
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">未解答</span>
                  )}
                  <span className="flex-1 truncate text-sm text-foreground" lang="en">
                    {item.question.stem}
                  </span>
                </summary>
                <div className="border-t border-border p-4">
                  <QuestionStem
                    className="text-sm leading-relaxed text-foreground"
                    stem={item.question.stem}
                    choices={item.question.choices}
                    questionType={item.question.questionType}
                  />
                  <div className="mt-4 space-y-1.5">
                    {item.question.choices.map((choice, choiceIndex) => {
                      const isSelected = selected === choiceIndex;
                      const isCorrectChoice = choiceIndex === item.question.correctIndex;
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
                          {isCorrectChoice && <CheckCircleIcon weight="fill" className="size-4 text-success" />}
                          {isSelected && !isCorrectChoice && (
                            <XCircleIcon weight="fill" className="size-4 text-destructive" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.question.explanation}</p>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
