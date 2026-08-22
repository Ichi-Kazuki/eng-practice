import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions, passages } from "@/db/schema";

async function queryLatestAttemptRows(userId: string) {
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

export type MistakeRow = Awaited<ReturnType<typeof queryLatestAttemptRows>>[number];

export async function getMistakesForUser({
  userId,
  section,
  range,
}: {
  userId: string;
  section?: string;
  range?: string;
}): Promise<MistakeRow[]> {
  const rows = await queryLatestAttemptRows(userId);

  const latestByQuestion = new Map<string, MistakeRow>();
  for (const row of rows) {
    if (!latestByQuestion.has(row.questions.id)) {
      latestByQuestion.set(row.questions.id, row);
    }
  }

  const days = range === "7" ? 7 : range === "30" ? 30 : null;
  const cutoff = days ? Date.now() - days * 86400_000 : null;

  return Array.from(latestByQuestion.values()).filter((row) => {
    if (row.attempts.isCorrect) return false;
    if (section && row.questions.sectionSlug !== section) return false;
    if (cutoff && row.attempts.createdAt.getTime() < cutoff) return false;
    return true;
  });
}
