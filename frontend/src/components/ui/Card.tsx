"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./utils";

export type CardVariant =
  | "default"
  | "glass"
  | "stat"
  | "interactive"
  | "danger-zone"
  | "dark-glass"
  | "panel"
  | "elevated";

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardAccent = "primary" | "success" | "warning" | "danger" | "info";

export type CardProps = Omit<HTMLMotionProps<"section">, "children" | "title" | "style"> & {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  accent?: CardAccent;
  interactive?: boolean;
  children?: ReactNode;
};

export type CardHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
};

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const cardBaseClassName =
  "group/card relative overflow-hidden rounded-lg border transition-all duration-200 ease-out focus-within:border-elv-iris/45 focus-within:ring-4 focus-within:ring-primary-ring";

export const cardPaddingClassNames: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export const cardVariantClassNames: Record<CardVariant, string> = {
  default:
    "border-elv-border bg-elv-surface shadow-md dark:border-elv-dark-border dark:bg-elv-dark-1",
  glass:
    "border-white/30 bg-white/60 shadow-glass backdrop-blur-xl dark:border-elv-dark-border/70 dark:bg-elv-dark-1/60",
  stat:
    "border-elv-border bg-elv-surface shadow-md dark:border-elv-dark-border dark:bg-elv-dark-1",
  interactive:
    "cursor-pointer border-elv-border bg-elv-surface shadow-md hover:-translate-y-1 hover:border-elv-iris/40 hover:shadow-lg dark:border-elv-dark-border dark:bg-elv-dark-1",
  "danger-zone":
    "border-red-200 bg-red-50/80 shadow-md dark:border-red-900/60 dark:bg-red-950/20",
  "dark-glass":
    "border-white/10 bg-black/40 text-white shadow-glass backdrop-blur-xl",
  panel:
    "border-elv-border bg-elv-surface-2 shadow-sm hover:border-elv-iris/25 dark:border-elv-dark-border dark:bg-elv-dark-2",
  elevated:
    "border-elv-border bg-elv-surface shadow-lg hover:border-elv-iris/25 dark:border-elv-dark-border dark:bg-elv-dark-1",
};

const cardAccentClassNames: Record<CardAccent, string> = {
  primary: "bg-gradient-to-r from-elv-iris to-elv-purple",
  success: "bg-gradient-to-r from-elv-success to-emerald-600",
  warning: "bg-gradient-to-r from-elv-warning to-amber-500",
  danger: "bg-gradient-to-r from-elv-danger to-rose-700",
  info: "bg-gradient-to-r from-elv-info to-sky-500",
};

export function CardHeader({
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 border-b border-border-subtle pb-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    >
      {title || subtitle ? (
        <div className="min-w-0">
          {title ? <h2 className="text-base font-bold text-current">{title}</h2> : null}
          {subtitle ? <p className="mt-1 max-w-2xl text-xs leading-5 text-current opacity-70">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, ...props }: CardBodyProps) {
  return <div className={cn("relative", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "relative mt-4 flex flex-col gap-2 border-t border-border-subtle pt-3 sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  title,
  description,
  action,
  variant = "default",
  padding = "md",
  accent = "primary",
  interactive,
  className,
  whileHover,
  transition,
  children,
  ...props
}: CardProps) {
  const shouldLift = interactive || variant === "interactive";

  return (
    <motion.section
      className={cn(
        cardBaseClassName,
        cardVariantClassNames[variant],
        cardPaddingClassNames[padding],
        className,
      )}
      initial={props.initial ?? { opacity: 0, y: 8 }}
      whileInView={props.whileInView ?? { opacity: 1, y: 0 }}
      viewport={props.viewport ?? { once: true, margin: "-24px" }}
      whileHover={whileHover ?? (shouldLift ? { y: -4, scale: 1.01 } : { y: -2 })}
      whileTap={props.whileTap ?? (shouldLift ? { scale: 0.99 } : undefined)}
      transition={transition ?? { type: "spring", stiffness: 300, damping: 26 }}
      {...props}
    >
      {variant === "stat" ? (
        <span
          aria-hidden="true"
          className={cn("absolute inset-x-0 top-0 h-1", cardAccentClassNames[accent])}
        />
      ) : null}
      {title || description || action ? (
        <CardHeader title={title} subtitle={description} action={action} className="mb-4" />
      ) : null}
      {title || description || action ? <CardBody>{children}</CardBody> : children}
    </motion.section>
  );
}
