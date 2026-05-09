import type { ELVCategory, UserRole } from "@/types";
import { LANGUAGES } from "@/lib/experience-preferences";

export const USER_ROLES: Record<"CLIENT" | "ENGINEER" | "ADMIN", UserRole> = {
  CLIENT: "customer",
  ENGINEER: "service_provider",
  ADMIN: "admin",
};

export const ELV_CATEGORIES: Array<{ id: ELVCategory; label: string }> = [
  { id: "cctv", label: "CCTV" },
  { id: "fire_alarm", label: "Fire Safety" },
  { id: "access_control", label: "Access Control" },
  { id: "structured_cabling", label: "Data Networking" },
  { id: "pa_system", label: "PA System" },
  { id: "bms", label: "BMS" },
  { id: "intercom", label: "Intercom" },
  { id: "gate_automation", label: "Gate Automation" },
  { id: "av_integration", label: "AV Integration" },
  { id: "other", label: "Other" },
];

export const INDIAN_LANGUAGES = LANGUAGES.map(({ code, label, native, short }) => ({
  code,
  label,
  native,
  short,
}));
