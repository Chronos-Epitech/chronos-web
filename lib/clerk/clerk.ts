import { clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function clerkSendInvitation(email: string, role: string) {
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

export async function clerkGetAllInvitations() {
  return client.invitations.getInvitationList();
}

export async function clerkRevokeInvitation(invitationId: string) {
  return client.invitations.revokeInvitation(invitationId);
}

export async function clerkGetAllUsers() {
  return client.users.getUserList();
}

export async function clerkGetUser(userId: string) {
  return client.users.getUser(userId);
}

export async function clerkCreateUser(params: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}) {
  const { email, password, firstName, lastName, role } = params;
  return client.users.createUser({
    emailAddress: [email],
    password,
    firstName,
    lastName,
    publicMetadata: role ? { role } : undefined,
  });
}

export async function clerkDeleteUser(userId: string) {
  return client.users.deleteUser(userId);
}

export async function clerkUpdateUser(
  userId: string,
  params: { firstName?: string; lastName?: string }
) {
  return client.users.updateUser(userId, params);
}

export async function clerkUpdateUserMetadata(
  userId: string,
  params: {
    publicMetadata?: Record<string, unknown>;
    privateMetadata?: Record<string, unknown>;
  }
) {
  return client.users.updateUserMetadata(userId, params);
}
