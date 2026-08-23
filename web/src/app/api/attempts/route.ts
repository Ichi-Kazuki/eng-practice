import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, inArray } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { attempts, questions, mockSessions } from "@/db/schema";
import { getOrCreateActiveIdentity } from "@/lib/auth/active-identity";
import { assertInt, assertNonEmptyString, assertOneOf, ValidationError } from "@/lib/validation";

const MODES = ["practice", "mock"] as const;
const MAX_ID_LENGTH = 200;
const MAX_BATCH_ANSWERS = 200;
const D1_MAX_BOUND_PARAMS = 100;
const ATTEMPT_INSERT_PARAM_COUNT = 7;
const MAX_INSERT_ROWS = Math.floor(D1_MAX_BOUND_PARAMS / ATTEMPT_INSERT_PARAM_COUNT);
const DEDUP_WINDOW_MS = 3000;

type ParsedSubmission = {
  mode: (typeof MODES)[number];
  mockSessionId: string | null;
  answers: Record<string, number>;
  isLegacySingle: boolean;
};

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

function parseAnswers(value: unknown): Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ValidationError("answers must be an object");
  }
  const entries = Object.entries(value);
  if (entries.length > MAX_BATCH_ANSWERS) throw new ValidationError("too many answers");

  const answers: Record<string, number> = Object.create(null) as Record<string, number>;
  for (const [questionId, selectedIndex] of entries) {
    const validId = assertNonEmptyString(questionId, "questionId", MAX_ID_LENGTH);
    answers[validId] = assertInt(selectedIndex, "selectedIndex", { min: 0 });
  }
  return answers;
}

function parseSubmission(body: Record<string, unknown>): ParsedSubmission {
  const mode = assertOneOf(body.mode, "mode", MODES);
  const mockSessionId =
    body.mockSessionId === undefined || body.mockSessionId === null || body.mockSessionId === ""
      ? null
      : assertNonEmptyString(body.mockSessionId, "mockSessionId", MAX_ID_LENGTH);

  if (body.answers !== undefined) {
    const answers = parseAnswers(body.answers);
    if (Object.keys(answers).length === 0) throw new ValidationError("answers must not be empty");
    return { mode, mockSessionId, answers, isLegacySingle: false };
  }

  const questionId = assertNonEmptyString(body.questionId, "questionId", MAX_ID_LENGTH);
  const selectedIndex = assertInt(body.selectedIndex, "selectedIndex", { min: 0 });
  return { mode, mockSessionId, answers: { [questionId]: selectedIndex }, isLegacySingle: true };
}

async function getQuestionsForIds(ids: string[]) {
  const db = getDb();
  const rows = [];
  for (const idChunk of chunk(ids, D1_MAX_BOUND_PARAMS)) {
    rows.push(...(await db.select().from(questions).where(inArray(questions.id, idChunk))));
  }
  return rows;
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が正しくありません。" }, { status: 400 });
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: "リクエストの形式が正しくありません。" }, { status: 400 });
  }

  let submission: ParsedSubmission;
  try {
    submission = parseSubmission(raw as Record<string, unknown>);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
    throw err;
  }

  const { env } = getCloudflareContext();
  const clientIp = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success: withinRateLimit } = await env.ATTEMPTS_RATE_LIMITER.limit({ key: clientIp });
  if (!withinRateLimit) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらくしてから再試行してください。" }, { status: 429 });
  }

  const identity = await getOrCreateActiveIdentity();
  const db = getDb();
  const ids = Object.keys(submission.answers);
  if (submission.mockSessionId) {
    const session = await db.query.mockSessions.findFirst({
      where: eq(mockSessions.id, submission.mockSessionId),
    });
    if (!session || session.userId !== identity.userId) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
    const sessionQuestionIds = new Set(
      (session.sections as { questionIds: string[] }[]).flatMap((section) => section.questionIds)
    );
    if (ids.some((id) => !sessionQuestionIds.has(id))) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
  }

  const questionRows = await getQuestionsForIds(ids);
  const questionsById = new Map(questionRows.map((question) => [question.id, question]));
  if (questionRows.length !== ids.length || ids.some((id) => !questionsById.has(id))) {
    return NextResponse.json({ error: "question not found" }, { status: 404 });
  }

  for (const [questionId, selectedIndex] of Object.entries(submission.answers)) {
    const question = questionsById.get(questionId);
    if (!question || selectedIndex >= question.choices.length) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
  }

  const recentAttempts = await db.query.attempts.findMany({
    where: and(
      eq(attempts.userId, identity.userId),
      eq(attempts.mode, submission.mode),
      gte(attempts.createdAt, new Date(Date.now() - DEDUP_WINDOW_MS))
    ),
  });
  const recentKeys = new Set(
    recentAttempts
      .filter((attempt) => attempt.mockSessionId === submission.mockSessionId)
      .map((attempt) => `${attempt.questionId}:${attempt.selectedIndex}`)
  );

  const values = ids
    .filter((questionId) => !recentKeys.has(`${questionId}:${submission.answers[questionId]}`))
    .map((questionId) => {
      const question = questionsById.get(questionId)!;
      const selectedIndex = submission.answers[questionId];
      return {
        id: crypto.randomUUID(),
        userId: identity.userId,
        questionId,
        selectedIndex,
        isCorrect: selectedIndex === question.correctIndex,
        mode: submission.mode,
        mockSessionId: submission.mockSessionId,
      };
    });

  for (const valueChunk of chunk(values, MAX_INSERT_ROWS)) {
    await db.insert(attempts).values(valueChunk);
  }

  if (submission.isLegacySingle) {
    const question = questionsById.get(ids[0])!;
    return NextResponse.json({ isCorrect: submission.answers[ids[0]] === question.correctIndex });
  }
  return NextResponse.json({ saved: values.length });
}
