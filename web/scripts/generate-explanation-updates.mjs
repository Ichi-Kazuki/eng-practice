import { writeFileSync } from "node:fs";
import { structureQuestions, readingQuestions } from "./seed-data.mjs";

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const allQuestions = [...structureQuestions, ...readingQuestions];
const lines = allQuestions.map(
  (q) => `UPDATE questions SET explanation = ${sqlStr(q.explanation)} WHERE id = ${sqlStr(q.id)};`
);

writeFileSync(new URL("../update-explanations.sql", import.meta.url), lines.join("\n") + "\n");
console.log(`Wrote ${lines.length} UPDATE statements to update-explanations.sql`);
