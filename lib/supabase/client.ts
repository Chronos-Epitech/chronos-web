"use client";

import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase-types";
import { useSession } from "@clerk/nextjs";

export function useSupabaseClerkClient() {
  const { session } = useSession();

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      accessToken: async () => (session ? await session.getToken() : null),
    }
  );
}
