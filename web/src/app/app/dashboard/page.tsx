import { eq, and, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { attempts, questions, mockSessions, type MockSectionConfig } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SECTION_META, MOCK_SECTION_ORDER, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { percentToScaledScore, estimateProvisionalTotalScore } from "@/lib/mock-scoring";
import { LoginRequired } from "@/components/login-required";
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

  const weakest = scoredSections
    .map((s) => ({ section: s, stat: bySection.get(s) }))
    .filter((x) => x.stat && x.stat.total > 0)
    .sort((a, b) => a.stat!.correct / a.stat!.total - b.stat!.correct / b.stat!.total)[0];

  const completedMocks = await db.query.mockSessions.findMany({
    where: and(eq(mockSessions.userId, user.userId), eq(mockSessions.status, "completed")),
    orderBy: [desc(mockSessions.completedAt)],
  });

  // 伸びの記録としての意味を持たせるため、Structure40問・Reading50問の本番相当を
  // 両セクションとも解いたフルレングスの模試のみ履歴に表示する
  const fullLengthMocks = completedMocks.filter((session) => {
    const sections = session.sections as MockSectionConfig[];
    return MOCK_SECTION_ORDER.every((slug) => {
      const sec = sections.find((s) => s.sectionSlug === slug);
      return (
        sec &&
        sec.timeMode === "fixed" &&
        sec.questionIds.length === SECTION_META[slug].mockOfficialQuestionCount
      );
    });
  });

  const mockQuestionIds = Array.from(
    new Set(
      fullLengthMocks.flatMap((session) =>
        (session.sections as MockSectionConfig[]).flatMap((s) => s.questionIds)
      )
    )
  );
  const correctIndexById = new Map<string, number>();
  // D1は1クエリあたり最大100個のバインドパラメータまでしか受け付けないため、
  // 受験履歴が増えて出題IDの合計が100を超える場合はチャンクに分けて問い合わせる
  const D1_MAX_BOUND_PARAMS = 100;
  for (let i = 0; i < mockQuestionIds.length; i += D1_MAX_BOUND_PARAMS) {
    const chunk = mockQuestionIds.slice(i, i + D1_MAX_BOUND_PARAMS);
    const qRows = await db
      .select({ id: questions.id, correctIndex: questions.correctIndex })
      .from(questions)
      .where(inArray(questions.id, chunk));
    for (const q of qRows) correctIndexById.set(q.id, q.correctIndex);
  }

  const mockHistory = fullLengthMocks.map((session) => {
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

      {weakest && (
        <p className="mt-4 text-sm text-muted-foreground">
          現在の弱点セクションは
          <span className="font-medium text-destructive"> {SECTION_META[weakest.section].nameJa} </span>
          です(正答率 {Math.round((weakest.stat!.correct / weakest.stat!.total) * 100)}%)。
        </p>
      )}

      <h2 className="mt-10 text-lg font-bold text-foreground">分野別正答率</h2>
      <div className="mt-4 space-y-4">
        {[
          ...Object.keys(QUESTION_TYPE_LABEL_JA).filter((type) => byType.has(type)),
          ...Array.from(byType.keys()).filter((type) => !(type in QUESTION_TYPE_LABEL_JA)),
        ].map((type) => {
          const stat = byType.get(type)!;
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
