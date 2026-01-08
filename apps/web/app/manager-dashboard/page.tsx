import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Team } from "@chronos/types";
import DashboardClient from "@/components/ui/dashboard-manager";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  let teams: z.infer<typeof Team>[] = [];
  let userProfile = null;

  // Récupération du profil utilisateur depuis Supabase
  try {
    userProfile = await trpc.user.me.query();
    console.log("User profile récupéré:", userProfile);
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === "UNAUTHORIZED") {
        console.error("Utilisateur non authentifié");
      } else if (error.code === "FORBIDDEN") {
        console.error("Accès interdit");
      } else {
        console.error("Erreur lors de la récupération du profil:", error.message);
      }
    } else {
      console.error("Erreur inattendue:", error);
    }
  }

  // Récupération des équipes
  try {
    teams = await trpc.team.getAll.query();
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      console.error("Accès interdit pour les équipes");
    } else {
      console.error("Erreur lors de la récupération des équipes:", error);
    }
  }

  return <DashboardClient teams={teams} userProfile={userProfile} />;
}
