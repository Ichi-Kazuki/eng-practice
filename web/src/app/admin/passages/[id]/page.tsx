import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { passages } from "@/db/schema";
import { PassageForm } from "@/components/admin/passage-form";
import { updatePassage } from "@/app/admin/actions";
import { JaHeading } from "@/components/ja-heading";

export const dynamic = "force-dynamic";

export default async function EditPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const passage = await db.query.passages.findFirst({ where: eq(passages.id, id) });
  if (!passage) notFound();

  const updateWithId = updatePassage.bind(null, id);

  return (
    <div className="max-w-2xl">
      <JaHeading className="mb-6 text-xl font-bold text-foreground" text="パッセージを編集" />
      <PassageForm action={updateWithId} initial={passage} />
    </div>
  );
}
