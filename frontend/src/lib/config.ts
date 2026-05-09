// Configuration for API and app constants
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const API_TIMEOUT = 30000; // 30 seconds

export const TOKEN_KEYS = {
  ACCESS_TOKEN: "elv_token",
  REFRESH_TOKEN: "elv_refresh_token",
};

export const ELV_CATEGORIES = [
  "cctv",
  "access_control",
  "fire_alarm",
  "structured_cabling",
  "pa_system",
  "bms",
  "intercom",
  "gate_automation",
  "av_integration",
  "other",
] as const;

export const USER_ROLES = ["customer", "service_provider", "admin"] as const;

export const JOB_STATUSES = [
  "draft",
  "open",
  "applications_received",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const INVOICE_TYPES = [
  "tax_invoice",
  "proforma",
  "boq",
  "amc",
  "progress",
  "credit_note",
] as const;

export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "partially_paid",
  "paid",
  "overdue",
  "disputed",
  "cancelled",
] as const;

export const INVOICE_TEMPLATES = ["classic", "modern", "detailed"] as const;
