import { router } from "../trpc.js";
import { teamRouter } from "./team.js";
import { teamMemberRouter } from "./team-member.js";
import { invitationRouter } from "./invitation.js";
import { userRouter } from "./user.js";
import { scheduleRouter } from "./schedule.js";

export const appRouter = router({
  team: teamRouter,
  teamMember: teamMemberRouter,
  invitation: invitationRouter,
  user: userRouter,
  schedule: scheduleRouter,
});

export type AppRouter = typeof appRouter;
