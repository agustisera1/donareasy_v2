export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  | "UNEXPECTED";

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; error: string };

export const fail = (code: ErrorCode, error: string) =>
  ({ ok: false, code, error }) as const;

export function unexpected(tag: string, error: unknown) {
  console.error(tag, error);
  return fail("UNEXPECTED", "No se pudo completar la operación");
}
