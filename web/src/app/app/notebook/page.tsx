import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMistakesForUser } from "@/lib/notebook";
import { SECTION_META, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginRequired } from "@/components/login-required";
import { JaHeading } from "@/components/ja-heading";
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
  if (!user) {
    return <LoginRequired message="復習ノートは誤答をアカウントに記録して表示するため、ログインが必要です。" />;
  }

  const mistakes = await getMistakesForUser({ userId: user.userId, section, range });
  const activeRange = DATE_RANGES.find((r) => r.key === range) ?? DATE_RANGES[0];
  const sections: SectionSlug[] = ["structure", "reading"];

  return (
    <div>
      <JaHeading className="text-xl font-bold text-foreground" text="復習ノート" />
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
