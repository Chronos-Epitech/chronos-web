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
  teamId: string | null; // important pour remove()
}

export default function TeamBoardClient({
  teamMembers,
  userProfile,
  teamId,
}: TeamBoardClientProps) {
  const trpc = useTrpcClient();

  const authorization =
    userProfile?.role === "manager" || userProfile?.role === "admin";

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

  // DELETE MEMBER
  const handleDelete = async (member: TeamMember) => {
    try {
      await trpc.teamMember.remove.mutate({
        team_id: teamId!,
        user_id: member.id,
      });
      alert("Membre supprimé");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // EDIT MEMBER (placeholder)
  const handleEdit = (member: TeamMember) => {
    console.log("Edit member:", member);
    alert("Fonction Edit à implémenter");
  };

  return (
    <div className="flex flex-row h-full relative">
      {/* RIGHT SIDE — TABLE */}
      <div className="flex flex-col h-full w-2/3 p-4 ml-auto">
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
                  <th className="py-2 px-3 text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {teamMembers.map((member) => (
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
        </div>
      </div>

      {/* POPUP (only for managers) */}
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
