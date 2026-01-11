import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Team } from "@chronos/types";
import { auth } from "@clerk/nextjs/server";
import DashboardAdmin from "@/components/ui/dashboard-admin";

export default async function AdminPage() {
  let teams: z.infer<typeof Team>[] = [];
  let userProfile = null;
  let users = [];

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
        console.error(
          "Erreur lors de la récupération du profil:",
          error.message,
        );
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

  // Récupération des membres
  try {
    users = await trpc.user.getAll.query();
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      console.error("Accès interdit pour les équipes");
    } else {
      console.error("Erreur lors de la récupération des équipes:", error);
    }
  }

  return <DashboardAdmin teams={teams} userProfile={userProfile} />;
}
