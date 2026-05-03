import type { ELVCategory, UserRole } from "@/types";

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

export const INDIAN_LANGUAGES = [
  { code: "en-IN", label: "English", short: "EN" },
  { code: "hi-IN", label: "Hindi", short: "हिं" },
  { code: "bn-IN", label: "Bengali", short: "BN" },
  { code: "te-IN", label: "Telugu", short: "TE" },
  { code: "mr-IN", label: "Marathi", short: "MR" },
  { code: "ta-IN", label: "Tamil", short: "TA" },
  { code: "ur-IN", label: "Urdu", short: "UR" },
  { code: "gu-IN", label: "Gujarati", short: "GU" },
  { code: "kn-IN", label: "Kannada", short: "KN" },
  { code: "ml-IN", label: "Malayalam", short: "ML" },
  { code: "or-IN", label: "Odia", short: "OR" },
  { code: "pa-IN", label: "Punjabi", short: "PA" },
  { code: "as-IN", label: "Assamese", short: "AS" },
];
