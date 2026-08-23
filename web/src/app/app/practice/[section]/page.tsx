import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { questions, passages } from "@/db/schema";
import { SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { shuffle } from "@/lib/shuffle";
import {
  getPracticeQuestionCount,
  getPracticeTimeLimitSec,
  hasPracticeSearchParams,
  parsePracticeConfig,
  resolvePracticeCount,
  type PracticeSearchParams,
} from "@/lib/practice-config";
import { PracticeConfigForm } from "@/components/practice-config-form";
import { QuestionRunner, type RunnerItem } from "@/components/question-runner";

export const dynamic = "force-dynamic";

export default async function PracticeSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<PracticeSearchParams>;
}) {
  const { section } = await params;
  if (!(section in SECTION_META)) notFound();
  const sectionSlug = section as SectionSlug;
  if (!SECTION_META[sectionSlug].available) notFound();

  const db = getDb();
  const availabilityRows = await db
    .select({ questionType: questions.questionType })
    .from(questions)
    .where(and(eq(questions.sectionSlug, sectionSlug), eq(questions.status, "published")));
  const availableByType = availabilityRows.reduce<Record<string, number>>((counts, row) => {
    counts[row.questionType] = (counts[row.questionType] ?? 0) + 1;
    return counts;
  }, {});

  const rawSearchParams = await searchParams;
  if (!hasPracticeSearchParams(rawSearchParams)) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-xl font-bold text-foreground">{SECTION_META[sectionSlug].nameJa}の演習設定</h1>
        <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
          問題タイプ・問題数・時間の測り方を選んでください。設定はURLに保存され、問題セットや解答は保存されません。
        </p>
        <PracticeConfigForm section={sectionSlug as "structure" | "reading"} availableByType={availableByType} />
      </div>
    );
  }

  const config = parsePracticeConfig(sectionSlug, rawSearchParams);
  if (!config) notFound();

  const questionRows = await db
    .select()
    .from(questions)
    .leftJoin(passages, eq(questions.passageId, passages.id))
    .where(and(eq(questions.sectionSlug, sectionSlug), eq(questions.status, "published")));

  const questionCount = getPracticeQuestionCount(config, availableByType);
  if (questionCount === null) notFound();

  let orderedRows: typeof questionRows;
  if (config.section === "structure") {
    const completionRows = shuffle(
      questionRows.filter((row) => row.questions.questionType === "structure_completion")
    );
    const errorRows = shuffle(questionRows.filter((row) => row.questions.questionType === "structure_error_id"));
    const completionCount =
      config.type === "structure_error_id" || config.completionCount === null
        ? 0
        : resolvePracticeCount(config.completionCount, completionRows.length);
    const errorCount =
      config.type === "structure_completion" || config.errorCount === null
        ? 0
        : resolvePracticeCount(config.errorCount, errorRows.length);
    if (completionCount === null || errorCount === null) notFound();
    orderedRows = shuffle([
      ...completionRows.slice(0, completionCount),
      ...errorRows.slice(0, errorCount),
    ]);
  } else {
    const groups = new Map<string, typeof questionRows>();
    for (const row of questionRows) {
      const key = row.questions.passageId ?? row.questions.id;
      const list = groups.get(key) ?? [];
      list.push(row);
      groups.set(key, list);
    }
    const groupedRows = shuffle(Array.from(groups.values()).map((group) => shuffle(group)));
    orderedRows = groupedRows.flat().slice(0, questionCount);
  }

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
        key={`${sectionSlug}-${JSON.stringify(rawSearchParams)}`}
        items={items}
        mode="practice"
        timerMode={config.timer}
        timeLimitSec={getPracticeTimeLimitSec(config, questionCount)}
        sectionLabel={SECTION_META[sectionSlug].nameJa}
        backHref={`/app/practice/${sectionSlug}`}
        backLabel="設定に戻る"
      />
    </div>
  );
}
