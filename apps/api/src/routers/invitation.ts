import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { SendInvitationInput } from "@chronos/types";
import { invitations } from "@chronos/data";

const InvitationSchema = z.object({
  id: z.string(),
  emailAddress: z.email(),
  publicMetadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  status: z.string(),
  url: z.string().optional(),
  revoked: z.boolean().optional(),
});
const PaginatedInvitationSchema = z.object({
  data: z.array(InvitationSchema),
  totalCount: z.number(),
});

export const invitationRouter = router({
  send: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/invitations",
        summary: "Send an invitation",
        description: "Only admins can access this endpoint",
      },
    })
    .input(SendInvitationInput)
    .output(InvitationSchema)
    .mutation(({ ctx, input }) => invitations.sendInvitation(ctx.role, input)),

  list: adminProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/invitations",
        summary: "List invitations",
        description: "Only admins can access this endpoint",
      },
    })
    .output(PaginatedInvitationSchema)
    .query(({ ctx }) => invitations.listInvitations(ctx.role)),

  revoke: adminProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/invitations/{invitation_id}",
        summary: "Revoke an invitation",
        description: "Only admins can access this endpoint",
      },
    })
    .input(z.object({ invitation_id: z.string() }))
    .output(InvitationSchema)
    .mutation(({ ctx, input }) =>
      invitations.revokeInvitation(ctx.role, input.invitation_id),
    ),
});
