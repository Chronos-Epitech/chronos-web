// imports
import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import type { Tables } from "@chronos/types";
import TeamBoardClient from "@/components/ui/pages/team-board-client";

// define the type User for the team
type TeamUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
};

export default async function Page() {
  let teamMembers: TeamUser[] = [];

  // get user profile from Supabase
  let userProfile: Tables<"users"> | null = null;
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

  // get the team of the user
  let teamId: string | null = null;
  try {
    const teams = await trpc.team.getAll.query();
    teamId = teams?.[0]?.id || null;
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      console.error("Accès interdit pour les équipes");
    } else {
      console.error("Erreur lors de la récupération des équipes:", error);
    }
  }

  // get the team members
  if (teamId) {
    try {
      const membersData = await trpc.teamMember.getAll.query({
        team_id: teamId,
      });
      if (membersData) {
        // include the manager in the list of members
        const allMembers: TeamUser[] = [
          {
            id: membersData.manager.id,
            firstName: membersData.manager.firstName,
            lastName: membersData.manager.lastName,
            email: membersData.manager.email,
            role: membersData.manager.role,
            avatarUrl: membersData.manager.avatarUrl,
          },
          ...(membersData.users?.map((user: TeamUser) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          })) || []),
        ];
        teamMembers = allMembers;
      }
    } catch (error) {
      if (error instanceof TRPCError && error.code === "FORBIDDEN") {
        console.error("Accès interdit pour les membres d'équipe");
      } else {
        console.error("Erreur lors de la récupération des membres:", error);
      }
    }
  }

  return (
    <TeamBoardClient
      teamMembers={teamMembers}
      userProfile={userProfile}
      teamId={teamId}
    />
  );
}
