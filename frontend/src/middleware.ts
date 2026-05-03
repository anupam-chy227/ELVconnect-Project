import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/types/api";

type MiddlewareJwtPayload = {
  id?: string;
  _id?: string;
  sub?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
};

const dashboardByRole: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  service_provider: "/dashboard/engineer",
  admin: "/dashboard/admin",
};

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

function decodeToken(token: string): MiddlewareJwtPayload | null {
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

function isExpired(payload: MiddlewareJwtPayload) {
  return typeof payload.exp === "number" && payload.exp <= Math.floor(Date.now() / 1000);
}

function requiredRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/engineer")) return "service_provider";
  if (pathname.startsWith("/dashboard/customer") || pathname.startsWith("/dashboard/client")) return "customer";
  return null;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";
  url.search = `?returnUrl=${encodeURIComponent(`${request.nextUrl.pathname}${request.nextUrl.search}`)}`;
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("elv_token")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const payload = decodeToken(token);

  if (!payload?.role || isExpired(payload)) {
    return redirectToLogin(request);
  }

  const requiredRole = requiredRoleForPath(request.nextUrl.pathname);

  if (requiredRole && payload.role !== requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardByRole[payload.role];
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
