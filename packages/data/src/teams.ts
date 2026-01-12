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
  console.log("[createTeam] Starting team creation");
  console.log("[createTeam] Context:", {
    role: ctx.role,
    userId: ctx.auth?.userId,
    hasAccessToken: !!ctx.accessToken,
  });
  console.log("[createTeam] Input:", {
    name: input.name,
    managerId: input.managerId,
    memberIds: input.memberIds,
  });

  assertAdmin(ctx.role);
  const supabase = createServerSupabaseClient(ctx.accessToken);

  // Check if manager exists and get their team_id from teams table
  console.log("[createTeam] Step 1: Checking if manager exists");
  console.log(
    "[createTeam] Querying users table for managerId:",
    input.managerId,
  );
  const { data: manager, error: managerError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", input.managerId)
    .maybeSingle();

  console.log("[createTeam] Manager query result:", {
    manager,
    managerError: managerError
      ? {
          message: managerError.message,
          code: managerError.code,
          details: managerError.details,
          hint: managerError.hint,
        }
      : null,
  });

  if (managerError) {
    console.error("[createTeam] Manager check failed:", managerError);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check manager: " + managerError.message,
    });
  }
  if (!manager) {
    console.log("[createTeam] Manager not found");
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Manager not found",
    });
  }
  if (manager.role !== "manager") {
    console.log("[createTeam] User is not a manager, role:", manager.role);
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Manager must have role 'manager'",
    });
  }

  // Check if manager already has a team by looking in teams table
  console.log("[createTeam] Step 2: Checking if manager already has a team");
  console.log(
    "[createTeam] Querying teams table for manager_id:",
    input.managerId,
  );
  const { data: existingTeam, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("manager_id", input.managerId)
    .maybeSingle();

  console.log("[createTeam] Existing team query result:", {
    existingTeam,
    teamError: teamError
      ? {
          message: teamError.message,
          code: teamError.code,
          details: teamError.details,
          hint: teamError.hint,
        }
      : null,
  });

  if (teamError) {
    console.error("[createTeam] Existing team check failed:", teamError);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check existing team: " + teamError.message,
    });
  }
  if (existingTeam) {
    console.log("[createTeam] Manager already has a team:", existingTeam.id);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Manager already has a team",
    });
  }

  // Insert new team
  console.log("[createTeam] Step 3: Inserting new team");
  const teamData = { name: input.name, manager_id: input.managerId };
  console.log("[createTeam] Team data to insert:", teamData);
  console.log("[createTeam] About to execute INSERT on teams table");

  const { data, error } = await supabase
    .from("teams")
    .insert(teamData)
    .select("*")
    .single();

  console.log("[createTeam] Insert result:", {
    data,
    error: error
      ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          // Log full error object for debugging
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        }
      : null,
  });

  if (error) {
    console.error("[createTeam] Team creation failed with error:", error);
    console.error("[createTeam] Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create team: " + error.message,
    });
  }

  console.log("[createTeam] Team created successfully:", data?.id);

  if (input.memberIds && input.memberIds.length > 0) {
    console.log("[createTeam] Step 4: Adding team members");
    console.log("[createTeam] Member IDs to add:", input.memberIds);
    const memberData = input.memberIds.map((memberId) => ({
      team_id: data.id,
      user_id: memberId,
    }));
    console.log("[createTeam] Member data to insert:", memberData);

    const { error: memberErrors } = await supabase
      .from("team_members")
      .insert(memberData);

    console.log("[createTeam] Member insert result:", {
      memberErrors: memberErrors
        ? {
            message: memberErrors.message,
            code: memberErrors.code,
            details: memberErrors.details,
            hint: memberErrors.hint,
          }
        : null,
    });

    if (memberErrors) {
      console.error("[createTeam] Failed to add team members:", memberErrors);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add team members: " + memberErrors.message,
      });
    }
    console.log("[createTeam] Team members added successfully");
  }

  console.log("[createTeam] Team creation completed successfully");
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
