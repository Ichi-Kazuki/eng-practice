import { Button } from "@/components/ui/button";

export function LoginRequired({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <h1 className="text-lg font-bold text-foreground">ログインが必要です</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
      <Button render={<a href="/api/auth/login" />} size="lg" className="mt-6">
        Googleでログイン
      </Button>
    </div>
  );
}
