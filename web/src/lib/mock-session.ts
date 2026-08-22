import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { MOCK_SECTION_ORDER, SECTION_META } from "@/lib/section-meta";
import type { MockSectionConfig } from "@/db/schema";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function buildMockSections(): Promise<MockSectionConfig[]> {
  const db = getDb();
  const sections: MockSectionConfig[] = [];

  for (const sectionSlug of MOCK_SECTION_ORDER) {
    const published = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.sectionSlug, sectionSlug), eq(questions.status, "published")));

    sections.push({
      sectionSlug,
      questionIds: shuffle(published.map((q) => q.id)),
      timeLimitSec: SECTION_META[sectionSlug].mockTimeLimitSec,
      startedAt: null,
      submittedAt: null,
    });
  }

  return sections;
}

export async function getQuestionsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const db = getDb();
  return db.select().from(questions).where(inArray(questions.id, ids));
}
