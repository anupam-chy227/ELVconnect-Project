import type { SelectHTMLAttributes } from "react";
import { cn } from "./utils";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "style"> & {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({ label, error, hint, options, placeholder, className, id, disabled, ...props }: SelectProps) {
  return (
    <label className="grid gap-1.5 text-left" htmlFor={id}>
      {label ? <span className="text-xs font-semibold text-foreground">{label}</span> : null}
      <select
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-10 rounded-md border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-all duration-200 hover:border-border-strong focus:border-secondary focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
          error ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-border-subtle",
          className,
        )}
        disabled={disabled}
        id={id}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
