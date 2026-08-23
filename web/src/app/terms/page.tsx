import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | 英語演習",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/app/practice" className="text-sm text-primary hover:underline">
        ← 演習に戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold text-foreground">利用規約</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        本サービス「英語演習」は、個人が運営する無料の学習サイトです。ご利用にあたっては、以下の内容をご確認ください。
      </p>

      <ol className="mt-8 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">サービスの性質</span>
          <br />
          本サービスは個人が運営する無料の学習サイトであり、法人・団体としての事業ではありません。
        </li>
        <li>
          <span className="font-medium text-foreground">コンテンツについて</span>
          <br />
          本サービスに掲載する問題・解説・パッセージは、いずれも独自に作成したオリジナルコンテンツです。
        </li>
        <li>
          <span className="font-medium text-foreground">内容の正確性について</span>
          <br />
          問題・解説の内容および表示される推定スコアについて、正確性・完全性を保証するものではありません。表示されるスコアはあくまで独自の目安です。
        </li>
        <li>
          <span className="font-medium text-foreground">サービスの変更・停止</span>
          <br />
          運営者の判断により、事前の通知なくサービス内容の変更、一時停止、または終了を行うことがあります。
        </li>
        <li>
          <span className="font-medium text-foreground">禁止事項</span>
          <br />
          不正アクセス、本サービスのシステムに過度な負荷をかける自動化されたアクセス、その他の運営を妨げる行為を禁止します。これらの行為が確認された場合、アクセスを制限することがあります。
        </li>
        <li>
          <span className="font-medium text-foreground">免責事項</span>
          <br />
          本サービスの利用により生じたいかなる損害についても、運営者は責任を負いかねます。あらかじめご了承の上でご利用ください。
        </li>
        <li>
          <span className="font-medium text-foreground">規約の変更</span>
          <br />
          本規約は、必要に応じて予告なく変更されることがあります。変更後の内容は、本ページに掲載した時点で効力を持つものとします。
        </li>
      </ol>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        取得情報の取り扱いについては
        <Link href="/privacy" className="text-primary hover:underline">
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>

      <p className="mt-10 text-xs text-muted-foreground">最終更新日: 2026年8月23日</p>
    </div>
  );
}
