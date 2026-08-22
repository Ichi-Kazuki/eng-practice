"use server";

import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { mockSessions, attempts, questions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import type { MockSectionConfig } from "@/db/schema";

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
