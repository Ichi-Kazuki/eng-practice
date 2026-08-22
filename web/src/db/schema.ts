import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 将来のListening追加を見据え、セクションはマスタテーブルとして疎結合に扱う
export const sections = sqliteTable("sections", {
  slug: text("slug").primaryKey(), // "structure" | "reading" | "listening"
  nameJa: text("name_ja").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const passages = sqliteTable("passages", {
  id: text("id").primaryKey(),
  sectionSlug: text("section_slug")
    .notNull()
    .references(() => sections.slug),
  title: text("title").notNull(),
  body: text("body").notNull(), // Reading本文(英語)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  sectionSlug: text("section_slug")
    .notNull()
    .references(() => sections.slug),
  passageId: text("passage_id").references(() => passages.id),
  questionType: text("question_type").notNull(), // 例: structure_completion, structure_error_id, reading_comprehension
  stem: text("stem").notNull(),
  choices: text("choices", { mode: "json" }).$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull().default("medium"), // easy | medium | hard
  status: text("status").notNull().default("draft"), // draft | ai_verified | published
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  googleSub: text("google_sub").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  selectedIndex: integer("selected_index").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  mode: text("mode").notNull(), // practice | mock
  mockSessionId: text("mock_session_id").references(() => mockSessions.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type MockSectionConfig = {
  sectionSlug: string;
  questionIds: string[];
  timeLimitSec: number;
  startedAt: number | null;
  submittedAt: number | null;
};

export const mockSessions = sqliteTable("mock_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("in_progress"), // in_progress | completed
  sections: text("sections", { mode: "json" }).$type<MockSectionConfig[]>().notNull(),
  currentSectionIndex: integer("current_section_index").notNull().default(0),
  answers: text("answers", { mode: "json" })
    .$type<Record<string, number>>()
    .notNull()
    .default(sql`'{}'`),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
