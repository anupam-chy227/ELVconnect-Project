import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

export function progressWidthClass(value: number) {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));

  if (percentage <= 0) return "w-0";
  if (percentage <= 5) return "w-[5%]";
  if (percentage <= 10) return "w-[10%]";
  if (percentage <= 15) return "w-[15%]";
  if (percentage <= 20) return "w-[20%]";
  if (percentage <= 25) return "w-1/4";
  if (percentage <= 30) return "w-[30%]";
  if (percentage <= 35) return "w-[35%]";
  if (percentage <= 40) return "w-[40%]";
  if (percentage <= 45) return "w-[45%]";
  if (percentage <= 50) return "w-1/2";
  if (percentage <= 55) return "w-[55%]";
  if (percentage <= 60) return "w-[60%]";
  if (percentage <= 65) return "w-[65%]";
  if (percentage <= 70) return "w-[70%]";
  if (percentage <= 75) return "w-3/4";
  if (percentage <= 80) return "w-4/5";
  if (percentage <= 85) return "w-[85%]";
  if (percentage <= 90) return "w-[90%]";
  if (percentage <= 95) return "w-[95%]";
  return "w-full";
}
