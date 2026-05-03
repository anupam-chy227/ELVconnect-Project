import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-gradient-to-r from-elv-iris to-elv-purple text-elv-text-inv shadow-md shadow-elv-purple/20 hover:shadow-glow",
  secondary:
    "border-elv-border bg-elv-surface-2 text-elv-iris shadow-sm hover:border-elv-iris/40 hover:bg-white hover:shadow-md dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-indigo-200 dark:hover:bg-elv-dark-3",
  ghost:
    "border-transparent bg-transparent text-elv-iris shadow-none hover:bg-elv-surface-2/80 dark:text-indigo-200 dark:hover:bg-elv-dark-2",
  danger:
    "border-transparent bg-gradient-to-r from-elv-danger to-rose-700 text-elv-text-inv shadow-md shadow-red-900/15 hover:shadow-lg hover:shadow-red-900/20",
  success:
    "border-transparent bg-gradient-to-r from-elv-success to-emerald-700 text-elv-text-inv shadow-md shadow-emerald-900/15 hover:shadow-lg hover:shadow-emerald-900/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "min-h-7 px-2.5 py-1 text-xs",
  sm: "min-h-8 px-3 py-1.5 text-xs",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-11 px-5 py-2.5 text-sm",
  xl: "min-h-12 px-6 py-3 text-base",
};

const spinnerSizes: Record<ButtonSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-4 w-4",
  xl: "h-5 w-5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  whileHover,
  whileTap,
  transition,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <motion.button
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring disabled:pointer-events-none disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileHover={isDisabled ? undefined : (whileHover ?? { scale: 1.01 })}
      whileTap={isDisabled ? undefined : (whileTap ?? { scale: 0.98 })}
      transition={transition ?? { type: "spring", stiffness: 420, damping: 30 }}
      {...props}
    >
      {loading ? (
        <motion.span
          aria-hidden="true"
          className={cn("shrink-0 rounded-full border-2 border-current border-t-transparent", spinnerSizes[size])}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, ease: "linear", repeat: Infinity }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading ? rightIcon : null}
    </motion.button>
  );
}
