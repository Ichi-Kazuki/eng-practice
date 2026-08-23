import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, questions, mockSessions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { assertInt, assertNonEmptyString, assertOneOf, ValidationError } from "@/lib/validation";

const MODES = ["practice", "mock"] as const;
const MAX_ID_LENGTH = 200;
// 同一クライアントからの二重送信(ネットワーク再試行・多重クリック等)による
// 無意味な重複行の蓄積を軽減するための短い時間窓(秒単位のレート制限ではなく、あくまで重複排除)。
const DEDUP_WINDOW_MS = 3000;

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が正しくありません。" }, { status: 400 });
  }
  if (typeof raw !== "object" || raw === null) {
    return NextResponse.json({ error: "リクエストの形式が正しくありません。" }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;

  let questionId: string;
  let selectedIndex: number;
  let mode: (typeof MODES)[number];
  let mockSessionId: string | null;
  try {
    questionId = assertNonEmptyString(body.questionId, "questionId", MAX_ID_LENGTH);
    selectedIndex = assertInt(body.selectedIndex, "selectedIndex", { min: 0 });
    mode = assertOneOf(body.mode, "mode", MODES);
    mockSessionId =
      body.mockSessionId === undefined || body.mockSessionId === null || body.mockSessionId === ""
        ? null
        : assertNonEmptyString(body.mockSessionId, "mockSessionId", MAX_ID_LENGTH);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
    throw err;
  }

  const db = getDb();
  const question = await db.query.questions.findFirst({
    where: eq(questions.id, questionId),
  });
  if (!question) {
    return NextResponse.json({ error: "question not found" }, { status: 404 });
  }
  if (selectedIndex >= question.choices.length) {
    return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
  }

  const identity = await getOrCreateActiveIdentity();

  if (mockSessionId) {
    const session = await db.query.mockSessions.findFirst({
      where: eq(mockSessions.id, mockSessionId),
    });
    if (!session || session.userId !== identity.userId) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
  }

  const isCorrect = selectedIndex === question.correctIndex;

  const recentAttempts = await db.query.attempts.findMany({
    where: and(
      eq(attempts.userId, identity.userId),
      eq(attempts.questionId, questionId),
      eq(attempts.mode, mode)
    ),
  });
  const isDuplicate = recentAttempts.some(
    (a) => a.selectedIndex === selectedIndex && Date.now() - a.createdAt.getTime() < DEDUP_WINDOW_MS
  );
  if (isDuplicate) {
    return NextResponse.json({ isCorrect });
  }

  await db.insert(attempts).values({
    id: crypto.randomUUID(),
    userId: identity.userId,
    questionId,
    selectedIndex,
    isCorrect,
    mode,
    mockSessionId,
  });

  return NextResponse.json({ isCorrect });
}
