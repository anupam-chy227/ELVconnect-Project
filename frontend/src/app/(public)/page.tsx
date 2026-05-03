"use client";

import { useEffect } from "react";
import PremiumLanding from "@/components/Landing/PremiumLanding";

export default function Home() {
  useEffect(() => {
    sessionStorage.setItem("elv-last-public-landing-visit", String(Date.now()));
    sessionStorage.removeItem("elv-dashboard-navigation-intent");
  }, []);

  return <PremiumLanding />;
}
