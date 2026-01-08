import { z } from "zod";
import { Role, SendInvitationInput } from "@chronos/types";
import { assertAdmin } from "./roles";
import { createClerkClient } from "@clerk/backend";
import { mapClerkErrorToTrpc } from "./utils";

const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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
  input: z.infer<typeof SendInvitationInput>,
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
