import Link from "next/link";
import { getDb } from "@/db";
import { passages } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { deletePassage } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminPassagesPage() {
  const db = getDb();
  const rows = await db.select().from(passages);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Readingパッセージ一覧</h1>
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
                <button type="submit" className="text-destructive hover:underline">
                  削除
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
