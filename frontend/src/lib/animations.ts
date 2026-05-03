import type { MotionProps, Transition } from "framer-motion";

const easeOut: Transition["ease"] = "easeOut";

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: easeOut },
} satisfies MotionProps;

export const cardHover = {
  whileHover: {
    y: -2,
    boxShadow: "0 12px 40px rgba(79,70,229,0.16)",
    transition: { duration: 0.15 },
  },
  whileTap: { scale: 0.99 },
} satisfies MotionProps;

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.06 } },
} satisfies MotionProps;

export const fadeSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: easeOut },
} satisfies MotionProps;

export const counterAnimation = {
  duration: 1.5,
  separator: ",",
} as const;
