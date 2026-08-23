import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/ssr";
import { getDb } from "@/db";
import { mockSessions, questions, type MockSectionConfig } from "@/db/schema";
import { getActiveIdentity } from "@/lib/auth/active-identity";
import { SECTION_META, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { percentToScaledScore, estimateProvisionalTotalScore } from "@/lib/mock-scoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreDisclaimerBadge } from "@/components/score-disclaimer-badge";
import { JaHeading } from "@/components/ja-heading";
import { QuestionStem } from "@/components/question-stem";
import { restartMockTest } from "@/app/app/mock/actions";
import { cn } from "@/lib/utils";

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

  const sections = session.sections as MockSectionConfig[];
  const answers = session.answers as Record<string, number>;
  const allQuestionIds = sections.flatMap((s) => s.questionIds);
  const questionRows =
    allQuestionIds.length > 0
      ? await db.select().from(questions).where(inArray(questions.id, allQuestionIds))
      : [];
  const questionById = new Map(questionRows.map((q) => [q.id, q]));
  const correctById = new Map(questionRows.map((q) => [q.id, q.correctIndex]));

  const results = sections.map((s) => {
    const total = s.questionIds.length;
    const correct = s.questionIds.filter((id) => answers[id] === correctById.get(id)).length;
    const scaled = total > 0 ? percentToScaledScore((correct / total) * 100) : null;
    return { sectionSlug: s.sectionSlug as SectionSlug, correct, total, scaled };
  });

  const totalScore = estimateProvisionalTotalScore(
    results.filter((r) => r.scaled !== null).map((r) => r.scaled as number)
  );

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
          各問題をタップすると、選択肢ごとの正解・不正解と解説を確認できます。
        </p>

        {sections.map((s) => (
          <div key={s.sectionSlug} className="mt-6">
            <h3 className="text-sm font-medium text-foreground">
              {SECTION_META[s.sectionSlug as SectionSlug].nameJa}
            </h3>
            <div className="mt-2 space-y-2">
              {s.questionIds.map((id, i) => {
                const q = questionById.get(id);
                if (!q) return null;
                const selectedIndex = answers[id];
                const isAnswered = selectedIndex !== undefined;
                const isCorrect = isAnswered && selectedIndex === q.correctIndex;

                return (
                  <details key={id} className="group rounded-lg border border-border">
                    <summary className="flex list-none cursor-pointer items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                      <span className="w-6 shrink-0 font-[family-name:var(--font-geist-mono)] text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                      {isAnswered ? (
                        isCorrect ? (
                          <CheckCircleIcon weight="fill" className="size-5 shrink-0 text-success" />
                        ) : (
                          <XCircleIcon weight="fill" className="size-5 shrink-0 text-destructive" />
                        )
                      ) : (
                        <span className="shrink-0 text-xs text-muted-foreground">未解答</span>
                      )}
                      <span className="flex-1 truncate text-sm text-foreground" lang="en">
                        {q.stem}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {QUESTION_TYPE_LABEL_JA[q.questionType] ?? q.questionType}
                      </span>
                    </summary>

                    <div className="border-t border-border p-4">
                      <QuestionStem
                        className="text-sm leading-relaxed text-foreground"
                        stem={q.stem}
                        choices={q.choices}
                        questionType={q.questionType}
                      />

                      <div className="mt-4 space-y-1.5">
                        {q.choices.map((choice, ci) => {
                          const isSelected = selectedIndex === ci;
                          const isCorrectChoice = ci === q.correctIndex;
                          return (
                            <div
                              key={ci}
                              className={cn(
                                "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                                isCorrectChoice && "border-success bg-success/10",
                                isSelected && !isCorrectChoice && "border-destructive bg-destructive/10",
                                !isSelected && !isCorrectChoice && "border-border opacity-60"
                              )}
                            >
                              <span className="font-[family-name:var(--font-geist-mono)] font-medium text-muted-foreground">
                                {String.fromCharCode(65 + ci)}
                              </span>
                              <span className="flex-1 text-foreground" lang="en">
                                {choice}
                              </span>
                              {isCorrectChoice && (
                                <CheckCircleIcon weight="fill" className="size-4 shrink-0 text-success" />
                              )}
                              {isSelected && !isCorrectChoice && (
                                <XCircleIcon weight="fill" className="size-4 shrink-0 text-destructive" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
