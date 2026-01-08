"use client"

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
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AppSidebarProps {
  onSettingsClick?: () => void
}

export function AppSidebar({ onSettingsClick }: AppSidebarProps = {}) {
  const router = useRouter()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        MENU
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manager</SidebarGroupLabel>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Équipes">
                <Users />
                <span>Équipes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Planning" onClick={() => router.push("/team-board")}>
                <Calendar />
                <span>Mon équipe</span>
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
  )
}
