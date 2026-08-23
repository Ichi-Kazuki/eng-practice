// D1 caps bound parameters per statement; queries built from a caller-supplied
// id list must be split into chunks that stay under that limit.
export const D1_MAX_BOUND_PARAMS = 100;

export function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}
