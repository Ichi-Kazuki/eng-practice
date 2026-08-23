// wrangler secret（本番）/ .dev.vars（ローカル）で注入するシークレット類。
// cloudflare-env.d.ts は `npm run cf-typegen` で上書きされるため、ここで別ファイルとして型を拡張する。
interface CloudflareEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  // 管理者判定の正式な識別子(Google sub)。移行期間中は未設定でもよく、
  // その間はADMIN_EMAILにフォールバックする(src/lib/auth/admin.ts参照)。
  ADMIN_GOOGLE_SUB?: string;
  // 移行用の後方互換フィールド。ADMIN_GOOGLE_SUB設定後は本番から削除してよい
  // (型は wrangler types が.dev.varsから生成する宣言と揃えるため必須のまま)。
  ADMIN_EMAIL: string;
}
