"use client";
import { useTrpcClient } from "@/trpc/client";
import * as React from "react";
import { z } from "zod";
import type { Tables, Team } from "@chronos/types";
import { Button } from "@/components/ui/button";

import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarWeek } from "@/components/ui/calendar-week";
import Image from "next/image";
import AdminSidePanel from "@/components/ui/admin-side-panel";
import { usePathname } from "next/navigation";

export default function DashboardAdmin({
  teams,
  userProfile,
  children,
}: {
  teams: z.infer<typeof Team>[];
  userProfile: Tables<"users"> | null;
  children?: React.ReactNode;
}) {
  const trpc = useTrpcClient();
  const pathname = usePathname();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mode, setMode] = React.useState<"week" | "month">("week");

  // Récupération des données utilisateur depuis Supabase
  const firstName = userProfile?.first_name ?? "Prénom";
  const lastName = userProfile?.last_name ?? "Nom";
  const role = userProfile?.role ?? "member";
  const teamName = teams?.[0]?.name ?? "Aucune équipe";
  const roleLabel =
    role === "admin"
      ? "Administrateur"
      : role === "manager"
        ? "Manager"
        : "Membre";

  const initials =
    (firstName?.[0] ?? "").toUpperCase() + (lastName?.[0] ?? "").toUpperCase();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen">
        <div className="relative min-h-screen w-full bg-linear-to-b from-background to-muted/30">
          {/* Header */}
          <div className="w-full h-20 bg-background/80 backdrop-blur px-4 sm:px-8 border-b border-border flex items-center justify-between fixed top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Image
                src="/icon.png"
                alt="logo"
                className="object-cover"
                width={48}
                height={48}
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">CHRONOS</h1>
                <p className="text-xs sm:text-sm font-medium">
                  Manage your time like a pro
                </p>
              </div>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Content */}
          <div className="pt-24 pb-10 px-4 sm:px-8 sm:h-full">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
              {/* left screen (hidden on teams-and-members page) */}
              {pathname !== "/teams-and-members" && (
                <div className="flex w-full flex-col gap-6 lg:w-[380px]">
                  <AdminSidePanel teams={teams} userProfile={userProfile} />
                </div>
              )}

              {/* right screen */}
              <div className="w-full flex flex-col lg:flex-1">
                {children ? (
                  <div className="w-full">{children}</div>
                ) : mode === "week" ? (
                  <CalendarWeek
                    selectedDate={date}
                    onSelect={setDate}
                    className="rounded-xl border border-border/70 w-full bg-card"
                    mode={mode}
                    onModeChange={setMode}
                  />
                ) : (
                  <Calendar
                    selectedDate={date}
                    onSelect={setDate}
                    className="rounded-xl border border-border/70 w-full h-[680px] bg-card"
                    mode={mode}
                    onModeChange={setMode}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
