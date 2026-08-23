import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions, passages } from "@/db/schema";

async function queryAttemptRows(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .leftJoin(passages, eq(questions.passageId, passages.id))
    .where(eq(attempts.userId, userId))
    // createdAtは秒精度のため、同一秒内の複数回答はrowidで挿入順にタイブレークする
    .orderBy(desc(attempts.createdAt), desc(sql`attempts.rowid`));
}

type AttemptRow = Awaited<ReturnType<typeof queryAttemptRows>>[number];

export type MistakeRow = AttemptRow & {
  // 直近の解答が正解で、あと1回正解すれば復習ノートから外れる状態かどうか
  // (連続2回正解で習得済み扱いにする仕様のため、streakは0か1のみ取りうる)
  pendingMastery: boolean;
};

export async function getMistakesForUser({
  userId,
  section,
  range,
}: {
  userId: string;
  section?: string;
  range?: string;
}): Promise<MistakeRow[]> {
  const days = range === "7" ? 7 : range === "30" ? 30 : null;
  const cutoff = days ? new Date(Date.now() - days * 86400_000) : null;
  const rows = await queryAttemptRows(userId);

  // 問題ごとに新しい順(desc)の解答履歴をまとめる
  const historyByQuestion = new Map<string, AttemptRow[]>();
  for (const row of rows) {
    const history = historyByQuestion.get(row.questions.id);
    if (history) history.push(row);
    else historyByQuestion.set(row.questions.id, [row]);
  }

  const result: MistakeRow[] = [];
  for (const history of historyByQuestion.values()) {
    const latest = history[0];
    if (cutoff && latest.attempts.createdAt < cutoff) continue;

    const hasEverWrong = history.some((r) => !r.attempts.isCorrect);
    if (!hasEverWrong) continue;

    // 直近から数えた連続正解数。2回連続正解したら習得済みとして復習ノートから外す
    let trailingCorrectStreak = 0;
    for (const r of history) {
      if (!r.attempts.isCorrect) break;
      trailingCorrectStreak++;
    }
    if (trailingCorrectStreak >= 2) continue;

    if (section && latest.questions.sectionSlug !== section) continue;
    result.push({ ...latest, pendingMastery: trailingCorrectStreak === 1 });
  }

  return result;
}
