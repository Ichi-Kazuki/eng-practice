export type SectionSlug = "structure" | "reading" | "listening";

export const SECTION_META: Record<
  SectionSlug,
  { nameJa: string; nameEn: string; mockTimeLimitSec: number; available: boolean }
> = {
  structure: {
    nameJa: "Structure and Written Expression",
    nameEn: "Structure",
    mockTimeLimitSec: 25 * 60,
    available: true,
  },
  reading: {
    nameJa: "Reading",
    nameEn: "Reading",
    mockTimeLimitSec: 55 * 60,
    available: true,
  },
  listening: {
    nameJa: "Listening",
    nameEn: "Listening",
    mockTimeLimitSec: 35 * 60,
    available: false,
  },
};

export const MOCK_SECTION_ORDER: SectionSlug[] = ["structure", "reading"];

export const QUESTION_TYPE_LABEL_JA: Record<string, string> = {
  structure_completion: "文法補充",
  structure_error_id: "誤り指摘",
  reading_comprehension: "読解",
};
