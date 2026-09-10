import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiBody<T> = ApiSuccess<T> | ApiFailure;

const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Simple in-memory sliding-window rate limiter (per-process).
 * Suitable for basic protection of search/sync endpoints.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, entry.resetAt - now),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    retryAfterMs: 0,
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function ok<T>(
  data: T,
  init?: ResponseInit & { headers?: HeadersInit },
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}

export function err(
  message: string,
  status = 400,
  options?: {
    code?: string;
    details?: unknown;
    headers?: HeadersInit;
  },
): NextResponse<ApiFailure> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        message,
        code: options?.code,
        details: options?.details,
      },
    },
    { status, headers: options?.headers },
  );
}

export function zodErr(error: ZodError): NextResponse<ApiFailure> {
  return err("Validation failed", 400, {
    code: "VALIDATION_ERROR",
    details: error.flatten(),
  });
}

export function rateLimited(
  retryAfterMs: number,
): NextResponse<ApiFailure> {
  const retryAfterSec = Math.ceil(retryAfterMs / 1000) || 1;
  return err("Too many requests", 429, {
    code: "RATE_LIMITED",
    headers: {
      "Retry-After": String(retryAfterSec),
    },
  });
}

export function withRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number,
): NextResponse<ApiFailure> | null {
  const key = `${bucket}:${clientIp(request)}`;
  const result = checkRateLimit(key, limit, windowMs);
  if (!result.allowed) {
    return rateLimited(result.retryAfterMs);
  }
  return null;
}
