import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AppNav } from "@/components/app-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/app" className="text-sm font-bold text-foreground">
            英語演習
          </Link>
          <AppNav />
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <a href="/api/auth/login" className="text-sm text-primary hover:underline">
                ログインする
              </a>
            )}
          </div>
        </div>
      </header>
      {!user && (
        <div className="border-b border-border bg-secondary/40 px-6 py-2 text-center text-xs text-muted-foreground">
          ゲストとして利用中です。演習・模試はそのまま解けますが、復習ノートとスコアの記録にはログインが必要です。
        </div>
      )}
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
