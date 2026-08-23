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

const MAX_ID_LENGTH = 200;
const MAX_INSERT_ROWS = 10;
// 個人運営の無料サイトを想定した粗い濫用対策。1時間に大量の模試セッションを
// 自動生成されるとD1の行数が無制限に増えるため、常識的な上限だけ設ける
// (通常利用でこの回数に達することはない)。
const MAX_SESSIONS_PER_HOUR = 20;

async function assertUnderSessionRateLimit(db: ReturnType<typeof getDb>, userId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count: recentSessionCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mockSessions)
    .where(and(eq(mockSessions.userId, userId), gte(mockSessions.createdAt, oneHourAgo)));
  if (recentSessionCount >= MAX_SESSIONS_PER_HOUR) {
    redirect("/app/mock");
  }
}

async function assertFixedMockAvailability(db: ReturnType<typeof getDb>) {
  const published = await db
    .select({ sectionSlug: questions.sectionSlug, questionType: questions.questionType })
    .from(questions)
    .where(eq(questions.status, "published"));
  const structureCompletion = published.filter(
    (question) => question.sectionSlug === "structure" && question.questionType === "structure_completion"
  ).length;
  const structureErrorId = published.filter(
    (question) => question.sectionSlug === "structure" && question.questionType === "structure_error_id"
  ).length;
  const reading = published.filter((question) => question.sectionSlug === "reading").length;

  if (
    structureCompletion < 15 ||
    structureErrorId < 25 ||
    reading < SECTION_META.reading.mockOfficialQuestionCount
  ) {
    redirect("/app/mock?error=inventory");
  }
}

function isSectionExpired(section: MockSectionConfig, now = Date.now()): boolean {
  return (
    section.timeMode === "fixed" &&
    section.startedAt !== null &&
    section.timeLimitSec !== null &&
    now - section.startedAt >= section.timeLimitSec * 1000
  );
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

async function createAndEnterMockSession(
  db: ReturnType<typeof getDb>,
  userId: string,
  requests: MockSectionRequest[],
  timeMode: MockTimeMode,
  enforceFixedAvailability = false
) {
  if (enforceFixedAvailability) await assertFixedMockAvailability(db);
  const sections = await buildMockSections(requests, timeMode);
  if (
    sections.length !== requests.length ||
    sections.some((section, index) => section.questionIds.length !== requests[index]?.count)
  ) {
    redirect("/app/mock?error=inventory");
  }
  // 「模試を開始する」を押した時点で最初のセクションの計測も始め、
  // セッション作成後に別途「このセクションを開始する」を押させる中間画面を挟まない
  sections[0].startedAt = Date.now();
  const id = crypto.randomUUID();
  await db.insert(mockSessions).values({
    id,
    userId,
    status: "in_progress",
    sections,
    currentSectionIndex: 0,
    answers: {},
  });

  redirect(`/app/mock/${id}`);
}

export async function startMockTest(formData: FormData) {
  const identity = await getOrCreateActiveIdentity();
  const db = getDb();
  await assertUnderSessionRateLimit(db, identity.userId);

  const rawTimeMode = formData.get("timeMode");
  if (rawTimeMode !== "fixed" && rawTimeMode !== "stopwatch") redirect("/app/mock");
  const requests: MockSectionRequest[] = MOCK_SECTION_ORDER.map((sectionSlug) => ({
    sectionSlug,
    count: SECTION_META[sectionSlug].mockOfficialQuestionCount,
  }));
  const timeMode = rawTimeMode as MockTimeMode;

  await createAndEnterMockSession(db, identity.userId, requests, timeMode, true);
}

// 完了済みセッションと同じセクション構成・出題数・時間の測り方で新しいセッションを作る
export async function restartMockTest(sessionId: string) {
  const identity = await getOrCreateActiveIdentity();
  const db = getDb();

  const prevSession = await db.query.mockSessions.findFirst({
    where: eq(mockSessions.id, sessionId),
  });
  if (!prevSession || prevSession.userId !== identity.userId) throw new Error("not found");

  await assertUnderSessionRateLimit(db, identity.userId);

  const prevSections = prevSession.sections as MockSectionConfig[];
  const requests: MockSectionRequest[] =
    prevSession.status === "completed"
      ? MOCK_SECTION_ORDER.map((sectionSlug) => ({
          sectionSlug,
          count: SECTION_META[sectionSlug].mockOfficialQuestionCount,
        }))
      : prevSections.map((s) => ({
          sectionSlug: s.sectionSlug as SectionSlug,
          count: s.questionIds.length,
        }));
  const timeMode: MockTimeMode = prevSections[0]?.timeMode ?? "fixed";

  await createAndEnterMockSession(db, identity.userId, requests, timeMode, prevSession.status === "completed");
}

async function loadOwnedSession(sessionId: string) {
  const identity = await getOrCreateActiveIdentity();

  const db = getDb();
  const session = await db.query.mockSessions.findFirst({
    where: eq(mockSessions.id, sessionId),
  });
  if (!session || session.userId !== identity.userId || session.status !== "in_progress") throw new Error("not found");
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
  const current = sections[session.currentSectionIndex];
  if (!current || !current.questionIds.includes(questionId)) {
    throw new Error("question not in this mock session");
  }
  if (current.startedAt === null || isSectionExpired(current)) throw new Error("section time expired");

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
  if (current.startedAt === null || isSectionExpired(current)) throw new Error("section time expired");

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

  if (current.submittedAt !== null) return { done: session.status === "completed" };
  if (current.startedAt === null) throw new Error("section has not started");

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

      const attemptValues = answeredQuestions.map((q) => ({
        id: crypto.randomUUID(),
        userId: identity.userId,
        questionId: q.id,
        selectedIndex: answers[q.id],
        isCorrect: answers[q.id] === q.correctIndex,
        mode: "mock" as const,
        mockSessionId: sessionId,
      }));
      for (const values of chunk(attemptValues, MAX_INSERT_ROWS)) {
        await db.insert(attempts).values(values);
      }
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
