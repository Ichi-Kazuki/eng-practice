import { loadDefaultJapaneseParser } from "budoux";

const parser = loadDefaultJapaneseParser();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 「」『』で囲まれたフレーズをBudouXの分割対象から保護する(ja-webtypo-skill Rule 22)
function protectQuotedPhrases(html: string): string {
  return html
    .replace(/「([^」]+)」/g, '<span class="text-ja-nowrap">「$1」</span>')
    .replace(/『([^』]+)』/g, '<span class="text-ja-nowrap">『$1』</span>');
}

/**
 * 短い日本語の見出し・カードタイトル(Tier A)向けに、BudouXでフレーズ単位の
 * 改行候補(<wbr>)を挿入したHTML文字列を返す。ビルド/リクエスト時に実行し、
 * 結果はデータ層に保存しない(ja-webtypo-skill: Coverage Tiers参照)。
 */
export function jaPhraseHtml(text: string): string {
  const escaped = escapeHtml(text);
  const protectedHtml = protectQuotedPhrases(escaped);
  return parser.translateHTMLString(protectedHtml).replaceAll("​", "<wbr>");
}
