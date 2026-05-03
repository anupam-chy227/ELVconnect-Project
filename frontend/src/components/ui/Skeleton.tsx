import type { HTMLAttributes } from "react";
import { cn } from "./utils";

type SkeletonStatusProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

type SkeletonTextProps = SkeletonStatusProps & {
  lines?: number;
  lineClassName?: string;
  lastLineClassName?: string;
};

type SkeletonAvatarProps = SkeletonStatusProps & {
  size?: "sm" | "md" | "lg" | "xl";
};

type SkeletonTableProps = SkeletonStatusProps & {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
};

type SkeletonCardProps = SkeletonStatusProps & {
  lines?: number;
  showAvatar?: boolean;
};

const avatarSizeClassNames: Record<NonNullable<SkeletonAvatarProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const tableCellWidths = ["w-36", "w-28", "w-44", "w-24", "w-32", "w-20"];

function getCount(value: number | undefined, fallback: number) {
  return Math.max(1, Math.floor(value ?? fallback));
}

function LoadingStatus({
  label,
  className,
  children,
  role = "status",
  "aria-label": ariaLabel,
  "aria-busy": ariaBusy = true,
  ...props
}: SkeletonStatusProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel ?? label ?? "Loading content"}
      aria-busy={ariaBusy}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  lineClassName,
  lastLineClassName = "w-2/3",
  className,
  label = "Loading text",
  ...props
}: SkeletonTextProps) {
  const lineCount = getCount(lines, 3);

  return (
    <LoadingStatus label={label} className={cn("grid gap-2", className)} {...props}>
      {Array.from({ length: lineCount }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={cn(
            "skeleton block h-3 rounded-md",
            index === lineCount - 1 && lineCount > 1 ? lastLineClassName : "w-full",
            lineClassName,
          )}
        />
      ))}
    </LoadingStatus>
  );
}

export function SkeletonAvatar({
  size = "md",
  className,
  label = "Loading avatar",
  ...props
}: SkeletonAvatarProps) {
  return (
    <LoadingStatus
      label={label}
      className={cn("skeleton shrink-0 rounded-full", avatarSizeClassNames[size], className)}
      {...props}
    />
  );
}

export function SkeletonCard({
  lines = 3,
  showAvatar = true,
  className,
  label = "Loading card",
  ...props
}: SkeletonCardProps) {
  const lineCount = getCount(lines, 3);

  return (
    <LoadingStatus
      label={label}
      className={cn(
        "rounded-lg border border-elv-border bg-elv-surface p-5 shadow-sm dark:border-elv-dark-border dark:bg-elv-dark-2",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3" aria-hidden="true">
        {showAvatar ? <span className="skeleton h-11 w-11 shrink-0 rounded-full" /> : null}
        <div className="grid flex-1 gap-2">
          <span className="skeleton h-4 w-2/3 rounded-md" />
          <span className="skeleton h-3 w-1/2 rounded-md" />
        </div>
      </div>
      <div className="mt-5 grid gap-2" aria-hidden="true">
        {Array.from({ length: lineCount }).map((_, index) => (
          <span
            key={index}
            className={cn("skeleton h-3 rounded-md", index === lineCount - 1 && lineCount > 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3" aria-hidden="true">
        <span className="skeleton h-10 rounded-md" />
        <span className="skeleton h-10 rounded-md" />
        <span className="skeleton h-10 rounded-md" />
      </div>
    </LoadingStatus>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  label = "Loading table",
  ...props
}: SkeletonTableProps) {
  const rowCount = getCount(rows, 5);
  const columnCount = getCount(columns, 4);

  return (
    <LoadingStatus
      label={label}
      className={cn(
        "overflow-hidden rounded-lg border border-elv-border bg-elv-surface shadow-sm dark:border-elv-dark-border dark:bg-elv-dark-1",
        className,
      )}
      {...props}
    >
      <div className="overflow-x-auto" aria-hidden="true">
        <table className="w-full min-w-[640px] text-left">
          {showHeader ? (
            <thead className="bg-elv-surface-2 dark:bg-elv-dark-2">
              <tr>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <span className={cn("skeleton block h-3 rounded-md", tableCellWidths[index % tableCellWidths.length])} />
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody className="divide-y divide-elv-border dark:divide-elv-dark-border">
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, columnIndex) => (
                  <td key={columnIndex} className="px-4 py-4">
                    <span
                      className={cn(
                        "skeleton block h-4 rounded-md",
                        tableCellWidths[(rowIndex + columnIndex) % tableCellWidths.length],
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LoadingStatus>
  );
}

export function SkeletonStat({
  className,
  label = "Loading statistic",
  ...props
}: SkeletonStatusProps) {
  return (
    <LoadingStatus
      label={label}
      className={cn(
        "rounded-lg border border-elv-border bg-elv-surface p-5 shadow-sm dark:border-elv-dark-border dark:bg-elv-dark-2",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4" aria-hidden="true">
        <div className="grid flex-1 gap-3">
          <span className="skeleton h-3 w-24 rounded-md" />
          <span className="skeleton h-8 w-32 rounded-md" />
        </div>
        <span className="skeleton h-11 w-11 shrink-0 rounded-full" />
      </div>
      <div className="mt-6 flex items-end justify-between gap-4" aria-hidden="true">
        <span className="skeleton h-6 w-28 rounded-full" />
        <span className="skeleton h-12 w-28 rounded-md" />
      </div>
    </LoadingStatus>
  );
}
