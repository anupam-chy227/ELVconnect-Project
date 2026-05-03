import { TOKEN_KEYS } from "./config";
import type { UserRole } from "@/types/api";

const TOKEN_COOKIE_NAME = "elv_token";
const REFRESH_COOKIE_NAME = "elv_refresh_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type TokenUser = {
  id: string;
  email: string;
  role: UserRole;
};

type JwtPayload = {
  id?: string;
  _id?: string;
  sub?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser()) return;

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (!isBrowser()) return;

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${normalized}${"=".repeat((4 - (normalized.length % 4)) % 4)}`;
  return globalThis.atob(padded);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "customer" || value === "service_provider" || value === "admin";
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(payload));

    if (!isRecord(parsed)) {
      return null;
    }

    return {
      id: typeof parsed.id === "string" ? parsed.id : undefined,
      _id: typeof parsed._id === "string" ? parsed._id : undefined,
      sub: typeof parsed.sub === "string" ? parsed.sub : undefined,
      userId: typeof parsed.userId === "string" ? parsed.userId : undefined,
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      role: isUserRole(parsed.role) ? parsed.role : undefined,
      exp: typeof parsed.exp === "number" ? parsed.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function saveTokens(token: string, refreshToken: string): void {
  if (!isBrowser()) return;

  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  setCookie(TOKEN_COOKIE_NAME, token, COOKIE_MAX_AGE_SECONDS);
  setCookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_MAX_AGE_SECONDS);
}

export function saveToken(token: string): void {
  if (!isBrowser()) return;

  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
  setCookie(TOKEN_COOKIE_NAME, token, COOKIE_MAX_AGE_SECONDS);
}

export function getToken(): string | null {
  if (!isBrowser()) return null;

  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;

  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
}

export function clearTokens(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  deleteCookie(TOKEN_COOKIE_NAME);
  deleteCookie(REFRESH_COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  const token = getToken();

  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp > Math.floor(Date.now() / 1000);
}

export function getUserFromToken(): TokenUser | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  const id = payload?.id ?? payload?._id ?? payload?.userId ?? payload?.sub;

  if (!payload?.email || !payload.role || !id) {
    return null;
  }

  return {
    id,
    email: payload.email,
    role: payload.role,
  };
}
