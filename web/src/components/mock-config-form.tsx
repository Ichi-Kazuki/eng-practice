"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SECTION_META, MOCK_SECTION_ORDER, type SectionSlug } from "@/lib/section-meta";
import { countPresets } from "@/lib/mock-session";
import { startMockTest } from "@/app/app/mock/actions";

type SectionChoice = "both" | SectionSlug;

export function MockConfigForm({
  availableBySection,
}: {
  availableBySection: Record<SectionSlug, number | undefined>;
}) {
  const [sectionChoice, setSectionChoice] = useState<SectionChoice>("both");

  function isIncluded(slug: SectionSlug) {
    return sectionChoice === "both" || sectionChoice === slug;
  }

  return (
    <form action={startMockTest} className="mt-6 space-y-6">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">セクション</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="sectionChoice"
              value="both"
              checked={sectionChoice === "both"}
              onChange={() => setSectionChoice("both")}
              className="size-4"
            />
            両方({SECTION_META.structure.nameJa} + {SECTION_META.reading.nameJa})
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="sectionChoice"
              value="structure"
              checked={sectionChoice === "structure"}
              onChange={() => setSectionChoice("structure")}
              className="size-4"
            />
            {SECTION_META.structure.nameJa}のみ
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="sectionChoice"
              value="reading"
              checked={sectionChoice === "reading"}
              onChange={() => setSectionChoice("reading")}
              className="size-4"
            />
            {SECTION_META.reading.nameJa}のみ
          </label>
        </div>
      </fieldset>

      {MOCK_SECTION_ORDER.map((slug) => {
        const available = availableBySection[slug] ?? 0;
        const presets = countPresets(available, SECTION_META[slug].mockOfficialQuestionCount);
        const defaultValue = presets.find((p) => p.value === SECTION_META[slug].mockOfficialQuestionCount)
          ? SECTION_META[slug].mockOfficialQuestionCount
          : presets[presets.length - 1]?.value;
        const included = isIncluded(slug);

        return (
          <fieldset
            key={slug}
            className={cn(
              "space-y-2 rounded-md border border-border p-4 transition-opacity",
              !included && "opacity-40"
            )}
          >
            <legend className="text-sm font-medium text-foreground">
              {SECTION_META[slug].nameJa}の問題数
              <span className="ml-1 font-normal text-muted-foreground">({available}問公開中)</span>
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {presets.map((preset) => (
                <label
                  key={preset.value}
                  className={cn(
                    "flex items-center gap-2 text-sm text-foreground",
                    !included && "cursor-not-allowed"
                  )}
                >
                  <input
                    type="radio"
                    name={`count_${slug}`}
                    value={preset.value}
                    disabled={!included}
                    defaultChecked={preset.value === defaultValue}
                    className="size-4"
                  />
                  {preset.label}
                </label>
              ))}
            </div>
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
  );
}
