import { z } from "zod";
import { Role, SendInvitationInput } from "@chronos/types";
import { assertAdmin } from "./roles";
import { createClerkClient } from "@clerk/backend";
import { TRPCError } from "@trpc/server";
import type { ClerkAPIResponseError } from "@clerk/types";

const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

function mapClerkErrorToTrpc(error: unknown): never {
  const isClerkError =
    typeof error === "object" &&
    error !== null &&
    (error as any).clerkError === true &&
    typeof (error as any).status === "number";

  if (isClerkError) {
    const e = error as ClerkAPIResponseError;
    const first = e.errors?.[0];
    const message =
      (first as any)?.longMessage ||
      first?.message ||
      e.message ||
      "Request failed";
    const status = e.status ?? 500;
    let code: TRPCError["code"] = "INTERNAL_SERVER_ERROR";
    if (status === 400) code = "BAD_REQUEST";
    else if (status === 401) code = "UNAUTHORIZED";
    else if (status === 403) code = "FORBIDDEN";
    else if (status === 404) code = "NOT_FOUND";
    else if (status === 409) code = "CONFLICT";
    else if (status === 422) code = "BAD_REQUEST";
    else if (status === 429) code = "TOO_MANY_REQUESTS";
    else if (status >= 500) code = "INTERNAL_SERVER_ERROR";

    throw new TRPCError({
      code,
      message,
      cause: {
        status,
        clerkTraceId: (e as any)?.clerkTraceId,
        errors: e.errors,
      },
    });
  }

  // Fallback
  const message = error instanceof Error ? error.message : "Unknown error";
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
}

export async function listInvitations(role: Role) {
  assertAdmin(role);
  try {
    const res = await client.invitations.getInvitationList();
    return { data: res.data, totalCount: res.totalCount };
  } catch (e) {
    return mapClerkErrorToTrpc(e);
  }
}

export async function sendInvitation(
  role: Role,
  input: z.infer<typeof SendInvitationInput>
) {
  assertAdmin(role);
  try {
    return await client.invitations.createInvitation({
      emailAddress: input.email,
      redirectUrl: "http://localhost:3000/sign-in",
      publicMetadata: {
        role: input.role,
      },
    });
  } catch (e) {
    return mapClerkErrorToTrpc(e);
  }
}

export async function revokeInvitation(role: Role, invitationId: string) {
  assertAdmin(role);
  try {
    return await client.invitations.revokeInvitation(invitationId);
  } catch (e) {
    return mapClerkErrorToTrpc(e);
  }
}
