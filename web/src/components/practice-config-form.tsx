"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PRACTICE_COUNT_PRESETS,
  type GrammarPracticeType,
  type PracticeCountSelection,
  type PracticeTimerMode,
} from "@/lib/practice-config";
import { SECTION_META } from "@/lib/section-meta";
import { cn } from "@/lib/utils";

function RadioTile({
  name,
  value,
  label,
  sublabel,
  checked,
  disabled,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  sublabel?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-sm text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/40"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="size-4 accent-primary"
      />
      <span>
        <span className="block font-medium">{label}</span>
        {sublabel && <span className="mt-0.5 block text-xs text-muted-foreground">{sublabel}</span>}
      </span>
    </label>
  );
}

function CountTiles({
  name,
  value,
  available,
  onChange,
}: {
  name: string;
  value: PracticeCountSelection;
  available: number;
  onChange: (value: PracticeCountSelection) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {PRACTICE_COUNT_PRESETS.map((preset) => {
        const isAvailable = preset === "all" ? available > 0 : preset <= available;
        return (
          <RadioTile
            key={preset}
            name={name}
            value={String(preset)}
            label={preset === "all" ? "すべて" : `${preset}問`}
            checked={value === preset}
            disabled={!isAvailable}
            onChange={() => onChange(preset)}
          />
        );
      })}
    </div>
  );
}

function timerLabel(mode: PracticeTimerMode, questionCount: number, section: "structure" | "reading") {
  if (mode === "none") return "タイマーなし";
  if (mode === "stopwatch") return "経過時間を測る";
  const seconds = Math.max(1, Math.round(questionCount * SECTION_META[section].mockPerQuestionSec));
  return `制限時間（${Math.ceil(seconds / 60)}分）`;
}

export function PracticeConfigForm({
  section,
  availableByType,
}: {
  section: "structure" | "reading";
  availableByType: Partial<Record<string, number>>;
}) {
  const [grammarType, setGrammarType] = useState<GrammarPracticeType>("both");
  const [completionCount, setCompletionCount] = useState<PracticeCountSelection>(5);
  const [errorCount, setErrorCount] = useState<PracticeCountSelection>(5);
  const [readingCount, setReadingCount] = useState<PracticeCountSelection>(10);
  const [timer, setTimer] = useState<PracticeTimerMode>("none");

  const completionAvailable = availableByType.structure_completion ?? 0;
  const errorAvailable = availableByType.structure_error_id ?? 0;
  const readingAvailable = availableByType.reading_comprehension ?? 0;

  const selectedCount = useMemo(() => {
    const resolve = (value: PracticeCountSelection, available: number) =>
      value === "all" ? available : value;
    if (section === "reading") return resolve(readingCount, readingAvailable);
    if (grammarType === "structure_completion") return resolve(completionCount, completionAvailable);
    if (grammarType === "structure_error_id") return resolve(errorCount, errorAvailable);
    return resolve(completionCount, completionAvailable) + resolve(errorCount, errorAvailable);
  }, [completionAvailable, completionCount, errorAvailable, errorCount, grammarType, readingAvailable, readingCount, section]);

  const selectionIsAvailable = useMemo(() => {
    const isCountAvailable = (value: PracticeCountSelection, available: number) =>
      value === "all" ? available > 0 : value <= available;
    if (section === "reading") return isCountAvailable(readingCount, readingAvailable);
    if (grammarType === "structure_completion") return isCountAvailable(completionCount, completionAvailable);
    if (grammarType === "structure_error_id") return isCountAvailable(errorCount, errorAvailable);
    return (
      isCountAvailable(completionCount, completionAvailable) && isCountAvailable(errorCount, errorAvailable)
    );
  }, [completionAvailable, completionCount, errorAvailable, errorCount, grammarType, readingAvailable, readingCount, section]);

  return (
    <form method="get" action="" className="space-y-7">
      {section === "structure" ? (
        <>
          <fieldset className="space-y-2.5">
            <legend className="text-sm font-medium text-foreground">問題タイプ</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              <RadioTile
                name="type"
                value="both"
                label="両方"
                sublabel="文法補充 + 誤り指摘"
                checked={grammarType === "both"}
                onChange={() => setGrammarType("both")}
              />
              <RadioTile
                name="type"
                value="structure_completion"
                label="文法補充"
                sublabel={`${completionAvailable}問公開中`}
                checked={grammarType === "structure_completion"}
                onChange={() => setGrammarType("structure_completion")}
              />
              <RadioTile
                name="type"
                value="structure_error_id"
                label="誤り指摘"
                sublabel={`${errorAvailable}問公開中`}
                checked={grammarType === "structure_error_id"}
                onChange={() => setGrammarType("structure_error_id")}
              />
            </div>
          </fieldset>

          {grammarType !== "structure_error_id" && (
            <fieldset className="space-y-2.5 rounded-lg border border-border p-4">
              <legend className="text-sm font-medium text-foreground">
                文法補充の問題数
                <span className="ml-1 font-normal text-muted-foreground">({completionAvailable}問公開中)</span>
              </legend>
              <CountTiles
                name="completionCount"
                value={completionCount}
                available={completionAvailable}
                onChange={setCompletionCount}
              />
            </fieldset>
          )}

          {grammarType !== "structure_completion" && (
            <fieldset className="space-y-2.5 rounded-lg border border-border p-4">
              <legend className="text-sm font-medium text-foreground">
                誤り指摘の問題数
                <span className="ml-1 font-normal text-muted-foreground">({errorAvailable}問公開中)</span>
              </legend>
              <CountTiles name="errorCount" value={errorCount} available={errorAvailable} onChange={setErrorCount} />
            </fieldset>
          )}
        </>
      ) : (
        <fieldset className="space-y-2.5 rounded-lg border border-border p-4">
          <legend className="text-sm font-medium text-foreground">
            Readingの問題数
            <span className="ml-1 font-normal text-muted-foreground">({readingAvailable}問公開中)</span>
          </legend>
          <CountTiles name="count" value={readingCount} available={readingAvailable} onChange={setReadingCount} />
          <p className="text-xs text-muted-foreground">
            パッセージはまとまりを保って並び、最後のパッセージは一部の設問だけになる場合があります。
          </p>
        </fieldset>
      )}

      <fieldset className="space-y-2.5">
        <legend className="text-sm font-medium text-foreground">時間の測り方</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          <RadioTile
            name="timer"
            value="none"
            label="タイマーなし"
            sublabel="解答直後に解説を表示"
            checked={timer === "none"}
            onChange={() => setTimer("none")}
          />
          <RadioTile
            name="timer"
            value="stopwatch"
            label="経過時間"
            sublabel="提出するまで解答を続ける"
            checked={timer === "stopwatch"}
            onChange={() => setTimer("stopwatch")}
          />
          <RadioTile
            name="timer"
            value="fixed"
            label={timerLabel("fixed", selectedCount, section)}
            sublabel="時間切れで自動提出"
            checked={timer === "fixed"}
            onChange={() => setTimer("fixed")}
          />
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          合計 <span className="font-[family-name:var(--font-geist-mono)] font-medium text-foreground">{selectedCount}</span>問
        </p>
        <Button type="submit" size="lg" disabled={!selectionIsAvailable}>
          演習を開始する
        </Button>
      </div>
    </form>
  );
}
