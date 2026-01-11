"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
import { Button } from "./button";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Separator } from "./separator";
import { Input } from "./input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "./sheet";
import { useTrpcClient } from "@/trpc/client";

type Team = {
  id: string;
  name: string;
  manager_id?: string;
};

type Member = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string;
  avatarUrl?: string | null;
  team_id?: string | null;
};

type TeamsAndMembersProps = {
  teams: Team[];
  members: Member[];
};

export default function TeamsAndMembers({
  teams,
  members,
}: TeamsAndMembersProps) {
  const [openTeam, setOpenTeam] = React.useState<string | null>(null);

  const [localTeams, setLocalTeams] = React.useState<Team[]>(teams || []);
  const [localMembers, setLocalMembers] = React.useState<Member[]>(
    members || [],
  );
  const trpc = useTrpcClient();

  // editing state
  const [editingTeamId, setEditingTeamId] = React.useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = React.useState<string>("");
  const [isTeamSheetOpen, setIsTeamSheetOpen] = React.useState(false);

  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(
    null,
  );
  const [editingMember, setEditingMember] = React.useState<Partial<Member>>({});
  const [isMemberSheetOpen, setIsMemberSheetOpen] = React.useState(false);

  React.useEffect(() => setLocalTeams(teams || []), [teams]);
  React.useEffect(() => setLocalMembers(members || []), [members]);

  function getFirstName(m: any) {
    return m.firstName ?? m.first_name ?? "";
  }
  function getLastName(m: any) {
    return m.lastName ?? m.last_name ?? "";
  }
  function getEmail(m: any) {
    return m.email ?? m.email_address ?? "";
  }
  function getRole(m: any) {
    return m.role ?? "";
  }

  const membersByTeam = React.useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const t of localTeams) map.set(t.id, []);
    for (const m of localMembers) {
      const tid = m.team_id ?? "__no_team";
      if (!map.has(tid)) map.set(tid, []);
      map.get(tid)!.push(m);
    }
    return map;
  }, [localTeams, localMembers]);

  const membersWithoutTeam = React.useMemo(() => {
    return localMembers.filter((m) => !m.team_id);
  }, [localMembers]);

  function openEditTeam(teamId: string) {
    const t = localTeams.find((x) => x.id === teamId);
    setEditingTeamId(teamId);
    setEditingTeamName(t?.name ?? "");
    setIsTeamSheetOpen(true);
  }

  async function saveTeam() {
    if (!editingTeamId) return;
    try {
      await trpc.team.update.mutate({
        id: editingTeamId,
        name: editingTeamName,
      });
      setLocalTeams((prev) =>
        prev.map((t) =>
          t.id === editingTeamId ? { ...t, name: editingTeamName } : t,
        ),
      );
      setIsTeamSheetOpen(false);
    } catch (err) {
      console.error("Failed to update team:", err);
    }
  }

  function openEditMember(memberId: string) {
    const m = localMembers.find((x) => x.id === memberId);
    setEditingMemberId(memberId);
    setEditingMember({
      firstName: getFirstName(m),
      lastName: getLastName(m),
      email: getEmail(m),
      role: getRole(m),
      team_id: (m as any).team_id ?? null,
    });
    setIsMemberSheetOpen(true);
  }

  async function saveMember() {
    if (!editingMemberId) return;
    try {
      const role = editingMember.role
        ? (editingMember.role as "admin" | "manager" | "member")
        : undefined;
      await trpc.user.update.mutate({
        id: editingMemberId,
        firstName: editingMember.firstName ?? undefined,
        lastName: editingMember.lastName ?? undefined,
        role,
      });

      // handle team change
      const prev = localMembers.find((m) => m.id === editingMemberId) as any;
      const prevTeam = prev?.team_id ?? null;
      const newTeam = (editingMember.team_id as string) ?? null;

      if (prevTeam !== newTeam) {
        try {
          if (prevTeam) {
            await trpc.teamMember.remove.mutate({
              team_id: prevTeam,
              user_id: editingMemberId,
            });
          }
        } catch (err) {
          console.error("Failed to remove member from previous team:", err);
        }
        try {
          if (newTeam) {
            await trpc.teamMember.add.mutate({
              team_id: newTeam,
              userId: editingMemberId,
            });
          }
        } catch (err) {
          console.error("Failed to add member to new team:", err);
        }
      }

      setLocalMembers((prev) =>
        prev.map((m) =>
          m.id === editingMemberId
            ? {
                ...m,
                firstName: editingMember.firstName ?? getFirstName(m),
                lastName: editingMember.lastName ?? getLastName(m),
                email: getEmail(m),
                role: editingMember.role ?? getRole(m),
                team_id: newTeam,
              }
            : m,
        ),
      );
      setIsMemberSheetOpen(false);
    } catch (err) {
      console.error("Failed to update member:", err);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Liste des équipes et leurs membres</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Team</th>
                  <th className="p-2">Members</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {localTeams.map((team) => (
                  <tr key={team.id} className="border-t">
                    <td className="p-2 align-top">
                      <div className="font-medium">{team.name}</div>
                    </td>
                    <td className="p-2 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(membersByTeam.get(team.id) || [])
                          .slice(0, 6)
                          .map((m) => (
                            <div key={m.id} className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    (m as any).avatarUrl ??
                                    (m as any).avatar_url ??
                                    undefined
                                  }
                                  alt={`${getFirstName(m) || ""} ${getLastName(m) || ""}`}
                                />
                                <AvatarFallback>
                                  {(getFirstName(m)?.[0] || "") +
                                    (getLastName(m)?.[0] || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {getFirstName(m) || "User"}{" "}
                                  {getLastName(m) || ""}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {getEmail(m)}
                                </div>
                              </div>
                            </div>
                          ))}
                        {(membersByTeam.get(team.id) || []).length > 6 && (
                          <div className="text-sm text-muted-foreground">
                            +{(membersByTeam.get(team.id) || []).length - 6}{" "}
                            autres
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 align-top">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditTeam(team.id)}
                        >
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant={openTeam === team.id ? "default" : "outline"}
                          onClick={() =>
                            setOpenTeam(openTeam === team.id ? null : team.id)
                          }
                        >
                          {openTeam === team.id ? "Fermer" : "Gérer membres"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Expanded team member list */}
            {openTeam && (
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">
                  Membres de l'équipe
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {(membersByTeam.get(openTeam) || []).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <Avatar>
                        <AvatarImage
                          src={
                            (m as any).avatarUrl ??
                            (m as any).avatar_url ??
                            undefined
                          }
                          alt={`${getFirstName(m) || ""} ${getLastName(m) || ""}`}
                        />
                        <AvatarFallback>
                          {(getFirstName(m)?.[0] || "") +
                            (getLastName(m)?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">
                          {getFirstName(m) || "User"} {getLastName(m) || ""}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getEmail(m)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getRole(m)}
                      </div>
                      <div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditMember(m.id)}
                        >
                          Modifier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Members without team</CardTitle>
          <CardDescription>
            Liste des membres qui n'ont pas d'équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Member</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {membersWithoutTeam.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-2 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            (m as any).avatarUrl ??
                            (m as any).avatar_url ??
                            undefined
                          }
                          alt={`${getFirstName(m) || ""} ${getLastName(m) || ""}`}
                        />
                        <AvatarFallback>
                          {(getFirstName(m)?.[0] || "") +
                            (getLastName(m)?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {getFirstName(m) || "User"} {getLastName(m) || ""}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {m.id}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">{getEmail(m)}</td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {getRole(m)}
                    </td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditMember(m.id)}
                      >
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Team edit sheet */}
      <Sheet open={isTeamSheetOpen} onOpenChange={setIsTeamSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Modifier l'équipe</SheetTitle>
            <SheetDescription>Changez le nom de l'équipe</SheetDescription>
          </SheetHeader>
          <div className="grid gap-2">
            <Input
              value={editingTeamName}
              onChange={(e) => setEditingTeamName(e.target.value)}
            />
            <div>
              <div className="text-sm font-medium">Membres de l'équipe</div>
              <div className="mt-2">
                {(membersByTeam.get(editingTeamId ?? "") || []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 p-2 border rounded mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={
                            (m as any).avatarUrl ??
                            (m as any).avatar_url ??
                            undefined
                          }
                          alt={`${getFirstName(m) || ""} ${getLastName(m) || ""}`}
                        />
                        <AvatarFallback>
                          {(getFirstName(m)?.[0] || "") +
                            (getLastName(m)?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {getFirstName(m)} {getLastName(m)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getEmail(m)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!editingTeamId) return;
                          try {
                            await trpc.teamMember.remove.mutate({
                              team_id: editingTeamId,
                              user_id: m.id,
                            });
                            setLocalMembers((prev) =>
                              prev.map((pm) =>
                                pm.id === m.id ? { ...pm, team_id: null } : pm,
                              ),
                            );
                          } catch (err) {
                            console.error("Failed to remove member", err);
                          }
                        }}
                      >
                        Retirer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <div className="text-sm font-medium">Ajouter un membre</div>
                <div className="mt-2 flex gap-2">
                  <select
                    id="add-member-select"
                    className="h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1"
                    defaultValue=""
                    onChange={async (e) => {
                      const userId = e.target.value;
                      if (!userId || !editingTeamId) return;
                      try {
                        await trpc.teamMember.add.mutate({
                          team_id: editingTeamId,
                          userId,
                        });
                        setLocalMembers((prev) =>
                          prev.map((pm) =>
                            pm.id === userId
                              ? { ...pm, team_id: editingTeamId }
                              : pm,
                          ),
                        );
                        (
                          document.getElementById(
                            "add-member-select",
                          ) as HTMLSelectElement
                        ).value = "";
                      } catch (err) {
                        console.error("Failed to add member", err);
                      }
                    }}
                  >
                    <option value="">Sélectionner un membre sans équipe</option>
                    {localMembers
                      .filter((m) => !m.team_id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {getFirstName(m)} {getLastName(m)} — {getEmail(m)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsTeamSheetOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={saveTeam}>Enregistrer</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Member edit sheet */}
      <Sheet open={isMemberSheetOpen} onOpenChange={setIsMemberSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Modifier le membre</SheetTitle>
            <SheetDescription>
              Mettre à jour nom, email ou rôle
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-2">
            <Input
              placeholder="Prénom"
              value={editingMember.firstName ?? ""}
              onChange={(e) =>
                setEditingMember((s) => ({ ...s, firstName: e.target.value }))
              }
            />
            <Input
              placeholder="Nom"
              value={editingMember.lastName ?? ""}
              onChange={(e) =>
                setEditingMember((s) => ({ ...s, lastName: e.target.value }))
              }
            />
            <Input
              placeholder="Email"
              value={editingMember.email ?? ""}
              disabled
            />
            <select
              className="h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1"
              value={editingMember.role ?? "member"}
              onChange={(e) =>
                setEditingMember((s) => ({ ...s, role: e.target.value }))
              }
            >
              <option value="member">member</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </select>

            <div>
              <div className="text-sm font-medium mt-2">Équipe</div>
              <select
                className="h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 mt-1"
                value={editingMember.team_id ?? ""}
                onChange={(e) =>
                  setEditingMember((s) => ({
                    ...s,
                    team_id: e.target.value || null,
                  }))
                }
              >
                <option value="">Aucune équipe</option>
                {localTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SheetFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsMemberSheetOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={saveMember}>Enregistrer</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { TeamsAndMembers };
