import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { mockSessions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { buildMockSections } from "@/lib/mock-session";
import { SECTION_META, MOCK_SECTION_ORDER } from "@/lib/section-meta";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function startMockTest() {
  "use server";
  const identity = await getOrCreateActiveIdentity();

  const db = getDb();
  const sections = await buildMockSections();
  const id = crypto.randomUUID();
  await db.insert(mockSessions).values({
    id,
    userId: identity.userId,
    status: "in_progress",
    sections,
    currentSectionIndex: 0,
    answers: {},
  });

  redirect(`/app/mock/${id}`);
}

export default async function MockIntroPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold text-foreground">模試モード</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        本番同様、セクションごとに制限時間付きで通し受験します。Listeningは準備中のため、v1では
        Structure and Written Expression / Reading の2セクション構成です。開始すると各セクションの時間が計測されます。通信が切れても進行状況は保存されます。
      </p>

      <div className="mt-6 space-y-2">
        {MOCK_SECTION_ORDER.map((s) => (
          <div key={s} className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm">
            <span className="text-foreground">{SECTION_META[s].nameJa}</span>
            <span className="font-[family-name:var(--font-geist-mono)] text-muted-foreground">
              {SECTION_META[s].mockTimeLimitSec / 60}分
            </span>
          </div>
        ))}
      </div>

      <form action={startMockTest} className="mt-6">
        <Button type="submit" size="lg">
          模試を開始する
        </Button>
      </form>
    </div>
  );
}
