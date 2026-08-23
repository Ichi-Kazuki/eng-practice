"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { SECTION_META } from "@/lib/section-meta";
import { startMockTest } from "@/app/app/mock/actions";
import { cn } from "@/lib/utils";

type TimeMode = "fixed" | "stopwatch";
const STORAGE_KEY = "mockConfig";

function getStoredRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function getServerStoredRaw(): string | null {
  return null;
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function RadioTile({
  name,
  value,
  label,
  sublabel,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-sm text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 hover:border-primary/40">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
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

export function MockConfigForm({
  availableBySection,
  availableStructureByType,
}: {
  availableBySection: Record<string, number>;
  availableStructureByType: { structure_completion: number; structure_error_id: number };
}) {
  const storedRaw = useSyncExternalStore(subscribeToStorage, getStoredRaw, getServerStoredRaw);
  const persistedTimeMode = useMemo<TimeMode>(() => {
    if (!storedRaw) return "fixed";
    try {
      return (JSON.parse(storedRaw) as { timeMode?: string }).timeMode === "stopwatch" ? "stopwatch" : "fixed";
    } catch {
      return "fixed";
    }
  }, [storedRaw]);
  const [liveTimeMode, setLiveTimeMode] = useState<TimeMode | null>(null);
  const timeMode = liveTimeMode ?? persistedTimeMode;

  function selectTimeMode(next: TimeMode) {
    setLiveTimeMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ timeMode: next }));
    } catch {
      // localStorageが使えない環境でも選択自体は継続できる
    }
  }

  const requiredStructure = SECTION_META.structure.mockOfficialQuestionCount;
  const requiredReading = SECTION_META.reading.mockOfficialQuestionCount;
  const canStart =
    (availableStructureByType.structure_completion >= 15 &&
      availableStructureByType.structure_error_id >= 25) &&
    (availableBySection.reading ?? 0) >= requiredReading;

  return (
    <form action={startMockTest} className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-foreground">{SECTION_META.structure.nameJa}</p>
          <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-lg font-bold text-foreground">
            {requiredStructure}問 / {SECTION_META.structure.mockTimeLimitSec / 60}分
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            文法補充15問 + 誤り指摘25問
          </p>
          <p
            className={cn(
              "mt-3 text-xs",
              availableStructureByType.structure_completion >= 15 && availableStructureByType.structure_error_id >= 25
                ? "text-muted-foreground"
                : "font-medium text-destructive"
            )}
          >
            公開中: 文法補充{availableStructureByType.structure_completion}問 / 誤り指摘
            {availableStructureByType.structure_error_id}問
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-foreground">{SECTION_META.reading.nameJa}</p>
          <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-lg font-bold text-foreground">
            {requiredReading}問 / {SECTION_META.reading.mockTimeLimitSec / 60}分
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">公開Reading問題から無作為に出題します。</p>
          <p
            className={cn(
              "mt-3 text-xs",
              (availableBySection.reading ?? 0) >= requiredReading
                ? "text-muted-foreground"
                : "font-medium text-destructive"
            )}
          >
            公開中: {availableBySection.reading ?? 0}問
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        GrammarからReadingの順に進む2セクション構成です。Listeningは現在利用できません。進行状況は保存されるため、通信が切れても続きから再開できます。
      </p>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">時間の測り方</legend>
        <div className="space-y-2">
          <RadioTile
            name="timeMode"
            value="fixed"
            label="制限時間制"
            sublabel="セクションごとに本番相当の時間で自動提出"
            checked={timeMode === "fixed"}
            onChange={() => selectTimeMode("fixed")}
          />
          <RadioTile
            name="timeMode"
            value="stopwatch"
            label="経過時間を測る"
            sublabel="制限なし。自分で提出するまで終了しない"
            checked={timeMode === "stopwatch"}
            onChange={() => selectTimeMode("stopwatch")}
          />
        </div>
      </fieldset>

      {!canStart && (
        <p className="text-sm font-medium text-destructive" role="alert">
          固定構成に必要な公開問題が不足しているため、現在は開始できません。
        </p>
      )}
      <Button type="submit" size="lg" disabled={!canStart}>
        模試を開始する
      </Button>
    </form>
  );
}
