import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/db";
import { mockSessions, questions, type MockSectionConfig } from "@/db/schema";
import { getActiveIdentity } from "@/lib/auth/active-identity";
import { SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { percentToScaledScore, estimateProvisionalTotalScore } from "@/lib/mock-scoring";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreDisclaimerBadge } from "@/components/score-disclaimer-badge";
import { JaHeading } from "@/components/ja-heading";

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
    <div className="mx-auto max-w-lg">
      <JaHeading className="text-xl font-bold text-foreground" text="模試の結果" />

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

      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" render={<Link href="/app/dashboard" />}>
          ダッシュボードを見る
        </Button>
        <Button render={<Link href="/app/mock" />}>もう一度模試を受ける</Button>
      </div>
    </div>
  );
}
