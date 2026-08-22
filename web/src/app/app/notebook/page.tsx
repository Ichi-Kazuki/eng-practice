import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions, passages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SECTION_META, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DATE_RANGES = [
  { key: "all", label: "すべての期間", days: null },
  { key: "7", label: "直近7日", days: 7 },
  { key: "30", label: "直近30日", days: 30 },
] as const;

export default async function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; range?: string }>;
}) {
  const { section, range } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/?login_required=1");

  const db = getDb();
  const rows = await db
    .select()
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .leftJoin(passages, eq(questions.passageId, passages.id))
    .where(eq(attempts.userId, user.userId))
    // createdAtは秒精度のため、同一秒内の複数回答はrowidで挿入順にタイブレークする
    .orderBy(desc(attempts.createdAt), desc(sql`attempts.rowid`));

  const latestByQuestion = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latestByQuestion.has(row.questions.id)) {
      latestByQuestion.set(row.questions.id, row);
    }
  }

  const activeRange = DATE_RANGES.find((r) => r.key === range) ?? DATE_RANGES[0];
  // eslint-disable-next-line react-hooks/purity -- サーバーコンポーネントはリクエストごとに再実行されるため問題ない
  const cutoff = activeRange.days ? Date.now() - activeRange.days * 86400_000 : null;

  const mistakes = Array.from(latestByQuestion.values()).filter((row) => {
    if (row.attempts.isCorrect) return false;
    if (section && row.questions.sectionSlug !== section) return false;
    if (cutoff && row.attempts.createdAt.getTime() < cutoff) return false;
    return true;
  });

  const sections: SectionSlug[] = ["structure", "reading"];

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">復習ノート</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        最新の解答が不正解だった問題を表示しています。正解すると自動的にここから外れます。
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FilterLink
          href={buildHref(undefined, range)}
          active={!section}
          label="すべてのセクション"
        />
        {sections.map((s) => (
          <FilterLink
            key={s}
            href={buildHref(s, range)}
            active={section === s}
            label={SECTION_META[s].nameJa}
          />
        ))}
        <span className="mx-1 text-border">|</span>
        {DATE_RANGES.map((r) => (
          <FilterLink
            key={r.key}
            href={buildHref(section, r.key === "all" ? undefined : r.key)}
            active={activeRange.key === r.key}
            label={r.label}
          />
        ))}
      </div>

      {mistakes.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          条件に一致する誤答はありません。演習を続けるとここに記録されます。
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{mistakes.length}問</p>
            <Button
              render={
                <Link
                  href={`/app/notebook/practice${section ? `?section=${section}` : ""}${
                    range && range !== "all" ? `${section ? "&" : "?"}range=${range}` : ""
                  }`}
                />
              }
              size="sm"
            >
              この問題をまとめて解き直す
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {mistakes.map((row) => (
              <Card key={row.questions.id} className="border-l-4 border-l-destructive p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{SECTION_META[row.questions.sectionSlug as SectionSlug].nameJa}</span>
                  <span>·</span>
                  <span>
                    {QUESTION_TYPE_LABEL_JA[row.questions.questionType] ?? row.questions.questionType}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground">{row.questions.stem}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function buildHref(section: string | undefined, range: string | undefined) {
  const params = new URLSearchParams();
  if (section) params.set("section", section);
  if (range && range !== "all") params.set("range", range);
  const qs = params.toString();
  return `/app/notebook${qs ? `?${qs}` : ""}`;
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </Link>
  );
}
