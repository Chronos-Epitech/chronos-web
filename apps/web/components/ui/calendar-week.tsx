"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function getWeekDates(date: Date) {
  const day = date.getDay() === 0 ? 6 : date.getDay() - 1
  const start = new Date(date)
  start.setDate(date.getDate() - day)
  const week = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    week.push(d)
  }
  return week
}

const hours = Array.from({ length: 11 }, (_, i) => 8 + i) // 8h à 18h

type CalendarWeekProps = {
  selectedDate?: Date
  onSelect?: (date: Date) => void
  className?: string
}

export function CalendarWeek({
  selectedDate,
  onSelect,
  className,
}: CalendarWeekProps) {
  const [date, setDate] = React.useState<Date>(selectedDate || new Date())
  const weekDates = getWeekDates(date)

  const handlePrevWeek = () => {
    const prev = new Date(date)
    prev.setDate(date.getDate() - 7)
    setDate(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(date)
    next.setDate(date.getDate() + 7)
    setDate(next)
  }

  const handleDayClick = (d: Date) => {
    setDate(d)
    onSelect?.(d)
  }

  return (
    
    <div className={cn("bg-background p-4 rounded-lg w-full h-full flex flex-col", className)}>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeftIcon />
        </Button>
        <span className="font-semibold text-lg">
        {weekDates[0].toLocaleDateString("fr-FR")}  - {weekDates[6].toLocaleDateString("fr-FR")}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRightIcon />
        </Button>
      </div>
      {/* Grille emploi du temps */}
      <div className="grid grid-cols-8 gap-6">
        {/* Colonne heures */}
        <div className="flex flex-col sm:items-end">
          
          <div className="h-11" />
          {hours.map((h) => (
            <span
              key={h}
              className={cn(
                "text-[0.8rem] text-end text-muted-foreground border-b last:border-b-0 w-[25%] sm:w-16 h-[50px]",
                ![8, 12, 15, 18].includes(h) && "opacity-20"
              )}
            >
              {h}:00
            </span>
          ))}
        </div>
        {/* Colonnes des jours */}
        {weekDates.map((d, idx) => (
          <div key={idx} className="flex flex-col items-center h-full">
            {/* Entête du jour */}
            <Button
              variant={d.toDateString() === date.toDateString() ? "default" : "ghost"}
              onClick={() => handleDayClick(d)}
              className="w-full mb-2"
            >
              <span className="text-xs font-medium">
                {d.toLocaleDateString("fr-FR", { weekday: "short" })}
              </span>
              <span className="text-lg">{d.getDate()}</span>
            </Button>
            {/* Cases horaires (vides ou à remplir selon besoin) */}
            <div className="flex flex-col w-full">
              {hours.map((h) => (
                <div
                  key={h}
                  className="border-b last:border-b-0 w-full h-[50px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}