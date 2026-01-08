import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({
    ctx,
  });
});

const isManager = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  if (ctx.role !== "manager" && ctx.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN" });
  return next({
    ctx,
  });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  if (ctx.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({
    ctx,
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const managerProcedure = t.procedure.use(isManager);
export const adminProcedure = t.procedure.use(isAdmin);
