import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { MOCK_SECTION_ORDER, SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { shuffle } from "@/lib/shuffle";
import type { MockSectionConfig } from "@/db/schema";

export type MockSectionRequest = {
  sectionSlug: SectionSlug;
  count: number;
};

export type MockTimeMode = "fixed" | "stopwatch";

// 本番のStructureセクションは「文法補充15問→誤り指摘25問」の順・比率で出題される。
// 出題数が本番相当(40問)のときはこの比率、それ以外(10問・20問など)は半々に分ける。
function splitStructureCounts(total: number, officialCount: number) {
  if (total === officialCount) {
    const officialCompletion = 15;
    return { completion: Math.min(officialCompletion, total), errorId: total - Math.min(officialCompletion, total) };
  }
  const completion = Math.floor(total / 2);
  return { completion, errorId: total - completion };
}

async function selectStructureQuestionIds(count: number, officialCount: number): Promise<string[]> {
  const db = getDb();
  const [completionRows, errorIdRows] = await Promise.all([
    db
      .select({ id: questions.id })
      .from(questions)
      .where(
        and(
          eq(questions.sectionSlug, "structure"),
          eq(questions.status, "published"),
          eq(questions.questionType, "structure_completion")
        )
      ),
    db
      .select({ id: questions.id })
      .from(questions)
      .where(
        and(
          eq(questions.sectionSlug, "structure"),
          eq(questions.status, "published"),
          eq(questions.questionType, "structure_error_id")
        )
      ),
  ]);

  const shuffledCompletion = shuffle(completionRows.map((q) => q.id));
  const shuffledErrorId = shuffle(errorIdRows.map((q) => q.id));
  const total = Math.min(count, shuffledCompletion.length + shuffledErrorId.length);
  const { completion, errorId } = splitStructureCounts(total, officialCount);

  // 固定模試では本番のtype別構成を維持する。不足時は呼び出し側で開始を止める。
  const completionTake = Math.min(completion, shuffledCompletion.length);
  const errorIdTake = Math.min(errorId, shuffledErrorId.length);

  return [
    ...shuffledCompletion.slice(0, completionTake),
    ...shuffledErrorId.slice(0, errorIdTake),
  ];
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
    let selectedIds: string[];

    if (sectionSlug === "structure") {
      selectedIds = await selectStructureQuestionIds(
        Math.round(count) || 1,
        SECTION_META.structure.mockOfficialQuestionCount
      );
      if (selectedIds.length !== Math.round(count)) {
        throw new Error("not enough published structure questions");
      }
    } else {
      const published = await db
        .select({ id: questions.id })
        .from(questions)
        .where(and(eq(questions.sectionSlug, sectionSlug), eq(questions.status, "published")));

      const shuffled = shuffle(published.map((q) => q.id));
      const requestedCount = Math.round(count) || 1;
      if (shuffled.length < requestedCount) {
        throw new Error("not enough published questions");
      }
      selectedIds = shuffled.slice(0, requestedCount);
    }

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
      flags: [],
    });
  }

  return sections;
}

export async function getQuestionsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const db = getDb();
  return db.select().from(questions).where(inArray(questions.id, ids));
}
