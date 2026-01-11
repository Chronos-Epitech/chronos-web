import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../cards/card";

type RawScheduleTeam = {
  user_id?: string;
  type: "check_in" | "check_out" | string;
  created_at: string; // ISO timestamp
};

type KpiWorkingHoursDoneTeamProps = {
  schedules: RawScheduleTeam[]; // flat list across team
  includeOpenShiftUntilNow?: boolean;
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

function msToHours(ms: number) {
  return ms / (1000 * 60 * 60);
}

function formatHoursAndMinutesFromMs(msTotal: number) {
  const totalMinutes = Math.floor(msTotal / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function KpiWorkingHoursDoneTeam({
  schedules,
  includeOpenShiftUntilNow = false,
  period,
}: KpiWorkingHoursDoneTeamProps) {
  console.log("KpiWorkingHoursDoneTeam received:", {
    scheduleCount: schedules?.length,
    period,
    sample: schedules?.[0],
  });

  const { totalMs, daysWithData, avgPerDay } = React.useMemo(() => {
    if (!Array.isArray(schedules) || schedules.length === 0)
      return { totalMs: 0, daysWithData: 0, avgPerDay: 0 };

    const range = getPeriodDateRange(period);
    const filterFn = range
      ? (d: Date) => d >= range.start && d <= range.end
      : () => true;

    // Group schedules by user_id
    const byMember = new Map<string, RawScheduleTeam[]>();

    for (const s of schedules) {
      const dt = new Date(s.created_at);
      if (!filterFn(dt)) continue;
      const id = s.user_id ?? "__unknown";
      const arr = byMember.get(id) ?? [];
      arr.push(s);
      byMember.set(id, arr);
    }

    // Calculate hours per day per member, then build per-day totals and unique worker counts
    // dayKey -> { ms: total milliseconds that day, users: Set<user_id> }
    const dayTotals = new Map<string, { ms: number; users: Set<string> }>();
    let totalMs = 0;

    for (const [userId, events] of byMember.entries()) {
      const list = events
        .slice()
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

      let lastCheckIn: Date | null = null;
      for (const ev of list) {
        const dt = toDate(ev.created_at);
        if (!dt) continue;
        if (ev.type === "check_in") {
          lastCheckIn = dt;
        } else if (ev.type === "check_out") {
          if (lastCheckIn) {
            const diff = dt.getTime() - lastCheckIn.getTime();
            if (diff > 0) {
              totalMs += diff;
              const dayKey = lastCheckIn.toISOString().split("T")[0];
              const entry = dayTotals.get(dayKey) ?? {
                ms: 0,
                users: new Set<string>(),
              };
              entry.ms += diff;
              entry.users.add(userId || "__unknown");
              dayTotals.set(dayKey, entry);
            }
            lastCheckIn = null;
          }
        }
      }

      if (includeOpenShiftUntilNow && lastCheckIn) {
        const now = new Date();
        const diff = now.getTime() - lastCheckIn.getTime();
        if (diff > 0) {
          totalMs += diff;
          const dayKey = lastCheckIn.toISOString().split("T")[0];
          const entry = dayTotals.get(dayKey) ?? {
            ms: 0,
            users: new Set<string>(),
          };
          entry.ms += diff;
          entry.users.add(userId || "__unknown");
          dayTotals.set(dayKey, entry);
        }
      }
    }

    const daysWithData = dayTotals.size;

    // For each day, compute per-person average (day.ms / number of users that day), then average across days
    let sumPerDayPerPersonMs = 0;
    for (const [, entry] of dayTotals.entries()) {
      const usersCount = Math.max(1, entry.users.size);
      sumPerDayPerPersonMs += entry.ms / usersCount;
    }
    const avgPerDay =
      daysWithData > 0 ? sumPerDayPerPersonMs / daysWithData : 0;

    return { totalMs, daysWithData, avgPerDay };
  }, [schedules, includeOpenShiftUntilNow, period]);

  const hours = msToHours(totalMs);
  const avgHours = msToHours(avgPerDay);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heures travaillées (équipe)</CardTitle>
        <CardDescription>
          Moyenne des heures de travail {period && `(${period})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-semibold">
            {formatHoursAndMinutesFromMs(avgPerDay)}
          </div>
          <div className="text-sm text-muted-foreground">
            {daysWithData} jours • Total: {formatHoursAndMinutesFromMs(totalMs)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { KpiWorkingHoursDoneTeam };
