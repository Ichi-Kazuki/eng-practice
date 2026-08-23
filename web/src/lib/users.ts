import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, attempts, mockSessions } from "@/db/schema";
import { isValidGuestId } from "@/lib/auth/active-identity";

export async function getOrCreateUserByGoogle(profile: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}) {
  const db = getDb();

  const existing = await db.query.users.findFirst({
    where: eq(users.googleSub, profile.sub),
  });
  if (existing) return existing;

  const id = crypto.randomUUID();
  try {
    await db.insert(users).values({
      id,
      googleSub: profile.sub,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture ?? null,
    });
  } catch (error) {
    const concurrentUser = await db.query.users.findFirst({
      where: eq(users.googleSub, profile.sub),
    });
    if (concurrentUser) return concurrentUser;
    throw error;
  }

  return {
    id,
    googleSub: profile.sub,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture ?? null,
    createdAt: new Date(),
  };
}

/**
 * ログイン時、同じブラウザにゲストCookieが残っていれば、
 * ゲスト時代の演習履歴・模試セッションを実ユーザーへ引き継ぐ。
 * 引き継ぎ後、空になったゲストuser行は削除する。
 */
export async function mergeGuestDataIntoUser(guestId: string, realUserId: string) {
  if (!isValidGuestId(guestId)) return;

  const db = getDb();
  const googleSub = `guest:${guestId}`;

  const guestUser = await db.query.users.findFirst({ where: eq(users.googleSub, googleSub) });
  if (!guestUser || guestUser.id === realUserId) return;

  await db.update(attempts).set({ userId: realUserId }).where(eq(attempts.userId, guestUser.id));
  await db.update(mockSessions).set({ userId: realUserId }).where(eq(mockSessions.userId, guestUser.id));
  await db.delete(users).where(eq(users.id, guestUser.id));
}
