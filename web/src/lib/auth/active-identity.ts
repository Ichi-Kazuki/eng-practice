import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "./current-user";

export const GUEST_COOKIE_NAME = "guest_id";
const GUEST_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1年

/**
 * Route Handler/Server Actionではリクエストの生プロトコルに直接アクセスできないため、
 * Cloudflareが付与するx-forwarded-protoで判定し、無ければビルド時のNODE_ENVにフォールバックする
 * (session cookie発行側のrequest.nextUrl.protocol判定と同じ意図を、requestオブジェクトが無い
 * コンテキストでも安全に再現するため)。
 */
async function isHttpsRequest(): Promise<boolean> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return process.env.NODE_ENV === "production";
}

export type ActiveIdentity = {
  userId: string;
  email: string;
  name: string;
  isGuest: boolean;
};

async function getOrCreateGuestUser(guestId: string) {
  const db = getDb();
  const googleSub = `guest:${guestId}`;

  const existing = await db.query.users.findFirst({
    where: eq(users.googleSub, googleSub),
  });
  if (existing) return existing;

  const id = crypto.randomUUID();
  await db.insert(users).values({ id, googleSub, email: "", name: "ゲスト", avatarUrl: null });
  return { id, googleSub, email: "", name: "ゲスト", avatarUrl: null, createdAt: new Date() };
}

/**
 * Route HandlerまたはServer Action専用。
 * ログイン済みならそのユーザー、未ログインならCookieのゲストIDを解決し、
 * 無ければ新規発行してCookieに保存する(ここでのcookies().set()はNext.jsの制約上、
 * Server ComponentのレンダリングパスからではなくRoute Handler/Server Actionからのみ呼び出せる)。
 */
export async function getOrCreateActiveIdentity(): Promise<ActiveIdentity> {
  const user = await getCurrentUser();
  if (user) return { userId: user.userId, email: user.email, name: user.name, isGuest: false };

  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set(GUEST_COOKIE_NAME, guestId, {
      httpOnly: true,
      secure: await isHttpsRequest(),
      sameSite: "lax",
      path: "/",
      maxAge: GUEST_MAX_AGE_SEC,
    });
  }

  const guestUser = await getOrCreateGuestUser(guestId);
  return { userId: guestUser.id, email: "", name: "ゲスト", isGuest: true };
}

/**
 * Server Component専用の読み取り専用版。新規Cookieの発行はしない
 * (Server Componentのレンダリング中はcookies().set()を呼べないため)。
 * ログイン済みユーザーもゲストCookieも無ければnullを返す。
 */
export async function getActiveIdentity(): Promise<ActiveIdentity | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.userId, email: user.email, name: user.name, isGuest: false };

  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!guestId) return null;

  const guestUser = await getOrCreateGuestUser(guestId);
  return { userId: guestUser.id, email: "", name: "ゲスト", isGuest: true };
}
