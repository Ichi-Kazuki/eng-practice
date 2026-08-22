import { PassageForm } from "@/components/admin/passage-form";
import { createPassage } from "@/app/admin/actions";

export default function NewPassagePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-foreground">パッセージを新規作成</h1>
      <PassageForm action={createPassage} />
    </div>
  );
}
