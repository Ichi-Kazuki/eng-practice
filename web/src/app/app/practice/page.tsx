import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PracticeSectionSelect() {
  const db = getDb();
  const counts = await db
    .select({ sectionSlug: questions.sectionSlug, count: sql<number>`count(*)` })
    .from(questions)
    .where(eq(questions.status, "published"))
    .groupBy(questions.sectionSlug);

  const countBySection = Object.fromEntries(counts.map((c) => [c.sectionSlug, c.count]));

  const sections: SectionSlug[] = ["structure", "reading", "listening"];

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">セクションを選ぶ</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        解答後すぐに正誤と解説が表示されます。同じセクションは何度でも解き直せます。
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sections.map((slug) => {
          const meta = SECTION_META[slug];
          const count = countBySection[slug] ?? 0;
          const disabled = !meta.available || count === 0;
          const card = (
            <Card
              className={`p-5 ${disabled ? "opacity-50" : "transition-colors hover:border-primary"}`}
            >
              <h2 className="font-medium text-foreground">{meta.nameJa}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {meta.available ? `${count}問 公開中` : "準備中"}
              </p>
            </Card>
          );
          return disabled ? (
            <div key={slug}>{card}</div>
          ) : (
            <Link key={slug} href={`/app/practice/${slug}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
