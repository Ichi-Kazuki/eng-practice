"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { JaHeading } from "@/components/ja-heading";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-sm py-24 text-center">
      <JaHeading className="text-lg font-bold text-foreground" text="読み込みに失敗しました" />
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        一時的な問題が発生した可能性があります。もう一度お試しください。
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        再読み込みする
      </Button>
    </div>
  );
}
