import { clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function sendInvitation(email: string, role: string) {
  // const redirectUrl =
  //   process.env.NODE_ENV === "development"
  //     ? "http://localhost:3000/sign-in"
  //     : "https://chronos.com/sign-in";

  return client.invitations.createInvitation({
    emailAddress: email,
    redirectUrl: "http://localhost:3000/sign-in",
    publicMetadata: {
      role: role,
    },
  });
}

export async function getAllInvitations() {
  return client.invitations.getInvitationList();
}

export async function revokeInvitation(invitationId: string) {
  return client.invitations.revokeInvitation(invitationId);
}