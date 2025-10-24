"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarWeek } from "@/components/ui/calendar-week";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function CalendarContainer() {
  const [date, setDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<"week" | "month">("week");

  return (
    <div className="w-full sm:w-2/3 flex flex-col mt-4 sm:mt-0">
      {/* Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex mb-4 w-full sm:w-auto text-sm sm:text-base"
          >
            Display: {mode === "week" ? "Semaine" : "Mois"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setMode("week")}>
            week
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("month")}>
            month
          </DropdownMenuItem>
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
  );
}
