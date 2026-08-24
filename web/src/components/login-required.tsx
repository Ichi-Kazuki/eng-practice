import { Button } from "@/components/ui/button";
import { JaHeading } from "@/components/ja-heading";

export function LoginRequired({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <JaHeading className="text-lg font-bold text-foreground" text="ログインが必要です" />
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
      <Button nativeButton={false} render={<a href="/api/auth/login" />} size="lg" className="mt-6">
        Googleでログイン
      </Button>
    </div>
  );
}
