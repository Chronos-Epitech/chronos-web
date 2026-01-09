import { z } from "zod";
import {
  router,
  managerProcedure,
  adminProcedure,
  protectedProcedure,
} from "../trpc";
import { CreateTeamInput, UpdateTeamInput, TeamId, Team } from "@chronos/types";
import { teams } from "@chronos/data";

export const teamRouter = router({
  // Allow any authenticated user to fetch teams (was admin only)
  getAll: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/teams",
        summary: "Get all teams",
        description: "Only admins can access this endpoint",
      },
    })
    .output(z.array(Team))
    .query(({ ctx }) =>
      teams.listTeams({
        auth: ctx.auth,
        role: ctx.role,
        accessToken: ctx.accessToken,
      }),
    ),

  get: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/teams/{id}",
        summary: "Get a team by id",
        description:
          "Admins can access all teams, managers can access their own team",
      },
    })
    .input(z.object({ id: TeamId }))
    .output(Team.nullable())
    .query(({ ctx, input }) =>
      teams.getTeamById(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input.id,
      ),
    ),

  create: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/teams",
        summary: "Create a team",
        description: "Only admins can access this endpoint",
      },
    })
    .input(CreateTeamInput)
    .output(Team)
    .mutation(({ ctx, input }) =>
      teams.createTeam(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input,
      ),
    ),

  update: managerProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/teams/{id}",
        summary: "Update a team's name",
        description:
          "Admins can update any team, managers can only update the name of their own team",
      },
    })
    .input(UpdateTeamInput)
    .output(Team.nullable())
    .mutation(({ ctx, input }) =>
      teams.updateTeam(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input,
      ),
    ),

  delete: adminProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/teams/{id}",
        summary: "Delete a team",
        description: "Only admins can access this endpoint",
      },
    })
    .input(z.object({ id: TeamId }))
    .output(Team.nullable())
    .mutation(({ ctx, input }) =>
      teams.deleteTeam(
        { auth: ctx.auth, role: ctx.role, accessToken: ctx.accessToken },
        input.id,
      ),
    ),
});
