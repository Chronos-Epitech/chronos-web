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

import { useState, useEffect } from "react";
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

  const [avgHours, setAvgHours] = useState(0);
  const [lateHours, setLateHours] = useState(0);
  const [extraHours, setExtraHours] = useState(0);

  // Load weekly schedule data
  useEffect(() => {
    async function load() {
      if (!teamId || members.length === 0) return;

      try {
        const allSchedules = await Promise.all(
          members.map(async (member) => {
            try {
              return await trpc.schedule.getByUserId.query({
                userId: member.id,
              });
            } catch {
              return [];
            }
          }),
        );

        const raw = allSchedules.flat();

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const lastWeekSchedules = raw.filter((entry: any) => {
          const date = entry.created_at ? new Date(entry.created_at) : null;
          return date && date >= oneWeekAgo;
        });

        let totalHours = 0;
        let totalDays = 0;
        let late = 0;
        let extra = 0;

        lastWeekSchedules.forEach((entry: any) => {
          const start = entry.check_in ? new Date(entry.check_in) : null;
          const end = entry.check_out ? new Date(entry.check_out) : null;

          if (!start || !end) return;

          const worked = (end.getTime() - start.getTime()) / 1000 / 3600;
          totalHours += worked;
          totalDays++;

          const nine = new Date(start);
          nine.setHours(9, 0, 0, 0);
          if (start > nine) {
            late += (start.getTime() - nine.getTime()) / 1000 / 3600;
          }

          const five = new Date(end);
          five.setHours(17, 0, 0, 0);
          if (end > five) {
            extra += (end.getTime() - five.getTime()) / 1000 / 3600;
          }
        });

        setAvgHours(totalDays > 0 ? totalHours / totalDays : 0);
        setLateHours(late);
        setExtraHours(extra);
      } catch (error) {
        console.error("Failed to load schedule data:", error);
      }
    }

    load();
  }, [teamId, members]);

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

  return (
    <div className="flex flex-row h-full relative">
      {/* LEFT SIDE — KPI ONLY */}
      <div className="flex flex-col h-full w-1/3 min-w-[300px] p-4">
        <HeaderTitle title="Team Overview" className="w-full mb-4" />

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card shadow rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">
              Moyenne d'heures par jour (semaine)
            </h3>
            <p className="text-2xl font-bold">{avgHours.toFixed(2)} h</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card shadow rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-2">Heures de retard</h3>
              <p className="text-2xl font-bold text-red-600">
                {lateHours.toFixed(2)} h
              </p>
            </div>

            <div className="bg-card shadow rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-2">
                Heures supplémentaires
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {extraHours.toFixed(2)} h
              </p>
            </div>
          </div>
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
