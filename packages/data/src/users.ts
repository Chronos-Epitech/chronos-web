import { z } from "zod";
import { CreateUserInput, UpdateUserInput, DataCtx } from "@chronos/types";
import { assertAdmin } from "./roles";
import { createClerkClient } from "@clerk/backend";
import { mapClerkErrorToTrpc } from "./utils";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function listUsers(ctx: DataCtx) {
  assertAdmin(ctx.role);

  try {
    const response = await clerkClient.users.getUserList();
    return response.data;
  } catch (error) {
    return mapClerkErrorToTrpc(error);
  }
}

export async function getUserById(ctx: DataCtx, userId: string) {
  assertAdmin(ctx.role);

  try {
    const user = await clerkClient.users.getUser(userId);
    return user;
  } catch (error) {
    return mapClerkErrorToTrpc(error);
  }
}

export async function createUser(
  ctx: DataCtx,
  input: z.infer<typeof CreateUserInput>,
) {
  assertAdmin(ctx.role);

  try {
    const user = await clerkClient.users.createUser({
      emailAddress: [input.email],
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      publicMetadata: {
        role: input.role,
      },
    });

    return user;
  } catch (error) {
    return mapClerkErrorToTrpc(error);
  }
}

export async function updateUser(
  ctx: DataCtx,
  input: z.infer<typeof UpdateUserInput>,
) {
  assertAdmin(ctx.role);

  try {
    const updateData: any = {};

    if (input.firstName !== undefined) {
      updateData.firstName = input.firstName;
    }
    if (input.lastName !== undefined) {
      updateData.lastName = input.lastName;
    }
    if (input.role !== undefined) {
      updateData.publicMetadata = { role: input.role };
    }

    const user = await clerkClient.users.updateUser(input.id, updateData);
    return user;
  } catch (error) {
    return mapClerkErrorToTrpc(error);
  }
}

export async function deleteUser(ctx: DataCtx, userId: string) {
  assertAdmin(ctx.role);

  try {
    const user = await clerkClient.users.deleteUser(userId);
    return user;
  } catch (error) {
    return mapClerkErrorToTrpc(error);
  }
}
