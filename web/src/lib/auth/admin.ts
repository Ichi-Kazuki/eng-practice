import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "./current-user";
import type { SessionPayload } from "./session";

/**
 * 管理者判定は本来Google sub(ADMIN_GOOGLE_SUB)で行う。
 * ADMIN_GOOGLE_SUBが未設定の間だけ、移行期間の互換性としてADMIN_EMAILにフォールバックする。
 * ADMIN_GOOGLE_SUBが設定されたら、そちらのみを正とする(ADMIN_EMAILへは戻さない)。
 */
export async function isAdminUser(user: SessionPayload | null): Promise<boolean> {
  if (!user) return false;
  const { env } = getCloudflareContext();

  if (env.ADMIN_GOOGLE_SUB) {
    const db = getDb();
    const row = await db.query.users.findFirst({ where: eq(users.id, user.userId) });
    return row?.googleSub === env.ADMIN_GOOGLE_SUB;
  }

  return !!env.ADMIN_EMAIL && user.email === env.ADMIN_EMAIL;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user || !(await isAdminUser(user))) {
    throw new Error("forbidden");
  }
  return user;
}
