import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "style"> & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
};

export function Input({ label, error, hint, leftIcon, className, id, disabled, ...props }: InputProps) {
  return (
    <label className="grid gap-1.5 text-left" htmlFor={id}>
      {label ? <span className="text-xs font-semibold text-foreground">{label}</span> : null}
      <span
        className={cn(
          "flex min-h-10 items-center gap-2 rounded-md border bg-surface px-3 text-sm shadow-sm transition-all duration-200 hover:border-border-strong focus-within:border-secondary focus-within:shadow-focus",
          error ? "border-rose-300 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10" : "border-border-subtle",
          disabled ? "cursor-not-allowed bg-surface-muted opacity-70" : null,
        )}
      >
        {leftIcon ? <span className="text-muted-foreground">{leftIcon}</span> : null}
        <input
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full bg-transparent py-2 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
            className,
          )}
          disabled={disabled}
          id={id}
          {...props}
        />
      </span>
      {error ? (
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
