"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { mockSessions, attempts, questions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { buildMockSections, type MockSectionRequest, type MockTimeMode } from "@/lib/mock-session";
import { SECTION_META, MOCK_SECTION_ORDER, type SectionSlug } from "@/lib/section-meta";
import type { MockSectionConfig } from "@/db/schema";

type SectionChoice = "both" | SectionSlug;

export async function startMockTest(formData: FormData) {
  const identity = await getOrCreateActiveIdentity();

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

  const db = getDb();
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
  const { db, session } = await loadOwnedSession(sessionId);
  const answers = { ...(session.answers as Record<string, number>), [questionId]: selectedIndex };
  await db.update(mockSessions).set({ answers }).where(eq(mockSessions.id, sessionId));
}

export async function toggleMockFlag(sessionId: string, questionId: string) {
  const { db, session } = await loadOwnedSession(sessionId);
  const sections = session.sections as MockSectionConfig[];
  const current = sections[session.currentSectionIndex];
  if (!current) return;

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
