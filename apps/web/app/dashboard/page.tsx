import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/trpc/server";
import { CalendarContainer } from "@/components/calendar-container";
import { ScheduleButtons } from "@/components/schedule-buttons";
import { TRPCError } from "@trpc/server";
import type { Team } from "@chronos/types";
import { z } from "zod";

export default async function Dashboard() {
  let teams: z.infer<typeof Team>[] = [];
  try {
    teams = await trpc.team.getAll.query();
  } catch (error) {
    if (error instanceof TRPCError && error.code === "FORBIDDEN") {
      teams = [];
      console.error("FORBIDDEN");
    } else {
      console.error(error);
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Header */}
      <div className="w-full h-20 bg-white px-4 sm:px-8 border-b border-gray-200 flex items-center justify-between fixed top-0 z-10">
        <div className="flex items-center gap-2">
          <Image
            width={48}
            height={48}
            src="/icon.png"
            alt="logo"
            className="object-cover"
          />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">CHRONOS</h1>
            <p className="text-xs sm:text-sm font-medium">
              Manage your time like a pro
            </p>
          </div>
        </div>
        <UserButton />
      </div>

      {/* Content */}
      <div className="pt-24 flex flex-col gap-4 sm:flex-row sm:gap-8 px-4 sm:px-8 sm:h-full">
        {/* left screen */}
        <div className="flex flex-col gap-4 sm:gap-6 w-full mt-13 sm:w-1/3">
          {/* User Card */}
          <Card className="flex flex-col gap-2 p-4 relative">
            <div className="flex flex-col gap-1">
              <Label className="text-sm sm:text-base">Last Name:</Label>
              <Label className="text-sm sm:text-base">First Name:</Label>
              <div className="flex justify-start mt-2">
                <Button
                  variant="secondary"
                  className="w-auto px-4 py-2 text-sm sm:text-base mt-3"
                >
                  Changes
                </Button>
              </div>
            </div>
            <Avatar className="h-full w-1/4 sm:w-1/4 absolute right-0 bottom-0">
              <AvatarImage
                src="id.png"
                alt="User Avatar"
                className="object-cover"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Card>

          {/* Card Schedules */}
          <Card>
            <ScheduleButtons />
          </Card>
          {teams.length > 0 &&
            teams.map((team) => (
              <div key={team.id} className="w-full flex flex-col mt-4 sm:mt-0">
                <Card className="flex flex-col gap-2 p-4">
                  <div key={team.id}>
                    <p>{team.name}</p>
                  </div>
                </Card>
              </div>
            ))}
        </div>

        {/* right screen*/}
        <CalendarContainer />
      </div>
    </div>
  );
}
