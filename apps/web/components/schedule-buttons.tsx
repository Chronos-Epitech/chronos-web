"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ScheduleButtons() {
  const handleArrival = () => {
    const now = new Date();
    toast("Arrival saved at:", {
      description: now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      action: { label: "Undo", onClick: () => console.log("Undo") },
    });
  };

  const handleDeparture = () => {
    const now = new Date();
    toast("Departure saved at:", {
      description: now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      action: { label: "Undo", onClick: () => console.log("Undo") },
    });
  };

  return (
    <div className="flex flex-row sm:flex-row items-center justify-center gap-2 sm:gap-6 p-4">
      <Button
        variant="secondary"
        className="flex-1 min-w-[80px] max-w-[200px] h-32 px-4 py-2"
        onClick={handleArrival}
      >
        ARRIVAL
      </Button>
      <div className="sm:flex items-center text-lg font-medium">-</div>
      <Button
        variant="secondary"
        className="flex-1 min-w-[80px] max-w-[200px] h-32 px-4 py-2"
        onClick={handleDeparture}
      >
        DEPARTURE
      </Button>
    </div>
  );
}
