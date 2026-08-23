import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 英語演習",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/app/practice" className="text-sm text-primary hover:underline">
        ← 演習に戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold text-foreground">プライバシーポリシー</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        本サービス「英語演習」(以下「本サービス」)は個人が運営する無料の学習サイトです。本ページでは、本サービスが実際に取得・保存している情報と、その利用目的について説明します。
      </p>

      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">取得する情報</h2>
        <h3 className="mt-4 text-sm font-medium text-foreground">Googleログインを利用する場合</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Googleアカウントの識別子(sub)</li>
          <li>メールアドレス</li>
          <li>表示名</li>
          <li>プロフィール画像のURL(取得のみ行い、現在の画面上には表示していません)</li>
        </ul>
        <h3 className="mt-4 text-sm font-medium text-foreground">演習・模試を利用した場合</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>回答した問題ID、選択した選択肢、正誤、解答日時</li>
          <li>模試の進行状況(セクション構成、経過時間、解答内容、見直しフラグ)</li>
        </ul>
        <h3 className="mt-4 text-sm font-medium text-foreground">ログインせずに利用した場合(ゲスト利用)</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          端末を識別するためのランダムなID(個人を特定する情報は含みません)をCookieに保存し、上記の演習・模試の記録と紐づけます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">利用目的</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>ログイン状態の維持</li>
          <li>演習・模試の履歴の保存と復習ノートへの反映</li>
          <li>スコア目安・弱点分析ダッシュボードの表示</li>
          <li>模試の進行状況の保存(通信切断時の復旧を含む)</li>
          <li>不具合対応・サービス改善</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">利用しているCookie</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">session</span
            >: ログイン状態を維持するためのCookie(HttpOnly、外部から参照・改ざんできない形で保存)
          </li>
          <li>
            <span className="font-medium text-foreground">guest_id</span
            >: ゲスト利用時に演習履歴を紐づけるためのランダムなID(HttpOnly)
          </li>
          <li>
            <span className="font-medium text-foreground">oauth_state</span
            >: Googleログイン時の不正リクエスト防止用の一時的なCookie(数分で失効)
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">外部サービス</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Google(ログイン機能のため。Googleのプライバシーポリシーも参照してください)</li>
          <li>Cloudflare Workers / Cloudflare D1(本サービスのサーバー・データベースとして利用)</li>
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          上記以外の分析ツール・広告配信サービス等は利用していません。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">データの保存期間・削除</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ログインユーザーは、アカウント設定ページからいつでも自分の学習データとアカウントを削除できます。
          <Link href="/app/settings" className="text-primary hover:underline">
            設定ページはこちら
          </Link>
          。ゲスト利用時の記録も同ページから削除できます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">お問い合わせ</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          [運営者の問い合わせ先を設定してください]
        </p>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">最終更新日: 2026年8月23日</p>
    </div>
  );
}
