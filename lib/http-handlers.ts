import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Handler = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

// middleware.ts already protect all routes by default, so this is not really needed
// but it's a good practice to have it
export function withAuth(handler: Handler): Handler {
  return async (req: NextRequest, context?: unknown) => {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
        }
      );
    }

    return handler(req, context);
  };
}

export function withAdmin(handler: Handler): Handler {
  return async (req: NextRequest, context?: unknown) => {
    const user = await currentUser();

    if (user?.publicMetadata.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, context);
  };
}

export function withManager(handler: Handler): Handler {
  return async (req: NextRequest, context?: unknown) => {
    const user = await currentUser();
    if (user?.publicMetadata.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, context);
  };
}
