import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { CreateUserInput, UpdateUserInput, UserId } from "@chronos/types";
import { users } from "@chronos/data";

export const userRouter = router({
  getAll: adminProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/users",
        summary: "Get all users",
        description: "Only admins can access this endpoint",
      },
    })
    .output(z.array(z.any())) // Clerk user objects are complex, using z.any() for now
    .query(({ ctx }) =>
      users.listUsers({
        auth: ctx.auth,
        role: ctx.role,
        accessToken: ctx.accessToken,
      })
    ),

  get: adminProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/users/{id}",
        summary: "Get a user by id",
        description: "Only admins can access this endpoint",
      },
    })
    .input(z.object({ id: UserId }))
    .output(z.any().nullable()) // Clerk user objects are complex, using z.any() for now
    .query(({ ctx, input }) =>
      users.getUserById(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input.id
      )
    ),

  create: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/users",
        summary: "Create a user",
        description: "Only admins can access this endpoint",
      },
    })
    .input(CreateUserInput)
    .output(z.any()) // Clerk user objects are complex, using z.any() for now
    .mutation(({ ctx, input }) =>
      users.createUser(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input
      )
    ),

  update: adminProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/users/{id}",
        summary: "Update a user",
        description: "Only admins can access this endpoint",
      },
    })
    .input(UpdateUserInput)
    .output(z.any().nullable()) // Clerk user objects are complex, using z.any() for now
    .mutation(({ ctx, input }) =>
      users.updateUser(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input
      )
    ),

  delete: adminProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/users/{id}",
        summary: "Delete a user",
        description: "Only admins can access this endpoint",
      },
    })
    .input(z.object({ id: UserId }))
    .output(z.any().nullable()) // Clerk user objects are complex, using z.any() for now
    .mutation(({ ctx, input }) =>
      users.deleteUser(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input.id
      )
    ),
});
