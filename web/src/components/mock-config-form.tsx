"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SECTION_META, MOCK_SECTION_ORDER, type SectionSlug } from "@/lib/section-meta";
import { countPresets } from "@/lib/mock-session";
import { startMockTest } from "@/app/app/mock/actions";

type SectionChoice = "both" | SectionSlug;

function RadioTile({
  name,
  value,
  label,
  sublabel,
  checked,
  defaultChecked,
  disabled,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  sublabel?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: () => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-sm text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary/40"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        className="size-4 accent-primary"
      />
      <span>
        <span className="block font-medium">{label}</span>
        {sublabel && <span className="mt-0.5 block text-xs text-muted-foreground">{sublabel}</span>}
      </span>
    </label>
  );
}

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
        <div className="flex flex-wrap gap-2">
          <RadioTile
            name="sectionChoice"
            value="both"
            label={`両方(${SECTION_META.structure.nameJa} + ${SECTION_META.reading.nameJa})`}
            checked={sectionChoice === "both"}
            onChange={() => setSectionChoice("both")}
          />
          <RadioTile
            name="sectionChoice"
            value="structure"
            label={`${SECTION_META.structure.nameJa}のみ`}
            checked={sectionChoice === "structure"}
            onChange={() => setSectionChoice("structure")}
          />
          <RadioTile
            name="sectionChoice"
            value="reading"
            label={`${SECTION_META.reading.nameJa}のみ`}
            checked={sectionChoice === "reading"}
            onChange={() => setSectionChoice("reading")}
          />
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
              "space-y-2.5 rounded-lg border border-border p-4 transition-opacity",
              !included && "opacity-40"
            )}
          >
            <legend className="text-sm font-medium text-foreground">
              {SECTION_META[slug].nameJa}の問題数
              <span className="ml-1 font-normal text-muted-foreground">({available}問公開中)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <RadioTile
                  key={preset.value}
                  name={`count_${slug}`}
                  value={String(preset.value)}
                  label={preset.label}
                  disabled={!included}
                  defaultChecked={preset.value === defaultValue}
                />
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
        <div className="space-y-2">
          <RadioTile
            name="timeMode"
            value="fixed"
            label="制限時間制"
            sublabel="本番相当のペースで自動計算した時間になると自動提出"
            defaultChecked
          />
          <RadioTile
            name="timeMode"
            value="stopwatch"
            label="時間を測るだけ"
            sublabel="制限なし。経過時間を表示し、自分で提出するまで終了しない"
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg">
        模試を開始する
      </Button>
    </form>
  );
}
