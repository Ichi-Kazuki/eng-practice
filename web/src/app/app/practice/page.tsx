import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import {
  PencilSimpleLineIcon,
  BookOpenIcon,
  HeadphonesIcon,
  CaretRightIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { SECTION_META, type SectionSlug } from "@/lib/section-meta";
import { Card } from "@/components/ui/card";
import { JaHeading } from "@/components/ja-heading";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SectionVisual = {
  icon: typeof PencilSimpleLineIcon;
  iconBg: string;
  iconColor: string;
};

const SECTION_VISUALS: Record<SectionSlug, SectionVisual> = {
  structure: { icon: PencilSimpleLineIcon, iconBg: "bg-primary/10", iconColor: "text-primary" },
  reading: {
    icon: BookOpenIcon,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  listening: {
    icon: HeadphonesIcon,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
};

function CornerDots({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("hidden grid-cols-3 gap-2 sm:grid", className)}>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="size-1 rounded-full bg-foreground/15" />
      ))}
    </div>
  );
}

export default async function PracticeSectionSelect() {
  const db = getDb();
  const counts = await db
    .select({ sectionSlug: questions.sectionSlug, count: sql<number>`count(*)` })
    .from(questions)
    .where(eq(questions.status, "published"))
    .groupBy(questions.sectionSlug);

  const countBySection = Object.fromEntries(counts.map((c) => [c.sectionSlug, c.count]));

  const sections: SectionSlug[] = ["structure", "reading", "listening"];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-violet-50/70 via-background to-sky-50/50 dark:from-background dark:via-background dark:to-background"
      />
      <CornerDots className="pointer-events-none fixed top-24 right-6 -z-10" />
      <CornerDots className="pointer-events-none fixed bottom-10 left-6 -z-10" />

      <div className="flex items-center gap-2">
        <JaHeading className="text-xl font-bold text-foreground" text="セクションを選ぶ" />
        <SparkleIcon className="size-4 text-primary" weight="fill" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        解答後すぐに正誤と解説が表示されます。同じセクションは何度でも解き直せます。
      </p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {sections.map((slug) => {
          const meta = SECTION_META[slug];
          const count = countBySection[slug] ?? 0;
          const disabled = !meta.available || count === 0;
          const { icon: Icon, iconBg, iconColor } = SECTION_VISUALS[slug];
          const card = (
            <Card
              className={cn(
                "flex-row items-center justify-between gap-4 rounded-2xl p-6 ring-1 ring-border/60 transition-all",
                disabled
                  ? "opacity-50"
                  : "hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-full", iconBg)}>
                  <Icon className={cn("size-6", iconColor)} weight="bold" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{meta.nameJa}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {meta.available ? `${count}問 公開中` : "準備中"}
                  </p>
                </div>
              </div>
              <span
                aria-hidden
                className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", iconBg)}
              >
                <CaretRightIcon className={cn("size-4", iconColor)} weight="bold" />
              </span>
            </Card>
          );
          return disabled ? (
            <div key={slug}>{card}</div>
          ) : (
            <Link key={slug} href={`/app/practice/${slug}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
