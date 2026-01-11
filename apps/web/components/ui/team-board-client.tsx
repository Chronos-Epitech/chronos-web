"use client";

import { useEffect, useState } from "react";
import type { Tables } from "@chronos/types";
import { HeaderTitle } from "@/components/ui/header-title";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { UserProfile, useClerk, SignedIn, UserButton } from "@clerk/nextjs";
import { MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

import KpiWorkingHoursDoneTeam from "@/components/ui/kpi-working-hours-done-team";
import KpiLateTeam from "@/components/ui/kpi-late-team";
import KpiWorkingHoursDone from "@/components/ui/kpi-working-hours-done";
import { KpiLateMember } from "@/components/ui/kpi-late";
import { useTrpcClient } from "@/trpc/client";

interface TeamMember {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
}

interface TeamBoardClientProps {
  teamMembers: TeamMember[];
  userProfile: Tables<"users"> | null;
  teamId: string | null;
}

export default function TeamBoardClient({
  teamMembers,
  userProfile,
  teamId,
}: TeamBoardClientProps) {
  const trpc = useTrpcClient();
  const clerk = useClerk();
  const [showUserProfile, setShowUserProfile] = useState(false);

  const authorization =
    userProfile?.role === "manager" || userProfile?.role === "admin";

  /* ---------------- TEAM KPI (LEFT) ---------------- */

  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [schedules, setSchedules] = useState<
    (Tables<"schedules"> & { user_id: string })[]
  >([]);

  useEffect(() => {
    async function loadTeamSchedules() {
      const all: (Tables<"schedules"> & { user_id: string })[] = [];

      for (const member of teamMembers) {
        try {
          const memberSchedules = await trpc.schedule.getByUserId.query({
            userId: member.id,
          });

          if (Array.isArray(memberSchedules)) {
            all.push(
              ...memberSchedules.map((s) => ({
                ...s,
                user_id: member.id,
              })),
            );
          }
        } catch (err) {
          console.warn(`Failed to load schedules for ${member.id}`, err);
        }
      }

      setSchedules(all);
    }

    if (teamMembers.length > 0) {
      loadTeamSchedules();
    }
  }, [trpc, teamMembers]);

  /* ---------------- TEAM MEMBERS (RIGHT) ---------------- */

  const [members, setMembers] = useState(teamMembers);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedMemberSchedules, setSelectedMemberSchedules] = useState<
    Tables<"schedules">[]
  >([]);
  const [popupPeriod, setPopupPeriod] = useState<"week" | "month" | "year">(
    "week",
  );
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = async (member: TeamMember) => {
    if (!authorization) return;

    setSelectedMember(member);
    setShowPopup(true);

    try {
      const memberSchedules = await trpc.schedule.getByUserId.query({
        userId: member.id,
      });
      setSelectedMemberSchedules(
        Array.isArray(memberSchedules) ? memberSchedules : [],
      );
    } catch {
      setSelectedMemberSchedules([]);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMember(null);
  };

  const handleDelete = async (member: TeamMember) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));

    try {
      await trpc.teamMember.remove.mutate({
        team_id: teamId!,
        user_id: member.id,
      });
    } catch {
      setMembers((prev) => [...prev, member]);
    }
  };

  // Récupération des données utilisateur depuis Supabase
  const firstName = userProfile?.first_name ?? "Prénom";
  const lastName = userProfile?.last_name ?? "Nom";

  return (
    <SidebarProvider>
      <AppSidebar
        onSettingsClick={() => setShowUserProfile(true)}
        userProfile={userProfile}
      />
      <SidebarInset className="h-screen overflow-hidden">
        <div className="relative h-screen w-full bg-linear-to-b from-background to-muted/30 flex flex-col">
          {/* Header */}
          <div className="w-full h-20 bg-background/80 backdrop-blur px-4 sm:px-8 border-b border-border flex items-center justify-between shrink-0 z-10">
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
          <div className="flex-1 min-h-0 px-4 sm:px-8 py-4 overflow-auto">
            <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-0">
              {/* LEFT — KPI */}
              <div className="w-full lg:w-1/3 lg:min-w-[300px] p-4 flex flex-col h-full lg:h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                  <HeaderTitle title="Teams Statistics" />
                  <div className="flex gap-2">
                    {["week", "month", "year"].map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={period === p ? "default" : "outline"}
                        onClick={() => setPeriod(p as any)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex-1 min-h-0">
                    <KpiWorkingHoursDoneTeam
                      schedules={schedules}
                      includeOpenShiftUntilNow={false}
                      period={period}
                    />
                  </div>
                  <div className="flex-1 min-h-0">
                    <KpiLateTeam
                      schedules={schedules}
                      toleranceMinutes={0}
                      period={period}
                    />
                  </div>
                </div>
              </div>

              <Separator orientation="vertical" className="hidden lg:block" />

              {/* RIGHT — TABLE */}
              <div className="w-full lg:w-2/3 p-4 flex flex-col h-full">
                <HeaderTitle title="Team Members" className="mb-4" />

                <div className="bg-card rounded-xl p-2 sm:p-4 overflow-x-auto overflow-y-auto flex-1 min-h-0">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="py-2 px-2 sm:px-3">Prénom</th>
                        <th className="py-2 px-2 sm:px-3">Nom</th>
                        <th className="py-2 px-2 sm:px-3 hidden sm:table-cell">
                          Email
                        </th>
                        <th className="py-2 px-2 sm:px-3">Rôle</th>
                        {authorization && (
                          <th className="py-2 px-2 sm:px-3 text-right" />
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr
                          key={m.id}
                          className="border-b hover:bg-muted/30 cursor-pointer"
                          onClick={() => openPopup(m)}
                        >
                          <td className="py-2 px-2 sm:px-3">{m.firstName}</td>
                          <td className="py-2 px-2 sm:px-3">{m.lastName}</td>
                          <td className="py-2 px-2 sm:px-3 hidden sm:table-cell">
                            {m.email}
                          </td>
                          <td className="py-2 px-2 sm:px-3 capitalize">
                            {m.role}
                          </td>

                          {authorization && (
                            <td
                              className="py-2 px-2 sm:px-3 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(m)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POPUP */}
        {authorization && showPopup && selectedMember && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={closePopup}
          >
            <div
              className="bg-background rounded-xl p-6 w-[600px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="absolute top-4 right-4" onClick={closePopup}>
                <X />
              </button>

              <h2 className="text-xl font-semibold mb-4">
                {selectedMember.firstName} {selectedMember.lastName}
              </h2>

              <div className="flex gap-2 mb-4">
                {["week", "month", "year"].map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={popupPeriod === p ? "default" : "outline"}
                    onClick={() => setPopupPeriod(p as any)}
                  >
                    {p}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4">
                <KpiWorkingHoursDone
                  schedules={selectedMemberSchedules}
                  includeOpenShiftUntilNow={false}
                  period={popupPeriod}
                />
                <KpiLateMember
                  schedules={selectedMemberSchedules}
                  toleranceMinutes={0}
                  period={popupPeriod}
                />
              </div>
            </div>
          </div>
        )}

        {/* User Profile Modal */}
        {showUserProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
              onClick={() => setShowUserProfile(false)}
            />
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
              <UserProfile routing="hash" />
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
