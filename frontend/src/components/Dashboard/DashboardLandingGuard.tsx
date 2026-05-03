"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const LANDING_VISIT_KEY = "elv-last-public-landing-visit";
const DASHBOARD_INTENT_KEY = "elv-dashboard-navigation-intent";

export function markDashboardNavigationIntent() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DASHBOARD_INTENT_KEY, String(Date.now()));
}

export default function DashboardLandingGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/dashboard") return;

    const lastLandingVisit = Number(sessionStorage.getItem(LANDING_VISIT_KEY) || 0);
    const dashboardIntent = Number(sessionStorage.getItem(DASHBOARD_INTENT_KEY) || 0);
    const now = Date.now();
    const cameFromLandingJustNow = lastLandingVisit > 0 && now - lastLandingVisit < 6000;
    const hasRecentDashboardIntent = dashboardIntent > 0 && now - dashboardIntent < 15000;

    if (cameFromLandingJustNow && !hasRecentDashboardIntent) {
      sessionStorage.removeItem(LANDING_VISIT_KEY);
      router.replace("/");
      return;
    }

    sessionStorage.removeItem(LANDING_VISIT_KEY);
    sessionStorage.removeItem(DASHBOARD_INTENT_KEY);
  }, [pathname, router]);

  return null;
}
