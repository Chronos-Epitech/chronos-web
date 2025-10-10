import { NextRequest, NextResponse } from "next/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { ClerkAPIError } from "@clerk/types";

export async function getJsonOrNull<T = unknown>(
  req: NextRequest
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function extractClerkError(
  error: unknown
): { message: string; status: number } | null {
  if (!isClerkAPIResponseError(error)) return null;
  const first: ClerkAPIError | undefined = error.errors?.[0];
  const message = first?.longMessage ?? first?.message ?? "Request failed";
  const status = typeof error.status === "number" ? error.status : 400;
  return { message, status };
}

export function handleClerkApiError(
  error: unknown,
  fallbackMessage: string,
  fallbackStatus = 500
) {
  const extracted = extractClerkError(error);
  if (extracted) {
    return NextResponse.json(
      { error: extracted.message },
      { status: extracted.status }
    );
  }
  return NextResponse.json(
    { error: fallbackMessage },
    { status: fallbackStatus }
  );
}
