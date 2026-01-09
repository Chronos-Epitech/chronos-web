import { router } from "../trpc";
import { teamRouter } from "./team";
import { teamMemberRouter } from "./team-member";
import { invitationRouter } from "./invitation";
import { userRouter } from "./user";
import { scheduleRouter } from "./schedule";

export const appRouter = router({
  team: teamRouter,
  teamMember: teamMemberRouter,
  invitation: invitationRouter,
  user: userRouter,
  schedule: scheduleRouter,
});

export type AppRouter = typeof appRouter;
