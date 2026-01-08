"use client";
import { useState } from "react";
import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Génère toutes les dates du mois courant
function getMonthDates(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

type CalendarMonthProps = {
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  mode?: "week" | "month";
  onModeChange?: (mode: "week" | "month") => void;
};

export function Calendar({
  selectedDate,
  onSelect,
  className,
  mode,
  onModeChange,
}: CalendarMonthProps) {
  const [date, setDate] = useState<Date>(selectedDate || new Date());
  const monthDates = getMonthDates(date);

  // Naviguer vers le mois précédent
  const handlePrevMonth = () => {
    const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    setDate(prev);
  };

  // Naviguer vers le mois suivant
  const handleNextMonth = () => {
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    setDate(next);
  };

  // Sélectionner un jour
  const handleDayClick = (d: Date) => {
    setDate(d);
    onSelect?.(d);
  };

  // Génère la grille (semaines x jours)
  const weeks: Date[][] = [];
  let week: Date[] = [];
  monthDates.forEach((d, idx) => {
    // Ajoute des jours vides au début si le mois ne commence pas lundi
    if (idx === 0 && d.getDay() !== 1) {
      const emptyDays = d.getDay() === 0 ? 6 : d.getDay() - 1;
      for (let i = 0; i < emptyDays; i++) {
        week.push(undefined as unknown as Date);
      }
    }
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) {
    while (week.length < 7) week.push(undefined as unknown as Date);
    weeks.push(week);
  }

  return (
    <div
      className={cn(
        "bg-background p-4 rounded-lg w-full h-full flex flex-col",
        className,
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </Button>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">
            {date.toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </span>
          {mode && onModeChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  {mode === "week" ? "Semaine" : "Mois"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onModeChange("week")}>
                  Semaine
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onModeChange("month")}>
                  Mois
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRightIcon />
        </Button>
      </div>
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, idx) => (
          <span key={idx} className="text-xs font-medium text-center">
            {day}
          </span>
        ))}
      </div>
      {/* Grille du mois */}
      <div className="flex-1 grid grid-cols-7 gap-2">
        {weeks.flat().map((d, idx) =>
          d ? (
            <Button
              key={idx}
              variant={
                d.toDateString() === date.toDateString() ? "secondary" : "ghost"
              }
              onClick={() => handleDayClick(d)}
              className="w-full h-full flex flex-col items-center py-2"
            >
              <span className="text-lg">{d.getDate()}</span>
            </Button>
          ) : (
            <div key={idx} className="w-full h-full" />
          ),
        )}
      </div>
    </div>
  );
}
