import { trpc } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Team } from "@chronos/types";
import { redirect } from "next/navigation";
import TeamsAndMembers from "@/components/ui/pages/teams-and-members";

export default async function Page() {
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

  // Guard: only admin can access this page
  try {
    const role =
      userProfile?.role ??
      userProfile?.public_metadata?.role ??
      userProfile?.publicMetadata?.role ??
      null;
    if (role !== "admin") {
      return redirect("/");
    }
  } catch {
    // if anything goes wrong, redirect to home
    return redirect("/");
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

  // Récupération des utilisateurs globaux
  try {
    users = await trpc.user.getAll.query();
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      console.error("Accès interdit pour la récupération des utilisateurs");
    } else {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  }

  // Récupération des membres par équipe pour attacher team_id
  interface UserLike {
    firstName?: string | null;
    first_name?: string | null;
    name?: { first?: string | null; last?: string | null } | null;
    lastName?: string | null;
    last_name?: string | null;
    email?: string | null;
    email_address?: string | null;
    emailAddress?: string | null;
    emailAddresses?: Array<{ email_address?: string; emailAddress?: string }>;
    role?: string | null;
    public_metadata?: { role?: string | null };
    publicMetadata?: { role?: string | null };
    avatarUrl?: string | null;
    avatar_url?: string | null;
    imageUrl?: string | null;
    image_url?: string | null;
  }

  interface MemberData {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    role: string | null;
    avatarUrl: string | null;
    team_id: string | null;
  }

  const members: MemberData[] = [];
  try {
    function getFirstName(u: UserLike): string | null {
      return u.firstName ?? u.first_name ?? u.name?.first ?? null;
    }
    function getLastName(u: UserLike): string | null {
      return u.lastName ?? u.last_name ?? u.name?.last ?? null;
    }
    function getEmail(u: UserLike): string | null {
      return (
        u.email ??
        u.email_address ??
        u.emailAddress ??
        (u.emailAddresses &&
          u.emailAddresses[0] &&
          (u.emailAddresses[0].email_address ??
            u.emailAddresses[0].emailAddress)) ??
        null
      );
    }
    function getRole(u: UserLike): string | null {
      return (
        u.role ?? u.public_metadata?.role ?? u.publicMetadata?.role ?? null
      );
    }
    function getAvatar(u: UserLike): string | null {
      return u.avatarUrl ?? u.avatar_url ?? u.imageUrl ?? u.image_url ?? null;
    }

    for (const t of teams || []) {
      try {
        const teamMembers = await trpc.teamMember.getAll.query({
          team_id: t.id,
        });
        if (teamMembers) {
          // manager
          if (teamMembers.manager) {
            members.push({
              id: teamMembers.manager.id,
              firstName: getFirstName(teamMembers.manager),
              lastName: getLastName(teamMembers.manager),
              email: getEmail(teamMembers.manager),
              role: getRole(teamMembers.manager),
              avatarUrl: getAvatar(teamMembers.manager),
              team_id: t.id,
            });
          }
          // users
          for (const u of teamMembers.users || []) {
            members.push({
              id: u.id,
              firstName: getFirstName(u),
              lastName: getLastName(u),
              email: getEmail(u),
              role: getRole(u),
              avatarUrl: getAvatar(u),
              team_id: t.id,
            });
          }
        }
      } catch (err) {
        console.warn(`Failed to load members for team ${t.id}:`, err);
      }
    }

    // Add users that are not in any team
    const memberIds = new Set(members.map((m) => m.id));
    for (const u of users || []) {
      if (!memberIds.has(u.id)) {
        members.push({
          id: u.id,
          firstName: getFirstName(u),
          lastName: getLastName(u),
          email: getEmail(u),
          role: getRole(u),
          avatarUrl: getAvatar(u),
          team_id: null,
        });
      }
    }
  } catch (error) {
    console.error(
      "Erreur lors de la construction de la liste des membres:",
      error,
    );
  }

  return (
    <TeamsAndMembers
      teams={teams}
      members={members}
      userProfile={userProfile}
    />
  );
}
