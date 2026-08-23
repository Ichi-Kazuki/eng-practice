import type { NextConfig } from "next";

// next/font はビルド時にフォントを自己ホストするため、Google Fonts等の外部originへの
// 実行時リクエストは発生しない。クライアントJSからの外部fetchも無い(Google OAuthは
// サーバー側リダイレクト/サーバー間通信のみ)ため、connect-src/font-srcは'self'に絞れる。
// script-src/style-srcの'unsafe-inline'は、Next.js App RouterのRSCハイドレーション用
// インラインscriptと、SSRされるReactのinline style属性を許可するために現時点では必要
// (nonceベースにするにはmiddleware/proxyでのper-request注入が要るが、このプロジェクトは
// Cloudflare Workers上のNode.jsランタイムでミドルウェアが使えない制約があるため見送り。
// 将来proxy.tsが使えるようになったらnonceベースへ強化する)。
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
