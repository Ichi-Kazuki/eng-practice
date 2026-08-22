import { writeFileSync } from "node:fs";
import { sections, passages, structureQuestions, readingQuestions } from "./seed-data.mjs";

function sqlStr(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const lines = [];

for (const s of sections) {
  lines.push(
    `INSERT INTO sections (slug, name_ja, sort_order) VALUES (${sqlStr(s.slug)}, ${sqlStr(s.nameJa)}, ${s.sortOrder}) ON CONFLICT(slug) DO NOTHING;`
  );
}

for (const p of passages) {
  lines.push(
    `INSERT INTO passages (id, section_slug, title, body) VALUES (${sqlStr(p.id)}, ${sqlStr(p.sectionSlug)}, ${sqlStr(p.title)}, ${sqlStr(p.body)}) ON CONFLICT(id) DO NOTHING;`
  );
}

const allQuestions = [...structureQuestions, ...readingQuestions];
for (const q of allQuestions) {
  lines.push(
    `INSERT INTO questions (id, section_slug, passage_id, question_type, stem, choices, correct_index, explanation, difficulty, status) VALUES (${sqlStr(
      q.id
    )}, ${sqlStr(q.sectionSlug)}, ${sqlStr(q.passageId)}, ${sqlStr(q.questionType)}, ${sqlStr(q.stem)}, ${sqlStr(
      JSON.stringify(q.choices)
    )}, ${q.correctIndex}, ${sqlStr(q.explanation)}, ${sqlStr(q.difficulty)}, 'published') ON CONFLICT(id) DO NOTHING;`
  );
}

writeFileSync(new URL("../seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log(`Wrote ${lines.length} statements to seed.sql`);
