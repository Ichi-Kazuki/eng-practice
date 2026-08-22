import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";

export async function POST(request: NextRequest) {
  const identity = await getOrCreateActiveIdentity();

  const body = (await request.json()) as {
    questionId: string;
    selectedIndex: number;
    mode: "practice" | "mock";
    mockSessionId?: string;
  };

  const db = getDb();
  const question = await db.query.questions.findFirst({
    where: eq(questions.id, body.questionId),
  });
  if (!question) {
    return NextResponse.json({ error: "question not found" }, { status: 404 });
  }

  const isCorrect = body.selectedIndex === question.correctIndex;

  await db.insert(attempts).values({
    id: crypto.randomUUID(),
    userId: identity.userId,
    questionId: body.questionId,
    selectedIndex: body.selectedIndex,
    isCorrect,
    mode: body.mode,
    mockSessionId: body.mockSessionId ?? null,
  });

  return NextResponse.json({ isCorrect });
}
