import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/cards/card";

type RawSchedule = {
  type: "check_in" | "check_out" | string;
  created_at: string; // ISO timestamp
};

type KpiWorkingHoursDoneProps = {
  schedules: RawSchedule[];
  memberName?: string;
  includeOpenShiftUntilNow?: boolean; // if true, count ongoing shift until now
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

function formatHoursAndMinutes(msTotal: number) {
  const totalMinutes = Math.floor(msTotal / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function KpiWorkingHoursDone({
  schedules,
  includeOpenShiftUntilNow = false,
  period,
}: KpiWorkingHoursDoneProps) {
  const totalMs = React.useMemo(() => {
    if (!Array.isArray(schedules) || schedules.length === 0) return 0;

    const range = getPeriodDateRange(period);
    const filterFn = range
      ? (d: Date) => d >= range.start && d <= range.end
      : () => true;

    const list = [...schedules]
      .map((s) => ({ ...s }))
      .filter((s) => filterFn(new Date(s.created_at)))
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

    let lastCheckIn: Date | null = null;
    let acc = 0;

    for (const item of list) {
      const dt = toDate(item.created_at);
      if (!dt) continue;

      if (item.type === "check_in") {
        // start a new shift (replace any previous dangling check-in)
        lastCheckIn = dt;
      } else if (item.type === "check_out") {
        if (lastCheckIn) {
          const diff = dt.getTime() - lastCheckIn.getTime();
          if (diff > 0) acc += diff;
          lastCheckIn = null;
        }
      }
    }

    if (includeOpenShiftUntilNow && lastCheckIn) {
      const now = new Date();
      const diff = now.getTime() - lastCheckIn.getTime();
      if (diff > 0) acc += diff;
    }

    return acc;
  }, [schedules, includeOpenShiftUntilNow, period]);

  const hours = msToHours(totalMs);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{"Heures travaillées"}</CardTitle>
        <CardDescription>
          Total heures travaillées {period && `(${period})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-semibold">{hours.toFixed(2)}h</div>
          <div className="text-muted-foreground">
            {formatHoursAndMinutes(totalMs)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { KpiWorkingHoursDone };
