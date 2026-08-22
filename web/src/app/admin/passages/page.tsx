import Link from "next/link";
import { getDb } from "@/db";
import { passages } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { deletePassage } from "@/app/admin/actions";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

export default async function AdminPassagesPage() {
  const db = getDb();
  const rows = await db.select().from(passages);

  return (
    <div>
      <div className="flex items-center justify-between">
        <JaHeading className="text-xl font-bold text-foreground" text="Readingパッセージ一覧" />
        <Button render={<Link href="/admin/passages/new" />} size="sm">
          新規作成
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {rows.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <span className="text-sm text-foreground">{p.title}</span>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/passages/${p.id}`} className="text-primary hover:underline">
                編集
              </Link>
              <form action={deletePassage.bind(null, p.id)}>
                <ConfirmSubmitButton
                  confirmMessage="このパッセージを削除します。よろしいですか?"
                  className="text-destructive hover:underline"
                >
                  削除
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
