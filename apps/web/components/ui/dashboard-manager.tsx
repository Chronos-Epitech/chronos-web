"use client";
import { useTrpcClient } from "@/trpc/client";
import { useEffect, useState } from "react";
import * as React from "react";
import { z } from "zod";
import type { Tables, Team } from "@chronos/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/squared-avatar";
import { SignedIn, UserButton, UserProfile, useUser } from "@clerk/nextjs";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
  
import { AppSidebar } from "@/components/ui/app-sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
  

import { Calendar } from "@/components/ui/calendar";
import { CalendarWeek } from "@/components/ui/calendar-week";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} 

from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
// =================== CONFIG CHART ===================
const chartDataWeek = [
  { day: "Lun", Departure: 186, Arrival: 80 },
  { day: "Mar", Departure: 305, Arrival: 200 },
  { day: "Mer", Departure: 237, Arrival: 120 },
  { day: "Jeu", Departure: 73, Arrival: 190 },
  { day: "Ven", Departure: 209, Arrival: 130 },
  { day: "Sam", Departure: 214, Arrival: 140 },
  { day: "Dim", Departure: 150, Arrival: 90 },
];

const chartDataMonth = [
  { month: "January", Departure: 186, Arrival: 80 },
  { month: "February", Departure: 305, Arrival: 200 },
  { month: "March", Departure: 237, Arrival: 120 },
  { month: "April", Departure: 73, Arrival: 190 },
  { month: "May", Departure: 209, Arrival: 130 },
  { month: "June", Departure: 214, Arrival: 140 },
];

const chartConfig = {
  Departure: {
    label: "Departure",
    color: "#1e40af",
  },
  Arrival: {
    label: "Arrival",
    color: "#3b82f6",
  },
} satisfies ChartConfig;
// =================== FIN CONFIG CHART ===================

export default function DashboardClient({
  teams,
  userProfile,
}: {
  teams: z.infer<typeof Team>[];
  userProfile: Tables<"users"> | null;
}) {
  const { user } = useUser();
  const userId = user?.id;
  const trpc = useTrpcClient();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mode, setMode] = React.useState<"week" | "month">("week");
  const [showUserProfile, setShowUserProfile] = React.useState(false);
  

  // Récupération des données utilisateur depuis Supabase
  const firstName = userProfile?.first_name ?? "Prénom";
  const lastName = userProfile?.last_name ?? "Nom";
  const avatarUrl = userProfile?.avatar_url ?? "/id.png";
  const role = userProfile?.role ?? "member";
  const teamName = teams?.[0]?.name ?? "Aucune équipe";

  const initials =
    (firstName?.[0] ?? "").toUpperCase() + (lastName?.[0] ?? "").toUpperCase();

  // ============================
  // ARRIVAL (checkIn)
  // ============================
  const handleArrival = async () => {
    if (!userId) return;
  
    const now = new Date();
  
    await trpc.schedule.checkIn.mutate({
      user_id: userId, // <-- EXACTEMENT comme checkOut
    });
  
    toast("Arrival saved at:", {
      description: now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    });
  };
  

  // ============================
  // DEPARTURE (checkOut)
  // ============================
  const handleDeparture = async () => {
    if (!userId) return;

    const now = new Date();

    await trpc.schedule.checkOut.mutate({
      user_id: userId,
    });

    toast("Departure saved at:", {
      description: now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar onSettingsClick={() => setShowUserProfile(true)} />
      <SidebarInset className="min-h-screen">
        {/* Header */}
        <div className="w-full h-20 bg-white px-4 sm:px-8 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <img src="icon.png" alt="logo" className="w-12 h-12 sm:w-16 sm:h-16 object-cover" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">CHRONOS</h1>
                <p className="text-xs sm:text-sm font-medium">Manage your time like a pro</p>
              </div>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

        {/* Content */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 px-4 sm:px-8 py-4">

        {/* left screen */}
        <div className="flex flex-col gap-4 sm:gap-2 w-full sm:w-1/3">

          {/* User Card */}
          <Card className="flex flex-col gap-2 p-4 relative">
            <div className="flex flex-col gap-1">
              <Label className="text-sm sm:text-base font-semibold">Nom: {lastName}</Label>
              <Label className="text-sm sm:text-base font-semibold">Prénom: {firstName}</Label>

              <Label className="text-xs sm:text-sm text-gray-500 mt-1">
                Rôle: {role === "admin" ? "Administrateur" : role === "manager" ? "Manager" : "Membre"}
              </Label>

              <Label className="text-xs sm:text-sm text-gray-500">
                Équipe : {teamName}
              </Label>

              <div className="flex justify-start mt-2">
                <Button
                  variant="secondary"
                  className="w-auto px-4 py-2 text-sm sm:text-base mt-3"
                  onClick={() => setShowUserProfile(true)}
                >
                  Modifier
                </Button>
              </div>
            </div>

            <Avatar className="h-full w-1/4 sm:w-1/4 absolute right-0 bottom-0">
              <AvatarImage src={avatarUrl} alt={`Avatar de ${firstName} ${lastName}`} className="object-cover" />
              <AvatarFallback>{initials || "??"}</AvatarFallback>
            </Avatar>
          </Card>

          {/* Card Schedules */}
          <Card className="flex flex-row items-center justify-center gap-6 p-4">
            <Button variant="outline" className="flex-1 h-32" onClick={handleArrival}>
              ARRIVAL
            </Button>

            <div className="text-lg font-medium">-</div>

            <Button variant="outline" className="flex-1 h-32" onClick={handleDeparture}>
              DEPARTURE
            </Button>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Charts - {mode === "week" ? "Last Week" : "Last Months"}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      {mode === "week" ? "Semaine" : "Mois"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setMode("week")}>Semaine</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMode("month")}>Mois</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={mode === "week" ? chartDataWeek : chartDataMonth}
                  margin={{ left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey={mode === "week" ? "day" : "month"}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => mode === "week" ? value : value.slice(0, 3)}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    dataKey="Arrival"
                    type="natural"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                    stroke="var(--color-Arrival)"
                    stackId="a"
                  />
                  <Area
                    dataKey="Departure"
                    type="natural"
                    fill="var(--color-Departure)"
                    fillOpacity={0.4}
                    stroke="var(--color-Departure)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

        </div>

        {/* right screen */}
        <div className="w-full sm:w-2/3 flex flex-col mt-4 sm:mt-0">
          {mode === "week" ? (
            <CalendarWeek
              selectedDate={date}
              onSelect={setDate}
              className="rounded-lg border w-full bg-white"
              mode={mode}
              onModeChange={setMode}
            />
          ) : (
            <Calendar
              selectedDate={date}
              onSelect={setDate}
              className="rounded-lg border w-full h-[680px] bg-white"
              mode={mode}
              onModeChange={setMode}
            />
          )}
        </div>
      </div>

      {/* Clerk modal */}
        {showUserProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={() => setShowUserProfile(false)} />
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
              <UserProfile routing="hash" />
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
