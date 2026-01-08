"use client";

import { useMemo, useState, useEffect } from "react";
import type { Tables } from "@chronos/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  getWeekBoundsMonday,
  minutesToTimeLabel,
  timeToMinutes,
} from "@/lib/utils";

const chartConfig = {
  Departure: {
    label: "Departure",
    color: "#1e40af",
  },
  Arrival: {
    label: "Arrival",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

function averageOrZero(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function ScheduleAreaChartCard({
  schedules,
  mode,
  onModeChange,
  selectedDate,
}: {
  schedules: Tables<"schedules">[];
  mode: "week" | "month";
  onModeChange: (mode: "week" | "month") => void;
  selectedDate?: Date;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartDataWeek = useMemo(() => {
    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const base = dayNames.map((day) => ({ day, Departure: 0, Arrival: 0 }));
    if (!schedules?.length) return base;

    const referenceDate = selectedDate ?? new Date();
    const { start, endExclusive } = getWeekBoundsMonday(referenceDate);

    const buckets: Record<number, { Departure: number[]; Arrival: number[] }> =
      {};
    for (let i = 0; i < 7; i++) buckets[i] = { Departure: [], Arrival: [] };

    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.created_at);
      if (!(scheduleDate >= start && scheduleDate < endExclusive)) return;
      const dayIdx = (scheduleDate.getDay() + 6) % 7; // Monday-first index
      const minutes = timeToMinutes(scheduleDate);
      if (schedule.type === "check_out")
        buckets[dayIdx].Departure.push(minutes);
      if (schedule.type === "check_in") buckets[dayIdx].Arrival.push(minutes);
    });

    return dayNames.map((day, index) => ({
      day,
      Departure: averageOrZero(buckets[index].Departure),
      Arrival: averageOrZero(buckets[index].Arrival),
    }));
  }, [schedules, selectedDate]);

  const chartDataMonth = useMemo(() => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const base = Array.from({ length: 6 }, (_, i) => {
      const now = new Date();
      const monthIndex = (now.getMonth() - 5 + i + 12) % 12;
      return { month: monthNames[monthIndex], Departure: 0, Arrival: 0 };
    });
    if (!schedules?.length) return base;

    const monthData: Record<
      number,
      { Departure: number[]; Arrival: number[] }
    > = {};
    for (let i = 0; i < 12; i++) monthData[i] = { Departure: [], Arrival: [] };

    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.created_at);
      const month = scheduleDate.getMonth();
      const minutes = timeToMinutes(scheduleDate);
      if (schedule.type === "check_out")
        monthData[month].Departure.push(minutes);
      if (schedule.type === "check_in") monthData[month].Arrival.push(minutes);
    });

    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (now.getMonth() - 5 + i + 12) % 12;
      return {
        month: monthNames[monthIndex],
        Departure: averageOrZero(monthData[monthIndex].Departure),
        Arrival: averageOrZero(monthData[monthIndex].Arrival),
      };
    });
  }, [schedules]);

  const data = mode === "week" ? chartDataWeek : chartDataMonth;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Charts - {mode === "week" ? "Selected Week" : "Last Months"}
          </CardTitle>
          {mounted ? (
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
          ) : (
            <Button variant="outline" size="sm" className="text-xs" disabled>
              {mode === "week" ? "Semaine" : "Mois"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={mode === "week" ? "day" : "month"}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                mode === "week" ? value : value.slice(0, 3)
              }
            />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={minutesToTimeLabel}
              domain={[0, 24 * 60]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => (
                    <div className="flex flex-1 justify-between leading-none">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {minutesToTimeLabel(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="Arrival"
              type="natural"
              fill="var(--color-Arrival)"
              fillOpacity={0.4}
              stroke="var(--color-Arrival)"
            />
            <Area
              dataKey="Departure"
              type="natural"
              fill="var(--color-Departure)"
              fillOpacity={0.4}
              stroke="var(--color-Departure)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
