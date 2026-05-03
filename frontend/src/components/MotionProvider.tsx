"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

export type MotionProviderProps = {
  children: ReactNode;
};

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}
