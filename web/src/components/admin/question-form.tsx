import { Button } from "@/components/ui/button";

export type QuestionFormValues = {
  id?: string;
  sectionSlug: string;
  passageId: string | null;
  questionType: string;
  stem: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  status: string;
};

export function QuestionForm({
  action,
  initial,
  passages,
}: {
  action: (formData: FormData) => void;
  initial?: QuestionFormValues;
  passages: { id: string; title: string }[];
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          セクション
          <select
            name="sectionSlug"
            defaultValue={initial?.sectionSlug ?? "structure"}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="structure">Grammar</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
          </select>
        </label>
        <label className="block text-sm">
          問題タイプ
          <input
            name="questionType"
            defaultValue={initial?.questionType ?? "structure_completion"}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block text-sm">
        パッセージ(Readingのみ)
        <select
          name="passageId"
          defaultValue={initial?.passageId ?? ""}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">なし</option>
          {passages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        設問文
        <textarea
          name="stem"
          required
          rows={3}
          defaultValue={initial?.stem}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        選択肢(1行につき1つ)
        <textarea
          name="choices"
          required
          rows={4}
          defaultValue={initial?.choices.join("\n")}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          正解のインデックス(0始まり)
          <input
            type="number"
            name="correctIndex"
            min={0}
            required
            defaultValue={initial?.correctIndex ?? 0}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          難易度
          <select
            name="difficulty"
            defaultValue={initial?.difficulty ?? "medium"}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>
      </div>

      <label className="block text-sm">
        解説
        <textarea
          name="explanation"
          required
          rows={3}
          defaultValue={initial?.explanation}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        ステータス
        <select
          name="status"
          defaultValue={initial?.status ?? "draft"}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="draft">draft(下書き)</option>
          <option value="ai_verified">ai_verified(AI検証済み)</option>
          <option value="published">published(公開済み)</option>
        </select>
      </label>

      <Button type="submit">保存する</Button>
    </form>
  );
}
