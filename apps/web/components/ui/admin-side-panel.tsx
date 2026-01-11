"use client";
import { useTrpcClient } from "@/trpc/client";
import * as React from "react";
import { z } from "zod";
import type { Tables, Team } from "@chronos/types";
import { Button } from "@/components/ui/buttons/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/images/avatar";
import { SignedIn, UserButton, UserProfile, useClerk } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards/card";
import { toast } from "sonner";
import { formatDurationSince } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { ScheduleHistoryCard } from "@/components/ui/cards/schedule-history-card";
export default function AdminSidePanel({
  teams,
  userProfile,
}: {
  teams: z.infer<typeof Team>[];
  userProfile: Tables<"users"> | null;
}) {
  const clerk = useClerk();
  const trpc = useTrpcClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mode, setMode] = useState<"week" | "month">("week");
  const [showUserProfile, setShowUserProfile] = useState(false);

  const firstName = userProfile?.first_name ?? "Prénom";
  const lastName = userProfile?.last_name ?? "Nom";
  const role = userProfile?.role ?? "member";
  const teamName = teams?.[0]?.name ?? "Aucune équipe";
  const roleLabel =
    role === "admin"
      ? "Administrateur"
      : role === "manager"
        ? "Manager"
        : "Membre";

  const initials =
    (firstName?.[0] ?? "").toUpperCase() + (lastName?.[0] ?? "").toUpperCase();

  // schedules
  const [schedules, setSchedules] = useState<Tables<"schedules">[]>([]);
  const [, forceTick] = useState(0);

  useEffect(() => {
    async function loadSchedules() {
      try {
        const data = await trpc.schedule.getMe.query();
        setSchedules(data || []);
      } catch (error) {
        console.error("Failed to load schedules:", error);
        setSchedules([]);
      }
    }

    loadSchedules();
  }, [trpc]);

  useEffect(() => {
    const id = window.setInterval(() => forceTick((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const lastSchedule = schedules?.[0];
  const lastActivityDate = lastSchedule?.created_at
    ? new Date(lastSchedule.created_at)
    : null;
  const lastActivityType = lastSchedule?.type as
    | "check_in"
    | "check_out"
    | undefined;
  const lastActivityLabel =
    lastActivityType === "check_in"
      ? "Arrivée"
      : lastActivityType === "check_out"
        ? "Départ"
        : undefined;

  const canCheckIn = !lastActivityType || lastActivityType === "check_out";
  const canCheckOut = lastActivityType === "check_in";

  const refetchSchedules = useCallback(async () => {
    try {
      const data = await trpc.schedule.getMe.query();
      setSchedules(data || []);
    } catch (error) {
      console.error("Failed to refetch schedules:", error);
    }
  }, [trpc]);

  const handleArrival = async () => {
    const now = new Date();

    try {
      await trpc.schedule.checkIn.mutate({});
      await refetchSchedules();
      toast("Arrival saved at:", {
        description: now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save arrival";
      toast.error("Error saving arrival", { description: errorMessage });
      console.error("Failed to check in:", error);
    }
  };

  const handleDeparture = async () => {
    const now = new Date();

    try {
      await trpc.schedule.checkOut.mutate({});
      await refetchSchedules();
      toast("Departure saved at:", {
        description: now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save departure";
      toast.error("Error saving departure", { description: errorMessage });
      console.error("Failed to check out:", error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 lg:w-[380px]">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Profil</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-0.5 text-[0.75rem] font-medium text-foreground">
                  {roleLabel}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {teamName}
                </span>
              </CardDescription>
            </div>

            <Avatar>
              <AvatarImage alt={`Avatar de ${firstName} ${lastName}`} />
              <AvatarFallback>{initials || "??"}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>

        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Nom</dt>
              <dd className="text-sm font-semibold tracking-tight truncate">
                {lastName}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Prénom</dt>
              <dd className="text-sm font-semibold tracking-tight truncate">
                {firstName}
              </dd>
            </div>
          </dl>
        </CardContent>

        <CardFooter>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => clerk.openUserProfile()}
          >
            Modifier le profil
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Pointage</CardTitle>
          <CardDescription>
            Enregistre une arrivée ou un départ en un clic.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {lastActivityDate && lastActivityLabel ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Dernière activité :</span>
                <span className="font-medium text-foreground">
                  {lastActivityLabel}
                </span>
                <span>à</span>
                <span className="font-medium text-foreground">
                  {lastActivityDate.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span className="hidden sm:inline">·</span>
                <span>
                  il y a{" "}
                  <span className="font-mono text-foreground">
                    {formatDurationSince(lastActivityDate)}
                  </span>
                </span>
              </div>
            ) : (
              <>Aucune activité enregistrée.</>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleArrival}
              disabled={!canCheckIn}
            >
              Arrivée
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleDeparture}
              disabled={!canCheckOut}
            >
              Départ
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScheduleHistoryCard schedules={schedules} />

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
    </div>
  );
}
