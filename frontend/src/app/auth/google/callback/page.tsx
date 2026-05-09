"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { decodeJwtPayload } from "@/lib/auth";
import { markDashboardNavigationIntent } from "@/components/Dashboard/DashboardLandingGuard";

function getDashboardPath(token: string) {
  const role = decodeJwtPayload(token)?.role;

  if (role === "admin") return "/dashboard/admin";
  if (role === "service_provider") return "/dashboard/engineer";
  if (role === "customer") return "/dashboard/customer";
  return "/dashboard";
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    if (accessToken) {
      apiClient.setAccessToken(accessToken);
      markDashboardNavigationIntent();
      router.replace(getDashboardPath(accessToken));
      return;
    }

    router.replace("/login?google=failed");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <p className="text-sm font-semibold text-gray-900">Completing Google sign-in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <p className="text-sm font-semibold text-gray-900">Completing Google sign-in...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
