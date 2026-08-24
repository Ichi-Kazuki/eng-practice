import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions, passages } from "@/db/schema";

export type NotebookStatus = "needs_review" | "one_more";
export type NotebookSection = "structure" | "reading";
export type NotebookDateRange = "7" | "30";
export type NotebookPracticeCount = 5 | 10 | 20;

export type NotebookFilters = {
  section?: NotebookSection;
  range?: NotebookDateRange;
  status?: NotebookStatus;
};

type NotebookQueryValue = string | string[] | undefined;

const NOTEBOOK_SECTIONS: readonly NotebookSection[] = ["structure", "reading"];
const NOTEBOOK_RANGES: readonly NotebookDateRange[] = ["7", "30"];
const NOTEBOOK_STATUSES: readonly NotebookStatus[] = ["needs_review", "one_more"];
const NOTEBOOK_COUNTS: readonly NotebookPracticeCount[] = [5, 10, 20];

export function parseNotebookFilters({
  section,
  range,
  status,
}: {
  section?: NotebookQueryValue;
  range?: NotebookQueryValue;
  status?: NotebookQueryValue;
}): NotebookFilters {
  return {
    section: parseValue(section, NOTEBOOK_SECTIONS),
    range: parseValue(range, NOTEBOOK_RANGES),
    status: parseValue(status, NOTEBOOK_STATUSES),
  };
}

export function parseNotebookCount(value: NotebookQueryValue): NotebookPracticeCount {
  if (typeof value !== "string") return 10;
  const count = NOTEBOOK_COUNTS.find((allowedCount) => String(allowedCount) === value);
  return count ?? 10;
}

function parseValue<T extends string>(value: NotebookQueryValue, allowed: readonly T[]): T | undefined {
  if (typeof value !== "string") return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

async function queryAttemptRows(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .leftJoin(passages, eq(questions.passageId, passages.id))
    .where(and(eq(attempts.userId, userId), eq(questions.status, "published")))
    // createdAtは秒精度のため、同一秒内の複数回答はrowidで挿入順にタイブレークする
    .orderBy(desc(attempts.createdAt), desc(sql`attempts.rowid`));
}

type AttemptRow = Awaited<ReturnType<typeof queryAttemptRows>>[number];

export type MistakeRow = AttemptRow & {
  status: NotebookStatus;
  /**
   * 直近の誤答で選んだ選択肢。one_more状態でも誤答の記録を残す。
   * 解答後に問題が編集されている場合、インデックスが別の選択肢を指してしまうためnullにする
   */
  lastWrongSelectedIndex: number | null;
  answerCount: number;
  wrongCount: number;
  lastAnsweredAt: Date;
};

export type NotebookSummary = {
  needsReview: number;
  oneMore: number;
  total: number;
};

export const NOTEBOOK_PAGE_SIZE = 20;

export async function getMistakesForUser({
  userId,
  filters,
}: {
  userId: string;
  filters?: NotebookFilters;
}): Promise<MistakeRow[]> {
  const normalizedFilters = filters ?? {};
  const rows = await queryAttemptRows(userId);

  // 問題ごとに新しい順(desc)の解答履歴をまとめる
  const historyByQuestion = new Map<string, AttemptRow[]>();
  for (const row of rows) {
    const history = historyByQuestion.get(row.questions.id);
    if (history) history.push(row);
    else historyByQuestion.set(row.questions.id, [row]);
  }

  const days = normalizedFilters.range === "7" ? 7 : normalizedFilters.range === "30" ? 30 : null;
  const cutoff = days ? new Date(Date.now() - days * 86400_000) : null;

  const result: MistakeRow[] = [];
  for (const history of historyByQuestion.values()) {
    const latest = history[0];

    if (cutoff && latest.attempts.createdAt < cutoff) continue;

    // 履歴は新しい順。直近の誤答は「何を間違えたか」の表示に使う
    const latestWrong = history.find((row) => !row.attempts.isCorrect);
    if (!latestWrong) continue;

    // 直近から数えた連続正解数。2回連続正解したら習得済みとして復習ノートから外す
    let trailingCorrectStreak = 0;
    for (const row of history) {
      if (!row.attempts.isCorrect) break;
      trailingCorrectStreak++;
    }
    if (trailingCorrectStreak >= 2) continue;

    const rowStatus: NotebookStatus = trailingCorrectStreak === 1 ? "one_more" : "needs_review";
    if (normalizedFilters.section && latest.questions.sectionSlug !== normalizedFilters.section) continue;
    if (normalizedFilters.status && rowStatus !== normalizedFilters.status) continue;

    result.push({
      ...latest,
      status: rowStatus,
      lastWrongSelectedIndex:
        latest.questions.updatedAt > latestWrong.attempts.createdAt
          ? null
          : latestWrong.attempts.selectedIndex,
      answerCount: history.length,
      wrongCount: history.filter((row) => !row.attempts.isCorrect).length,
      lastAnsweredAt: latest.attempts.createdAt,
    });
  }

  // 要復習を先にし、同じ状態では最終解答が古い問題から出す
  return result.sort((a, b) => {
    const statusOrder = a.status === b.status ? 0 : a.status === "needs_review" ? -1 : 1;
    if (statusOrder !== 0) return statusOrder;
    const dateOrder = a.lastAnsweredAt.getTime() - b.lastAnsweredAt.getTime();
    return dateOrder !== 0 ? dateOrder : a.questions.id.localeCompare(b.questions.id);
  });
}

export function summarizeMistakes(mistakes: MistakeRow[]): NotebookSummary {
  return {
    needsReview: mistakes.filter((mistake) => mistake.status === "needs_review").length,
    oneMore: mistakes.filter((mistake) => mistake.status === "one_more").length,
    total: mistakes.length,
  };
}

export async function getNotebookDataForUser({
  userId,
  filters,
}: {
  userId: string;
  filters: NotebookFilters;
}) {
  const allMistakes = await getMistakesForUser({ userId });
  const scopedFilters = { section: filters.section, range: filters.range } satisfies NotebookFilters;
  const scopedMistakes = filterMistakes(allMistakes, scopedFilters);
  const visibleMistakes = filters.status
    ? scopedMistakes.filter((mistake) => mistake.status === filters.status)
    : scopedMistakes;

  return {
    mistakes: visibleMistakes,
    summary: summarizeMistakes(scopedMistakes),
    allCount: allMistakes.length,
  };
}

function filterMistakes(mistakes: MistakeRow[], filters: NotebookFilters) {
  return mistakes.filter((mistake) => {
    if (filters.section && mistake.questions.sectionSlug !== filters.section) return false;
    if (filters.range) {
      const cutoff = new Date(Date.now() - Number(filters.range) * 86400_000);
      if (mistake.lastAnsweredAt < cutoff) return false;
    }
    return true;
  });
}

/** 復習ノート一覧へのリンク。絞り込みとページ位置を保ったまま戻れるようにする */
export function buildNotebookHref(filters: NotebookFilters, page?: number) {
  const params = new URLSearchParams();
  if (filters.section) params.set("section", filters.section);
  if (filters.range) params.set("range", filters.range);
  if (filters.status) params.set("status", filters.status);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/app/notebook${query ? `?${query}` : ""}`;
}
