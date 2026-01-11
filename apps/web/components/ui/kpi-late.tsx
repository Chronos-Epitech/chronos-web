import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/cards/card";

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

export { KpiLate };
