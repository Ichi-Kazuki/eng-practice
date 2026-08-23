import { eq, and, desc, inArray, sql } from "drizzle-orm";
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

const MAX_D1_BOUND_PARAMS = 100;
const MOCK_ID_CHUNK_SIZE = MAX_D1_BOUND_PARAMS - 2; // userId + mode

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <LoginRequired message="スコアダッシュボードは演習履歴をアカウントに保存して表示するため、ログインが必要です。" />
    );
  }

  const db = getDb();
  const [sectionRows, typeRows] = await Promise.all([
    db
      .select({
        sectionSlug: questions.sectionSlug,
        correct: sql<number>`sum(case when ${attempts.isCorrect} = 1 then 1 else 0 end)`,
        total: sql<number>`count(*)`,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(eq(attempts.userId, user.userId))
      .groupBy(questions.sectionSlug),
    db
      .select({
        questionType: questions.questionType,
        correct: sql<number>`sum(case when ${attempts.isCorrect} = 1 then 1 else 0 end)`,
        total: sql<number>`count(*)`,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(eq(attempts.userId, user.userId))
      .groupBy(questions.questionType),
  ]);

  const bySection = new Map(
    sectionRows.map((row) => [row.sectionSlug, { correct: Number(row.correct), total: Number(row.total) }])
  );
  const byType = new Map(
    typeRows.map((row) => [row.questionType, { correct: Number(row.correct), total: Number(row.total) }])
  );

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

  const fullMockIds = fullLengthMocks.map((session) => session.id);
  const legacyMockAttempts = [];
  for (let i = 0; i < fullMockIds.length; i += MOCK_ID_CHUNK_SIZE) {
    const idChunk = fullMockIds.slice(i, i + MOCK_ID_CHUNK_SIZE);
    legacyMockAttempts.push(
      ...(await db
        .select({
          mockSessionId: attempts.mockSessionId,
          questionId: attempts.questionId,
          isCorrect: attempts.isCorrect,
        })
        .from(attempts)
        .where(
          and(
            eq(attempts.userId, user.userId),
            eq(attempts.mode, "mock"),
            inArray(attempts.mockSessionId, idChunk)
          )
        ))
    );
  }
  const legacyCorrectByKey = new Map(
    legacyMockAttempts.map((attempt) => [`${attempt.mockSessionId}:${attempt.questionId}`, attempt.isCorrect])
  );

  const mockHistory = fullLengthMocks.map((session) => {
    const sections = session.sections as MockSectionConfig[];
    if (session.resultSnapshot) {
      return {
        id: session.id,
        completedAt: session.completedAt,
        sectionScores: session.resultSnapshot.sections.map((section) => ({
          sectionSlug: section.sectionSlug as SectionSlug,
          scaled: section.scaled,
        })),
        total: session.resultSnapshot.totalScore,
      };
    }

    const sectionScores = sections.map((section) => {
      const total = section.questionIds.length;
      const correct = section.questionIds.filter((id) => legacyCorrectByKey.get(`${session.id}:${id}`)).length;
      const scaled = total > 0 ? percentToScaledScore((correct / total) * 100) : null;
      return { sectionSlug: section.sectionSlug as SectionSlug, scaled };
    });
    const total = estimateProvisionalTotalScore(
      sectionScores.filter((section) => section.scaled !== null).map((section) => section.scaled as number)
    );
    return { id: session.id, completedAt: session.completedAt, sectionScores, total };
  });

  return (
    <div>
      <JaHeading className="text-xl font-bold text-foreground" text="スコアダッシュボード" />

      {weakest && (
        <p className="mt-4 text-sm text-muted-foreground">
          現在の弱点セクションは
          <span className="font-medium text-primary"> {SECTION_META[weakest.section].nameJa} </span>
          です(正答率 {Math.round((weakest.stat!.correct / weakest.stat!.total) * 100)}%)。
        </p>
      )}

      <h2 className="mt-10 text-lg font-bold text-foreground">セクション別正答率</h2>
      <div className="mt-4 space-y-4">
        {scoredSections.map((section) => {
          const stat = bySection.get(section);
          const percent = stat ? Math.round((stat.correct / stat.total) * 100) : null;
          return (
            <div key={section}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{SECTION_META[section].nameJa}</span>
                <span className="font-[family-name:var(--font-geist-mono)] text-muted-foreground">
                  {stat ? `${stat.correct}/${stat.total} (${percent}%)` : "未受験"}
                </span>
              </div>
              {percent !== null && (
                <div className="mt-1.5">
                  <AccuracyBar percent={percent} />
                </div>
              )}
            </div>
          );
        })}
      </div>

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
            className="grid gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent sm:flex sm:items-center sm:justify-between"
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
            <span className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
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
