"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Tables } from "@chronos/types";

type Props = {
  schedules: Tables<"schedules">[];
};

export function ScheduleHistoryCard({ schedules }: Props) {
  if (!schedules.length) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground">
          Aucun pointage enregistré.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Historique des pointages</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {schedules.map((schedule) => {
          const date = new Date(schedule.created_at);
          const isCheckIn = schedule.type === "check_in";

          return (
            <div
              key={schedule.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              {/* Texte principal */}
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    isCheckIn ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isCheckIn ? "Arrivée" : "Départ"}
                </span>

                <span className="text-xs text-muted-foreground">
                  {date.toLocaleDateString("fr-FR")} ·{" "}
                  {date.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Indication simple à droite */}
              <span
                className={`text-xs font-semibold ${
                  isCheckIn ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isCheckIn ? "IN" : "OUT"}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
