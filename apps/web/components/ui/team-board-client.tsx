"use client";

import { useEffect, useState } from "react";
import type { Tables } from "@chronos/types";
import { HeaderTitle } from "@/components/ui/header-title";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

  const authorization =
    userProfile?.role === "manager" || userProfile?.role === "admin";

  /* ---------------- KPI LOGIC (LEFT SIDE) ---------------- */

  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [schedules, setSchedules] = useState<Tables<"schedules">[]>([]);

  useEffect(() => {
    async function loadTeamSchedules() {
      const allSchedules: Tables<"schedules">[] = [];

      for (const member of teamMembers) {
        try {
          const memberSchedules = await trpc.schedule.getByUserId.query({
            userId: member.id,
          });

          if (Array.isArray(memberSchedules)) {
            allSchedules.push(...memberSchedules);
          }
        } catch (err) {
          console.warn(`Failed to load schedules for ${member.id}`, err);
        }
      }

      setSchedules(allSchedules);
    }

    if (teamMembers.length > 0) {
      loadTeamSchedules();
    }
  }, [trpc, teamMembers]);

  /* ---------------- TEAM MEMBERS (RIGHT SIDE) ---------------- */

  const [members, setMembers] = useState(teamMembers);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMemberSchedules, setSelectedMemberSchedules] = useState<
    Tables<"schedules">[]
  >([]);
  const [popupPeriod, setPopupPeriod] = useState<"week" | "month" | "year">(
    "week",
  );

  const openPopup = async (member: TeamMember) => {
    if (!authorization) return;
    setSelectedMember(member);
    setShowPopup(true);

    // Load schedules for the selected member
    try {
      const memberSchedules = await trpc.schedule.getByUserId.query({
        userId: member.id,
      });
      setSelectedMemberSchedules(
        Array.isArray(memberSchedules) ? memberSchedules : [],
      );
    } catch (err) {
      console.warn(`Failed to load schedules for ${member.id}`, err);
      setSelectedMemberSchedules([]);
    }
  };

  const closePopup = () => {
    setSelectedMember(null);
    setShowPopup(false);
  };

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
      setMembers((prev) => [...prev, member]);
    }
  };

  const handleEdit = () => {
    alert("Fonction Edit à implémenter");
  };

  return (
    <div className="flex flex-row h-full relative">
      {/* LEFT SIDE — KPI */}
      <div className="flex flex-col h-full w-1/3 min-w-[300px] p-4">
        <div className="flex items-center justify-between gap-3">
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

        <div className="grid grid-cols-1 gap-4 mt-4">
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

      <Separator orientation="vertical" />

      {/* RIGHT SIDE — TABLE */}
      <div className="flex flex-col h-full w-2/3 p-4">
        <HeaderTitle title="Team Members" className="mb-4" />

        <div className="flex-1 overflow-auto rounded-xl shadow bg-card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="py-2 px-3">Prénom</th>
                <th className="py-2 px-3">Nom</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Rôle</th>
                {authorization && (
                  <th className="py-2 px-3 text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className={`border-b ${
                    authorization ? "hover:bg-muted/30 cursor-pointer" : ""
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
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleEdit}>
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
        </div>
      </div>

      {/* POPUP */}
      {authorization && showPopup && selectedMember && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-3 right-3" onClick={closePopup}>
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {selectedMember.firstName} {selectedMember.lastName}
            </h2>

            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-sm text-muted-foreground">Période</span>
              <div className="flex gap-2">
                {["week", "month", "year"].map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={popupPeriod === p ? "default" : "outline"}
                    onClick={() =>
                      setPopupPeriod(p as "week" | "month" | "year")
                    }
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
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
    </div>
  );
}
