import Link from "next/link";
import {
  BookOpenTextIcon,
  ClockCountdownIcon,
  NotebookIcon,
  ChartBarIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { zenKakuGothicNew } from "@/lib/fonts";
import { getCurrentUser } from "@/lib/auth/current-user";

const FEATURES = [
  {
    icon: BookOpenTextIcon,
    title: "セクション別に演習する",
    body: "Structure and Written ExpressionとReadingを、いつでも好きなだけ繰り返し解ける。",
  },
  {
    icon: ClockCountdownIcon,
    title: "本番形式で通し受験する",
    body: "制限時間付きの模試モードで、本番同様の時間配分に慣れる。",
  },
  {
    icon: NotebookIcon,
    title: "間違えた問題を復習する",
    body: "誤答は自動で復習ノートに記録。正解できたら自然に外れていく。",
  },
  {
    icon: ChartBarIcon,
    title: "弱点を可視化する",
    body: "セクション別・分野別の正答率とスコア目安をひと目で確認できる。",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className={zenKakuGothicNew.variable}>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-[family-name:var(--font-zen-kaku-gothic-new)] text-lg font-bold text-foreground">
            英語演習
          </span>
          <div className="flex items-center gap-3">
            <Button render={<Link href="/app" />} size="sm">
              演習を始める
            </Button>
            {!user && (
              <a href="/api/auth/login" className="text-sm text-muted-foreground hover:underline">
                ログイン
              </a>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="mb-4 text-sm font-medium text-primary">無料・登録数分・広告なし</p>
          <h1 className="font-[family-name:var(--font-zen-kaku-gothic-new)] text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            TOEFL ITP形式の問題を、
            <br />
            解けるだけ解く。
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            大学の学内プレースメントテストや交換留学の要件として使われるTOEFL
            ITPには、大量に演習できる無料サイトがまだありません。このサイトは
            Structure and Written Expression / Reading
            のオリジナル問題を、セクション別演習・本番形式の模試・誤答復習・スコア目安の4つの機能で使い倒せる場所を目指しています。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button render={<Link href="/app" />} size="lg">
              ログイン不要ですぐに演習を始める
            </Button>
            {!user && (
              <Button render={<a href="/api/auth/login" />} variant="outline" size="lg">
                Googleでログイン
              </Button>
            )}
          </div>
          {!user && (
            <p className="mt-3 text-xs text-muted-foreground">
              演習・模試はログインなしで解けます。誤答を復習ノートに残したり、スコア推移を保存したい場合はログインしてください。
            </p>
          )}
        </section>

        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-[family-name:var(--font-zen-kaku-gothic-new)] text-2xl font-bold text-foreground">
              できること
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-background p-6">
                  <Icon className="mb-3 size-6 text-primary" weight="duotone" />
                  <h3 className="font-medium text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-zen-kaku-gothic-new)] text-2xl font-bold text-foreground">
            知っておいてほしいこと
          </h2>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>・演習・模試はログインなしで利用できます。復習ノートとスコアダッシュボードのみログインが必要です。</li>
            <li>・問題はすべてオリジナルです。ETSの公式問題・過去問の転載や翻案は行っていません。</li>
            <li>・スコア目安は非公式の推定値です。公式スコアではありません。</li>
            <li>・v1時点ではListeningセクションは準備中です。Structure/Readingのみ対応しています。</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
          英語演習は個人が運営する非営利の学習サイトです。TOEFLはETSの登録商標であり、本サイトはETSと提携していません。
        </div>
      </footer>
    </div>
  );
}
