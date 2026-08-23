import { cookies, headers } from "next/headers";
import { and, eq, like, lt, notExists } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { attempts, mockSessions, users } from "@/db/schema";
import { getCurrentUser } from "./current-user";

export const GUEST_COOKIE_NAME = "guest_id";
const GUEST_MAX_AGE_SEC = 60 * 60 * 24 * 365;
const GUEST_CLEANUP_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const GUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class GuestIdentityRateLimitError extends Error {}

export function isValidGuestId(value: string): boolean {
  return GUEST_ID_PATTERN.test(value);
}

async function isHttpsRequest(): Promise<boolean> {
  const requestHeaders = await headers();
  const proto = requestHeaders.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return process.env.NODE_ENV === "production";
}

export type ActiveIdentity = {
  userId: string;
  email: string;
  name: string;
  isGuest: boolean;
};

async function getGuestUser(guestId: string) {
  const db = getDb();
  return db.query.users.findFirst({ where: eq(users.googleSub, `guest:${guestId}`) });
}

async function assertGuestCreationAllowed() {
  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const { env } = getCloudflareContext();
  const { success } = await env.ATTEMPTS_RATE_LIMITER.limit({ key: `guest-create:${clientIp}` });
  if (!success) throw new GuestIdentityRateLimitError("guest identity creation rate limit exceeded");
}

async function cleanupStaleGuestUsers() {
  const db = getDb();
  const cutoff = new Date(Date.now() - GUEST_CLEANUP_AGE_MS);
  await db.delete(users).where(
    and(
      like(users.googleSub, "guest:%"),
      lt(users.createdAt, cutoff),
      notExists(db.select({ id: attempts.id }).from(attempts).where(eq(attempts.userId, users.id))),
      notExists(db.select({ id: mockSessions.id }).from(mockSessions).where(eq(mockSessions.userId, users.id)))
    )
  );
}

async function createGuestUser(guestId: string) {
  if (!isValidGuestId(guestId)) throw new Error("invalid guest id");

  const db = getDb();
  await assertGuestCreationAllowed();
  await cleanupStaleGuestUsers();

  const id = crypto.randomUUID();
  try {
    await db.insert(users).values({ id, googleSub: `guest:${guestId}`, email: "", name: "ゲスト", avatarUrl: null });
  } catch (error) {
    const existing = await getGuestUser(guestId);
    if (existing) return existing;
    throw error;
  }

  return { id, googleSub: `guest:${guestId}`, email: "", name: "ゲスト", avatarUrl: null, createdAt: new Date() };
}

async function getOrCreateGuestUser(guestId: string) {
  const existing = await getGuestUser(guestId);
  return existing ?? createGuestUser(guestId);
}

/** Use from Route Handlers and Server Actions where creating a guest identity is allowed. */
export async function getOrCreateActiveIdentity(): Promise<ActiveIdentity> {
  const user = await getCurrentUser();
  if (user) return { userId: user.userId, email: user.email, name: user.name, isGuest: false };

  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!guestId || !isValidGuestId(guestId)) {
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
  return { userId: guestUser.id, email: "", name: guestUser.name, isGuest: true };
}

/** Read-only identity lookup for Server Components. It never creates a database row or cookie. */
export async function getActiveIdentity(): Promise<ActiveIdentity | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.userId, email: user.email, name: user.name, isGuest: false };

  const guestId = (await cookies()).get(GUEST_COOKIE_NAME)?.value;
  if (!guestId || !isValidGuestId(guestId)) return null;

  const guestUser = await getGuestUser(guestId);
  if (!guestUser) return null;
  return { userId: guestUser.id, email: "", name: guestUser.name, isGuest: true };
}
