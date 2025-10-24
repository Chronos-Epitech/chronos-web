import { z } from "zod";
import { router, managerProcedure, protectedProcedure } from "../trpc";
import {
  TeamMember,
  TeamMembersResponse,
  AddTeamMemberInput,
  RemoveTeamMemberInput,
  TeamId,
} from "@chronos/types";
import { teamMembers } from "@chronos/data";

export const teamMemberRouter = router({
  getAll: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/teams/{team_id}/members",
        summary: "Get all members of a team",
        description:
          "Managers and members can see all members of their team. Admins can see all members of all teams.",
      },
    })
    .input(z.object({ team_id: TeamId }))
    .output(TeamMembersResponse)
    .query(({ ctx, input }) =>
      teamMembers.listTeamMembers(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input.team_id
      )
    ),

  add: managerProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/teams/{team_id}/members",
        summary: "Add a member to a team",
        description:
          "Managers can add members to their own team. Admins can add members to any team.",
      },
    })
    .input(AddTeamMemberInput)
    .output(TeamMember)
    .mutation(({ ctx, input }) =>
      teamMembers.addTeamMember(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input
      )
    ),

  remove: managerProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/teams/{team_id}/members/{user_id}",
        summary: "Remove a member from a team",
        description:
          "Managers can remove members from their own team. Admins can remove members from any team.",
      },
    })
    .input(RemoveTeamMemberInput)
    .output(TeamMember)
    .mutation(({ ctx, input }) =>
      teamMembers.removeTeamMember(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input
      )
    ),
});
