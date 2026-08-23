import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// 日本語UI本文の既定フォント(ナビ・ボタン・説明文)
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// 英語のボタンラベルや選択肢記号(A/B/C/D)用
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 数字・タイマー・スコア表示用(等幅で桁がガタつかない)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "英語演習",
  description: "TOEFL ITP形式のStructure/Reading問題を無料で何度でも解ける演習サイト",
  openGraph: {
    title: "英語演習",
    description: "TOEFL ITP形式のStructure/Reading問題を無料で何度でも解ける演習サイト",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          本文へスキップ
        </a>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
