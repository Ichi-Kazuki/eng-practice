import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { questions, passages } from "@/db/schema";
import { SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { shuffle } from "@/lib/shuffle";
import { QuestionRunner, type RunnerItem } from "@/components/question-runner";

export const dynamic = "force-dynamic";

export default async function PracticeSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!(section in SECTION_META)) notFound();
  const sectionSlug = section as SectionSlug;
  if (!SECTION_META[sectionSlug].available) notFound();

  const db = getDb();
  const rows = await db
    .select()
    .from(questions)
    .leftJoin(passages, eq(questions.passageId, passages.id))
    .where(and(eq(questions.sectionSlug, sectionSlug), eq(questions.status, "published")));

  // パッセージ単位のまとまりは保ったまま、パッセージの出題順と各パッセージ内の設問順をランダム化する
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = row.questions.passageId ?? row.questions.id;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const orderedRows = shuffle(Array.from(groups.values()).map(shuffle)).flat();

  const items: RunnerItem[] = orderedRows.map((row) => ({
    question: {
      id: row.questions.id,
      stem: row.questions.stem,
      choices: row.questions.choices,
      correctIndex: row.questions.correctIndex,
      explanation: row.questions.explanation,
      questionType: row.questions.questionType,
    },
    passage: row.passages
      ? { id: row.passages.id, title: row.passages.title, body: row.passages.body }
      : null,
  }));

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-foreground">{SECTION_META[sectionSlug].nameJa}</h1>
      <QuestionRunner
        key={sectionSlug}
        items={items}
        mode="practice"
        backHref="/app/practice"
        backLabel="セクション選択に戻る"
      />
    </div>
  );
}
