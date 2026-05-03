"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./utils";

export type HoverScaleProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  scale?: number;
  stiffness?: number;
};

export function HoverScale({
  children,
  className,
  scale = 1.02,
  stiffness = 200,
  transition,
  ...props
}: HoverScaleProps) {
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={{ scale }}
      transition={transition ?? { type: "spring", stiffness }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
