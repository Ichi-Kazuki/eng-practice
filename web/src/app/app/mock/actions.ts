"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { mockSessions, attempts, questions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { buildMockSections, type MockSectionRequest, type MockTimeMode } from "@/lib/mock-session";
import { SECTION_META, MOCK_SECTION_ORDER, type SectionSlug } from "@/lib/section-meta";
import type { MockSectionConfig } from "@/db/schema";

type SectionChoice = "both" | SectionSlug;

const MAX_ID_LENGTH = 200;
// 個人運営の無料サイトを想定した粗い濫用対策。1時間に大量の模試セッションを
// 自動生成されるとD1の行数が無制限に増えるため、常識的な上限だけ設ける
// (通常利用でこの回数に達することはない)。
const MAX_SESSIONS_PER_HOUR = 20;

export async function startMockTest(formData: FormData) {
  const identity = await getOrCreateActiveIdentity();

  const db = getDb();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count: recentSessionCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mockSessions)
    .where(and(eq(mockSessions.userId, identity.userId), gte(mockSessions.createdAt, oneHourAgo)));
  if (recentSessionCount >= MAX_SESSIONS_PER_HOUR) {
    redirect("/app/mock");
  }

  const sectionChoiceRaw = formData.get("sectionChoice");
  const sectionChoice: SectionChoice =
    sectionChoiceRaw === "structure" || sectionChoiceRaw === "reading" ? sectionChoiceRaw : "both";

  const includedSlugs: SectionSlug[] =
    sectionChoice === "both" ? MOCK_SECTION_ORDER : MOCK_SECTION_ORDER.filter((s) => s === sectionChoice);

  const requests: MockSectionRequest[] = includedSlugs.map((slug) => {
    const rawCount = Number(formData.get(`count_${slug}`));
    const count =
      Number.isFinite(rawCount) && rawCount > 0 ? Math.round(rawCount) : SECTION_META[slug].mockOfficialQuestionCount;
    return { sectionSlug: slug, count };
  });

  const timeMode: MockTimeMode = formData.get("timeMode") === "stopwatch" ? "stopwatch" : "fixed";

  const sections = await buildMockSections(requests, timeMode);
  if (sections.length === 0) {
    // 選択されたセクションに公開問題が1問もない場合は空のセッションを作らず開始画面に戻す
    redirect("/app/mock");
  }
  const id = crypto.randomUUID();
  await db.insert(mockSessions).values({
    id,
    userId: identity.userId,
    status: "in_progress",
    sections,
    currentSectionIndex: 0,
    answers: {},
  });

  redirect(`/app/mock/${id}`);
}

async function loadOwnedSession(sessionId: string) {
  const identity = await getOrCreateActiveIdentity();

  const db = getDb();
  const session = await db.query.mockSessions.findFirst({
    where: eq(mockSessions.id, sessionId),
  });
  if (!session || session.userId !== identity.userId) throw new Error("not found");
  return { db, identity, session };
}

export async function startMockSection(sessionId: string) {
  const { db, session } = await loadOwnedSession(sessionId);
  const sections = session.sections as MockSectionConfig[];
  const current = sections[session.currentSectionIndex];
  if (current && current.startedAt === null) {
    current.startedAt = Date.now();
    await db
      .update(mockSessions)
      .set({ sections })
      .where(eq(mockSessions.id, sessionId));
  }
  revalidatePath(`/app/mock/${sessionId}`);
}

export async function answerMockQuestion(
  sessionId: string,
  questionId: string,
  selectedIndex: number
) {
  if (typeof questionId !== "string" || questionId.length === 0 || questionId.length > MAX_ID_LENGTH) {
    throw new Error("invalid questionId");
  }
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0) {
    throw new Error("invalid selectedIndex");
  }

  const { db, session } = await loadOwnedSession(sessionId);
  const sections = session.sections as MockSectionConfig[];
  const allQuestionIds = new Set(sections.flatMap((s) => s.questionIds));
  if (!allQuestionIds.has(questionId)) {
    throw new Error("question not in this mock session");
  }

  const question = await db.query.questions.findFirst({ where: eq(questions.id, questionId) });
  if (!question || selectedIndex >= question.choices.length) {
    throw new Error("invalid selectedIndex");
  }

  const answers = { ...(session.answers as Record<string, number>), [questionId]: selectedIndex };
  await db.update(mockSessions).set({ answers }).where(eq(mockSessions.id, sessionId));
}

export async function toggleMockFlag(sessionId: string, questionId: string) {
  if (typeof questionId !== "string" || questionId.length === 0 || questionId.length > MAX_ID_LENGTH) {
    throw new Error("invalid questionId");
  }

  const { db, session } = await loadOwnedSession(sessionId);
  const sections = session.sections as MockSectionConfig[];
  const current = sections[session.currentSectionIndex];
  if (!current) return;

  if (!current.questionIds.includes(questionId)) {
    throw new Error("question not in current section");
  }

  const flags = current.flags ?? [];
  current.flags = flags.includes(questionId)
    ? flags.filter((id) => id !== questionId)
    : [...flags, questionId];

  await db.update(mockSessions).set({ sections }).where(eq(mockSessions.id, sessionId));
}

export async function submitMockSection(sessionId: string): Promise<{ done: boolean }> {
  const { db, identity, session } = await loadOwnedSession(sessionId);
  const sections = session.sections as MockSectionConfig[];
  const idx = session.currentSectionIndex;
  const current = sections[idx];
  if (!current) return { done: true };

  if (current.submittedAt === null) {
    current.submittedAt = Date.now();
  }

  const isLastSection = idx === sections.length - 1;

  if (isLastSection) {
    const answers = session.answers as Record<string, number>;
    const allQuestionIds = sections.flatMap((s) => s.questionIds);
    const answeredIds = allQuestionIds.filter((id) => answers[id] !== undefined);

    if (answeredIds.length > 0) {
      const answeredQuestions = await db
        .select()
        .from(questions)
        .where(inArray(questions.id, answeredIds));

      await db.insert(attempts).values(
        answeredQuestions.map((q) => ({
          id: crypto.randomUUID(),
          userId: identity.userId,
          questionId: q.id,
          selectedIndex: answers[q.id],
          isCorrect: answers[q.id] === q.correctIndex,
          mode: "mock" as const,
          mockSessionId: sessionId,
        }))
      );
    }

    await db
      .update(mockSessions)
      .set({ sections, status: "completed", completedAt: new Date() })
      .where(eq(mockSessions.id, sessionId));
    return { done: true };
  }

  await db
    .update(mockSessions)
    .set({ sections, currentSectionIndex: idx + 1 })
    .where(eq(mockSessions.id, sessionId));
  return { done: false };
}
