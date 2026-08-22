"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { questions, passages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function requireAdmin() {
  const user = await getCurrentUser();
  const { env } = getCloudflareContext();
  if (!user || user.email !== env.ADMIN_EMAIL) {
    throw new Error("forbidden");
  }
}

export async function createQuestion(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const choices = String(formData.get("choices") ?? "")
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);

  await db.insert(questions).values({
    id: crypto.randomUUID(),
    sectionSlug: String(formData.get("sectionSlug")),
    passageId: formData.get("passageId") ? String(formData.get("passageId")) : null,
    questionType: String(formData.get("questionType")),
    stem: String(formData.get("stem")),
    choices,
    correctIndex: Number(formData.get("correctIndex")),
    explanation: String(formData.get("explanation")),
    difficulty: String(formData.get("difficulty") ?? "medium"),
    status: String(formData.get("status") ?? "draft"),
  });

  redirect("/admin/questions");
}

export async function updateQuestion(id: string, formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const choices = String(formData.get("choices") ?? "")
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);

  await db
    .update(questions)
    .set({
      sectionSlug: String(formData.get("sectionSlug")),
      passageId: formData.get("passageId") ? String(formData.get("passageId")) : null,
      questionType: String(formData.get("questionType")),
      stem: String(formData.get("stem")),
      choices,
      correctIndex: Number(formData.get("correctIndex")),
      explanation: String(formData.get("explanation")),
      difficulty: String(formData.get("difficulty") ?? "medium"),
      status: String(formData.get("status") ?? "draft"),
      updatedAt: new Date(),
    })
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
  const db = getDb();
  await db.insert(passages).values({
    id: crypto.randomUUID(),
    sectionSlug: String(formData.get("sectionSlug") ?? "reading"),
    title: String(formData.get("title")),
    body: String(formData.get("body")),
  });
  redirect("/admin/passages");
}

export async function updatePassage(id: string, formData: FormData) {
  await requireAdmin();
  const db = getDb();
  await db
    .update(passages)
    .set({
      title: String(formData.get("title")),
      body: String(formData.get("body")),
    })
    .where(eq(passages.id, id));
  redirect("/admin/passages");
}

export async function deletePassage(id: string) {
  await requireAdmin();
  const db = getDb();
  await db.delete(passages).where(eq(passages.id, id));
  redirect("/admin/passages");
}
