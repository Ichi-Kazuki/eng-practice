import { Literata, Zen_Kaku_Gothic_New } from "next/font/google";

// LPの見出しのみで読み込む(アプリ側の見出しはNoto Sans JPに統一し、
// design-plan.md の方針どおりLPとの差を意図的につける)
export const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku-gothic-new",
  weight: ["500", "700"],
  subsets: ["latin"],
  preload: false,
});

// Reading本文(英語長文)専用。画面読書用に設計されたセリフ体
// (design-plan.md: 「genuinely editorial / publication」の例外に該当する根拠のある選定)
export const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  preload: false,
});
