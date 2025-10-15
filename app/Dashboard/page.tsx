// Code original restauré
"use client";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarWeek } from "@/components/ui/calendar_week";
import {toast} from "sonner";
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
    <div className="relative h-screen w-full">
      <div className=" absolute top-0 w-full h-20 bg-white px-8 border-1"></div>

      {/* Accueil button */}
      <Link href="/" className="absolute top-4 right-4 z-20">
        <Button variant="ghost" className="cursor-pointer">
          HomePage
        </Button>
      </Link>
      <div className="flex flex-row">
        <img src="icon.png" alt="logo" className="object-cover absolute top-left w-20 h-20" />
        <h1 className="text-2xl font-bold absolute top-3 left-20">CHRONOS</h1>
        <p className="text-1xl font-bold absolute top-10 left-21">Manage your time like a pro</p>
      </div>

      <div className="relative z-10 flex h-full">
        {/* Contenu gauche */}
        <div className="flex flex-col items-start justify-end p-8 gap-6 w-1/3">
          {/* User Card */}
          <Card className="flex w-full h-1/4 relative">
            <div className="flex flex-col gap-6">
              <div className="grid item start justify-start ml-2 gap-2">
                <Label>Last Name:</Label>
              </div>
              <div className="grid item start justify-start ml-2 gap-2">
                <div className="flex items-center">
                  <Label>First Name:</Label>
                </div>
              </div>
              <div className="flex justify-start ml-2 mt-8">
                <Button variant="secondary">Changes</Button>
              </div>
            </div>
            <Avatar className="w-1/4 h-full absolute right-0 top-0">
              <AvatarImage src="id.png" alt="User Avatar" className="object-cover" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Card>

          {/* Card Schedules */}
          <Card className="w-full h-1/4 relative p-2">
              <h1 className="text-2xl font-bold ml-40">Schedules</h1>
              <div className="flex flex-row justify-center gap-6">
                {/* Arrival */}
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" className="px-10 py-10"
                  onClick={() =>{
                    const now = new Date();
                    const time = now.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                    toast("Arrival saved at:", {
                      description: `${time}`,
                      action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                      },
                    });
                }}
              >
                    ARRIVAL
                  </Button>
                </div>
                <div className="flex items-center">
                  <p className="text-lg font-medium"> - </p>
                </div>
                {/* Departure */}
                <div className="flex flex-col">
                  <Button variant="secondary" className="px-10 py-10"
                                    onClick={() =>{
                    const now = new Date();
                    const time = now.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                    toast("Departure saved at:", {
                      description: `${time}`,
                      action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                      },
                    });
                }}>
                    DEPARTURE
                  </Button>
                </div>
              </div>
          </Card>
        </div>

        {/* Calendrier à droite */}
        <div className="absolute bottom-0 left-125 w-2/3">
         <div className="p-8 h-[700px] ">
          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="absolute top-12 right-60 mb-4">
                Display: {mode === "week" ? "Semaine" : "Mois"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setMode("week")}>week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode("month")}>month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* mode calendar */}
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
              className="rounded-lg border w-full bg-white"
            />
          )}
          </div>
        </div>
      </div>
    </div>
  );
}