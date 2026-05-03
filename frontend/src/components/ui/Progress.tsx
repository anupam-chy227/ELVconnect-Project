import { cn, progressWidthClass } from "./utils";

export type ProgressProps = {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
};

const toneClassNames = {
  primary: {
    text: "text-primary",
    bar: "bg-gradient-to-r from-primary to-secondary",
  },
  success: {
    text: "text-success",
    bar: "bg-gradient-to-r from-success to-emerald-400",
  },
  warning: {
    text: "text-warning",
    bar: "bg-gradient-to-r from-warning to-amber-300",
  },
  danger: {
    text: "text-danger",
    bar: "bg-gradient-to-r from-danger to-rose-400",
  },
};

export function Progress({ value, max = 100, label, showValue = true, tone = "primary", className }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={cn("grid gap-2", className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-3 text-xs">
          {label ? <span className="font-semibold tracking-tight text-slate-700 dark:text-slate-200">{label}</span> : <span />}
          {showValue ? <span className={cn("font-mono font-semibold", toneClassNames[tone].text)}>{percentage}%</span> : null}
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            toneClassNames[tone].bar,
            progressWidthClass(percentage),
          )}
        />
      </div>
    </div>
  );
}
