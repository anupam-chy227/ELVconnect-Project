"use client";

import { useEffect, useState } from "react";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import { landingActivityItems, landingStories } from "@/lib/landing-content";

const accentClasses = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary-fixed",
};

export function LandingCenterpiece() {
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStoryIndex((prev) => (prev + 1) % landingStories.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const story = landingStories[storyIndex];
  const scrollingItems = [...landingActivityItems, ...landingActivityItems];
  const goToPreviousStory = () => {
    setStoryIndex((prev) =>
      prev === 0 ? landingStories.length - 1 : prev - 1
    );
  };
  const goToNextStory = () => {
    setStoryIndex((prev) => (prev + 1) % landingStories.length);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="relative flex h-[220px] flex-col justify-between overflow-hidden rounded-xl border border-white bg-white/80 p-4 shadow-lg shadow-primary/10 backdrop-blur-[20px]">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-1.5 text-lg font-semibold text-on-background">
              Live Platform Activity
              <span className="text-xs font-medium text-primary opacity-80">
                {"(\u0932\u093e\u0907\u0935)"}
              </span>
            </h2>
            <p className="mt-0.5 text-[11px] font-medium text-on-surface-variant">
              Real-time national deployment metrics
            </p>
          </div>
          <span className="relative mt-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary-fixed opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-tertiary-fixed-dim"></span>
          </span>
        </div>

        <div className="group relative flex-1 overflow-hidden">
          <div className="animate-scroll-up absolute w-full space-y-2 group-hover:[animation-play-state:paused]">
            {scrollingItems.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${accentClasses[item.accent]}`}
                  ></span>
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${accentClasses[item.accent]}`}
                  ></span>
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-on-background">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <div className="relative flex min-h-[250px] flex-col overflow-hidden rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/20">
        <div className="absolute right-0 top-0 p-4 opacity-15">
          <MaterialSymbol name="format_quote" className="text-[42px]" />
        </div>

        <div className="relative z-10 flex h-full flex-col p-4">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-fixed">
                {String(storyIndex + 1).padStart(2, "0")} /{" "}
                {String(landingStories.length).padStart(2, "0")}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-on-primary">
                Client Success Stories
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goToPreviousStory}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-on-primary transition hover:bg-white/20"
                aria-label="Previous story"
              >
                <MaterialSymbol name="chevron_left" className="text-[19px]" />
              </button>
              <button
                type="button"
                onClick={goToNextStory}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-on-primary transition hover:bg-white/20"
                aria-label="Next story"
              >
                <MaterialSymbol name="chevron_right" className="text-[19px]" />
              </button>
            </div>
          </div>

          <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_220px]">
            <div className="flex flex-col justify-center">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="flex text-tertiary-fixed">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <MaterialSymbol
                      key={index}
                      name="star"
                      filled
                      className="text-[16px]"
                    />
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-primary-fixed">
                  Verified Partner
                  <span className="opacity-80">
                    {"(\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924)"}
                  </span>
                </span>
              </div>

              <p className="text-sm leading-6 text-on-primary transition-all duration-500">
                &quot;{story.quote}&quot;
              </p>
            </div>

            <div className="flex flex-col justify-between border-t border-white/20 pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-fixed">
                  Professional impact
                </p>
                <div className="mt-3 space-y-2 text-xs text-primary-fixed">
                  <p>Verified engineer network</p>
                  <p>Project-ready ELV specialists</p>
                  <p>City-wise deployment support</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                  {story.company
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{story.company}</p>
                  <p className="mt-0.5 text-[11px] text-primary-fixed">
                    {story.meta}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {landingStories.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setStoryIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === storyIndex ? "w-6 bg-white" : "w-2.5 bg-white/35"
                }`}
                aria-label={`Show success story ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
