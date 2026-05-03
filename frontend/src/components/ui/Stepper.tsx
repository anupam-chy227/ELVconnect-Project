"use client";

import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { cn, progressWidthClass } from "./utils";

export type StepperStep = {
  label: string;
  description?: string;
  status?: "complete" | "current" | "upcoming" | "error";
};

export type StepperProps = {
  steps: StepperStep[];
  orientation?: "horizontal" | "vertical";
  progress?: number;
  className?: string;
};

const statusStyles = {
  complete: {
    item: "border-emerald-200 bg-success-subtle text-success",
    marker: "bg-success text-white ring-success/20",
    bar: "bg-success",
    icon: CheckCircle2,
  },
  current: {
    item: "border-primary/35 bg-primary-subtle text-primary shadow-sm",
    marker: "bg-gradient-to-b from-primary to-primary-container text-white ring-primary/25",
    bar: "bg-gradient-to-r from-primary to-secondary",
    icon: Clock3,
  },
  upcoming: {
    item: "border-border-subtle bg-surface text-muted-foreground",
    marker: "bg-surface-muted text-muted-foreground ring-border",
    bar: "bg-border-subtle",
    icon: Circle,
  },
  error: {
    item: "border-rose-200 bg-danger-subtle text-danger",
    marker: "bg-danger text-white ring-danger/20",
    bar: "bg-danger",
    icon: Circle,
  },
};

const horizontalGridClassNames: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

export function Stepper({ steps, orientation = "horizontal", progress, className }: StepperProps) {
  const progressValue =
    progress ?? Math.round((Math.max(steps.findIndex((step) => step.status === "current"), 0) + 1) / steps.length * 100);

  return (
    <div className={cn("rounded-md border border-border-subtle bg-surface p-4 shadow-card", className)}>
      {orientation === "horizontal" ? (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase text-primary">Workflow progress</p>
            <p className="font-mono text-xs font-black text-foreground">{progressValue}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400 transition-all duration-500 ease-out",
                progressWidthClass(progressValue),
              )}
            />
          </div>
        </div>
      ) : null}

      <ol
        className={cn(
          orientation === "horizontal"
            ? cn("grid gap-3", horizontalGridClassNames[steps.length] ?? "md:grid-cols-6")
            : "grid gap-3",
        )}
      >
        {steps.map((step, index) => {
          const status = step.status ?? "upcoming";
          const styles = statusStyles[status];
          const Icon = styles.icon;

          return (
            <li key={`${step.label}-${index}`} className={cn("relative rounded-md border p-3 transition-all duration-300", styles.item)}>
              {orientation === "horizontal" && index < steps.length - 1 ? (
                <span className={cn("pointer-events-none absolute left-[calc(50%+1rem)] top-7 hidden h-0.5 w-[calc(100%-2rem)] md:block", styles.bar)} />
              ) : null}
              <div className="relative flex items-start gap-3">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ring-4", styles.marker)}>
                  {status === "complete" ? <Icon className="h-4 w-4" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black">{step.label}</p>
                  {step.description ? <p className="mt-1 text-[11px] font-semibold opacity-80">{step.description}</p> : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
