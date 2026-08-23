import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // 管理画面は運営者本人専用のため、他の未ログインページ(LoginRequired)とは異なり
  // 案内画面を挟まず即座にログインへ誘導している(意図的な差異)。
  if (!user) redirect("/api/auth/login");

  if (!(await isAdminUser(user))) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="text-sm font-bold text-foreground">
            管理画面 — 問題管理
          </Link>
          <Link href="/app" className="text-sm text-muted-foreground hover:underline">
            アプリに戻る
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
