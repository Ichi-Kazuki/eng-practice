import { Button } from "@/components/ui/button";

export function PassageForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: { title: string; body: string };
}) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="sectionSlug" value="reading" />
      <label className="block text-sm">
        タイトル
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        本文
        <textarea
          name="body"
          required
          rows={12}
          defaultValue={initial?.body}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-[family-name:var(--font-literata)] text-sm"
        />
      </label>
      <Button type="submit">保存する</Button>
    </form>
  );
}
