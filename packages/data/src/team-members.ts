import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  AddTeamMemberInput,
  RemoveTeamMemberInput,
  TeamId,
  DataCtx,
} from "@chronos/types";
import { assertManager } from "./roles";
import { createServerSupabaseClient } from "@chronos/supabase";

export async function listTeamMembers(
  ctx: DataCtx,
  input: z.infer<typeof TeamId>
) {
  const supabase = createServerSupabaseClient(ctx.accessToken);

  // Get team with manager info
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, manager_id")
    .eq("id", input)
    .maybeSingle();

  console.log("team", team);

  if (teamError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get team: " + teamError.message,
    });
  }
  if (!team) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team not found",
    });
  }

  // Get manager details
  const { data: manager, error: managerError } = await supabase
    .from("users")
    .select("*")
    .eq("id", team.manager_id)
    .single();
  console.log("manager", manager);

  if (managerError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get manager: " + managerError.message,
    });
  }

  // Get team members
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", input);
  console.log("members", members);

  if (membersError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to list team members: " + membersError.message,
    });
  }

  // Get user details for all members
  const userIds = members?.map((m) => m.user_id) ?? [];

  if (userIds.length === 0) {
    return {
      manager: {
        id: manager.id,
        firstName: manager.first_name,
        lastName: manager.last_name,
        email: manager.email,
        role: manager.role,
        avatarUrl: manager.avatar_url,
      },
      users: [],
    };
  }

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .in("id", userIds);

  if (usersError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get users: " + usersError.message,
    });
  }

  return {
    manager: {
      id: manager.id,
      firstName: manager.first_name,
      lastName: manager.last_name,
      email: manager.email,
      role: manager.role,
      avatarUrl: manager.avatar_url,
    },
    users: (users ?? []).map((user) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
    })),
  };
}

export async function addTeamMember(
  ctx: DataCtx,
  input: z.infer<typeof AddTeamMemberInput>
) {
  assertManager(ctx.role);
  const supabase = createServerSupabaseClient(ctx.accessToken);

  // Check if user exists
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", input.userId)
    .maybeSingle();

  if (userError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check user: " + userError.message,
    });
  }
  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  // Check if team exists
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("id", input.team_id)
    .maybeSingle();

  if (teamError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check team: " + teamError.message,
    });
  }
  if (!team) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team not found",
    });
  }

  // Check if member already exists
  const { data: existingMember, error: existingError } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", input.team_id)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existingError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to check existing member: " + existingError.message,
    });
  }
  if (existingMember) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User is already a member of this team",
    });
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert({ team_id: input.team_id, user_id: input.userId })
    .select("*")
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to add team member: " + error.message,
    });
  }

  return {
    teamId: data.team_id,
    userId: data.user_id,
    createdAt: data.created_at ?? undefined,
  };
}

export async function removeTeamMember(
  ctx: DataCtx,
  input: z.infer<typeof RemoveTeamMemberInput>
) {
  assertManager(ctx.role);
  const supabase = createServerSupabaseClient(ctx.accessToken);

  const { data, error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", input.team_id)
    .eq("user_id", input.user_id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to remove team member: " + error.message,
    });
  }
  if (!data) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Team member not found",
    });
  }

  return {
    teamId: data.team_id,
    userId: data.user_id,
    createdAt: data.created_at ?? undefined,
  };
}
