import { NextRequest, NextResponse } from "next/server";
import {
  clerkGetUser,
  clerkCreateUser,
  clerkDeleteUser,
  clerkUpdateUser,
  clerkUpdateUserMetadata,
} from "@/lib/clerk/clerk";
import { withAdmin } from "@/lib/http-handlers";
import {
  getJsonOrNull,
  handleClerkApiError,
  isNonEmptyString,
} from "@/lib/http";

async function getUserByIdRoute(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")?.trim() ?? null;

  if (!isNonEmptyString(userId))
    return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const user = await clerkGetUser(userId);
    return NextResponse.json(user);
  } catch (error: unknown) {
    return handleClerkApiError(error, "Failed to fetch user.");
  }
}

async function createUserRoute(req: NextRequest) {
  const body = await getJsonOrNull<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }>(req);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const email = body.email?.trim();
  const password = body.password?.trim();
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const role = body.role?.trim();

  if (!isNonEmptyString(email))
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  if (!isNonEmptyString(password))
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  if (!isNonEmptyString(firstName))
    return NextResponse.json({ error: "First name required" }, { status: 400 });
  if (!isNonEmptyString(lastName))
    return NextResponse.json({ error: "Last name required" }, { status: 400 });

  try {
    const user = await clerkCreateUser({
      email,
      password,
      firstName,
      lastName,
      role: isNonEmptyString(role) ? role : undefined,
    });
    return NextResponse.json(user);
  } catch (error: unknown) {
    return handleClerkApiError(error, "Failed to create user.");
  }
}

async function deleteUserRoute(req: NextRequest) {
  const body = await getJsonOrNull<{ userId?: string }>(req);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const userId = body.userId?.trim();
  if (!isNonEmptyString(userId))
    return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const result = await clerkDeleteUser(userId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleClerkApiError(error, "Failed to delete user.");
  }
}

async function updateUserRoute(req: NextRequest) {
  const body = await getJsonOrNull<{
    userId?: string;
    firstName?: string;
    lastName?: string;
    role?: string | null;
  }>(req);
  if (!body)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const userId = body.userId?.trim();
  if (!isNonEmptyString(userId))
    return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const role = typeof body.role === "string" ? body.role.trim() : body.role;

  try {
    if (isNonEmptyString(firstName) || isNonEmptyString(lastName)) {
      await clerkUpdateUser(userId, {
        firstName: isNonEmptyString(firstName) ? firstName : undefined,
        lastName: isNonEmptyString(lastName) ? lastName : undefined,
      });
    }

    if (role !== undefined) {
      await clerkUpdateUserMetadata(userId, {
        publicMetadata: role ? { role } : { role: null },
      });
    }

    const updated = await clerkGetUser(userId);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return handleClerkApiError(error, "Failed to update user.");
  }
}

// Only admins can manage users
export const GET = withAdmin(getUserByIdRoute);
export const POST = withAdmin(createUserRoute);
export const DELETE = withAdmin(deleteUserRoute);
export const PUT = withAdmin(updateUserRoute);
