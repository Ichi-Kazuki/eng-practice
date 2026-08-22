import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions, passages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { QuestionRunner, type RunnerItem } from "@/components/question-runner";
import { LoginRequired } from "@/components/login-required";

export const dynamic = "force-dynamic";

export default async function NotebookPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; range?: string }>;
}) {
  const { section, range } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    return <LoginRequired message="復習ノートは誤答をアカウントに記録して表示するため、ログインが必要です。" />;
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .leftJoin(passages, eq(questions.passageId, passages.id))
    .where(eq(attempts.userId, user.userId))
    // createdAtは秒精度のため、同一秒内の複数回答はrowidで挿入順にタイブレークする
    .orderBy(desc(attempts.createdAt), desc(sql`attempts.rowid`));

  const latestByQuestion = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latestByQuestion.has(row.questions.id)) {
      latestByQuestion.set(row.questions.id, row);
    }
  }

  const days = range === "7" ? 7 : range === "30" ? 30 : null;
  // eslint-disable-next-line react-hooks/purity -- サーバーコンポーネントはリクエストごとに再実行されるため問題ない
  const cutoff = days ? Date.now() - days * 86400_000 : null;

  const mistakes = Array.from(latestByQuestion.values()).filter((row) => {
    if (row.attempts.isCorrect) return false;
    if (section && row.questions.sectionSlug !== section) return false;
    if (cutoff && row.attempts.createdAt.getTime() < cutoff) return false;
    return true;
  });

  const items: RunnerItem[] = mistakes.map((row) => ({
    question: {
      id: row.questions.id,
      stem: row.questions.stem,
      choices: row.questions.choices,
      correctIndex: row.questions.correctIndex,
      explanation: row.questions.explanation,
      questionType: row.questions.questionType,
    },
    passage: row.passages
      ? { id: row.passages.id, title: row.passages.title, body: row.passages.body }
      : null,
  }));

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">誤答の解き直し</h1>
      <QuestionRunner items={items} mode="practice" backHref="/app/notebook" backLabel="復習ノートに戻る" />
    </div>
  );
}
