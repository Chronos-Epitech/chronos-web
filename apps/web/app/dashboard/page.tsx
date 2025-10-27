import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Team } from "@chronos/types";
import DashboardClient from "@/components/ui/dashboard-client";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  let teams: z.infer<typeof Team>[] = [];


  try {
    teams = await trpc.team.getAll.query();
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      console.error("Forbidden");
    } else {
      console.error(error);
    }
  }

  return <DashboardClient teams={teams} />;
}
