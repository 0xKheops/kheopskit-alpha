export const isTruthy = <T>(
  value: T | null | undefined | false | 0 | ""
): value is T => !!value;
