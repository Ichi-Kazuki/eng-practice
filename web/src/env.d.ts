// wrangler secret（本番）/ .dev.vars（ローカル）で注入するシークレット類。
// cloudflare-env.d.ts は `npm run cf-typegen` で上書きされるため、ここで別ファイルとして型を拡張する。
interface CloudflareEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  ADMIN_EMAIL: string;
}
