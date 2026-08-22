import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { MOCK_SECTION_ORDER, SECTION_META, type SectionSlug } from "@/lib/section-meta";
import type { MockSectionConfig } from "@/db/schema";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type MockSectionRequest = {
  sectionSlug: SectionSlug;
  count: number;
};

export type MockTimeMode = "fixed" | "stopwatch";

export function countPresets(available: number, officialCount: number): { value: number; label: string }[] {
  const candidates = [10, 20, officialCount].filter((n) => n > 0 && n <= available);
  const unique = Array.from(new Set(candidates)).sort((a, b) => a - b);
  if (unique.length === 0 && available > 0) unique.push(available);
  return unique.map((n) => {
    if (n === officialCount) return { value: n, label: `${n}問(本番相当)` };
    return { value: n, label: `${n}問` };
  });
}

export async function buildMockSections(
  requests: MockSectionRequest[],
  timeMode: MockTimeMode
): Promise<MockSectionConfig[]> {
  const db = getDb();
  const sections: MockSectionConfig[] = [];

  // 本番の出題順(Structure→Reading)を保ったまま、選択されたセクションだけを残す
  const ordered = MOCK_SECTION_ORDER.map((slug) => requests.find((r) => r.sectionSlug === slug)).filter(
    (r): r is MockSectionRequest => !!r
  );

  for (const { sectionSlug, count } of ordered) {
    const published = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.sectionSlug, sectionSlug), eq(questions.status, "published")));

    const shuffled = shuffle(published.map((q) => q.id));
    const clampedCount = Math.max(1, Math.min(Math.round(count) || 1, shuffled.length || 1));
    const selectedIds = shuffled.slice(0, clampedCount);

    const timeLimitSec =
      timeMode === "stopwatch"
        ? null
        : Math.round(selectedIds.length * SECTION_META[sectionSlug].mockPerQuestionSec);

    sections.push({
      sectionSlug,
      questionIds: selectedIds,
      timeLimitSec,
      timeMode,
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
