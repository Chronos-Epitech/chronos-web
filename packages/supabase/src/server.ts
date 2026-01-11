import { createClient } from "@supabase/supabase-js";
import { Database } from "@chronos/types";

export function createServerSupabaseClient(accessToken?: string | null) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // Use passed accessToken (API). Next.js should use the Next-only helper instead.
      accessToken: async () => accessToken ?? null,
    },
  );
}
