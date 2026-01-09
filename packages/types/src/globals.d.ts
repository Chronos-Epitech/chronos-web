export {};

// Shared roles across apps
import type { Constants } from "./supabase-types";
import type { AuthObject } from "@clerk/types";

export type Role = (typeof Constants.public.Enums.role)[number];

export type DataCtx = {
  auth: AuthObject;
  role: Role;
  accessToken: string | null;
};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: Role;
    } | null;
  }
}
