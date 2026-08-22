export type SectionSlug = "structure" | "reading" | "listening";

export const SECTION_META: Record<
  SectionSlug,
  {
    nameJa: string;
    nameEn: string;
    mockTimeLimitSec: number;
    mockOfficialQuestionCount: number;
    mockPerQuestionSec: number;
    available: boolean;
  }
> = {
  structure: {
    nameJa: "Grammar",
    nameEn: "Grammar",
    mockTimeLimitSec: 25 * 60,
    mockOfficialQuestionCount: 40,
    mockPerQuestionSec: (25 * 60) / 40, // 本番相当ペース(1問あたり37.5秒)
    available: true,
  },
  reading: {
    nameJa: "Reading",
    nameEn: "Reading",
    mockTimeLimitSec: 55 * 60,
    mockOfficialQuestionCount: 50,
    mockPerQuestionSec: (55 * 60) / 50, // 本番相当ペース(1問あたり66秒)
    available: true,
  },
  listening: {
    nameJa: "Listening",
    nameEn: "Listening",
    mockTimeLimitSec: 35 * 60,
    mockOfficialQuestionCount: 50,
    mockPerQuestionSec: (35 * 60) / 50,
    available: false,
  },
};

export const MOCK_SECTION_ORDER: SectionSlug[] = ["structure", "reading"];

export const QUESTION_TYPE_LABEL_JA: Record<string, string> = {
  structure_completion: "文法補充",
  structure_error_id: "誤り指摘",
  reading_comprehension: "読解",
};
