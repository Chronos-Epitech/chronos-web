"use client";

import * as React from "react";
import type { Tables, Member, Team } from "@chronos/types";
import { Separator } from "@/components/ui/elements/separator";
import { Card, CardContent } from "@/components/ui/cards/card";
import { Button } from "@/components/ui/buttons/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/images/avatar";
import { Input } from "@/components/ui/elements/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/elements/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/elements/select";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar/sidebar";
import { AppSidebar } from "@/components/ui/sidebar/app-sidebar";
import { UserProfile, SignedIn, UserButton } from "@clerk/nextjs";
import { Pencil, Users, Trash2, Plus } from "lucide-react";
import {
  InviteSheet,
  InviteSheetTrigger,
} from "@/components/ui/forms/invite-bar";
import { useTrpcClient } from "@/trpc/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TeamsAndMembersProps = {
  teams: Team[];
  members: Member[];
  userProfile?: Tables<"users"> | null;
};

export default function TeamsAndMembers({
  teams,
  members,
  userProfile,
}: TeamsAndMembersProps) {
  const router = useRouter();
  const [showUserProfile, setShowUserProfile] = React.useState(false);
  const [openTeam, setOpenTeam] = React.useState<string | null>(null);
  const [showInviteSheet, setShowInviteSheet] = React.useState(false);

  const [localTeams, setLocalTeams] = React.useState<Team[]>(teams || []);
  const [localMembers, setLocalMembers] = React.useState<Member[]>(
    members || [],
  );
  const trpc = useTrpcClient();

  // editing state
  const [editingTeamId, setEditingTeamId] = React.useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = React.useState<string>("");
  const [isTeamSheetOpen, setIsTeamSheetOpen] = React.useState(false);

  // create team state
  const [isCreateTeamSheetOpen, setIsCreateTeamSheetOpen] =
    React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState<string>("");
  const [newTeamManagerId, setNewTeamManagerId] = React.useState<string>("");
  const [newTeamMemberIds, setNewTeamMemberIds] = React.useState<string[]>([]);
  const [allUsers, setAllUsers] = React.useState<Member[]>([]);

  const [editingMemberId, setEditingMemberId] = React.useState<string | null>(
    null,
  );
  const [editingMember, setEditingMember] = React.useState<Partial<Member>>({});
  const [isMemberSheetOpen, setIsMemberSheetOpen] = React.useState(false);

  // delete confirmation state
  const [teamToDelete, setTeamToDelete] = React.useState<Team | null>(null);
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(
    null,
  );

  React.useEffect(() => setLocalTeams(teams || []), [teams]);
  React.useEffect(() => setLocalMembers(members || []), [members]);

  // Fetch all users for team creation
  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await trpc.user.getAll.query();
        setAllUsers(users as Member[]);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    fetchUsers();
  }, [trpc]);

  interface MemberLike {
    firstName?: string | null;
    first_name?: string | null;
    name?: { first?: string | null; last?: string | null } | null;
    lastName?: string | null;
    last_name?: string | null;
    email?: string | null;
    email_address?: string | null;
    emailAddress?: string | null;
    emailAddresses?: Array<{ email_address?: string; emailAddress?: string }>;
    role?: string | null;
    public_metadata?: { role?: string | null };
    publicMetadata?: { role?: string | null };
  }

  function getFirstName(m: MemberLike | Member): string {
    return (
      m.firstName ??
      (m as MemberLike).first_name ??
      (m as MemberLike).name?.first ??
      ""
    );
  }
  function getLastName(m: MemberLike | Member): string {
    return (
      m.lastName ??
      (m as MemberLike).last_name ??
      (m as MemberLike).name?.last ??
      ""
    );
  }
  function getEmail(m: MemberLike | Member): string {
    return (
      m.email ??
      (m as MemberLike).email_address ??
      (m as MemberLike).emailAddress ??
      ((m as MemberLike).emailAddresses &&
        (m as MemberLike).emailAddresses![0] &&
        ((m as MemberLike).emailAddresses![0].email_address ??
          (m as MemberLike).emailAddresses![0].emailAddress)) ??
      ""
    );
  }
  function getRole(m: MemberLike | Member): string {
    return (
      m.role ??
      (m as MemberLike).public_metadata?.role ??
      (m as MemberLike).publicMetadata?.role ??
      ""
    );
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
      toast.success("Équipe modifiée", {
        description: `L'équipe a été mise à jour avec succès`,
      });
    } catch (err) {
      console.error("Failed to update team:", err);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour l'équipe",
      });
    }
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim() || !newTeamManagerId) {
      toast.error("Erreur", {
        description: "Le nom de l'équipe et le manager sont requis",
      });
      return;
    }

    try {
      const newTeam = await trpc.team.create.mutate({
        name: newTeamName,
        managerId: newTeamManagerId,
        memberIds: newTeamMemberIds.length > 0 ? newTeamMemberIds : undefined,
      });
      setLocalTeams((prev) => [...prev, newTeam as Team]);

      // Update localMembers to reflect the new team assignments
      const memberIdsInNewTeam = new Set([
        newTeamManagerId,
        ...newTeamMemberIds,
      ]);
      setLocalMembers((prev) =>
        prev.map((m) =>
          memberIdsInNewTeam.has(m.id)
            ? { ...m, team_id: (newTeam as Team).id }
            : m,
        ),
      );

      setIsCreateTeamSheetOpen(false);
      setNewTeamName("");
      setNewTeamManagerId("");
      setNewTeamMemberIds([]);
      toast.success("Équipe créée", {
        description: `L'équipe ${newTeamName} a été créée avec succès`,
      });
    } catch (err) {
      console.error("Failed to create team:", err);
      toast.error("Erreur", {
        description: "Impossible de créer l'équipe",
      });
    }
  }

  async function confirmDeleteTeam() {
    if (!teamToDelete) return;

    const team = teamToDelete;
    const previousTeams = [...localTeams];

    // Optimistic update
    setLocalTeams((prev) => prev.filter((t) => t.id !== team.id));
    setTeamToDelete(null);

    try {
      await trpc.team.delete.mutate({ id: team.id });
      toast.success("Équipe supprimée", {
        description: `L'équipe ${team.name} a été supprimée avec succès`,
      });
    } catch (err) {
      // Rollback on error
      setLocalTeams(previousTeams);
      console.error("Failed to delete team:", err);
      toast.error("Erreur", {
        description: "Impossible de supprimer l'équipe",
      });
    }
  }

  function openEditMember(memberId: string) {
    const m = localMembers.find((x) => x.id === memberId);
    setEditingMemberId(memberId);
    setEditingMember({
      firstName: m ? getFirstName(m) : "",
      lastName: m ? getLastName(m) : "",
      email: m ? getEmail(m) : "",
      role: m ? getRole(m) : "",
      team_id: m?.team_id ?? null,
    });
    setIsMemberSheetOpen(true);
  }

  async function saveMember() {
    if (!editingMemberId) return;
    try {
      const role = editingMember.role
        ? (editingMember.role as "admin" | "manager" | "member")
        : undefined;

      const selectedTeamId =
        editingMember.team_id && editingMember.team_id !== "__none__"
          ? String(editingMember.team_id)
          : null;

      await trpc.user.update.mutate({
        id: editingMemberId,
        firstName: editingMember.firstName ?? undefined,
        lastName: editingMember.lastName ?? undefined,
        role,
      });

      // handle team change
      const prev = localMembers.find((m) => m.id === editingMemberId);
      const prevTeam = prev?.team_id ?? null;
      const newTeam = selectedTeamId;

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
      toast.success("Membre modifié", {
        description: `Le membre a été mis à jour avec succès`,
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update member:", err);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le membre",
      });
    }
  }

  async function confirmDeleteUser() {
    if (!memberToDelete) return;

    const member = memberToDelete;
    const memberName =
      `${getFirstName(member) || ""} ${getLastName(member) || ""}`.trim() ||
      getEmail(member) ||
      "cet utilisateur";

    const previousMembers = [...localMembers];

    // Optimistic update
    setLocalMembers((prev) => prev.filter((m) => m.id !== member.id));
    setMemberToDelete(null);

    try {
      await trpc.user.delete.mutate({ id: member.id });
      toast.success("Utilisateur supprimé", {
        description: `${memberName} a été supprimé avec succès`,
      });
    } catch (err) {
      // Rollback on error
      setLocalMembers(previousMembers);
      console.error("Failed to delete user:", err);
      toast.error("Erreur", {
        description: "Impossible de supprimer l'utilisateur",
      });
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        onSettingsClick={() => setShowUserProfile(true)}
        userProfile={userProfile}
      />
      <SidebarInset className="h-screen overflow-hidden">
        <div className="relative h-screen w-full bg-linear-to-b from-background to-muted/30 flex flex-col">
          {/* Header */}
          <div className="w-full h-20 bg-background/80 backdrop-blur px-4 sm:px-8 border-b border-border flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Image
                src="/icon.png"
                alt="logo"
                className="object-cover"
                width={48}
                height={48}
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">CHRONOS</h1>
                <p className="text-xs sm:text-sm font-medium">
                  Manage your time like a pro
                </p>
              </div>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 px-4 sm:px-6 py-3 overflow-auto">
            <div className="mx-auto flex w-full max-w-[1800px] gap-4 lg:gap-6 h-full">
              {/* Teams Section - Left */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">Équipes</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreateTeamSheetOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                    <InviteSheetTrigger onOpenChange={setShowInviteSheet} />
                  </div>
                </div>
                <Card className="flex-1 flex flex-col min-h-0">
                  <CardContent className="flex-1 p-3 overflow-y-auto">
                    <div className="space-y-2">
                      {localTeams.map((team) => {
                        const teamMembers = membersByTeam.get(team.id) || [];
                        const isExpanded = openTeam === team.id;

                        return (
                          <div key={team.id} className="space-y-1">
                            <div className="flex items-center justify-between p-2 border rounded hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Users className="h-4 w-4 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-sm">
                                    {team.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {teamMembers.length} membre
                                    {teamMembers.length > 1 ? "s" : ""}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-1 shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditTeam(team.id)}
                                  className="h-7 px-2"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setTeamToDelete(team)}
                                  className="h-7 px-2 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isExpanded ? "default" : "ghost"}
                                  onClick={() =>
                                    setOpenTeam(isExpanded ? null : team.id)
                                  }
                                  className="h-7 px-2 text-xs"
                                >
                                  {isExpanded ? "Fermer" : "Voir"}
                                </Button>
                              </div>
                            </div>

                            {/* Expanded member list */}
                            {isExpanded && (
                              <div className="ml-6 border-l-2 pl-2 space-y-1">
                                {teamMembers.length === 0 ? (
                                  <p className="text-xs text-muted-foreground py-2">
                                    Aucun membre
                                  </p>
                                ) : (
                                  teamMembers.map((m) => (
                                    <div
                                      key={m.id}
                                      className="flex items-center justify-between p-1.5 border rounded text-xs hover:bg-muted/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage
                                            src={m.avatarUrl ?? undefined}
                                            alt={`${getFirstName(m) || ""} ${getLastName(m) || ""}`}
                                          />
                                          <AvatarFallback className="text-[10px]">
                                            {(getFirstName(m)?.[0] || "") +
                                              (getLastName(m)?.[0] || "")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">
                                            {getFirstName(m) || "User"}{" "}
                                            {getLastName(m) || ""}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground truncate">
                                            {getEmail(m)}
                                          </div>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground capitalize px-1">
                                          {getRole(m)}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => openEditMember(m.id)}
                                          className="h-6 px-1.5"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setMemberToDelete(m)}
                                          className="h-6 px-1.5 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Members without team - Right */}
              {membersWithoutTeam.length > 0 && (
                <>
                  <Separator
                    orientation="vertical"
                    className="hidden lg:block"
                  />
                  <div className="w-full lg:w-80 xl:w-96 flex flex-col shrink-0">
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold">
                        Membres sans équipe
                      </h2>
                    </div>
                    <Card className="flex-1 flex flex-col min-h-0">
                      <CardContent className="flex-1 p-3 overflow-y-auto">
                        <div className="space-y-1.5">
                          {membersWithoutTeam.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center justify-between p-2 border rounded hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={m.avatarUrl ?? undefined}
                                    alt={`${getFirstName(m) || ""} ${getLastName(m) || ""}`}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {(getFirstName(m)?.[0] || "") +
                                      (getLastName(m)?.[0] || "")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-sm">
                                    {getFirstName(m) || "User"}{" "}
                                    {getLastName(m) || ""}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {getEmail(m)}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground capitalize px-1">
                                  {getRole(m)}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditMember(m.id)}
                                  className="h-7 px-2"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setMemberToDelete(m)}
                                  className="h-7 px-2 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Profile Modal */}
        {showUserProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
              onClick={() => setShowUserProfile(false)}
            />
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
              <UserProfile routing="hash" />
            </div>
          </div>
        )}

        {/* Team edit sheet */}
        <Sheet open={isTeamSheetOpen} onOpenChange={setIsTeamSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Modifier l&apos;équipe</SheetTitle>
              <SheetDescription>
                Modifiez le nom de l&apos;équipe et gérez ses membres
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nom de l&apos;équipe
                </label>
                <Input
                  value={editingTeamName}
                  onChange={(e) => setEditingTeamName(e.target.value)}
                  placeholder="Nom de l'équipe"
                />
              </div>

              <div>
                <div className="text-sm font-medium mb-3">
                  Membres de l&apos;équipe
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {(membersByTeam.get(editingTeamId ?? "") || []).length ===
                  0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Aucun membre dans cette équipe
                    </p>
                  ) : (
                    (membersByTeam.get(editingTeamId ?? "") || []).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar>
                            <AvatarImage
                              src={m.avatarUrl ?? undefined}
                              alt={`${getFirstName(m) || ""} ${getLastName(m) || ""}`}
                            />
                            <AvatarFallback>
                              {(getFirstName(m)?.[0] || "") +
                                (getLastName(m)?.[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {getFirstName(m)} {getLastName(m)}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {getEmail(m)}
                            </div>
                          </div>
                        </div>
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
                                  pm.id === m.id
                                    ? { ...pm, team_id: null }
                                    : pm,
                                ),
                              );
                              toast.success("Membre retiré", {
                                description: `Le membre a été retiré de l'équipe`,
                              });
                            } catch (err) {
                              console.error("Failed to remove member", err);
                              toast.error("Erreur", {
                                description: "Impossible de retirer le membre",
                              });
                            }
                          }}
                        >
                          Retirer
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">
                  Ajouter un membre
                </div>
                <Select
                  onValueChange={async (userId) => {
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
                      toast.success("Membre ajouté", {
                        description: `Le membre a été ajouté à l'équipe`,
                      });
                    } catch (err) {
                      console.error("Failed to add member", err);
                      toast.error("Erreur", {
                        description: "Impossible d'ajouter le membre",
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un membre sans équipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {localMembers
                      .filter((m) => !m.team_id)
                      .map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {getFirstName(m)} {getLastName(m)} — {getEmail(m)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsTeamSheetOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button onClick={saveTeam} className="flex-1">
                  Enregistrer
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Member edit sheet */}
        <Sheet open={isMemberSheetOpen} onOpenChange={setIsMemberSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Modifier le membre</SheetTitle>
              <SheetDescription>
                Mettez à jour les informations du membre
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Prénom</label>
                <Input
                  placeholder="Prénom"
                  value={editingMember.firstName ?? ""}
                  onChange={(e) =>
                    setEditingMember((s) => ({
                      ...s,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nom</label>
                <Input
                  placeholder="Nom"
                  value={editingMember.lastName ?? ""}
                  onChange={(e) =>
                    setEditingMember((s) => ({
                      ...s,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  placeholder="Email"
                  value={editingMember.email ?? ""}
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rôle</label>
                <Select
                  value={editingMember.role ?? "member"}
                  onValueChange={(value) =>
                    setEditingMember((s) => ({ ...s, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Équipe</label>
                <Select
                  value={editingMember.team_id ?? "__none__"}
                  onValueChange={(value) =>
                    setEditingMember((s) => ({
                      ...s,
                      team_id: value === "__none__" ? null : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune équipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucune équipe</SelectItem>
                    {localTeams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsMemberSheetOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button onClick={saveMember} className="flex-1">
                  Enregistrer
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Create Team Sheet */}
        <Sheet
          open={isCreateTeamSheetOpen}
          onOpenChange={setIsCreateTeamSheetOpen}
        >
          <SheetContent side="right" className="w-full sm:max-w-md p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Créer une équipe</SheetTitle>
              <SheetDescription>
                Créez une nouvelle équipe avec un manager et des membres
                optionnels
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nom de l&apos;équipe
                </label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nom de l'équipe"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Manager <span className="text-destructive">*</span>
                </label>
                <Select
                  value={newTeamManagerId}
                  onValueChange={setNewTeamManagerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.length === 0 ? (
                      <SelectItem value="__loading__" disabled>
                        Chargement...
                      </SelectItem>
                    ) : allUsers.filter((u) => getRole(u) === "manager")
                        .length === 0 ? (
                      <SelectItem value="__no_manager__" disabled>
                        Aucun manager disponible
                      </SelectItem>
                    ) : (
                      allUsers
                        .filter((u) => getRole(u) === "manager")
                        .map((u) => {
                          const firstName = getFirstName(u);
                          const lastName = getLastName(u);
                          const email = getEmail(u);
                          const displayName =
                            `${firstName || ""} ${lastName || ""}`.trim() ||
                            email ||
                            "Manager";
                          return (
                            <SelectItem key={u.id} value={u.id}>
                              {displayName} {email ? `— ${email}` : ""}
                            </SelectItem>
                          );
                        })
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Membres (optionnel)
                </label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                  {allUsers
                    .filter((u) => u.id !== newTeamManagerId)
                    .map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newTeamMemberIds.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTeamMemberIds((prev) => [...prev, u.id]);
                            } else {
                              setNewTeamMemberIds((prev) =>
                                prev.filter((id) => id !== u.id),
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {getFirstName(u)} {getLastName(u)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {getEmail(u)}
                          </div>
                        </div>
                      </div>
                    ))}
                  {allUsers.filter(
                    (u) =>
                      getRole(u) !== "manager" && u.id !== newTeamManagerId,
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground py-2 text-center">
                      Aucun membre disponible
                    </p>
                  )}
                </div>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateTeamSheetOpen(false);
                    setNewTeamName("");
                    setNewTeamManagerId("");
                    setNewTeamMemberIds([]);
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateTeam} className="flex-1">
                  Créer
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Invite Sheet */}
        <InviteSheet open={showInviteSheet} onOpenChange={setShowInviteSheet} />

        {/* Delete Team Confirmation Dialog */}
        <Dialog
          open={teamToDelete !== null}
          onOpenChange={(open) => !open && setTeamToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l&apos;équipe</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer l&apos;équipe &quot;
                {teamToDelete?.name}&quot; ? Cette action est irréversible.
                {teamToDelete &&
                  (membersByTeam.get(teamToDelete.id) || []).length > 0 && (
                    <span className="block mt-2 text-destructive">
                      L&apos;équipe contient{" "}
                      {(membersByTeam.get(teamToDelete.id) || []).length} membre
                      {(membersByTeam.get(teamToDelete.id) || []).length > 1
                        ? "s"
                        : ""}
                      .
                    </span>
                  )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTeamToDelete(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmDeleteTeam}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Member Confirmation Dialog */}
        <Dialog
          open={memberToDelete !== null}
          onOpenChange={(open) => !open && setMemberToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l&apos;utilisateur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer{" "}
                {memberToDelete
                  ? `${getFirstName(memberToDelete) || ""} ${getLastName(memberToDelete) || ""}`.trim() ||
                    getEmail(memberToDelete) ||
                    "cet utilisateur"
                  : "cet utilisateur"}{" "}
                ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMemberToDelete(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmDeleteUser}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { TeamsAndMembers };
