import type { Role } from "./types";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: Role;
    } | null;
  }
}
