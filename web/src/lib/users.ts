import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";

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
  await db.insert(users).values({
    id,
    googleSub: profile.sub,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture ?? null,
  });

  return {
    id,
    googleSub: profile.sub,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture ?? null,
    createdAt: new Date(),
  };
}
