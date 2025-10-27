import { Role } from "@chronos/types";

export function assertManager(role: Role) {
  if (role !== "manager" && role !== "admin") throw new Error("FORBIDDEN");
}

export function assertAdmin(role: Role) {
  if (role !== "admin") throw new Error("FORBIDDEN");
}
