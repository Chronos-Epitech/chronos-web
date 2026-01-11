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

  return (
    <div className="flex h-full">
      {/* LEFT — KPI */}
      <div className="w-1/3 min-w-[300px] p-4">
        <div className="flex justify-between items-center">
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

        <div className="grid gap-4 mt-4">
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

      {/* RIGHT — TABLE */}
      <div className="w-2/3 p-4">
        <HeaderTitle title="Team Members" className="mb-4" />

        <div className="bg-card rounded-xl p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 px-3">Prénom</th>
                <th className="py-2 px-3">Nom</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Rôle</th>
                {authorization && <th className="py-2 px-3 text-right" />}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b hover:bg-muted/30 cursor-pointer"
                  onClick={() => openPopup(m)}
                >
                  <td className="py-2 px-3">{m.firstName}</td>
                  <td className="py-2 px-3">{m.lastName}</td>
                  <td className="py-2 px-3">{m.email}</td>
                  <td className="py-2 px-3 capitalize">{m.role}</td>

                  {authorization && (
                    <td
                      className="py-2 px-3 text-right"
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

      {/* POPUP */}
      {authorization && showPopup && selectedMember && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
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
    </div>
  );
}
