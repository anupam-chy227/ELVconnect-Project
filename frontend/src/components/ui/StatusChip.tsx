import { cn } from "./utils";

export type StatusTone = "approved" | "completed" | "pending" | "in_progress" | "delayed" | "rejected" | "draft";

const statusClasses: Record<StatusTone, string> = {
  approved: "border-emerald-200 bg-success-subtle text-success",
  completed: "border-emerald-200 bg-success-subtle text-success",
  pending: "border-amber-200 bg-warning-subtle text-warning",
  in_progress: "border-blue-200 bg-secondary-subtle text-secondary",
  delayed: "border-rose-200 bg-danger-subtle text-danger",
  rejected: "border-rose-200 bg-danger-subtle text-danger",
  draft: "border-border bg-surface-muted text-muted-foreground",
};

export type StatusChipProps = {
  status: StatusTone | string;
  label?: string;
  className?: string;
};

export function StatusChip({ status, label, className }: StatusChipProps) {
  const tone = status in statusClasses ? (status as StatusTone) : "draft";
  const text = label ?? status.replaceAll("_", " ");

  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold capitalize", statusClasses[tone], className)}>
      {text}
    </span>
  );
}
