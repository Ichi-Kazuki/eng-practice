import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  buildNotebookHref,
  getMistakesForUser,
  parseNotebookCount,
  parseNotebookFilters,
} from "@/lib/notebook";
import { parsePage } from "@/lib/pagination";
import { QuestionRunner, type RunnerItem } from "@/components/question-runner";
import { LoginRequired } from "@/components/login-required";
import { JaHeading } from "@/components/ja-heading";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type PracticeSearchParams = {
  section?: string | string[];
  range?: string | string[];
  status?: string | string[];
  page?: string | string[];
  count?: string | string[];
  question?: string | string[];
};

export default async function NotebookPracticePage({
  searchParams,
}: {
  searchParams: Promise<PracticeSearchParams>;
}) {
  const rawParams = await searchParams;
  const filters = parseNotebookFilters(rawParams);
  const count = parseNotebookCount(rawParams.count);
  const page = parsePage(rawParams.page);
  const requestedQuestionId = parseQuestionId(rawParams.question);
  // 不正なquestionパラメータ(空文字や重複指定)は無視して通常の優先復習にフォールバックする
  const hasQuestionParam = requestedQuestionId !== undefined;
  const user = await getCurrentUser();
  if (!user) {
    return <LoginRequired message="復習ノートは誤答をアカウントに記録して表示するため、ログインが必要です。" />;
  }

  // 1問だけ解き直すときは絞り込み(セクション/期間/状態)をすべて外す。
  // 正解して「あと1回」に変わった直後や、期間の絞り込みから外れた後にこのURLを
  // 開き直しても、対象外だと誤って伝えないため。絞り込みはbackHrefにだけ残す。
  const mistakes = await getMistakesForUser({
    userId: user.userId,
    filters: hasQuestionParam ? {} : filters,
  });
  // questionはURLから受け取るが、本人の公開中かつ未習得の復習対象に一致する場合だけ採用する
  const selectedMistake = requestedQuestionId
    ? mistakes.find((row) => row.questions.id === requestedQuestionId)
    : undefined;
  const practiceMistakes = hasQuestionParam
    ? selectedMistake
      ? [selectedMistake]
      : []
    : mistakes.slice(0, count);

  const items: RunnerItem[] = practiceMistakes.map((row) => ({
    question: {
      id: row.questions.id,
      stem: row.questions.stem,
      choices: row.questions.choices,
      correctIndex: row.questions.correctIndex,
      explanation: row.questions.explanation,
      questionType: row.questions.questionType,
    },
    passage: row.passages
      ? { id: row.passages.id, title: row.passages.title, body: row.passages.body }
      : null,
  }));

  const backHref = buildNotebookHref(filters, page);
  const emptyMessage = hasQuestionParam
    ? "この問題は復習対象から外れています。すでに習得済みになったか、公開中の問題ではありません。"
    : "この条件では復習できる問題がありません。復習ノートに戻って条件を確認してください。";

  return (
    <div data-question-solving>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <JaHeading className="text-xl font-bold text-foreground" text="優先復習" />
        <Button nativeButton={false} render={<Link href={backHref} />} variant="ghost" size="sm">
          復習ノートに戻る
        </Button>
      </div>
      <QuestionRunner
        items={items}
        mode="practice"
        backHref={backHref}
        backLabel="復習ノートに戻る"
        emptyMessage={emptyMessage}
        completionTitle="解き直し完了"
        allowRetry={false}
        completionDescription="解答結果を復習ノートに反映しました。続けて復習する問題を選べます。"
      />
    </div>
  );
}



function parseQuestionId(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length === 0 || value.length > 200) return undefined;
  return value;
}
