import { SECTION_META } from "@/lib/section-meta";

export const PRACTICE_COUNT_PRESETS = [5, 10, 20, 30, "all"] as const;
export type PracticeCountSelection = (typeof PRACTICE_COUNT_PRESETS)[number];
export type PracticeTimerMode = "none" | "stopwatch" | "fixed";
export type GrammarPracticeType = "structure_completion" | "structure_error_id" | "both";

export type PracticeConfig =
  | {
      section: "structure";
      type: GrammarPracticeType;
      completionCount: PracticeCountSelection | null;
      errorCount: PracticeCountSelection | null;
      timer: PracticeTimerMode;
    }
  | {
      section: "reading";
      count: PracticeCountSelection;
      timer: PracticeTimerMode;
    };

export type PracticeSearchParams = Record<string, string | string[] | undefined>;

function singleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? (value.length === 1 ? value[0] : undefined) : value;
}

export function parsePracticeCount(value: string | undefined): PracticeCountSelection | null {
  if (value === "all") return "all";
  const parsed = Number(value);
  return PRACTICE_COUNT_PRESETS.includes(parsed as PracticeCountSelection)
    ? (parsed as PracticeCountSelection)
    : null;
}

export function parsePracticeConfig(
  section: string,
  searchParams: PracticeSearchParams
): PracticeConfig | null {
  const timer = singleParam(searchParams.timer);
  if (timer !== "none" && timer !== "stopwatch" && timer !== "fixed") return null;

  if (section === "structure") {
    const type = singleParam(searchParams.type);
    if (type !== "structure_completion" && type !== "structure_error_id" && type !== "both") return null;

    const completionCount = parsePracticeCount(singleParam(searchParams.completionCount));
    const errorCount = parsePracticeCount(singleParam(searchParams.errorCount));
    if (type === "structure_completion" && completionCount === null) {
      return null;
    }
    if (type === "structure_error_id" && errorCount === null) {
      return null;
    }
    if (type === "both" && (completionCount === null || errorCount === null)) {
      return null;
    }

    return {
      section: "structure",
      type,
      completionCount: type === "structure_error_id" ? null : completionCount,
      errorCount: type === "structure_completion" ? null : errorCount,
      timer,
    };
  }

  if (section === "reading") {
    const count = parsePracticeCount(singleParam(searchParams.count));
    return count === null ? null : { section: "reading", count, timer };
  }

  return null;
}

export function hasPracticeSearchParams(searchParams: PracticeSearchParams): boolean {
  return Object.values(searchParams).some((value) => value !== undefined);
}

export function resolvePracticeCount(selection: PracticeCountSelection, available: number): number | null {
  const count = selection === "all" ? available : selection;
  return count > 0 && count <= available ? count : null;
}

export function getPracticeQuestionCount(
  config: PracticeConfig,
  availableByType: Partial<Record<string, number>>
): number | null {
  if (config.section === "reading") {
    return resolvePracticeCount(config.count, availableByType.reading_comprehension ?? 0);
  }

  const completionAvailable = availableByType.structure_completion ?? 0;
  const errorAvailable = availableByType.structure_error_id ?? 0;
  if (config.type === "structure_completion") {
    return config.completionCount === null ? null : resolvePracticeCount(config.completionCount, completionAvailable);
  }
  if (config.type === "structure_error_id") {
    return config.errorCount === null ? null : resolvePracticeCount(config.errorCount, errorAvailable);
  }

  if (config.completionCount === null || config.errorCount === null) return null;
  const completionCount = resolvePracticeCount(config.completionCount, completionAvailable);
  const errorCount = resolvePracticeCount(config.errorCount, errorAvailable);
  return completionCount === null || errorCount === null ? null : completionCount + errorCount;
}

export function getPracticeTimeLimitSec(config: PracticeConfig, questionCount: number): number | null {
  if (config.timer !== "fixed") return null;
  return Math.max(1, Math.round(questionCount * SECTION_META[config.section].mockPerQuestionSec));
}

export function getPracticeCountLabel(value: PracticeCountSelection): string {
  return value === "all" ? "すべて" : `${value}問`;
}
