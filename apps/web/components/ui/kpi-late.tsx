import * as React from "react";
import type { Tables } from "@chronos/types";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

type Schedule = {
  date?: string; // YYYY-MM-DD
  start?: string; // HH:mm or ISO
  arrivedAt?: string | null; // HH:mm or ISO or null
};

type KpiLateProps = {
  schedules: Schedule[];
  memberName?: string;
  toleranceMinutes?: number; // minutes after start considered late
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

function parseToDate(dateOrTime?: string | null, maybeTime?: string | null) {
  if (!dateOrTime && !maybeTime) return null;

  // If first argument looks like a full ISO datetime, use it.
  const first = String(dateOrTime ?? "");
  if (first.includes("T") || first.includes("Z")) {
    const d = new Date(first);
    return isNaN(d.getTime()) ? null : d;
  }

  // If we have a date and a time
  if (maybeTime && dateOrTime) {
    const iso = `${dateOrTime}T${maybeTime}`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  // If we only have a time (HH:mm), assume today
  const time = maybeTime ?? dateOrTime;
  if (time && /^\d{1,2}:\d{2}/.test(time)) {
    const today = new Date();
    const [hh, mm] = time.split(":").map((s) => parseInt(s, 10));
    today.setHours(hh);
    today.setMinutes(mm);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today;
  }

  // Fallback try
  const d = new Date(String(dateOrTime ?? maybeTime));
  return isNaN(d.getTime()) ? null : d;
}

export default function KpiLate({
  schedules,
  memberName,
  toleranceMinutes = 0,
  period,
}: KpiLateProps) {
  const lateCount = React.useMemo(() => {
    if (!Array.isArray(schedules)) return 0;

    const range = getPeriodDateRange(period);
    const filterFn = range
      ? (d: Date) => d >= range.start && d <= range.end
      : () => true;

    return schedules.reduce((acc, s) => {
      const scheduled = parseToDate(s.date, s.start);
      const arrived = parseToDate(
        s.arrivedAt,
        s.arrivedAt && !s.arrivedAt.includes("T") ? s.arrivedAt : s.date,
      );

      if (!scheduled || !arrived) return acc;
      if (!filterFn(scheduled)) return acc;

      const toleranceMs = Math.max(0, toleranceMinutes) * 60_000;
      if (arrived.getTime() - scheduled.getTime() > toleranceMs) return acc + 1;
      return acc;
    }, 0 as number);
  }, [schedules, toleranceMinutes, period]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {memberName ? `${memberName}` : "Arrivées en retard"}
        </CardTitle>
        <CardDescription>
          Nombre d&apos;arrivées en retard {period && `(${period})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{lateCount}</div>
      </CardContent>
    </Card>
  );
}

// Helper functions for KpiLateMember
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

export function KpiLateMember({
  schedules,
  toleranceMinutes = 0,
  period,
}: {
  schedules: Tables<"schedules">[];
  toleranceMinutes?: number;
  period?: "week" | "month" | "year";
}) {
  const { totalLateMinutes, totalLateCount } = React.useMemo(() => {
    if (!Array.isArray(schedules) || schedules.length === 0)
      return { totalLateMinutes: 0, totalLateCount: 0 };

    const range = getPeriodDateRange(period);
    const filterFn = range
      ? (d: Date) => d >= range.start && d <= range.end
      : () => true;

    let totalLateMinutes = 0;
    let totalLateCount = 0;
    const MORNING_THRESHOLD_HOURS = 8;

    // Group by day to find first check_in
    const checkInsByDay = new Map<string, Date>(); // dayKey -> first check_in time

    for (const s of schedules) {
      if (s.type !== "check_in") continue;
      const dt = toDate(s.created_at);
      if (!dt || !filterFn(dt)) continue;

      const dayKey = dt.toISOString().split("T")[0];
      if (!checkInsByDay.has(dayKey) || dt < checkInsByDay.get(dayKey)!) {
        checkInsByDay.set(dayKey, dt);
      }
    }

    // Check if first check_in is late
    for (const [dayKey, checkInTime] of checkInsByDay.entries()) {
      const hours = checkInTime.getHours();
      const minutes = checkInTime.getMinutes();
      const checkInMinutes = hours * 60 + minutes;
      const thresholdMinutes = MORNING_THRESHOLD_HOURS * 60;

      if (checkInMinutes > thresholdMinutes + toleranceMinutes) {
        const lateMs =
          (checkInMinutes - thresholdMinutes - toleranceMinutes) * 60 * 1000;
        const lateMinutes = Math.round(lateMs / 60000);

        totalLateMinutes += lateMinutes;
        totalLateCount += 1;
      }
    }

    return { totalLateMinutes, totalLateCount };
  }, [schedules, toleranceMinutes, period]);

  return (
    <Card className="h-full flex flex-col py-4 gap-4">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm">Arrivées en retard</CardTitle>
        <CardDescription className="text-xs">
          Total des minutes d&apos;arrivée en retard {period && `(${period})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-4 py-2">
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-semibold">
            {formatHoursAndMinutesFromMinutes(totalLateMinutes)}
          </div>
          <div className="text-xs text-muted-foreground">
            {totalLateMinutes} minutes — {totalLateCount} arrivées en retard
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { KpiLate };
