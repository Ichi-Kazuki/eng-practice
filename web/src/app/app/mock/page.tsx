import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { mockSessions, questions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { buildMockSections, type MockSectionRequest, type MockTimeMode } from "@/lib/mock-session";
import { SECTION_META, MOCK_SECTION_ORDER, type SectionSlug } from "@/lib/section-meta";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function startMockTest(formData: FormData) {
  "use server";
  const identity = await getOrCreateActiveIdentity();

  const requests: MockSectionRequest[] = [];
  for (const slug of MOCK_SECTION_ORDER) {
    if (formData.get(`include_${slug}`) !== "on") continue;
    const rawCount = Number(formData.get(`count_${slug}`));
    const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.round(rawCount) : SECTION_META[slug].mockOfficialQuestionCount;
    requests.push({ sectionSlug: slug, count });
  }
  // どちらも選ばれなかった場合は両方(デフォルト問題数)にフォールバックする
  if (requests.length === 0) {
    for (const slug of MOCK_SECTION_ORDER) {
      requests.push({ sectionSlug: slug, count: SECTION_META[slug].mockOfficialQuestionCount });
    }
  }

  const timeMode: MockTimeMode = formData.get("timeMode") === "stopwatch" ? "stopwatch" : "fixed";

  const db = getDb();
  const sections = await buildMockSections(requests, timeMode);
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
  const db = getDb();
  const counts = await db
    .select({ sectionSlug: questions.sectionSlug, count: sql<number>`count(*)` })
    .from(questions)
    .where(eq(questions.status, "published"))
    .groupBy(questions.sectionSlug);
  const availableBySection = Object.fromEntries(counts.map((c) => [c.sectionSlug, c.count])) as Record<
    SectionSlug,
    number | undefined
  >;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold text-foreground">模試モード</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        セクション・出題数・時間の測り方を選んでから開始できます。進行状況は保存されるため、通信が切れても続きから再開できます。
      </p>

      <form action={startMockTest} className="mt-6 space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">セクション</legend>
          {MOCK_SECTION_ORDER.map((slug) => {
            const available = availableBySection[slug] ?? 0;
            const defaultCount = Math.min(SECTION_META[slug].mockOfficialQuestionCount, available || 1);
            return (
              <div key={slug} className="rounded-md border border-border p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input type="checkbox" name={`include_${slug}`} defaultChecked className="size-4" />
                  {SECTION_META[slug].nameJa}
                  <span className="font-normal text-muted-foreground">({available}問公開中)</span>
                </label>
                <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  問題数
                  <input
                    type="number"
                    name={`count_${slug}`}
                    min={1}
                    max={available || 1}
                    defaultValue={defaultCount}
                    className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                  />
                  <span>
                    問(本番は{SECTION_META[slug].mockOfficialQuestionCount}問 /{" "}
                    {SECTION_META[slug].mockTimeLimitSec / 60}分)
                  </span>
                </label>
              </div>
            );
          })}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">時間の測り方</legend>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="radio" name="timeMode" value="fixed" defaultChecked className="size-4" />
            制限時間制(本番相当のペースで自動計算した時間になると自動提出)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="radio" name="timeMode" value="stopwatch" className="size-4" />
            時間を測るだけ(制限なし。経過時間を表示し、自分で提出するまで終了しない)
          </label>
        </fieldset>

        <Button type="submit" size="lg">
          模試を開始する
        </Button>
      </form>
    </div>
  );
}
