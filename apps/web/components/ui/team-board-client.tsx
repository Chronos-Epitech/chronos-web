"use client";

import { useEffect, useState } from "react";
import { HeaderTitle } from "@/components/ui/header-title";
import { ProfileCard } from "@/components/ui/profile-card-mini";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import KpiWorkingHoursDoneTeam from "@/components/ui/kpi-working-hours-done-team";
import KpiLateTeam from "@/components/ui/kpi-late-team";
import type { Tables } from "@chronos/types";
import { useTrpcClient } from "@/trpc/client";

const teamTitle = "Team Members";
const logTitle = "Log Entries";

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
}

export default function TeamBoardClient({
  teamMembers,
  userProfile,
}: TeamBoardClientProps) {
  const trpc = useTrpcClient();
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
    <div className="flex flex-row h-full">
      <div className="flex flex-col h-full w-1/3 min-w-[300px] p-4">
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
      <div className="flex flex-col h-full w-2/3 p-4">
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
        <div className="h-full"> </div>
      </div>
    </div>
  );
}
