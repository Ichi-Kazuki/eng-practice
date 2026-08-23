"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  mockSessions,
  attempts,
  questions,
  type MockResultSnapshot,
  type MockSectionConfig,
} from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { buildMockSections, type MockSectionRequest, type MockTimeMode } from "@/lib/mock-session";
import { MOCK_SECTION_ORDER, SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { estimateProvisionalTotalScore, percentToScaledScore } from "@/lib/mock-scoring";

const MAX_ID_LENGTH = 200;
const MAX_INSERT_ROWS = 10;
const D1_MAX_BOUND_PARAMS = 100;
const MAX_SESSION_WRITE_RETRIES = 4;
const MAX_SESSIONS_PER_HOUR = 20;

function assertId(value: string, name: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_ID_LENGTH) {
    throw new Error(`invalid ${name}`);
  }
  return value;
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

function isSectionExpired(section: MockSectionConfig, now = Date.now()): boolean {
  return (
    section.timeMode === "fixed" &&
    section.startedAt !== null &&
    section.timeLimitSec !== null &&
    now - section.startedAt >= section.timeLimitSec * 1000
  );
}

async function assertUnderSessionRateLimit(db: ReturnType<typeof getDb>, userId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count: recentSessionCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mockSessions)
    .where(and(eq(mockSessions.userId, userId), gte(mockSessions.createdAt, oneHourAgo)));
  if (recentSessionCount >= MAX_SESSIONS_PER_HOUR) redirect("/app/mock");
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

async function getQuestionsByIds(db: ReturnType<typeof getDb>, ids: string[]) {
  const rows = [];
  for (const idChunk of chunk(ids, D1_MAX_BOUND_PARAMS)) {
    rows.push(...(await db.select().from(questions).where(inArray(questions.id, idChunk))));
  }
  return rows;
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

  sections[0].startedAt = Date.now();
  const id = crypto.randomUUID();
  await db.insert(mockSessions).values({
    id,
    userId,
    status: "in_progress",
    sections,
    currentSectionIndex: 0,
    answers: {},
    revision: 0,
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
  await createAndEnterMockSession(db, identity.userId, requests, rawTimeMode, true);
}

export async function restartMockTest(sessionId: string) {
  assertId(sessionId, "sessionId");
  const identity = await getOrCreateActiveIdentity();
  const db = getDb();

  const prevSession = await db.query.mockSessions.findFirst({ where: eq(mockSessions.id, sessionId) });
  if (!prevSession || prevSession.userId !== identity.userId) throw new Error("not found");

  await assertUnderSessionRateLimit(db, identity.userId);

  const prevSections = prevSession.sections as MockSectionConfig[];
  const requests: MockSectionRequest[] =
    prevSession.status === "completed"
      ? MOCK_SECTION_ORDER.map((sectionSlug) => ({
          sectionSlug,
          count: SECTION_META[sectionSlug].mockOfficialQuestionCount,
        }))
      : prevSections.map((section) => ({
          sectionSlug: section.sectionSlug as SectionSlug,
          count: section.questionIds.length,
        }));
  const timeMode: MockTimeMode = prevSections[0]?.timeMode ?? "fixed";

  await createAndEnterMockSession(db, identity.userId, requests, timeMode, prevSession.status === "completed");
}

async function loadOwnedSession(sessionId: string) {
  assertId(sessionId, "sessionId");
  const identity = await getOrCreateActiveIdentity();
  const db = getDb();
  const session = await db.query.mockSessions.findFirst({ where: eq(mockSessions.id, sessionId) });
  if (!session || session.userId !== identity.userId || session.status !== "in_progress") {
    throw new Error("not found");
  }
  return { db, identity, session };
}

async function updateSessionIfCurrent(
  db: ReturnType<typeof getDb>,
  sessionId: string,
  revision: number,
  values: Partial<typeof mockSessions.$inferInsert>
): Promise<boolean> {
  const result = await db
    .update(mockSessions)
    .set({ ...values, revision: sql`${mockSessions.revision} + 1` })
    .where(
      and(
        eq(mockSessions.id, sessionId),
        eq(mockSessions.status, "in_progress"),
        eq(mockSessions.revision, revision)
      )
    );
  return (result.meta?.changes ?? 0) > 0;
}

export async function startMockSection(sessionId: string) {
  for (let attempt = 0; attempt < MAX_SESSION_WRITE_RETRIES; attempt += 1) {
    const { db, session } = await loadOwnedSession(sessionId);
    const sections = session.sections as MockSectionConfig[];
    const current = sections[session.currentSectionIndex];
    if (!current) throw new Error("invalid mock section");
    if (current.startedAt !== null) return;

    current.startedAt = Date.now();
    if (await updateSessionIfCurrent(db, sessionId, session.revision, { sections })) {
      revalidatePath(`/app/mock/${sessionId}`);
      return;
    }
  }
  throw new Error("mock session changed; retry");
}

export async function answerMockQuestion(sessionId: string, questionId: string, selectedIndex: number) {
  assertId(sessionId, "sessionId");
  assertId(questionId, "questionId");
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0) throw new Error("invalid selectedIndex");

  for (let attempt = 0; attempt < MAX_SESSION_WRITE_RETRIES; attempt += 1) {
    const { db, session } = await loadOwnedSession(sessionId);
    const sections = session.sections as MockSectionConfig[];
    const current = sections[session.currentSectionIndex];
    if (!current || !current.questionIds.includes(questionId)) {
      throw new Error("question not in this mock session");
    }
    if (current.startedAt === null || isSectionExpired(current)) throw new Error("section time expired");

    const question = await db.query.questions.findFirst({ where: eq(questions.id, questionId) });
    if (!question || selectedIndex >= question.choices.length) throw new Error("invalid selectedIndex");

    const answers = { ...(session.answers as Record<string, number>), [questionId]: selectedIndex };
    if (await updateSessionIfCurrent(db, sessionId, session.revision, { answers })) return;
  }
  throw new Error("mock session changed; retry");
}

export async function toggleMockFlag(sessionId: string, questionId: string) {
  assertId(sessionId, "sessionId");
  assertId(questionId, "questionId");

  for (let attempt = 0; attempt < MAX_SESSION_WRITE_RETRIES; attempt += 1) {
    const { db, session } = await loadOwnedSession(sessionId);
    const sections = session.sections as MockSectionConfig[];
    const current = sections[session.currentSectionIndex];
    if (!current || !current.questionIds.includes(questionId)) {
      throw new Error("question not in current section");
    }
    if (current.startedAt === null || isSectionExpired(current)) throw new Error("section time expired");

    const flags = current.flags ?? [];
    current.flags = flags.includes(questionId)
      ? flags.filter((id) => id !== questionId)
      : [...flags, questionId];
    if (await updateSessionIfCurrent(db, sessionId, session.revision, { sections })) return;
  }
  throw new Error("mock session changed; retry");
}

export async function setMockFlag(sessionId: string, questionId: string, flagged: boolean) {
  assertId(sessionId, "sessionId");
  assertId(questionId, "questionId");

  for (let attempt = 0; attempt < MAX_SESSION_WRITE_RETRIES; attempt += 1) {
    const { db, session } = await loadOwnedSession(sessionId);
    const sections = session.sections as MockSectionConfig[];
    const current = sections[session.currentSectionIndex];
    if (!current || !current.questionIds.includes(questionId)) {
      throw new Error("question not in current section");
    }
    if (current.startedAt === null || isSectionExpired(current)) throw new Error("section time expired");

    const flags = current.flags ?? [];
    current.flags = flagged
      ? [...new Set([...flags, questionId])]
      : flags.filter((id) => id !== questionId);
    if (await updateSessionIfCurrent(db, sessionId, session.revision, { sections })) return;
  }
  throw new Error("mock session changed; retry");
}

async function buildMockResultSnapshot(
  db: ReturnType<typeof getDb>,
  sections: MockSectionConfig[],
  answers: Record<string, number>,
  completedAt: number
): Promise<MockResultSnapshot> {
  const allQuestionIds = sections.flatMap((section) => section.questionIds);
  const rows = await getQuestionsByIds(db, allQuestionIds);
  const questionById = new Map(rows.map((question) => [question.id, question]));
  if (questionById.size !== new Set(allQuestionIds).size) throw new Error("mock question is missing");

  const resultSections = sections.map((section) => {
    const questionSnapshots = section.questionIds.map((questionId) => {
      const question = questionById.get(questionId);
      if (!question) throw new Error("mock question is missing");
      const selectedIndex = answers[questionId] ?? null;
      return {
        id: question.id,
        stem: question.stem,
        choices: [...question.choices],
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        questionType: question.questionType,
        selectedIndex,
        isCorrect: selectedIndex !== null && selectedIndex === question.correctIndex,
      };
    });
    const correct = questionSnapshots.filter((question) => question.isCorrect).length;
    const total = questionSnapshots.length;
    return {
      sectionSlug: section.sectionSlug,
      correct,
      total,
      scaled: total > 0 ? percentToScaledScore((correct / total) * 100) : null,
      questions: questionSnapshots,
    };
  });

  return {
    sections: resultSections,
    totalScore: estimateProvisionalTotalScore(
      resultSections.filter((section) => section.scaled !== null).map((section) => section.scaled as number)
    ),
    completedAt,
  };
}

export async function submitMockSection(sessionId: string): Promise<{ done: boolean }> {
  assertId(sessionId, "sessionId");

  for (let attempt = 0; attempt < MAX_SESSION_WRITE_RETRIES; attempt += 1) {
    const { db, identity, session } = await loadOwnedSession(sessionId);
    const sections = session.sections as MockSectionConfig[];
    const index = session.currentSectionIndex;
    const current = sections[index];
    if (!current) return { done: true };
    if (current.submittedAt !== null) return { done: session.status === "completed" };
    if (current.startedAt === null) throw new Error("section has not started");

    const submittedAt = Date.now();
    current.submittedAt = submittedAt;
    const isLastSection = index === sections.length - 1;
    if (!isLastSection) {
      const next = sections[index + 1];
      if (!next) throw new Error("invalid next mock section");
      next.startedAt = submittedAt;
      const updated = await updateSessionIfCurrent(db, sessionId, session.revision, {
        sections,
        currentSectionIndex: index + 1,
      });
      if (updated) return { done: false };
      continue;
    }

    const answers = session.answers as Record<string, number>;
    const completedAt = Date.now();
    const snapshot = await buildMockResultSnapshot(db, sections, answers, completedAt);
    const attemptValues = snapshot.sections.flatMap((section) =>
      section.questions
        .filter((question) => question.selectedIndex !== null)
        .map((question) => ({
          id: crypto.randomUUID(),
          userId: identity.userId,
          questionId: question.id,
          selectedIndex: question.selectedIndex as number,
          isCorrect: question.isCorrect,
          mode: "mock" as const,
          mockSessionId: sessionId,
        }))
    );
    for (const values of chunk(attemptValues, MAX_INSERT_ROWS)) {
      await db.insert(attempts).values(values).onConflictDoUpdate({
        target: [attempts.mockSessionId, attempts.questionId],
        set: {
          selectedIndex: sql`excluded.selected_index`,
          isCorrect: sql`excluded.is_correct`,
        },
      });
    }

    const updated = await updateSessionIfCurrent(db, sessionId, session.revision, {
      sections,
      status: "completed",
      resultSnapshot: snapshot,
      completedAt: new Date(completedAt),
    });
    if (updated) return { done: true };
  }

  throw new Error("mock session changed; retry");
}
