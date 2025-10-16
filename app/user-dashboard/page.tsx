"use client";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/squared-avatar";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarWeek } from "@/components/ui/calendar-week";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mode, setMode] = React.useState<"week" | "month">("week");

  return (
    <div className="relative min-h-screen w-full">

      {/* Header */}
      <div className="w-full h-20 bg-white px-4 sm:px-8 border-b border-gray-200 flex items-center justify-between fixed top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="icon.png" alt="logo" className="w-12 h-12 sm:w-16 sm:h-16 object-cover" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">CHRONOS</h1>
            <p className="text-xs sm:text-sm font-medium">Manage your time like a pro</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="ghost" className="cursor-pointer text-sm sm:text-base">
            HomePage
          </Button>
        </Link>
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
                <Button variant="secondary" className="w-auto px-4 py-2 text-sm sm:text-base mt-3">
                  Changes
                </Button>
              </div>
            </div>
            <Avatar className="h-full w-1/4 sm:w-1/4 absolute right-0 bottom-0">
              <AvatarImage src="id.png" alt="User Avatar" className="object-cover" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Card>

          {/* Card Schedules */}
          <Card className="flex flex-row sm:flex-row items-center justify-center gap-2 sm:gap-6 p-4">
            <Button
              variant="secondary"
              className="flex-1 min-w-[80px] max-w-[200px] h-32 px-4 py-2"
              onClick={() => {
                const now = new Date();
                toast("Arrival saved at:", {
                  description: now.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  action: { label: "Undo", onClick: () => console.log("Undo") },
                });
              }}
            >
              ARRIVAL
            </Button>
            <div className="sm:flex items-center text-lg font-medium">-</div>
            <Button
              variant="secondary"
              className="flex-1 min-w-[80px] max-w-[200px] h-32 px-4 py-2"
              onClick={() => {
                const now = new Date();
                toast("Departure saved at:", {
                  description: now.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  action: { label: "Undo", onClick: () => console.log("Undo") },
                });
              }}
            >
              DEPARTURE
            </Button>
          </Card>

        </div>

        {/* right screen*/}
        <div className="w-full sm:w-2/3 flex flex-col mt-4 sm:mt-0">
          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex mb-4 w-full sm:w-auto text-sm sm:text-base">
                Display: {mode === "week" ? "Semaine" : "Mois"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setMode("week")}>week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode("month")}>month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Calendar */}
          {mode === "week" ? (
            <CalendarWeek
              selectedDate={date}
              onSelect={setDate}
              className="rounded-lg border w-full bg-white"
            />
          ) : (
            <Calendar
              selectedDate={date}
              onSelect={setDate}
              className="rounded-lg border w-full h-[680] bg-white"
            />
          )}
        </div>

      </div>
    </div>
  );
}
