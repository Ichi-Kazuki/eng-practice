import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { MockConfigForm } from "@/components/mock-config-form";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

export default async function MockIntroPage() {
  const db = getDb();
  const publishedQuestions = await db
    .select({ sectionSlug: questions.sectionSlug, questionType: questions.questionType })
    .from(questions)
    .where(eq(questions.status, "published"));
  const availableBySection = publishedQuestions.reduce<Record<string, number>>((counts, question) => {
    counts[question.sectionSlug] = (counts[question.sectionSlug] ?? 0) + 1;
    return counts;
  }, {});
  const availableStructureByType = publishedQuestions.reduce(
    (counts, question) => {
      if (question.sectionSlug === "structure" && question.questionType in counts) {
        counts[question.questionType as keyof typeof counts] += 1;
      }
      return counts;
    },
    { structure_completion: 0, structure_error_id: 0 }
  );

  return (
    <div className="mx-auto max-w-xl">
      <JaHeading className="text-xl font-bold text-foreground" text="模試モード" />
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        本番相当の固定構成でGrammarとReadingを続けて受験できます。時間の測り方だけを選んで開始してください。
      </p>

      <MockConfigForm
        availableBySection={availableBySection}
        availableStructureByType={availableStructureByType}
      />
    </div>
  );
}
