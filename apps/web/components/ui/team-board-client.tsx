"use client";

import { useEffect, useState } from "react";
import { HeaderTitle } from "@/components/ui/header-title";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import KpiWorkingHoursDoneTeam from "@/components/ui/kpi-working-hours-done-team";
import KpiLateTeam from "@/components/ui/kpi-late-team";
import type { Tables } from "@chronos/types";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTrpcClient } from "@/trpc/client";

import { useState } from "react";
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

  const authorization =
    userProfile?.role === "manager" || userProfile?.role === "admin";

  // 🔥 Liste locale pour refresh instantané
  const [members, setMembers] = useState(teamMembers);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = (member: TeamMember) => {
    if (!authorization) return;
    setSelectedMember(member);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMember(null);
  };

  // 🔥 DELETE instantané (optimistic update)
  const handleDelete = async (member: TeamMember) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));

    try {
      await trpc.teamMember.remove.mutate({
        team_id: teamId!,
        user_id: member.id,
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");

      // Restaure si erreur
      setMembers((prev) => [...prev, member]);
    }
  };

  const handleEdit = (member: TeamMember) => {
    alert("Fonction Edit à implémenter");
  };
  // Fetch team member schedules
  const [schedules, setSchedules] = useState<
    (Tables<"schedules"> & { user_id: string })[]
  >([]);

  useEffect(() => {
    async function loadTeamSchedules() {
      try {
        const allSchedules: (Tables<"schedules"> & { user_id: string })[] = [];

        // Load schedules for each team member
        for (const member of teamMembers) {
          try {
            const memberSchedules = await trpc.schedule.getByUserId.query({
              userId: member.id,
            });

            if (Array.isArray(memberSchedules)) {
              // Add user_id to each schedule for the KPI components
              allSchedules.push(
                ...memberSchedules.map((s) => ({
                  ...s,
                  user_id: member.id,
                })),
              );
            }
          } catch (err) {
            console.warn(
              `Failed to load schedules for member ${member.id}:`,
              err,
            );
          }
        }

        setSchedules(allSchedules);
        console.log("Loaded team schedules:", {
          count: allSchedules.length,
          schedules: allSchedules,
        });
      } catch (error) {
        console.error("Failed to load team schedules:", error);
        setSchedules([]);
      }
    }

    if (teamMembers.length > 0) {
      loadTeamSchedules();
    }
  }, [trpc, teamMembers]);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  return (
    <div className="flex flex-row h-full relative">
      {/* LEFT SIDE — KPI (SUPPRIMÉ MAIS ESPACE CONSERVÉ) */}
      <div className="flex flex-col h-full w-1/3 min-w-[300px] p-4">
        {/* KPI supprimés */}
        <div className="flex items-center justify-between gap-3">
          <HeaderTitle title={"Teams Statistics"} className="flex-1" />
          <div className="flex gap-2">
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("week")}
            >
              Week
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("month")}
            >
              Month
            </Button>
            <Button
              variant={period === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("year")}
            >
              Year
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <KpiWorkingHoursDoneTeam
            schedules={schedules}
            includeOpenShiftUntilNow={false}
            period={period}
          />
          <KpiLateTeam
            schedules={schedules}
            toleranceMinutes={0}
            period={period}
          />
        </div>
      </div>

      <Separator className="p-1" orientation="vertical" />

      {/* RIGHT SIDE — TABLE */}
      <div className="flex flex-col h-full w-2/3 p-4">
        <HeaderTitle title="Team Members" className="w-full mb-4" />

        <div className="flex-1 overflow-auto rounded-xl shadow bg-card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 px-3">Prénom</th>
                <th className="py-2 px-3">Nom</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Rôle</th>

                {authorization && (
                  <th className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      Actions
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => console.log("Add member")}
                      >
                        <span className="text-xl font-bold">+</span>
                      </Button>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className={`border-b transition ${
                    authorization
                      ? "hover:bg-muted/30 cursor-pointer"
                      : "cursor-default"
                  }`}
                  onClick={() => openPopup(member)}
                >
                  <td className="py-2 px-3">{member.firstName}</td>
                  <td className="py-2 px-3">{member.lastName}</td>
                  <td className="py-2 px-3">{member.email}</td>
                  <td className="py-2 px-3 capitalize">{member.role}</td>

                  {authorization && (
                    <td
                      className="py-2 px-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(member)}>
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(member)}
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
        <div className="flex flex-wrap h-full gap-2 justify-center">
          <HeaderTitle title={teamTitle} className="w-full" />
          {teamMembers.map((member) => (
            <ProfileCard
              key={member.id}
              avatar={member.avatarUrl || "/path/to/image.jpg"}
              avatarFallback={
                `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase() ||
                "U"
              }
              firstName={member.firstName || "User"}
              lastName={member.lastName || "Name"}
            />
          ))}
        </div>
      </div>

      {/* POPUP */}
      {authorization && showPopup && selectedMember && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 w-[350px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              onClick={closePopup}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-2">
              {selectedMember.firstName} {selectedMember.lastName}
            </h2>

            <p className="text-muted-foreground text-sm">(Contenu à venir)</p>
          </div>
        </div>
      )}
    </div>
  );
}
