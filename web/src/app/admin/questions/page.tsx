import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { deleteQuestion } from "@/app/admin/actions";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const db = getDb();
  const rows = await db.select().from(questions).orderBy(desc(questions.updatedAt));

  return (
    <div>
      <div className="flex items-center justify-between">
        <JaHeading className="text-xl font-bold text-foreground" text="問題一覧" />
        <Button render={<Link href="/admin/questions/new" />} size="sm">
          新規作成
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-4">セクション</th>
              <th className="py-2 pr-4">タイプ</th>
              <th className="py-2 pr-4">設問</th>
              <th className="py-2 pr-4">ステータス</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id} className="border-b border-border">
                <td className="py-2 pr-4">{q.sectionSlug}</td>
                <td className="py-2 pr-4">{q.questionType}</td>
                <td className="max-w-xs truncate py-2 pr-4">{q.stem}</td>
                <td className="py-2 pr-4">{q.status}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-3">
                    <Link href={`/admin/questions/${q.id}`} className="text-primary hover:underline">
                      編集
                    </Link>
                    <form action={deleteQuestion.bind(null, q.id)}>
                      <ConfirmSubmitButton
                        confirmMessage="この問題を削除します。よろしいですか?"
                        className="text-destructive hover:underline"
                      >
                        削除
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
