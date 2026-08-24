import { eq, inArray } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db";
import { mockSessions, passages, type MockSectionConfig } from "@/db/schema";
import { getActiveIdentity } from "@/lib/auth/active-identity";
import { getQuestionsByIds } from "@/lib/mock-session";
import { SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { startMockSection } from "@/app/app/mock/actions";
import { StartSectionButton } from "@/components/start-section-button";
import { MockSectionRunner, type MockRunnerQuestion } from "@/components/mock-section-runner";

export const dynamic = "force-dynamic";

export default async function MockSessionPage({
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
  if (session.status === "completed") redirect(`/app/mock/${sessionId}/result`);

  const sections = session.sections as MockSectionConfig[];
  const current = sections[session.currentSectionIndex];
  const sectionMeta = SECTION_META[current.sectionSlug as SectionSlug];

  if (current.startedAt === null) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-muted-foreground">
          セクション {session.currentSectionIndex + 1} / {sections.length}
        </p>
        <h1 className="mt-1 text-xl font-bold text-foreground">{sectionMeta.nameJa}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {current.timeLimitSec !== null
            ? `制限時間は${Math.round(current.timeLimitSec / 60)}分、`
            : "時間の制限はなく、経過時間の計測のみ、"}
          全{current.questionIds.length}問です。開始すると時間の計測が始まります。
        </p>
        <form
          action={async () => {
            "use server";
            await startMockSection(sessionId);
          }}
          className="mt-6"
        >
          <StartSectionButton />
        </form>
      </div>
    );
  }

  const questionRows = await getQuestionsByIds(current.questionIds);
  const passageIds = [...new Set(questionRows.map((q) => q.passageId).filter((id): id is string => !!id))];
  const passageMap = new Map<string, { id: string; title: string; body: string }>();
  if (passageIds.length > 0) {
    const allPassages = await db.select().from(passages).where(inArray(passages.id, passageIds));
    for (const p of allPassages) passageMap.set(p.id, p);
  }

  const byId = new Map(questionRows.map((q) => [q.id, q]));
  const orderedQuestions: MockRunnerQuestion[] = current.questionIds
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .map((q) => ({
      id: q.id,
      stem: q.stem,
      choices: q.choices,
      questionType: q.questionType,
      passage: q.passageId ? passageMap.get(q.passageId) ?? null : null,
    }));

  const initialAnswers = Object.fromEntries(
    Object.entries(session.answers as Record<string, number>).filter(([id]) =>
      current.questionIds.includes(id)
    )
  );
  const initialFlags = (current.flags ?? []).filter((id) => current.questionIds.includes(id));

  return (
    <div data-question-solving>
      <MockSectionRunner
        sessionId={sessionId}
        sectionLabel={sectionMeta.nameJa}
        timeLimitSec={current.timeLimitSec}
        startedAtMs={current.startedAt}
        questions={orderedQuestions}
        initialAnswers={initialAnswers}
        initialFlags={initialFlags}
      />
    </div>
  );
}
