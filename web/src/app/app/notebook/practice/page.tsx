import { getCurrentUser } from "@/lib/auth/current-user";
import { getMistakesForUser } from "@/lib/notebook";
import { QuestionRunner, type RunnerItem } from "@/components/question-runner";
import { LoginRequired } from "@/components/login-required";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

export default async function NotebookPracticePage({
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

  const items: RunnerItem[] = mistakes.map((row) => ({
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

  return (
    <div data-question-solving>
      <JaHeading className="mb-6 text-xl font-bold text-foreground" text="誤答の解き直し" />
      <QuestionRunner items={items} mode="practice" backHref="/app/notebook" backLabel="復習ノートに戻る" />
    </div>
  );
}
