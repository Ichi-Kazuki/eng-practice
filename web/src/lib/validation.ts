// APIやServer Actionの入力を実行時に検証するための最小限のヘルパー。
// バリデーション要件が単純なため、zod等の依存追加はせずここに集約する。

export class ValidationError extends Error {}

export function assertNonEmptyString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }
  if (value.trim().length === 0) {
    throw new ValidationError(`${field} must not be empty`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${field} is too long`);
  }
  return value;
}

export function assertInt(
  value: unknown,
  field: string,
  { min, max }: { min?: number; max?: number } = {}
): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new ValidationError(`${field} must be an integer`);
  }
  if (min !== undefined && value < min) {
    throw new ValidationError(`${field} is out of range`);
  }
  if (max !== undefined && value > max) {
    throw new ValidationError(`${field} is out of range`);
  }
  return value;
}

export function assertOneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}`);
  }
  return value as T;
}
