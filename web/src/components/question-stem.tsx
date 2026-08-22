import type { ReactNode } from "react";

// structure_error_id(誤り指摘)は本番同様、4つの選択肢の該当箇所を問題文中で
// アンダーラインして示す。choicesは問題文からの抜粋(部分文字列)として保存されている前提。
export function QuestionStem({
  stem,
  choices,
  questionType,
  className,
}: {
  stem: string;
  choices: string[];
  questionType: string;
  className?: string;
}) {
  if (questionType !== "structure_error_id") {
    return (
      <p className={className} lang="en">
        {stem}
      </p>
    );
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  choices.forEach((choice, i) => {
    const idx = stem.indexOf(choice, cursor);
    if (idx === -1) return;
    if (idx > cursor) parts.push(stem.slice(cursor, idx));
    parts.push(
      <u key={i} className="decoration-2 underline-offset-2">
        {choice}
      </u>
    );
    cursor = idx + choice.length;
  });
  if (cursor < stem.length) parts.push(stem.slice(cursor));

  return (
    <p className={className} lang="en">
      {parts}
    </p>
  );
}
