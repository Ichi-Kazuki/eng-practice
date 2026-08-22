import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SECTION_META, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { percentToScaledScore, estimateProvisionalTotalScore } from "@/lib/mock-scoring";
import { Card } from "@/components/ui/card";
import { LoginRequired } from "@/components/login-required";
import { ScoreDisclaimerBadge } from "@/components/score-disclaimer-badge";
import { AccuracyBar } from "@/components/accuracy-bar";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

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
          {(["structure", "reading", "listening"] as SectionSlug[]).map((s) => (
            <div key={s}>
              <p className="text-xs text-muted-foreground">{SECTION_META[s].nameEn}</p>
              <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-foreground">
                {s === "listening" ? "準備中" : (sectionScaled[s] ?? "-")}
              </p>
            </div>
          ))}
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
    </div>
  );
}
