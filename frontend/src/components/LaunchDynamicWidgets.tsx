"use client";

import dynamic from "next/dynamic";

const BusinessReviewSpotlight = dynamic(
  () => import("@/components/widgets/BusinessReviewSpotlight").then((module) => module.BusinessReviewSpotlight),
  { ssr: false },
);

const FloatingLiveStatsWidget = dynamic(() => import("@/components/FloatingLiveStatsWidget"), {
  ssr: false,
});

export function LaunchDynamicWidgets() {
  return (
    <>
      <BusinessReviewSpotlight />
      <FloatingLiveStatsWidget />
    </>
  );
}
