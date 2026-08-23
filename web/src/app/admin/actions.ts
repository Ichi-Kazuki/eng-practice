"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { questions, passages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/admin";
import { assertInt, assertNonEmptyString, assertOneOf } from "@/lib/validation";

const SECTION_SLUGS = ["structure", "reading", "listening"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const STATUSES = ["draft", "ai_verified", "published"] as const;

const MAX_ID = 200;
const MAX_QUESTION_TYPE = 100;
const MAX_STEM = 4000;
const MAX_EXPLANATION = 4000;
const MAX_CHOICE_LENGTH = 1000;
const MIN_CHOICES = 2;
const MAX_CHOICES = 10;
const MAX_TITLE = 300;
const MAX_PASSAGE_BODY = 20000;

function parseChoices(raw: string): string[] {
  const choices = raw
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);
  if (choices.length < MIN_CHOICES || choices.length > MAX_CHOICES) {
    throw new Error(`choices must have between ${MIN_CHOICES} and ${MAX_CHOICES} items`);
  }
  for (const c of choices) {
    if (c.length > MAX_CHOICE_LENGTH) throw new Error("a choice is too long");
  }
  return choices;
}

function parseQuestionFields(formData: FormData) {
  const sectionSlug = assertOneOf(formData.get("sectionSlug"), "sectionSlug", SECTION_SLUGS);
  const passageIdRaw = formData.get("passageId");
  const passageId = passageIdRaw ? assertNonEmptyString(passageIdRaw, "passageId", MAX_ID) : null;
  const questionType = assertNonEmptyString(formData.get("questionType"), "questionType", MAX_QUESTION_TYPE);
  const stem = assertNonEmptyString(formData.get("stem"), "stem", MAX_STEM);
  const choices = parseChoices(String(formData.get("choices") ?? ""));
  const correctIndex = assertInt(Number(formData.get("correctIndex")), "correctIndex", {
    min: 0,
    max: choices.length - 1,
  });
  const explanation = assertNonEmptyString(formData.get("explanation"), "explanation", MAX_EXPLANATION);
  const difficulty = assertOneOf(formData.get("difficulty") || "medium", "difficulty", DIFFICULTIES);
  const status = assertOneOf(formData.get("status") || "draft", "status", STATUSES);

  return { sectionSlug, passageId, questionType, stem, choices, correctIndex, explanation, difficulty, status };
}

export async function createQuestion(formData: FormData) {
  await requireAdmin();
  const fields = parseQuestionFields(formData);
  const db = getDb();

  await db.insert(questions).values({
    id: crypto.randomUUID(),
    ...fields,
  });

  redirect("/admin/questions");
}

export async function updateQuestion(id: string, formData: FormData) {
  await requireAdmin();
  const fields = parseQuestionFields(formData);
  const db = getDb();

  await db
    .update(questions)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(questions.id, id));

  redirect("/admin/questions");
}

export async function deleteQuestion(id: string) {
  await requireAdmin();
  const db = getDb();
  await db.delete(questions).where(eq(questions.id, id));
  redirect("/admin/questions");
}

export async function createPassage(formData: FormData) {
  await requireAdmin();
  const sectionSlug = assertOneOf(formData.get("sectionSlug") || "reading", "sectionSlug", SECTION_SLUGS);
  const title = assertNonEmptyString(formData.get("title"), "title", MAX_TITLE);
  const body = assertNonEmptyString(formData.get("body"), "body", MAX_PASSAGE_BODY);
  const db = getDb();

  await db.insert(passages).values({
    id: crypto.randomUUID(),
    sectionSlug,
    title,
    body,
  });
  redirect("/admin/passages");
}

export async function updatePassage(id: string, formData: FormData) {
  await requireAdmin();
  const title = assertNonEmptyString(formData.get("title"), "title", MAX_TITLE);
  const body = assertNonEmptyString(formData.get("body"), "body", MAX_PASSAGE_BODY);
  const db = getDb();

  await db
    .update(passages)
    .set({ title, body })
    .where(eq(passages.id, id));
  redirect("/admin/passages");
}

export async function deletePassage(id: string) {
  await requireAdmin();
  const db = getDb();
  await db.delete(passages).where(eq(passages.id, id));
  redirect("/admin/passages");
}
