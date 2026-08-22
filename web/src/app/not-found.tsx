import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JaHeading } from "@/components/ja-heading";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center py-24 text-center">
      <p className="font-[family-name:var(--font-geist-mono)] text-sm text-muted-foreground">404</p>
      <JaHeading className="mt-2 text-lg font-bold text-foreground" text="ページが見つかりません" />
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        お探しのページは移動または削除された可能性があります。
      </p>
      <Button className="mt-6" render={<Link href="/app/practice" />}>
        演習に戻る
      </Button>
    </div>
  );
}
