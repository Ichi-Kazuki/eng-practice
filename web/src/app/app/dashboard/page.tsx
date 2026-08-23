import { eq, and, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { PencilSimpleLineIcon, BookOpenIcon, HeadphonesIcon } from "@phosphor-icons/react/ssr";
import { getDb } from "@/db";
import { attempts, questions, mockSessions, type MockSectionConfig } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SECTION_META, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { percentToScaledScore, estimateProvisionalTotalScore } from "@/lib/mock-scoring";
import { Card } from "@/components/ui/card";
import { LoginRequired } from "@/components/login-required";
import { ScoreDisclaimerBadge } from "@/components/score-disclaimer-badge";
import { AccuracyBar } from "@/components/accuracy-bar";
import { JaHeading } from "@/components/ja-heading";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SECTION_ICON: Record<SectionSlug, { icon: typeof PencilSimpleLineIcon; color: string }> = {
  structure: { icon: PencilSimpleLineIcon, color: "text-primary" },
  reading: { icon: BookOpenIcon, color: "text-sky-600 dark:text-sky-400" },
  listening: { icon: HeadphonesIcon, color: "text-emerald-600 dark:text-emerald-400" },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <LoginRequired message="スコアダッシュボードは演習履歴をアカウントに保存して表示するため、ログインが必要です。" />
    );
  }

  const db = getDb();
  const rows = await db
    .select({
      sectionSlug: questions.sectionSlug,
      questionType: questions.questionType,
      isCorrect: attempts.isCorrect,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.userId, user.userId));

  const bySection = new Map<string, { correct: number; total: number }>();
  const byType = new Map<string, { correct: number; total: number }>();
  for (const row of rows) {
    const s = bySection.get(row.sectionSlug) ?? { correct: 0, total: 0 };
    s.total += 1;
    if (row.isCorrect) s.correct += 1;
    bySection.set(row.sectionSlug, s);

    const t = byType.get(row.questionType) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (row.isCorrect) t.correct += 1;
    byType.set(row.questionType, t);
  }

  const scoredSections: SectionSlug[] = ["structure", "reading"];
  const sectionScaled: Record<string, number | null> = {};
  const scaledScores: number[] = [];
  for (const s of scoredSections) {
    const stat = bySection.get(s);
    if (!stat || stat.total === 0) {
      sectionScaled[s] = null;
      continue;
    }
    const pct = (stat.correct / stat.total) * 100;
    const scaled = percentToScaledScore(pct);
    sectionScaled[s] = scaled;
    scaledScores.push(scaled);
  }

  const hasAnyData = scaledScores.length > 0;
  const totalScore = hasAnyData ? estimateProvisionalTotalScore(scaledScores) : null;

  const weakest = scoredSections
    .map((s) => ({ section: s, stat: bySection.get(s) }))
    .filter((x) => x.stat && x.stat.total > 0)
    .sort((a, b) => a.stat!.correct / a.stat!.total - b.stat!.correct / b.stat!.total)[0];

  const completedMocks = await db.query.mockSessions.findMany({
    where: and(eq(mockSessions.userId, user.userId), eq(mockSessions.status, "completed")),
    orderBy: [desc(mockSessions.completedAt)],
  });

  const mockQuestionIds = Array.from(
    new Set(
      completedMocks.flatMap((session) =>
        (session.sections as MockSectionConfig[]).flatMap((s) => s.questionIds)
      )
    )
  );
  const correctIndexById = new Map<string, number>();
  if (mockQuestionIds.length > 0) {
    const qRows = await db
      .select({ id: questions.id, correctIndex: questions.correctIndex })
      .from(questions)
      .where(inArray(questions.id, mockQuestionIds));
    for (const q of qRows) correctIndexById.set(q.id, q.correctIndex);
  }

  const mockHistory = completedMocks.map((session) => {
    const sections = session.sections as MockSectionConfig[];
    const answers = session.answers as Record<string, number>;
    const sectionScores = sections.map((s) => {
      const total = s.questionIds.length;
      const correct = s.questionIds.filter((id) => answers[id] === correctIndexById.get(id)).length;
      const scaled = total > 0 ? percentToScaledScore((correct / total) * 100) : null;
      return { sectionSlug: s.sectionSlug as SectionSlug, scaled };
    });
    const total = estimateProvisionalTotalScore(
      sectionScores.filter((s) => s.scaled !== null).map((s) => s.scaled as number)
    );
    return { id: session.id, completedAt: session.completedAt, sectionScores, total };
  });

  return (
    <div>
      <JaHeading className="text-xl font-bold text-foreground" text="スコアダッシュボード" />

      <Card className="mt-6 border-2 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">予想スコア(目安)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Listeningを含まない暫定スコアです。公式スコアではありません。
            </p>
          </div>
          <ScoreDisclaimerBadge />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5 text-center">
          {(["structure", "reading", "listening"] as SectionSlug[]).map((s) => {
            const { icon: Icon, color } = SECTION_ICON[s];
            return (
              <div key={s}>
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Icon className={cn("size-3.5", color)} weight="bold" />
                  {SECTION_META[s].nameEn}
                </p>
                <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-foreground">
                  {s === "listening" ? "準備中" : (sectionScaled[s] ?? "-")}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">推定合計スコア(2セクション暫定)</span>
          <span className="font-[family-name:var(--font-geist-mono)] text-3xl font-bold text-primary">
            {totalScore ?? "-"}
          </span>
        </div>
      </Card>

      {weakest && (
        <p className="mt-4 text-sm text-muted-foreground">
          現在の弱点セクションは
          <span className="font-medium text-destructive"> {SECTION_META[weakest.section].nameJa} </span>
          です(正答率 {Math.round((weakest.stat!.correct / weakest.stat!.total) * 100)}%)。
        </p>
      )}

      <h2 className="mt-10 text-lg font-bold text-foreground">分野別正答率</h2>
      <div className="mt-4 space-y-4">
        {Array.from(byType.entries()).map(([type, stat]) => {
          const pct = Math.round((stat.correct / stat.total) * 100);
          return (
            <div key={type}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{QUESTION_TYPE_LABEL_JA[type] ?? type}</span>
                <span className="font-[family-name:var(--font-geist-mono)] text-muted-foreground">
                  {stat.correct}/{stat.total} ({pct}%)
                </span>
              </div>
              <div className="mt-1.5">
                <AccuracyBar percent={pct} />
              </div>
            </div>
          );
        })}
        {byType.size === 0 && (
          <p className="text-sm text-muted-foreground">まだ演習記録がありません。</p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-bold text-foreground">模試の受験履歴</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        本番と同じ問題数・制限時間で受けた模試のスコアです。回を重ねた伸びの確認に使えます。
      </p>
      <div className="mt-4 space-y-2">
        {mockHistory.map((session) => (
          <Link
            key={session.id}
            href={`/app/mock/${session.id}/result`}
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent"
          >
            <span className="text-sm text-muted-foreground">
              {session.completedAt
                ? new Date(session.completedAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "-"}
            </span>
            <span className="flex items-center gap-4">
              {session.sectionScores.map((s) => (
                <span key={s.sectionSlug} className="text-xs text-muted-foreground">
                  {SECTION_META[s.sectionSlug].nameEn}{" "}
                  <span className="font-[family-name:var(--font-geist-mono)] font-medium text-foreground">
                    {s.scaled ?? "-"}
                  </span>
                </span>
              ))}
              <span className="font-[family-name:var(--font-geist-mono)] text-lg font-bold text-primary">
                {session.total}
              </span>
            </span>
          </Link>
        ))}
        {mockHistory.length === 0 && (
          <p className="text-sm text-muted-foreground">まだ模試の受験記録がありません。</p>
        )}
      </div>
    </div>
  );
}
