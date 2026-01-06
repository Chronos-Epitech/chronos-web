"use client";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { useAuth } from "@clerk/nextjs";
import type { AppRouter } from "@chronos/api/src/routers";
import { useMemo } from "react";
import { getApiUrl } from "@/lib/utils";

export function createBrowserTrpcClient(
  getToken: () => Promise<string | null>
) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: getApiUrl(),
        async headers() {
          const token = await getToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

/**
 * Convenience hook for Client Components.
 *
 * Usage:
 * const trpc = useTrpcClient();
 * await trpc.team.getAll.query()
 */
export function useTrpcClient() {
  const { getToken } = useAuth();
  return useMemo(() => createBrowserTrpcClient(getToken), [getToken]);
}
