import type { ErrorCode, ServiceResult } from "@/lib/shared/result";

const STATUS: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UNAVAILABLE: 503,
  UNEXPECTED: 500,
};

export const toHttpResponse = <T>(result: ServiceResult<T>) =>
  Response.json(result, { status: result.ok ? 200 : STATUS[result.code] });
