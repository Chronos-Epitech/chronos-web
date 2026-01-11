"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar/sidebar";

import { LayoutDashboard, Users, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTrpcClient } from "@/trpc/client";
import { toast } from "sonner";
import type { Tables } from "@chronos/types";
import { useState } from "react";

interface AppSidebarProps {
  onSettingsClick?: () => void;
  userProfile?: Tables<"users"> | null;
}

export function AppSidebar({
  onSettingsClick,
  userProfile,
}: AppSidebarProps = {}) {
  const router = useRouter();
  const trpc = useTrpcClient();
  const [isCheckingTeam, setIsCheckingTeam] = useState(false);

  const role = userProfile?.role ?? "member";
  const roleLabel =
    role === "admin"
      ? "Administrateur"
      : role === "manager"
        ? "Manager"
        : "Membre";

  const handleMonEquipeClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userProfile?.id) {
      toast.error("Erreur", {
        description: "Impossible de vérifier votre équipe",
      });
      return;
    }

    setIsCheckingTeam(true);

    try {
      // Get all teams
      const teams = await trpc.team.getAll.query();

      // Check if user is a manager of any team
      const isManager = teams.some(
        (team) => team.manager_id === userProfile.id,
      );

      // Check if user is a member of any team
      let isMember = false;
      for (const team of teams) {
        try {
          const teamMembers = await trpc.teamMember.getAll.query({
            team_id: team.id,
          });
          if (teamMembers) {
            const allMemberIds = [
              teamMembers.manager?.id,
              ...(teamMembers.users?.map((u: any) => u.id) || []),
            ];
            if (allMemberIds.includes(userProfile.id)) {
              isMember = true;
              break;
            }
          }
        } catch (err) {
          // Continue checking other teams
          console.warn("Failed to check team members:", err);
        }
      }

      if (!isManager && !isMember) {
        toast.error("Aucune équipe", {
          description: "Vous ne faites partie d'aucune équipe",
        });
      } else {
        router.push("/team-board");
      }
    } catch (error) {
      console.error("Failed to check team:", error);
      toast.error("Erreur", {
        description: "Impossible de vérifier votre équipe",
      });
    } finally {
      setIsCheckingTeam(false);
    }
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>MENU</SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{roleLabel}</SidebarGroupLabel>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="dashboard" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {role === "admin" && (
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Equipes et membres" asChild>
                  <Link href="/admin">
                    <Users />
                    <span>Equipes et membres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {(role === "manager" || role === "member") && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Mon équipe"
                  onClick={handleMonEquipeClick}
                  disabled={isCheckingTeam}
                >
                  <Calendar />
                  <span>Mon équipe</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Paramètres" onClick={onSettingsClick}>
                <Settings />
                <span>Paramètres</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-2 text-xs text-muted-foreground">
        © Chronos
      </SidebarFooter>
    </Sidebar>
  );
}
