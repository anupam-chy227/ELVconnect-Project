"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type SliderImage = {
  src: string;
  alt: string;
};

export default function PublicImageSlider({
  images,
  className = "",
}: {
  images: SliderImage[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const nextIndex = images.length > 1 ? (activeIndex + 1) % images.length : activeIndex;
  const visibleIndexes = images.length > 1 ? [activeIndex, nextIndex] : [activeIndex];

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [images.length]);

  if (!images.length) {
    return <div className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm ${className}`} />;
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm ${className}`}>
      <div className="relative h-full min-h-[170px] w-full">
        {visibleIndexes.map((index) => {
          const image = images[index];
          const isActive = index === activeIndex;

          return (
            <Image
              key={`${image.src}-${index}`}
              src={image.src}
              alt={isActive ? image.alt : ""}
              aria-hidden={!isActive}
              fill
              priority={index === 0 && activeIndex === 0}
              loading={index === 0 && activeIndex === 0 ? undefined : "lazy"}
              sizes="(min-width: 1024px) 420px, 100vw"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          );
        })}
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/35 px-2 py-1 backdrop-blur">
        {images.map((image, index) => (
          <button
            key={image.alt}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/55"
            }`}
            aria-label={`Show image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
