import { NextRequest, NextResponse } from "next/server";
import {
  sendInvitation,
  getAllInvitations,
  revokeInvitation,
} from "@/lib/clerk/clerk";
import { withAdmin, withManager } from "@/lib/http-handlers";
import {
  getJsonOrNull,
  handleClerkApiError,
  isNonEmptyString,
} from "@/lib/http";

async function getAllInvitationsRoute() {
  const invitations = await getAllInvitations();
  return NextResponse.json(invitations);
}

async function sendInvitationRoute(req: NextRequest) {
  const body = await getJsonOrNull<{ email?: string; role?: string }>(req);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const email = body.email?.trim();
  const role = body.role?.trim();
  if (!isNonEmptyString(email))
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  if (!isNonEmptyString(role))
    return NextResponse.json({ error: "Role required" }, { status: 400 });

  try {
    const invitation = await sendInvitation(email, role);
    return NextResponse.json(invitation);
  } catch (error: unknown) {
    return handleClerkApiError(error, "Failed to create invitation.");
  }
}

async function revokeInvitationRoute(req: NextRequest) {
  const body = await getJsonOrNull<{ invitationId?: string }>(req);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const invitationId = body.invitationId?.trim();
  if (!isNonEmptyString(invitationId))
    return NextResponse.json(
      { error: "Invitation ID required" },
      { status: 400 }
    );

  try {
    const invitation = await revokeInvitation(invitationId);
    return NextResponse.json(invitation);
  } catch (error: unknown) {
    return handleClerkApiError(error, "Failed to revoke invitation.");
  }
}

// admin can get all invitations
export const GET = withAdmin(getAllInvitationsRoute);
// manager can send invitations
export const POST = withManager(sendInvitationRoute);
// admin can revoke invitations
export const DELETE = withAdmin(revokeInvitationRoute);
