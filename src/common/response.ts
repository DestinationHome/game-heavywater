import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export interface ApiResponse<T = unknown> {
  STATUS: "SUCCESS" | "ERROR";
  result?: T;
  message?: string;
}

/**
 * Standard DRY response wrapper for successful EmoRay API requests.
 */
export function apiSuccess<T>(c: Context, result: T, status: StatusCode = 200) {
  return c.json<ApiResponse<T>>(
    {
      STATUS: "SUCCESS",
      result,
    },
    status,
  );
}

/**
 * Standard DRY response wrapper for failed EmoRay API requests.
 */
export function apiError(
  c: Context,
  message: string,
  status: StatusCode = 400,
) {
  return c.json<ApiResponse>(
    {
      STATUS: "ERROR",
      message,
    },
    status,
  );
}
