import Link from "next/link";
import {
  BookOpenTextIcon,
  ClockCountdownIcon,
  NotebookIcon,
  ChartBarIcon,
} from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/app/practice", label: "演習", icon: BookOpenTextIcon },
  { href: "/app/mock", label: "模試", icon: ClockCountdownIcon },
  { href: "/app/notebook", label: "復習ノート", icon: NotebookIcon },
  { href: "/app/dashboard", label: "スコア", icon: ChartBarIcon },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/app" className="text-sm font-bold text-foreground">
            英語演習
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
