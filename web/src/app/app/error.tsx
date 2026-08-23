"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-lg font-bold text-foreground">問題が発生しました</p>
      <p className="max-w-md text-sm text-muted-foreground">
        ページの表示中にエラーが発生しました。時間をおいて再度お試しください。
      </p>
      <Button onClick={() => reset()}>もう一度読み込む</Button>
    </div>
  );
}
