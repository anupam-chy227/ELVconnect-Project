"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card } from "./Card";
import { cn } from "./utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconColor?: string;
  sparkline?: number[];
  loading?: boolean;
}

type SparklinePoint = {
  index: number;
  value: number;
};

function getChangeTone(change?: number) {
  if (change === undefined || change === 0) {
    return {
      className:
        "border-elv-border bg-elv-surface-2 text-elv-text-2 dark:border-elv-dark-border dark:bg-elv-dark-2 dark:text-elv-text-3",
      Icon: ArrowRight,
      prefix: "",
    };
  }

  if (change > 0) {
    return {
      className:
        "border-emerald-200 bg-emerald-50 text-elv-success dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300",
      Icon: ArrowUpRight,
      prefix: "+",
    };
  }

  return {
    className:
      "border-red-200 bg-red-50 text-elv-danger dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300",
    Icon: ArrowDownRight,
    prefix: "",
  };
}

function normalizeSparkline(sparkline: number[] = []): SparklinePoint[] {
  return sparkline.map((value, index) => ({ index, value }));
}

function LoadingBlock({ className }: { className: string }) {
  return <span className={cn("block animate-pulse rounded-md bg-elv-border/70 dark:bg-elv-dark-border/70", className)} />;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  sparkline,
  loading = false,
}: StatCardProps) {
  const gradientId = useId().replace(/:/g, "");
  const sparklineData = normalizeSparkline(sparkline);
  const tone = getChangeTone(change);
  const hasSparkline = sparklineData.length > 1;
  const Icon = tone.Icon;

  return (
    <Card
      variant="stat"
      padding="lg"
      aria-label={`${label}: ${value}`}
      aria-busy={loading || undefined}
      className="min-h-[168px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-elv-text-3 dark:text-slate-400">{label}</p>
          {loading ? (
            <LoadingBlock className="mt-3 h-8 w-28" />
          ) : (
            <p className="mt-3 truncate text-2xl font-semibold text-elv-text dark:text-white">{value}</p>
          )}
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-elv-iris text-white shadow-md shadow-elv-iris/20"
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {loading ? (
            <LoadingBlock className="h-6 w-32" />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
                  tone.className,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {change === undefined ? "0%" : `${tone.prefix}${change}%`}
              </span>
              <span className="text-xs font-semibold text-elv-text-3 dark:text-slate-400">{changeLabel}</span>
            </div>
          )}
        </div>

        {hasSparkline ? (
          <div className="h-14 w-28 shrink-0" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`stat-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={change !== undefined && change < 0 ? "#DC2626" : "#4F46E5"} stopOpacity={0.34} />
                    <stop offset="100%" stopColor={change !== undefined && change < 0 ? "#DC2626" : "#4F46E5"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={change !== undefined && change < 0 ? "#DC2626" : "#4F46E5"}
                  strokeWidth={2}
                  fill={`url(#stat-${gradientId})`}
                  isAnimationActive={!loading}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
