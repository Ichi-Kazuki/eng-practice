import Link from "next/link";
import { getActiveIdentity } from "@/lib/auth/active-identity";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { deleteAccountAndData, deleteGuestData } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const identity = await getActiveIdentity();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-xl font-bold text-foreground">設定</h1>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">アカウント情報</h2>
        {identity && !identity.isGuest ? (
          <p className="text-sm text-muted-foreground">
            {identity.name} としてログイン中です({identity.email})。
          </p>
        ) : identity && identity.isGuest ? (
          <p className="text-sm text-muted-foreground">
            ゲストとして利用中です。
            <Link href="/api/auth/login" className="text-primary hover:underline">
              Googleでログイン
            </Link>
            すると、学習データを永続的に保存できます。
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            まだ演習を開始していないため、保存されているデータはありません。
          </p>
        )}
      </section>

      <section className="mt-10 space-y-3 border-t border-border pt-8">
        <h2 className="text-sm font-semibold text-destructive">学習データ・アカウントの削除</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          演習・模試の履歴、復習ノートのデータをすべて削除します。この操作は取り消せません。
        </p>

        {identity && !identity.isGuest && (
          <form action={deleteAccountAndData}>
            <ConfirmSubmitButton
              confirmMessage="アカウントと保存されている学習データをすべて削除します。この操作は取り消せません。よろしいですか?"
              className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              学習データ・アカウントを削除
            </ConfirmSubmitButton>
          </form>
        )}

        {identity && identity.isGuest && (
          <form action={deleteGuestData}>
            <ConfirmSubmitButton
              confirmMessage="このブラウザに保存されているゲストの学習データをすべて削除します。この操作は取り消せません。よろしいですか?"
              className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              ゲストの学習データを削除
            </ConfirmSubmitButton>
          </form>
        )}

        {!identity && (
          <p className="text-sm text-muted-foreground">削除対象のデータはありません。</p>
        )}
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        取得情報の詳細は
        <Link href="/privacy" className="text-primary hover:underline">
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>
    </div>
  );
}
