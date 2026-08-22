import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { type SectionSlug } from "@/lib/section-meta";
import { MockConfigForm } from "@/components/mock-config-form";

export const dynamic = "force-dynamic";

export default async function MockIntroPage() {
  const db = getDb();
  const counts = await db
    .select({ sectionSlug: questions.sectionSlug, count: sql<number>`count(*)` })
    .from(questions)
    .where(eq(questions.status, "published"))
    .groupBy(questions.sectionSlug);
  const availableBySection = Object.fromEntries(counts.map((c) => [c.sectionSlug, c.count])) as Record<
    SectionSlug,
    number | undefined
  >;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold text-foreground">模試モード</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        セクション・出題数・時間の測り方を選んでから開始できます。進行状況は保存されるため、通信が切れても続きから再開できます。
      </p>

      <MockConfigForm availableBySection={availableBySection} />
    </div>
  );
}
