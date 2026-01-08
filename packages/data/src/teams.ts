import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  CreateTeamInput,
  UpdateTeamInput,
  TeamId,
  DataCtx,
} from "@chronos/types";
import { assertAdmin, assertManager } from "./roles";
import { createServerSupabaseClient } from "@chronos/supabase";

export async function listTeams(ctx: DataCtx) {
  assertAdmin(ctx.role);
  const supabase = createServerSupabaseClient(ctx.accessToken);
  const { data, error } = await supabase.from("teams").select("*");
  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to list teams: " + error.message,
    });
  }
  return data ?? [];
}

export async function getTeamById(ctx: DataCtx, input: z.infer<typeof TeamId>) {
  const supabase = createServerSupabaseClient(ctx.accessToken);
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", input)
    .maybeSingle();
  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get team: " + error.message,
    });
  }
  return data;
}

export async function createTeam(
  ctx: DataCtx,
  input: z.infer<typeof CreateTeamInput>,
) {
  assertAdmin(ctx.role);
  const supabase = createServerSupabaseClient(ctx.accessToken);

  // Check if manager exists and get their team_id from teams table
  const { data: manager, error: managerError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", input.managerId)
    .maybeSingle();
  console.log("manager", manager);
  if (managerError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check manager: " + managerError.message,
    });
  }
  if (!manager) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Manager not found",
    });
  }
  if (manager.role !== "manager") {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Manager must have role 'manager'",
    });
  }

  // Check if manager already has a team by looking in teams table
  const { data: existingTeam, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("manager_id", input.managerId)
    .maybeSingle();
  if (teamError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check existing team: " + teamError.message,
    });
  }
  if (existingTeam) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Manager already has a team",
    });
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({ name: input.name, manager_id: input.managerId })
    .select("*")
    .single();
  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create team: " + error.message,
    });
  }
  if (input.memberIds) {
    const { error: memberErrors } = await supabase.from("team_members").insert(
      input.memberIds.map((memberId) => ({
        team_id: data.id,
        user_id: memberId,
      })),
    );
    if (memberErrors) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add team members: " + memberErrors.message,
      });
    }
  }
  return data;
}

export async function updateTeam(
  ctx: DataCtx,
  input: z.infer<typeof UpdateTeamInput>,
) {
  assertManager(ctx.role);
  const supabase = createServerSupabaseClient(ctx.accessToken);
  const { data, error } = await supabase
    .from("teams")
    .update({ name: input.name })
    .eq("id", input.id)
    .select("*")
    .maybeSingle();
  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update team: " + error.message,
    });
  }
  if (!data) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team not found",
    });
  }
  return data;
}

export async function deleteTeam(ctx: DataCtx, input: z.infer<typeof TeamId>) {
  assertAdmin(ctx.role);
  const supabase = createServerSupabaseClient(ctx.accessToken);
  const { data, error } = await supabase
    .from("teams")
    .delete()
    .eq("id", input)
    .select("*")
    .maybeSingle();
  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete team: " + error.message,
    });
  }
  if (!data) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team not found",
    });
  }
  return data;
}
