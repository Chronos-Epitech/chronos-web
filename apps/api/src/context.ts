import { Role } from "@chronos/types";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import * as clerkPkg from "@clerk/fastify";
const { getAuth } = clerkPkg;

export async function createContext({ req }: CreateFastifyContextOptions) {
  const auth = getAuth(req);

  // Access token: prefer Clerk-provided; else fall back to Bearer header (Postman)
  let accessToken = await auth?.getToken?.();
  if (!accessToken) {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) accessToken = header.slice(7);
  }

  const role = auth?.sessionClaims?.metadata?.role as Role;

  return { auth, accessToken, role };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
