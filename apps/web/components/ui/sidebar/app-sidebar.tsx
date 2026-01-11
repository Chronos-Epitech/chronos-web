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
import type { Tables } from "@chronos/types";

interface AppSidebarProps {
  onSettingsClick?: () => void;
  userProfile?: Tables<"users"> | null;
}

export function AppSidebar({
  onSettingsClick,
  userProfile,
}: AppSidebarProps = {}) {
  const role = userProfile?.role ?? "member";
  const roleLabel =
    role === "admin"
      ? "Administrateur"
      : role === "manager"
        ? "Manager"
        : "Membre";

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

            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Équipes et membres" asChild>
                <Link href="/teams-and-members">
                  <Users />
                  <span>Équipes et membres</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Mon équipe" asChild>
                <Link href="/team-board">
                  <Calendar />
                  <span>Mon équipe</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

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
