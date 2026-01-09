"use client";

import { HeaderTitle } from "@/components/ui/header-title";
import { Separator } from "@/components/ui/separator";
import type { Tables } from "@chronos/types";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";

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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = (member: TeamMember) => {
    setSelectedMember(member);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMember(null);
  };

  return (
    <div className="flex flex-row h-full relative">
      {/* LEFT SIDEBAR */}
      <div className="flex flex-col h-full w-1/3 min-w-[300px] p-4">
        <HeaderTitle title={logTitle} className="w-full" />

        <div className="flex-1 h-full w-full overflow-y-auto bg-card shadow rounded-xl p-4">
          <div className="mb-2 p-2 border rounded">
            <p className="text-sm text-muted-foreground">
              [2024-06-01 10:00:00] User A logged in.
            </p>
          </div>
        </div>
      </div>

      <Separator className="p-1" orientation="vertical" />

      {/* RIGHT SIDE — FULL HEIGHT TABLE */}
      <div className="flex flex-col h-full w-2/3 p-4">
        <HeaderTitle title={teamTitle} className="w-full mb-4" />

        <div className="flex-1 overflow-auto rounded-xl shadow bg-card p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 px-3">Prénom</th>
                <th className="py-2 px-3">Nom</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Rôle</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b hover:bg-muted/30 transition cursor-pointer"
                  onClick={() => openPopup(member)}
                >
                  <td className="py-2 px-3">{member.firstName || "-"}</td>
                  <td className="py-2 px-3">{member.lastName || "-"}</td>
                  <td className="py-2 px-3">{member.email || "-"}</td>
                  <td className="py-2 px-3 capitalize">{member.role}</td>

                  {/* ACTIONS BUTTON */}
                  <td
                    className="py-2 px-3 text-right"
                    onClick={(e) => e.stopPropagation()} // empêche d'ouvrir la pop-up
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
                        <DropdownMenuItem
                          onClick={() => console.log("Edit", member.id)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => console.log("Delete", member.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOM POPUP */}
      {showPopup && selectedMember && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 w-[350px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              onClick={closePopup}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold mb-2">
              {selectedMember.firstName} {selectedMember.lastName}
            </h2>

            <p className="text-muted-foreground text-sm">
              (Contenu de la pop-up à venir)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
