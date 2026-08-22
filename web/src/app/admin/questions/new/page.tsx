import { getDb } from "@/db";
import { passages } from "@/db/schema";
import { QuestionForm } from "@/components/admin/question-form";
import { createQuestion } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function NewQuestionPage() {
  const db = getDb();
  const passageRows = await db.select({ id: passages.id, title: passages.title }).from(passages);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-foreground">問題を新規作成</h1>
      <QuestionForm action={createQuestion} passages={passageRows} />
    </div>
  );
}
