import { eq, inArray } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/db";
import {
  attempts,
  mockSessions,
  passages,
  type MockResultSnapshot,
  type MockSectionConfig,
} from "@/db/schema";
import { getActiveIdentity } from "@/lib/auth/active-identity";
import { getQuestionsByIds } from "@/lib/mock-session";
import { chunk, D1_MAX_BOUND_PARAMS } from "@/lib/db/chunked-query";
import { SECTION_META, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { percentToScaledScore, estimateProvisionalTotalScore } from "@/lib/mock-scoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreDisclaimerBadge } from "@/components/score-disclaimer-badge";
import { JaHeading } from "@/components/ja-heading";
import { ResultQuestionReview, type ResultQuestion, type ResultSection } from "@/components/result-question-review";
import { restartMockTest } from "@/app/app/mock/actions";

export const dynamic = "force-dynamic";

export default async function MockResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const identity = await getActiveIdentity();
  if (!identity) notFound();

  const db = getDb();
  const session = await db.query.mockSessions.findFirst({
    where: eq(mockSessions.id, sessionId),
  });
  if (!session || session.userId !== identity.userId) notFound();
  if (session.status !== "completed") redirect(`/app/mock/${sessionId}`);

  const sections = session.sections as MockSectionConfig[];
  const snapshot = session.resultSnapshot as MockResultSnapshot | null;
  const answers = session.answers as Record<string, number>;
  const questionById = new Map<string, ResultQuestion>();
  if (snapshot) {
    for (const question of snapshot.sections.flatMap((section) => section.questions)) {
      questionById.set(question.id, {
        ...question,
        typeLabel: QUESTION_TYPE_LABEL_JA[question.questionType] ?? question.questionType,
        // New snapshots contain the passage as answered. Older snapshots may not.
        passage: question.passage ?? null,
      });
    }
  } else {
    const allQuestionIds = sections.flatMap((section) => section.questionIds);
    const questionRows = allQuestionIds.length > 0 ? await getQuestionsByIds(allQuestionIds) : [];
    const passageIds = [...new Set(questionRows.map((question) => question.passageId).filter((id): id is string => !!id))];
    const passageRows = [];
    for (const passageIdChunk of chunk(passageIds, D1_MAX_BOUND_PARAMS)) {
      passageRows.push(...(await db.select().from(passages).where(inArray(passages.id, passageIdChunk))));
    }
    const passageById = new Map(passageRows.map((passage) => [passage.id, passage]));
    const legacyAttempts = await db
      .select({ questionId: attempts.questionId, isCorrect: attempts.isCorrect })
      .from(attempts)
      .where(eq(attempts.mockSessionId, sessionId));
    const isCorrectById = new Map(legacyAttempts.map((attempt) => [attempt.questionId, attempt.isCorrect]));
    for (const question of questionRows) {
      const selectedIndex = answers[question.id] ?? null;
      questionById.set(question.id, {
        id: question.id,
        stem: question.stem,
        choices: question.choices,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        questionType: question.questionType,
        typeLabel: QUESTION_TYPE_LABEL_JA[question.questionType] ?? question.questionType,
        selectedIndex,
        isCorrect: isCorrectById.get(question.id) ?? selectedIndex === question.correctIndex,
        passage: question.passageId ? passageById.get(question.passageId) ?? null : null,
      });
    }
  }

  const results = sections.map((s) => {
    const savedResult = snapshot?.sections.find((result) => result.sectionSlug === s.sectionSlug);
    if (savedResult) {
      return {
        sectionSlug: savedResult.sectionSlug as SectionSlug,
        correct: savedResult.correct,
        total: savedResult.total,
        scaled: savedResult.scaled,
      };
    }
    const total = s.questionIds.length;
    const correct = s.questionIds.filter((id) => {
      const question = questionById.get(id);
      return (
        question !== undefined &&
        question.selectedIndex !== null &&
        (question.isCorrect ?? question.selectedIndex === question.correctIndex)
      );
    }).length;
    const scaled = total > 0 ? percentToScaledScore((correct / total) * 100) : null;
    return { sectionSlug: s.sectionSlug as SectionSlug, correct, total, scaled };
  });

  const totalScore = estimateProvisionalTotalScore(
    results.filter((r) => r.scaled !== null).map((r) => r.scaled as number)
  );

  const resultSections: ResultSection[] = sections.map((section) => ({
    id: section.sectionSlug,
    label: SECTION_META[section.sectionSlug as SectionSlug].nameJa,
    questions: section.questionIds
      .map((id) => questionById.get(id))
      .filter((question): question is ResultQuestion => !!question),
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <JaHeading className="text-xl font-bold text-foreground" text="模試の結果" />

      <div className="mx-auto max-w-lg">
        <Card className="mt-6 border-2 p-6">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-foreground">予想スコア(目安)</p>
            <ScoreDisclaimerBadge />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Listeningを含まない暫定スコアです。公式スコアではありません。
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-center">
            {results.map((r) => (
              <div key={r.sectionSlug}>
                <p className="text-xs text-muted-foreground">{SECTION_META[r.sectionSlug].nameEn}</p>
                <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-foreground">
                  {r.scaled ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.correct}/{r.total} 正答
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">推定合計スコア(2セクション暫定)</span>
            <span className="font-[family-name:var(--font-geist-mono)] text-3xl font-bold text-primary">
              {totalScore}
            </span>
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" render={<Link href="/app/dashboard" />}>
            ダッシュボードを見る
          </Button>
          <Button variant="outline" render={<Link href="/app/mock" />}>
            トップに戻る
          </Button>
          <form
            action={async () => {
              "use server";
              await restartMockTest(sessionId);
            }}
          >
            <Button type="submit">もう一度模試を受ける</Button>
          </form>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold text-foreground">問題ごとの結果</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          番号または問題行を選ぶと、選択肢ごとの正解・不正解と解説を確認できます。
        </p>
        <ResultQuestionReview className="mt-6" sections={resultSections} />
      </div>
    </div>
  );
}
