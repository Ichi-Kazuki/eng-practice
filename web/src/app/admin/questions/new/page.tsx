import { getDb } from "@/db";
import { passages } from "@/db/schema";
import { QuestionForm } from "@/components/admin/question-form";
import { createQuestion } from "@/app/admin/actions";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

export default async function NewQuestionPage() {
  const db = getDb();
  const passageRows = await db.select({ id: passages.id, title: passages.title }).from(passages);

  return (
    <div className="max-w-2xl">
      <JaHeading className="mb-6 text-xl font-bold text-foreground" text="問題を新規作成" />
      <QuestionForm action={createQuestion} passages={passageRows} />
    </div>
  );
}
