"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FlagIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { answerMockQuestion, submitMockSection } from "@/app/app/mock/actions";

export type MockRunnerQuestion = {
  id: string;
  stem: string;
  choices: string[];
  questionType: string;
  passage?: { id: string; title: string; body: string } | null;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function MockSectionRunner({
  sessionId,
  sectionLabel,
  timeLimitSec,
  startedAtMs,
  questions,
  initialAnswers,
}: {
  sessionId: string;
  sectionLabel: string;
  timeLimitSec: number | null;
  startedAtMs: number;
  questions: MockRunnerQuestion[];
  initialAnswers: Record<string, number>;
}) {
  const isStopwatch = timeLimitSec === null;
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [displaySec, setDisplaySec] = useState(() => {
    const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
    return isStopwatch ? elapsed : Math.max(0, timeLimitSec - elapsed);
  });
  const submittingRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const result = await submitMockSection(sessionId);
    if (result.done) {
      router.push(`/app/mock/${sessionId}/result`);
    } else {
      router.push(`/app/mock/${sessionId}`);
      router.refresh();
    }
  }, [router, sessionId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
      if (isStopwatch) {
        setDisplaySec(elapsed);
        return;
      }
      const remaining = Math.max(0, timeLimitSec - elapsed);
      setDisplaySec(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        void handleSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [handleSubmit, isStopwatch, startedAtMs, timeLimitSec]);

  const current = questions[index];

  async function handleSelect(choiceIndex: number) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choiceIndex }));
    try {
      await answerMockQuestion(sessionId, current.id, choiceIndex);
    } catch {
      // 保存に失敗しても解答自体はローカルに残る
    }
  }

  function toggleFlag() {
    if (!current) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  }

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (!current) return null;

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-6 mb-6 flex items-center justify-between border-b border-border bg-background px-6 py-3">
        <span className="font-[family-name:var(--font-geist-mono)] text-lg font-bold text-foreground">
          {isStopwatch ? "経過" : "残り"} {formatTime(displaySec)}
        </span>
        <span className="text-sm text-muted-foreground">{sectionLabel}</span>
      </div>

      <div className="mb-6 grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(10,minmax(0,1fr))]">
        {questions.map((q, i) => {
          const isAnswered = answers[q.id] !== undefined;
          const isFlagged = flagged.has(q.id);
          const isCurrent = i === index;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "flex aspect-square items-center justify-center rounded border font-[family-name:var(--font-geist-mono)] text-xs",
                isCurrent ? "border-primary ring-2 ring-primary/40" : "border-border",
                isAnswered && !isFlagged && "bg-primary/10",
                isFlagged && "bg-secondary"
              )}
              title={`問題 ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mb-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span>{answeredCount}/{questions.length} 解答済み</span>
        <span>■ 解答済み</span>
        <span>□ 未解答</span>
      </div>

      <div className={cn("grid gap-6", current.passage && "sm:grid-cols-2")}>
        {current.passage && (
          <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-border p-4">
            <h3 className="mb-3 font-medium text-foreground">{current.passage.title}</h3>
            <p className="whitespace-pre-line font-[family-name:var(--font-literata)] text-[15px] leading-relaxed text-foreground">
              {current.passage.body}
            </p>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-[family-name:var(--font-geist-mono)] text-sm text-muted-foreground">
              問題 {index + 1} / {questions.length}
            </span>
            <button
              type="button"
              onClick={toggleFlag}
              className={cn(
                "flex items-center gap-1 text-xs",
                flagged.has(current.id) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <FlagIcon weight={flagged.has(current.id) ? "fill" : "regular"} className="size-4" />
              見直しフラグ
            </button>
          </div>

          <p className="text-base leading-relaxed text-foreground">{current.stem}</p>

          <div className="mt-5 space-y-2">
            {current.choices.map((choice, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
                  answers[current.id] === i
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary hover:bg-secondary/40"
                )}
              >
                <span className="font-[family-name:var(--font-geist-mono)] font-medium text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-foreground">{choice}</span>
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
            <Button onClick={() => void handleSubmit()}>提出する</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
