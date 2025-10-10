import { NextResponse } from "next/server";
import { clerkGetAllUsers } from "@/lib/clerk/clerk";
import { withAdmin } from "@/lib/http-handlers";
import { handleClerkApiError } from "@/lib/http";

async function getUsers() {
  try {
    const users = await clerkGetAllUsers();
    return NextResponse.json(users);
  } catch (error: unknown) {
    return handleClerkApiError(error, "Failed to fetch users.");
  }
}

// only admin can get users
export const GET = withAdmin(getUsers);
