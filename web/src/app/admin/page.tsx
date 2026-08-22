import Link from "next/link";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { questions, passages } from "@/db/schema";
import { Card } from "@/components/ui/card";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = getDb();
  const [{ count: questionCount }] = await db.select({ count: sql<number>`count(*)` }).from(questions);
  const [{ count: passageCount }] = await db.select({ count: sql<number>`count(*)` }).from(passages);
  const [{ count: publishedCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questions)
    .where(sql`status = 'published'`);

  return (
    <div>
      <JaHeading className="text-xl font-bold text-foreground" text="管理画面" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/questions">
          <Card className="p-5 hover:border-primary">
            <p className="text-sm text-muted-foreground">問題</p>
            <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-foreground">
              {questionCount}
            </p>
            <p className="text-xs text-muted-foreground">うち公開済み {publishedCount}</p>
          </Card>
        </Link>
        <Link href="/admin/passages">
          <Card className="p-5 hover:border-primary">
            <p className="text-sm text-muted-foreground">Readingパッセージ</p>
            <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-2xl font-bold text-foreground">
              {passageCount}
            </p>
          </Card>
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        問題はAI生成→AIダブルチェック→人間の最終確認を経てから「公開済み」ステータスにしてください。
      </p>
    </div>
  );
}
