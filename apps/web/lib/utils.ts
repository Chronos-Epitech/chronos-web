import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiUrl() {
  /**
   * In the browser, Next.js only exposes env vars prefixed with NEXT_PUBLIC_.
   * On the server, we can still use API_URL.
   */
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/trpc"; // points to @chronos/api
}

// Convert time to minutes from midnight
export function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function minutesToTimeLabel(value: number) {
  if (!Number.isFinite(value)) return "";
  const total = Math.round(value);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatDurationSince(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getWeekBoundsMonday(referenceDate: Date) {
  const start = new Date(referenceDate);
  const dayIndexMondayFirst = (start.getDay() + 6) % 7; // Sun(0)->6, Mon(1)->0, ...
  start.setDate(start.getDate() - dayIndexMondayFirst);
  start.setHours(0, 0, 0, 0);
  const endExclusive = new Date(start);
  endExclusive.setDate(start.getDate() + 7);
  return { start, endExclusive };
}
