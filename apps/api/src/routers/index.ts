import { router } from "../trpc";
import { teamRouter } from "./team";
import { teamMemberRouter } from "./team-member";
import { invitationRouter } from "./invitation";

export const appRouter = router({
  team: teamRouter,
  teamMember: teamMemberRouter,
  invitation: invitationRouter,
});

export type AppRouter = typeof appRouter;
