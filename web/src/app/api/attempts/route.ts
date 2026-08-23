import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { attempts, mockSessions } from "@/db/schema";
import { getOrCreateActiveIdentity, GuestIdentityRateLimitError } from "@/lib/auth/active-identity";
import { assertInt, assertNonEmptyString, assertOneOf, ValidationError } from "@/lib/validation";
import { chunk, D1_MAX_BOUND_PARAMS } from "@/lib/db/chunked-query";
import { getQuestionsByIds } from "@/lib/mock-session";

const MODES = ["practice", "mock"] as const;
const MAX_ID_LENGTH = 200;
const MAX_BATCH_ANSWERS = 200;
const ATTEMPT_INSERT_PARAM_COUNT = 7;
const MAX_INSERT_ROWS = Math.floor(D1_MAX_BOUND_PARAMS / ATTEMPT_INSERT_PARAM_COUNT);
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // covers a manual "retry save" click, not just an instant client retry

type ParsedSubmission = {
  mode: (typeof MODES)[number];
  mockSessionId: string | null;
  answers: Record<string, number>;
  isLegacySingle: boolean;
};

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
    if (mode === "mock" && mockSessionId === null) throw new ValidationError("mockSessionId is required");
    if (mode === "practice" && mockSessionId !== null) throw new ValidationError("mockSessionId is not allowed");
    return { mode, mockSessionId, answers, isLegacySingle: false };
  }

  if (mode !== "practice" || mockSessionId !== null) {
    throw new ValidationError("legacy single submissions are practice-only");
  }

  const questionId = assertNonEmptyString(body.questionId, "questionId", MAX_ID_LENGTH);
  const selectedIndex = assertInt(body.selectedIndex, "selectedIndex", { min: 0 });
  return { mode, mockSessionId, answers: { [questionId]: selectedIndex }, isLegacySingle: true };
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

  let identity: Awaited<ReturnType<typeof getOrCreateActiveIdentity>>;
  try {
    identity = await getOrCreateActiveIdentity();
  } catch (error) {
    if (error instanceof GuestIdentityRateLimitError) {
      return NextResponse.json({ error: "too many guest sessions" }, { status: 429 });
    }
    throw error;
  }
  const db = getDb();
  const ids = Object.keys(submission.answers);
  if (submission.mockSessionId) {
    const session = await db.query.mockSessions.findFirst({
      where: eq(mockSessions.id, submission.mockSessionId),
    });
    if (!session || session.userId !== identity.userId) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
    if (submission.mode === "mock") {
      if (session.status !== "in_progress") {
        return NextResponse.json({ error: "mock session is not in progress" }, { status: 409 });
      }
      const sections = session.sections as {
        questionIds: string[];
        startedAt: number | null;
        timeMode: "fixed" | "stopwatch";
        timeLimitSec: number | null;
      }[];
      const current = sections[session.currentSectionIndex];
      const expired =
        current?.timeMode === "fixed" &&
        current.startedAt !== null &&
        current.timeLimitSec !== null &&
        Date.now() - current.startedAt >= current.timeLimitSec * 1000;
      if (!current || current.startedAt === null || expired) {
        return NextResponse.json({ error: "mock section is not available" }, { status: 409 });
      }
      if (ids.some((id) => !current.questionIds.includes(id))) {
        return NextResponse.json({ error: "question is not in the current mock section" }, { status: 400 });
      }
    }
    const sessionQuestionIds = new Set(
      submission.mode === "mock"
        ? ((session.sections as { questionIds: string[] }[])[session.currentSectionIndex]?.questionIds ?? [])
        : (session.sections as { questionIds: string[] }[]).flatMap((section) => section.questionIds)
    );
    if (ids.some((id) => !sessionQuestionIds.has(id))) {
      return NextResponse.json({ error: "入力内容が正しくありません。" }, { status: 400 });
    }
  }

  const questionRows = await getQuestionsByIds(ids);
  const questionsById = new Map(questionRows.map((question) => [question.id, question]));
  if (questionRows.length !== ids.length || ids.some((id) => !questionsById.has(id))) {
    return NextResponse.json({ error: "question not found" }, { status: 404 });
  }
  if (submission.mode === "practice" && questionRows.some((question) => question.status !== "published")) {
    return NextResponse.json({ error: "question is not available" }, { status: 400 });
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

  if (submission.isLegacySingle && submission.mode === "practice") {
    const question = questionsById.get(ids[0])!;
    return NextResponse.json({ isCorrect: submission.answers[ids[0]] === question.correctIndex });
  }
  return NextResponse.json({ saved: values.length });
}
