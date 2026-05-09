"use client";

import Image from "next/image";
import type { Theme } from "@/contexts/ThemeContext";
import { cn } from "@/components/ui/utils";

const logoByTheme: Record<Theme, string> = {
  light: "/elv-verse-logo-navbar.png",
  dark: "/elv-verse-logo-navbar.png",
};

type ThemeLogoProps = {
  alt?: string;
  className?: string;
  forceTheme?: Theme;
  height?: number;
  priority?: boolean;
  sizes?: string;
  width?: number;
};

export default function ThemeLogo({
  alt = "ELV Verse",
  className,
  forceTheme,
  height = 318,
  priority = false,
  sizes = "360px",
  width = 1537,
}: ThemeLogoProps) {
  if (forceTheme || logoByTheme.light === logoByTheme.dark) {
    return (
      <Image
        src={forceTheme ? logoByTheme[forceTheme] : logoByTheme.light}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <>
      <Image
        src={logoByTheme.light}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn("object-contain dark:hidden", className)}
      />
      <Image
        src={logoByTheme.dark}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  );
}
