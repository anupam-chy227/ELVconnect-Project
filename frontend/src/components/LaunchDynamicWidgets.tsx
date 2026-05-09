"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const FloatingLiveStatsWidget = dynamic(() => import("@/components/FloatingLiveStatsWidget"), {
  ssr: false,
});

const HIDDEN_LIVE_WIDGET_ROUTES = new Set(["/login", "/register"]);

function shouldHideLiveWidget(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return (
    HIDDEN_LIVE_WIDGET_ROUTES.has(pathname) ||
    pathname.startsWith("/register/") ||
    pathname.startsWith("/auth/")
  );
}

export function LaunchDynamicWidgets() {
  const pathname = usePathname();

  if (shouldHideLiveWidget(pathname)) {
    return null;
  }

  return <FloatingLiveStatsWidget />;
}
