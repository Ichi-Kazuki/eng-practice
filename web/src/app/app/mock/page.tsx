import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { mockSessions, questions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { buildMockSections, type MockSectionRequest, type MockTimeMode } from "@/lib/mock-session";
import { SECTION_META, MOCK_SECTION_ORDER, type SectionSlug } from "@/lib/section-meta";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type SectionChoice = "both" | SectionSlug;

function countPresets(available: number, officialCount: number): { value: number; label: string }[] {
  const candidates = [10, 20, officialCount, available].filter((n) => n > 0 && n <= available);
  const unique = Array.from(new Set(candidates)).sort((a, b) => a - b);
  return unique.map((n) => {
    if (n === available) return { value: n, label: `${n}問(全問)` };
    if (n === officialCount) return { value: n, label: `${n}問(本番相当)` };
    return { value: n, label: `${n}問` };
  });
}

async function startMockTest(formData: FormData) {
  "use server";
  const identity = await getOrCreateActiveIdentity();

  const sectionChoiceRaw = formData.get("sectionChoice");
  const sectionChoice: SectionChoice =
    sectionChoiceRaw === "structure" || sectionChoiceRaw === "reading" ? sectionChoiceRaw : "both";

  const includedSlugs: SectionSlug[] =
    sectionChoice === "both" ? MOCK_SECTION_ORDER : MOCK_SECTION_ORDER.filter((s) => s === sectionChoice);

  const requests: MockSectionRequest[] = includedSlugs.map((slug) => {
    const rawCount = Number(formData.get(`count_${slug}`));
    const count =
      Number.isFinite(rawCount) && rawCount > 0 ? Math.round(rawCount) : SECTION_META[slug].mockOfficialQuestionCount;
    return { sectionSlug: slug, count };
  });

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
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">セクション</legend>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="radio" name="sectionChoice" value="both" defaultChecked className="size-4" />
            両方(Structure and Written Expression + Reading)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="radio" name="sectionChoice" value="structure" className="size-4" />
            Structure and Written Expressionのみ
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="radio" name="sectionChoice" value="reading" className="size-4" />
            Readingのみ
          </label>
        </fieldset>

        {MOCK_SECTION_ORDER.map((slug) => {
          const available = availableBySection[slug] ?? 0;
          const presets = countPresets(available, SECTION_META[slug].mockOfficialQuestionCount);
          const defaultValue = presets.find((p) => p.value === SECTION_META[slug].mockOfficialQuestionCount)
            ? SECTION_META[slug].mockOfficialQuestionCount
            : presets[presets.length - 1]?.value;
          return (
            <fieldset key={slug} className="space-y-2 rounded-md border border-border p-4">
              <legend className="text-sm font-medium text-foreground">
                {SECTION_META[slug].nameJa}の問題数
                <span className="ml-1 font-normal text-muted-foreground">({available}問公開中)</span>
              </legend>
              {presets.map((preset) => (
                <label key={preset.value} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name={`count_${slug}`}
                    value={preset.value}
                    defaultChecked={preset.value === defaultValue}
                    className="size-4"
                  />
                  {preset.label}
                </label>
              ))}
              <p className="text-xs text-muted-foreground">
                本番は{SECTION_META[slug].mockOfficialQuestionCount}問 / {SECTION_META[slug].mockTimeLimitSec / 60}分
              </p>
            </fieldset>
          );
        })}

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
