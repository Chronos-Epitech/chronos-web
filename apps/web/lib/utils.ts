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
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001/trpc"
  ); // points to @chronos/api
}
