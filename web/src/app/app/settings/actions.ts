"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, attempts, mockSessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { GUEST_COOKIE_NAME } from "@/lib/auth/active-identity";

// 外部キー制約の依存順(子→親)で削除する: attempts → mockSessions → users
async function deleteAllDataForUserId(userId: string) {
  const db = getDb();
  await db.delete(attempts).where(eq(attempts.userId, userId));
  await db.delete(mockSessions).where(eq(mockSessions.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * ログイン済みユーザー自身のアカウントと学習データを削除する。
 * 削除対象のuserIdはクライアントから受け取らず、必ずセッションから解決する。
 */
export async function deleteAccountAndData() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です。");
  }

  await deleteAllDataForUserId(user.userId);

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}

/**
 * ゲスト利用時の学習データを削除する。対象はguest_id Cookieから解決し、
 * クライアントからのIDは受け取らない。
 */
export async function deleteGuestData() {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!guestId) {
    redirect("/app/settings");
  }

  const db = getDb();
  const guestUser = await db.query.users.findFirst({
    where: eq(users.googleSub, `guest:${guestId}`),
  });
  if (guestUser) {
    await deleteAllDataForUserId(guestUser.id);
  }

  cookieStore.delete(GUEST_COOKIE_NAME);
  redirect("/app/practice");
}
