import { Literata } from "next/font/google";

// Reading本文(英語長文)専用。画面読書用に設計されたセリフ体
// (design-plan.md: 「genuinely editorial / publication」の例外に該当する根拠のある選定)
export const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  preload: false,
});
