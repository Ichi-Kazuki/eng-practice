// 非公式のTOEFL ITPスコア換算(あくまで目安)。
// 公式換算表は非公開のため、市販対策本等で広く出回っている非公式換算表を複数参照し、
// 正答率(%) → セクションスケール得点(31〜68)の対応をパーセンタイル区分で近似したもの。
const PERCENT_TO_SCALED: [number, number][] = [
  [0, 31],
  [10, 33],
  [20, 36],
  [30, 39],
  [40, 42],
  [50, 46],
  [60, 50],
  [70, 54],
  [80, 58],
  [90, 63],
  [100, 68],
];

export function percentToScaledScore(percentCorrect: number): number {
  const pct = Math.max(0, Math.min(100, percentCorrect));
  for (let i = 0; i < PERCENT_TO_SCALED.length - 1; i++) {
    const [p0, s0] = PERCENT_TO_SCALED[i];
    const [p1, s1] = PERCENT_TO_SCALED[i + 1];
    if (pct >= p0 && pct <= p1) {
      const ratio = p1 === p0 ? 0 : (pct - p0) / (p1 - p0);
      return Math.round(s0 + ratio * (s1 - s0));
    }
  }
  return 68;
}

// v1はListeningを含まない暫定スコア(2セクションの平均 x 10、310〜677点相当のスケールに準拠)
export function estimateProvisionalTotalScore(sectionScaledScores: number[]): number {
  if (sectionScaledScores.length === 0) return 0;
  const avg = sectionScaledScores.reduce((a, b) => a + b, 0) / sectionScaledScores.length;
  return Math.round(avg * 10);
}
