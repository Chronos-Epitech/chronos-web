import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/cards/card";

type RawScheduleTeam = {
  user_id?: string;
  type: "check_in" | "check_out" | string;
  created_at: string; // ISO timestamp
};

type KpiLateTeamProps = {
  schedules: RawScheduleTeam[]; // flat list with memberId
  toleranceMinutes?: number; // grace minutes
  period?: "week" | "month" | "year"; // filter by period
};

function getPeriodDateRange(period?: string) {
  const now = new Date();
  const start = new Date();

  if (period === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
  } else if (period === "month") {
    start.setDate(1);
  } else if (period === "year") {
    start.setMonth(0);
    start.setDate(1);
  } else {
    return null;
  }

  start.setHours(0, 0, 0, 0);
  return { start, end: now };
}

function toDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatHoursAndMinutesFromMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
}

export default function KpiLateTeam({
  schedules,
  toleranceMinutes = 0,
  period,
}: KpiLateTeamProps) {
  const { totalLateMinutes, totalLateCount, daysWithLate, avgLatePerDay } =
    React.useMemo(() => {
      if (!Array.isArray(schedules) || schedules.length === 0)
        return {
          totalLateMinutes: 0,
          totalLateCount: 0,
          daysWithLate: 0,
          avgLatePerDay: 0,
        };

      const range = getPeriodDateRange(period);
      const filterFn = range
        ? (d: Date) => d >= range.start && d <= range.end
        : () => true;

      // Calculate late arrivals: if first check_in of the day is after 08:00, it's late
      const lateByDay = new Map<string, { count: number; lateMs: number }>(); // day (YYYY-MM-DD) -> { count, lateMs }
      let totalLateMinutes = 0;
      let totalLateCount = 0;
      const MORNING_THRESHOLD_HOURS = 8; // 08:00 is the expected time

      // Group by member and day to find first check_in
      const checkInsByDay = new Map<string, Map<string, Date>>(); // user_id -> (dayKey -> first check_in time)

      for (const s of schedules) {
        if (s.type !== "check_in") continue;
        const dt = toDate(s.created_at);
        if (!dt || !filterFn(dt)) continue;

        const memberId = s.user_id ?? "__unknown";
        const dayKey = dt.toISOString().split("T")[0];

        if (!checkInsByDay.has(memberId)) {
          checkInsByDay.set(memberId, new Map());
        }
        const memberDays = checkInsByDay.get(memberId)!;
        if (!memberDays.has(dayKey) || dt < memberDays.get(dayKey)!) {
          memberDays.set(dayKey, dt);
        }
      }

      // Check if first check_in is late
      for (const [, memberDays] of checkInsByDay.entries()) {
        for (const [dayKey, checkInTime] of memberDays.entries()) {
          const hours = checkInTime.getHours();
          const minutes = checkInTime.getMinutes();
          const checkInMinutes = hours * 60 + minutes;
          const thresholdMinutes = MORNING_THRESHOLD_HOURS * 60;

          if (checkInMinutes > thresholdMinutes + toleranceMinutes) {
            const lateMs =
              (checkInMinutes - thresholdMinutes - toleranceMinutes) *
              60 *
              1000;
            const lateMinutes = Math.round(lateMs / 60000);

            totalLateMinutes += lateMinutes;
            totalLateCount += 1;

            const existing = lateByDay.get(dayKey) || { count: 0, lateMs: 0 };
            lateByDay.set(dayKey, {
              count: existing.count + 1,
              lateMs: existing.lateMs + lateMs,
            });
          }
        }
      }

      const daysWithLate = lateByDay.size;
      const avgLatePerDay =
        daysWithLate > 0
          ? Array.from(lateByDay.values()).reduce(
              (sum, d) => sum + d.lateMs,
              0,
            ) / daysWithLate
          : 0;

      return { totalLateMinutes, totalLateCount, daysWithLate, avgLatePerDay };
    }, [schedules, toleranceMinutes, period]);

  const avgLateMinutes = Math.round(avgLatePerDay / 60000);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retards totaux (équipe)</CardTitle>
        <CardDescription>
          Total des minutes d&apos;arrivée en retard {period && `(${period})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-semibold">
            {formatHoursAndMinutesFromMinutes(totalLateMinutes)}
          </div>
          <div className="text-muted-foreground">
            {totalLateMinutes} minutes — {totalLateCount} arrivées en retard
          </div>
          <div className="text-sm text-muted-foreground">
            {daysWithLate} jours • Moyenne:{" "}
            {formatHoursAndMinutesFromMinutes(avgLateMinutes)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { KpiLateTeam };
