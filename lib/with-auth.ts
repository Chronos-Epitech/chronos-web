// middleware.ts already protect all routes by default, so this is not really needed
// but it's a good practice to have it

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Handler = (req: NextRequest, context?: unknown) => Promise<NextResponse>;

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
