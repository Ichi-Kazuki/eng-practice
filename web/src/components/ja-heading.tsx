import { jaPhraseHtml } from "@/lib/ja-phrase";

/**
 * 短い日本語の見出し用(Tier A)。BudouXでフレーズ単位の改行候補を挿入し、
 * WebKit(iPhone全ブラウザ)・Gecko(Firefox)でも意味のまとまりで改行されるようにする。
 * 英語の見出し文字列(セクション名など)には使わない。
 */
export function JaHeading({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <h1 className={className} dangerouslySetInnerHTML={{ __html: jaPhraseHtml(text) }} />;
}
