import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { questions, passages } from "@/db/schema";
import { QuestionForm } from "@/components/admin/question-form";
import { updateQuestion } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const question = await db.query.questions.findFirst({ where: eq(questions.id, id) });
  if (!question) notFound();

  const passageRows = await db.select({ id: passages.id, title: passages.title }).from(passages);
  const updateWithId = updateQuestion.bind(null, id);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-foreground">問題を編集</h1>
      <QuestionForm action={updateWithId} initial={question} passages={passageRows} />
    </div>
  );
}
