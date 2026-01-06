import { z } from "zod";
import {
  router,
  adminProcedure,
  protectedProcedure,
  managerProcedure,
} from "../trpc";
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  CheckInInput,
  CheckOutInput,
  ScheduleId,
  UserId,
} from "@chronos/types";
import { schedules } from "@chronos/data";

export const scheduleRouter = router({
  // Admin-only CRUD operations
  getAll: adminProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/schedules",
        summary: "Get all schedules",
        description: "Only admins can access this endpoint",
      },
    })
    .output(z.array(z.any()))
    .query(({ ctx }) =>
      schedules.listSchedules({
        auth: ctx.auth,
        role: ctx.role,
        accessToken: ctx.accessToken,
      }),
    ),

  get: adminProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/schedules/{id}",
        summary: "Get a schedule by id",
        description: "Only admins can access this endpoint",
      },
    })
    .input(z.object({ id: ScheduleId }))
    .output(z.any().nullable())
    .query(({ ctx, input }) =>
      schedules.getScheduleById(
        {
          auth: ctx.auth,
          role: ctx.role,
          accessToken: ctx.accessToken,
        },
        input.id,
      ),
    ),

  getByUserId: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/schedules/user/{userId}",
        summary: "Get schedules by user id",
        description:
          "Users can access their own schedules, managers can access team member schedules",
      },
    })
    .input(z.object({ userId: UserId }))
    .output(z.array(z.any()))
    .query(({ ctx, input }) =>
      schedules.getSchedulesByUserId(
        {
          auth: ctx.auth,
          role: ctx.role,
          accessToken: ctx.accessToken,
        },
        input.userId,
      ),
    ),

  create: managerProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/schedules",
        summary: "Create a schedule",
        description:
          "Managers can create schedules for their team members. Admins can create schedules for any user.",
      },
    })
    .input(CreateScheduleInput)
    .output(z.any())
    .mutation(({ ctx, input }) =>
      schedules.createSchedule(
        {
          auth: ctx.auth,
          role: ctx.role,
          accessToken: ctx.accessToken,
        },
        input,
      ),
    ),

  update: managerProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/schedules/{id}",
        summary: "Update a schedule",
        description:
          "Managers can update schedules for their team members. Admins can update schedules for any user.",
      },
    })
    .input(UpdateScheduleInput)
    .output(z.any().nullable())
    .mutation(({ ctx, input }) =>
      schedules.updateSchedule(
        {
          auth: ctx.auth,
          role: ctx.role,
          accessToken: ctx.accessToken,
        },
        input,
      ),
    ),

  delete: managerProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/schedules/{id}",
        summary: "Delete a schedule",
        description:
          "Managers can delete schedules for their team members. Admins can delete schedules for any user.",
      },
    })
    .input(z.object({ id: ScheduleId }))
    .output(z.any().nullable())
    .mutation(({ ctx, input }) =>
      schedules.deleteSchedule(
        {
          auth: ctx.auth,
          role: ctx.role,
          accessToken: ctx.accessToken,
        },
        input.id,
      ),
    ),

  // Check-in and Check-out methods for members
  checkIn: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/schedules/check-in",
        summary: "Check in",
        description:
          "Users can check themselves in, managers can check team members in",
      },
    })
    .input(CheckInInput)
    .output(z.any())
    .mutation(({ ctx, input }) =>
      schedules.checkIn(
        {
          auth: ctx.auth,
          role: ctx.role,
          accessToken: ctx.accessToken,
        },
        input,
      ),
    ),

  checkOut: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/schedules/check-out",
        summary: "Check out",
        description:
          "Users can check themselves out, managers can check team members out",
      },
    })
    .input(CheckOutInput)
    .output(z.any())
    .mutation(({ ctx, input }) =>
      schedules.checkOut(
        {
          auth: ctx.auth,
          role: ctx.role,
          accessToken: ctx.accessToken,
        },
        input,
      ),
    ),
});
