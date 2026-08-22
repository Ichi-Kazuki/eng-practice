"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { QuestionStem } from "@/components/question-stem";
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

export function QuestionRunner({
  items,
  mode,
  mockSessionId,
  backHref,
  backLabel,
}: {
  items: RunnerItem[];
  mode: "practice" | "mock";
  mockSessionId?: string;
  backHref: string;
  backLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});

  const isFinished = index >= items.length;
  const current = items[index];
  const selectedIndex = current ? selections[current.question.id] : undefined;
  const hasAnswered = selectedIndex !== undefined;
  const correctCount = useMemo(
    () =>
      items.filter((item) => selections[item.question.id] === item.question.correctIndex).length,
    [items, selections]
  );

  async function handleSelect(choiceIndex: number) {
    if (hasAnswered) return;
    setSelections((prev) => ({ ...prev, [current.question.id]: choiceIndex }));
    const isCorrect = choiceIndex === current.question.correctIndex;
    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: current.question.id,
          selectedIndex: choiceIndex,
          isCorrect,
          mode,
          mockSessionId,
        }),
      });
    } catch {
      // ベストエフォート: 記録に失敗しても演習自体は継続できる
    }
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

  if (!current) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end text-sm text-muted-foreground">
        <Link href={backHref} className="hover:text-foreground hover:underline">
          {backLabel}
        </Link>
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
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={hasAnswered}
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    !hasAnswered && "cursor-pointer border-border hover:border-primary hover:bg-secondary/40",
                    hasAnswered && isCorrectChoice && "border-success bg-success/10",
                    hasAnswered && isSelected && !isCorrectChoice && "border-destructive bg-destructive/10",
                    hasAnswered && !isSelected && !isCorrectChoice && "border-border opacity-60"
                  )}
                >
                  <span className="font-[family-name:var(--font-geist-mono)] font-medium text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-foreground" lang="en">
                    {choice}
                  </span>
                  {hasAnswered && isCorrectChoice && (
                    <CheckCircleIcon className="size-5 shrink-0 text-success" weight="fill" />
                  )}
                  {hasAnswered && isSelected && !isCorrectChoice && (
                    <XCircleIcon className="size-5 shrink-0 text-destructive" weight="fill" />
                  )}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="mt-5 rounded-md bg-secondary/50 p-4">
              <p className="text-sm font-medium text-foreground">
                {selectedIndex === current.question.correctIndex ? "正解" : "不正解"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {current.question.explanation}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button disabled={!hasAnswered} onClick={() => setIndex((i) => i + 1)}>
              次の問題へ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
