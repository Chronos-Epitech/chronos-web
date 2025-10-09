import { NextRequest, NextResponse } from "next/server";
import { sendInvitation } from "@/lib/clerk/clerk";
import { withAuth } from "@/lib/with-auth";
import { ClerkErrorLike, ClerkAPIError } from "@/app/types";

function isClerkErrorLike(e: unknown): e is ClerkErrorLike {
  if (typeof e !== "object" || e === null) return false;
  return "errors" in e || "status" in e || "clerkError" in e;
}

function mapClerkError(
  err: ClerkErrorLike
): { message: string; status: number } | null {
  const errorsArray: ClerkAPIError[] = Array.isArray(err.errors)
    ? err.errors
    : [];
  const status = typeof err.status === "number" ? err.status : undefined;
  if (errorsArray.length === 0) return null;

  const codes: string[] = errorsArray
    .map((e) => e.code)
    .filter((c): c is string => Boolean(c));

  if (codes.includes("form_identifier_exists")) {
    return { message: "User already exists", status: 400 };
  }
  if (codes.includes("duplicate_record")) {
    return { message: "Invitation already pending", status: 400 };
  }

  const first = errorsArray[0];
  const message = first?.longMessage ?? first?.message ?? "Request failed";
  return { message, status: status ?? 400 };
}

async function sendInvitationRoute(req: NextRequest) {
  let body: { email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body?.email?.trim();
  const role = body?.role?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: "Role required" }, { status: 400 });
  }

  try {
    const invitation = await sendInvitation(email, role);
    return NextResponse.json(invitation);
  } catch (error: unknown) {
    if (isClerkErrorLike(error)) {
      const mapped = mapClerkError(error);
      if (mapped) {
        return NextResponse.json(
          { error: mapped.message },
          { status: mapped.status }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to create invitation." },
      { status: 500 }
    );
  }
}

export const POST = withAuth(sendInvitationRoute);
