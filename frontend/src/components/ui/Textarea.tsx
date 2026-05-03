import type { TextareaHTMLAttributes } from "react";
import { cn } from "./utils";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style"> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, className, id, disabled, ...props }: TextareaProps) {
  return (
    <label className="grid gap-1.5 text-left" htmlFor={id}>
      {label ? <span className="text-xs font-semibold text-foreground">{label}</span> : null}
      <textarea
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-28 resize-y rounded-md border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-all duration-200 placeholder:text-muted-foreground hover:border-border-strong focus:border-secondary focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
          error ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-border-subtle",
          className,
        )}
        disabled={disabled}
        id={id}
        {...props}
      />
      {error ? (
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
