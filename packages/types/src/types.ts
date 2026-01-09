// Shared types across apps
import type { Constants } from "./supabase-types";
import type { SessionAuthObject } from "@clerk/backend";

export type Role = (typeof Constants.public.Enums.role)[number];

export type DataCtx = {
  auth: SessionAuthObject;
  role: Role;
  accessToken: string | null;
};
