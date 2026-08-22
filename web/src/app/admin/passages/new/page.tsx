import { PassageForm } from "@/components/admin/passage-form";
import { createPassage } from "@/app/admin/actions";
import { JaHeading } from "@/components/ja-heading";

export default function NewPassagePage() {
  return (
    <div className="max-w-2xl">
      <JaHeading className="mb-6 text-xl font-bold text-foreground" text="パッセージを新規作成" />
      <PassageForm action={createPassage} />
    </div>
  );
}
