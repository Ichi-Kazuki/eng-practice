"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function StartSectionButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "開始しています…" : "このセクションを開始する"}
    </Button>
  );
}
