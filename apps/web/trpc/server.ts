import "server-only";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@chronos/api/src/routers";
import { auth } from "@clerk/nextjs/server";
import { getApiUrl } from "@/lib/utils";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      async headers() {
        const { getToken } = await auth();
        const token = await getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
