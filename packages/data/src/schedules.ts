import { z } from "zod";
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  CheckInInput,
  CheckOutInput,
  DataCtx,
} from "@chronos/types";
import { assertManager } from "./roles";
import { createServerSupabaseClient } from "@chronos/supabase";
import { TRPCError } from "@trpc/server";

async function getLastScheduleForUser(
  ctx: DataCtx,
  userId: string,
): Promise<{ type: "check_in" | "check_out"; created_at: string } | null> {
  const supabase = createServerSupabaseClient(ctx.accessToken);
  const { data, error } = await supabase
    .from("schedules")
    .select("type, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch last schedule: " + error.message,
    });
  }
  return data ?? null;
}

export async function listSchedules(ctx: DataCtx) {
  assertManager(ctx.role);

  const supabase = createServerSupabaseClient(ctx.accessToken);

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to list schedules: " + error.message,
    });
  }
  return data;
}

export async function getScheduleById(ctx: DataCtx, scheduleId: string) {
  assertManager(ctx.role);

  const supabase = createServerSupabaseClient(ctx.accessToken);

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get schedule by id: " + error.message,
    });
  }
  return data;
}

export async function getSchedulesByUserId(ctx: DataCtx, userId: string) {
  const supabase = createServerSupabaseClient(ctx.accessToken);

  // RLS policies will handle the authorization
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get schedules by user id: " + error.message,
    });
  }
  return data;
}

export async function createSchedule(
  ctx: DataCtx,
  input: z.infer<typeof CreateScheduleInput>,
) {
  assertManager(ctx.role);

  const supabase = createServerSupabaseClient(ctx.accessToken);

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      user_id: input.user_id,
      type: input.type,
    })
    .select()
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create schedule: " + error.message,
    });
  }
  return data;
}

export async function updateSchedule(
  ctx: DataCtx,
  input: z.infer<typeof UpdateScheduleInput>,
) {
  assertManager(ctx.role);

  const supabase = createServerSupabaseClient(ctx.accessToken);

  const updateData: any = {};
  if (input.type !== undefined) updateData.type = input.type;
  if (input.created_at !== undefined)
    updateData.created_at = input.created_at.toISOString();

  const { data, error } = await supabase
    .from("schedules")
    .update(updateData)
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update schedule: " + error.message,
    });
  }
  return data;
}

export async function deleteSchedule(ctx: DataCtx, scheduleId: string) {
  assertManager(ctx.role);

  const supabase = createServerSupabaseClient(ctx.accessToken);

  const { data, error } = await supabase
    .from("schedules")
    .delete()
    .eq("id", scheduleId)
    .select()
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete schedule: " + error.message,
    });
  }
  return data;
}

// Check-in and Check-out methods for members
export async function checkIn(
  ctx: DataCtx,
  input: z.infer<typeof CheckInInput>,
) {
  const supabase = createServerSupabaseClient(ctx.accessToken);

  // Allow users to check themselves in, or managers/admins to check others in
  const targetUserId = input.user_id || ctx.auth.userId;

  if (
    ctx.role !== "admin" &&
    ctx.role !== "manager" &&
    ctx.auth.userId !== targetUserId
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Unauthorized: Cannot check in other users",
    });
  }

  const last = await getLastScheduleForUser(ctx, targetUserId);
  if (last?.type === "check_in") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Already checked in. You must check out first.",
    });
  }

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      user_id: targetUserId,
      type: "check_in",
    })
    .select()
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check in: " + error.message,
    });
  }
  return data;
}

export async function checkOut(
  ctx: DataCtx,
  input: z.infer<typeof CheckOutInput>,
) {
  const supabase = createServerSupabaseClient(ctx.accessToken);

  // Allow users to check themselves out, or managers/admins to check others out
  const targetUserId = input.user_id || ctx.auth.userId;

  if (
    ctx.role !== "admin" &&
    ctx.role !== "manager" &&
    ctx.auth.userId !== targetUserId
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Unauthorized: Cannot check out other users",
    });
  }

  const last = await getLastScheduleForUser(ctx, targetUserId);
  if (!last) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No check-in found. You must check in first.",
    });
  }
  if (last.type === "check_out") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Already checked out. You must check in first.",
    });
  }

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      user_id: targetUserId,
      type: "check_out",
    })
    .select()
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check out: " + error.message,
    });
  }
  return data;
}
