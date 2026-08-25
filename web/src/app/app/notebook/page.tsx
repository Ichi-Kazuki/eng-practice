import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  buildNotebookHref,
  getNotebookDataForUser,
  NOTEBOOK_PAGE_SIZE,
  parseNotebookFilters,
  type MistakeRow,
  type NotebookFilters,
  type NotebookStatus,
} from "@/lib/notebook";
import { getPageSlice, parsePage } from "@/lib/pagination";
import { SECTION_META, QUESTION_TYPE_LABEL_JA, type SectionSlug } from "@/lib/section-meta";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginRequired } from "@/components/login-required";
import { JaHeading } from "@/components/ja-heading";
import { PaginationControls } from "@/components/pagination-controls";
import { cn } from "@/lib/utils";
import { TimerIcon } from "@phosphor-icons/react/ssr";

export const dynamic = "force-dynamic";

type NotebookSearchParams = {
  section?: string | string[];
  range?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

export default async function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<NotebookSearchParams>;
}) {
  const rawParams = await searchParams;
  const filters = parseNotebookFilters(rawParams);
  const page = parsePage(rawParams.page);
  const user = await getCurrentUser();
  if (!user) {
    return <LoginRequired message="復習ノートは誤答をアカウントに記録して表示するため、ログインが必要です。" />;
  }

  const notebook = await getNotebookDataForUser({ userId: user.userId, filters });
  const mistakePage = getPageSlice(notebook.mistakes, page, NOTEBOOK_PAGE_SIZE);
  const sections = ["structure", "reading"] as const;
  const hasFilters = Boolean(filters.section || filters.range || filters.status);

  return (
    <div>
      <JaHeading className="text-xl font-bold text-foreground" text="復習ノート" />
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        間違えた問題を優先度順に並べています。2回連続で正解すると習得済みとしてここから外れます。
      </p>

      <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-card">
        <SummaryStat label="要復習" value={notebook.summary.needsReview} />
        <SummaryStat label="あと1回" value={notebook.summary.oneMore} />
        <SummaryStat label="合計" value={notebook.summary.total} />
      </div>
      {filters.status && (
        <p className="mt-2 text-xs text-muted-foreground">
          上の集計は状態の絞り込みを含みません。下の一覧は「{getStatusLabel(filters.status)}」のみを表示しています。
        </p>
      )}

      {notebook.mistakes.length > 0 && (
        <section
          aria-labelledby="priority-review-heading"
          className="mt-6 overflow-hidden rounded-xl border border-[#4F7A5A]/20 bg-[#F3F8F4]"
        >
          <div className="border-l-4 border-[#4F7A5A] p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[#E2EFE5] text-[#3F6849]">
                <TimerIcon className="size-4" weight="bold" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h2 id="priority-review-heading" className="text-sm font-bold text-foreground">
                    短時間で優先復習
                  </h2>
                  <span className="text-xs text-muted-foreground">全{notebook.mistakes.length}問から</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  要復習を先に、最終解答が古い順で出題します。
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:shrink-0">
              {[5, 10, 20].map((count) => (
                <Button
                  key={count}
                  nativeButton={false}
                  render={<Link href={buildPracticeHref(filters, count as 5 | 10 | 20, page)} />}
                  size="sm"
                  variant="outline"
                  className="border-[#4F7A5A]/60"
                >
                  {count === 10 ? "優先10問を復習" : `${count}問`}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="notebook-filter-heading" className="mt-6 border-t border-border pt-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="notebook-filter-heading" className="text-sm font-bold text-foreground">
            一覧を絞り込む
          </h2>
          <p className="text-xs text-muted-foreground">セクション・状態・最終解答日</p>
        </div>
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
          <FilterGroup label="セクション">
            <FilterLink href={buildNotebookHref({ ...filters, section: undefined }, 1)} active={!filters.section} label="すべて" />
            {sections.map((section) => (
              <FilterLink
                key={section}
                href={buildNotebookHref({ ...filters, section }, 1)}
                active={filters.section === section}
                label={SECTION_META[section].nameJa}
              />
            ))}
          </FilterGroup>
          <FilterGroup label="状態">
            <FilterLink href={buildNotebookHref({ ...filters, status: undefined }, 1)} active={!filters.status} label="すべて" />
            <FilterLink
              href={buildNotebookHref({ ...filters, status: "needs_review" }, 1)}
              active={filters.status === "needs_review"}
              label="要復習"
            />
            <FilterLink
              href={buildNotebookHref({ ...filters, status: "one_more" }, 1)}
              active={filters.status === "one_more"}
              label="あと1回"
            />
          </FilterGroup>
          <FilterGroup label="最終解答日">
            <FilterLink href={buildNotebookHref({ ...filters, range: undefined }, 1)} active={!filters.range} label="すべて" />
            <FilterLink href={buildNotebookHref({ ...filters, range: "7" }, 1)} active={filters.range === "7"} label="直近7日" />
            <FilterLink href={buildNotebookHref({ ...filters, range: "30" }, 1)} active={filters.range === "30"} label="直近30日" />
          </FilterGroup>
        </div>
      </section>

      {mistakePage.total === 0 ? (
        <EmptyNotebookState hasFilters={hasFilters && notebook.allCount > 0} />
      ) : (
        <>
          <div id="notebook-list-summary" className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              全{mistakePage.total}問中 {mistakePage.items.length}問を表示
              {hasFilters && <span className="ml-2 text-xs">絞り込み中</span>}
            </p>
            <p className="text-xs text-muted-foreground">カードを開くと解答と解説を確認できます</p>
          </div>

          <div className="mt-4 space-y-3">
            {mistakePage.items.map((row) => (
              <MistakeCard key={row.questions.id} row={row} filters={filters} page={mistakePage.currentPage} />
            ))}
          </div>
          <PaginationControls
            currentPage={mistakePage.currentPage}
            pageCount={mistakePage.pageCount}
            label="復習ノート"
            buildHref={(nextPage) => buildNotebookHref(filters, nextPage)}
            scrollTargetId="notebook-list-summary"
          />
        </>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 border-r border-border px-3 py-3 last:border-r-0 sm:px-4">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-semibold text-foreground">{label}</legend>
      <div className="flex flex-wrap gap-1">{children}</div>
    </fieldset>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

function MistakeCard({ row, filters, page }: { row: MistakeRow; filters: NotebookFilters; page: number }) {
  const statusLabel = getStatusLabel(row.status);
  const selectedChoice =
    row.lastWrongSelectedIndex === null ? null : getChoiceLabel(row.lastWrongSelectedIndex, row.questions.choices);
  const correctChoice = getChoiceLabel(row.questions.correctIndex, row.questions.choices);

  return (
    <Card className={cn("py-0 border-l-4", row.status === "needs_review" ? "border-l-destructive" : "border-l-primary")}>
      <details>
        <summary className="list-none cursor-pointer px-4 py-4 outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{SECTION_META[row.questions.sectionSlug as SectionSlug].nameJa}</span>
              <span aria-hidden="true">·</span>
              <span>{QUESTION_TYPE_LABEL_JA[row.questions.questionType] ?? row.questions.questionType}</span>
            </div>
            <Badge variant={row.status === "needs_review" ? "destructive" : "outline"}>{statusLabel}</Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{row.questions.stem}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              最終解答: <time dateTime={row.lastAnsweredAt.toISOString()}>{formatDate(row.lastAnsweredAt)}</time>
            </span>
            <span>解答 {row.answerCount}回</span>
            <span>誤答 {row.wrongCount}回</span>
            <span className="text-primary">詳細を開く</span>
          </div>
        </summary>

        <div className="border-t border-border px-4 pb-4 pt-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-secondary/60 p-3">
              <p className="text-xs font-semibold text-muted-foreground">直近の誤答</p>
              {selectedChoice ? (
                <p className="mt-1 text-foreground" lang="en">{selectedChoice}</p>
              ) : (
                <p className="mt-1 text-muted-foreground">問題が更新されたため、当時の解答は表示できません。</p>
              )}
            </div>
            <div className="rounded-md bg-secondary/60 p-3">
              <p className="text-xs font-semibold text-muted-foreground">正解</p>
              <p className="mt-1 text-foreground" lang="en">{correctChoice ?? "—"}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground">解説</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{row.questions.explanation}</p>
          </div>
          {row.passages && (
            <div className="mt-4 rounded-md border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground">Reading本文: {row.passages.title}</p>
              {/* detailsの中身は閉じていてもDOMに載るため、一覧では冒頭だけを出す。全文は解き直しで読める */}
              <p
                className="mt-2 whitespace-pre-line font-[family-name:var(--font-literata)] text-sm leading-relaxed text-foreground"
                lang="en"
              >
                {excerpt(row.passages.body)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">本文の全文は「この1問を解き直す」で確認できます。</p>
            </div>
          )}
          <div className="mt-4">
            <Button
              nativeButton={false}
              render={<Link href={buildPracticeHref(filters, undefined, page, row.questions.id)} />}
              size="sm"
              variant="outline"
            >
              この1問を解き直す
            </Button>
          </div>
        </div>
      </details>
    </Card>
  );
}

function EmptyNotebookState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-border px-5 py-10 text-center">
      <JaHeading
        className="text-lg font-bold text-foreground"
        text={hasFilters ? "絞り込み結果が0件です" : "復習待ちが0件です"}
      />
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {hasFilters
          ? "条件を変えるか、絞り込みを解除すると復習できる問題を確認できます。"
          : "演習で間違えた問題がここに記録されます。まずはGrammarかReadingを解いてみましょう。"}
      </p>
      <Button
        nativeButton={false}
        render={<Link href={hasFilters ? "/app/notebook" : "/app/practice"} />}
        className="mt-5"
      >
        {hasFilters ? "絞り込みを解除する" : "演習を始める"}
      </Button>
    </div>
  );
}


function buildPracticeHref(
  filters: NotebookFilters,
  count?: 5 | 10 | 20,
  page?: number,
  questionId?: string
) {
  const params = new URLSearchParams();
  if (filters.section) params.set("section", filters.section);
  if (filters.range) params.set("range", filters.range);
  if (filters.status) params.set("status", filters.status);
  if (page && page > 1) params.set("page", String(page));
  if (count) params.set("count", String(count));
  if (questionId) params.set("question", questionId);
  const query = params.toString();
  return `/app/notebook/practice${query ? `?${query}` : ""}`;
}


function getStatusLabel(status: NotebookStatus) {
  return status === "needs_review" ? "要復習" : "あと1回";
}

// 解答時のインデックスを現在の選択肢に当てるため、問題が編集されていると範囲外になりうる
// (範囲内のまま別の選択肢を指す並べ替えはnotebook.ts側でnullにしている)
function getChoiceLabel(index: number, choices: string[]) {
  const choice = choices[index];
  return choice === undefined ? null : `${String.fromCharCode(65 + index)}. ${choice}`;
}

const PASSAGE_EXCERPT_LENGTH = 160;

function excerpt(body: string) {
  if (body.length <= PASSAGE_EXCERPT_LENGTH) return body;
  return `${body.slice(0, PASSAGE_EXCERPT_LENGTH).trimEnd()}…`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Tokyo" }).format(date);
}
