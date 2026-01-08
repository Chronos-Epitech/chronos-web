"use client";

import { HeaderTitle } from "@/components/ui/header-title";
import { ProfileCard } from "@/components/ui/profile-card-mini";
import { Separator } from "@/components/ui/separator";
import type { Tables } from "@chronos/types";

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
  return (
    <div className="flex flex-row h-full">
      <div className="flex flex-col h-full w-1/3 min-w-[300px] p-4">
        {/* Sidebar content can go here */}
        <HeaderTitle title={logTitle} className="w-full" />
        <div className="flex-1 h-full w-full overflow-y-auto bg-card shadow rounded-xl p-4">
          {/* Example log entries */}
          <div className="mb-2 p-2 border rounded">
            <p className="text-sm text-muted-foreground">
              [2024-06-01 10:00:00] User A logged in.
            </p>
          </div>
          <div className="h-auto" />
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
