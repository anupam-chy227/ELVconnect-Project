"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import type { UserRole } from "@/types";

export type ProductRole = "CLIENT" | "ENGINEER" | "ADMIN";

const roleLabels: Record<UserRole, ProductRole> = {
  customer: "CLIENT",
  service_provider: "ENGINEER",
  admin: "ADMIN",
};

export function useRole() {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(
    () => ({
      role,
      productRole: role ? roleLabels[role] : undefined,
      isClient: role === "customer",
      isEngineer: role === "service_provider",
      isAdmin: role === "admin",
    }),
    [role],
  );
}
