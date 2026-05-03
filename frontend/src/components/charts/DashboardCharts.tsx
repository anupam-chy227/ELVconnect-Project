"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/components/ui/utils";

export type RevenuePoint = {
  label: string;
  revenue: number;
};

export type JobsByCategoryPoint = {
  label: string;
  cctv: number;
  fire: number;
  access: number;
  network: number;
};

export type EarningsPoint = {
  label: string;
  earnings: number;
};

export type StatusDistributionPoint = {
  name: string;
  value: number;
};

const lightPalette = {
  iris: "#4F46E5",
  violet: "#7C3AED",
  sky: "#0284C7",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  grid: "rgba(224, 222, 255, 0.4)",
  axis: "#64748B",
};

const darkPalette = {
  iris: "#A5B4FC",
  violet: "#C4B5FD",
  sky: "#7DD3FC",
  success: "#6EE7B7",
  warning: "#FDBA74",
  danger: "#FCA5A5",
  grid: "rgba(224, 222, 255, 0.4)",
  axis: "rgba(255,255,255,0.55)",
};

const tooltipDotClassNames = [
  "bg-elv-iris",
  "bg-elv-danger",
  "bg-elv-success",
  "bg-elv-info",
  "bg-elv-warning",
];

function useChartPalette() {
  const { theme } = useTheme();
  return theme === "dark" ? darkPalette : lightPalette;
}

function formatValue(value: unknown): string {
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(formatValue).join(" - ");
  return "";
}

function GlassTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-white/50 bg-white/82 px-3 py-2 text-xs shadow-lg backdrop-blur-xl dark:border-elv-dark-border dark:bg-elv-dark-2/92">
      <p className="mb-1 font-black text-foreground dark:text-white">{label}</p>
      <div className="grid gap-1">
        {payload.map((item, index) => (
          <div key={String(item.dataKey ?? item.name)} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 font-bold text-muted-foreground dark:text-white/70">
              <span className={cn("h-2.5 w-2.5 rounded-full", tooltipDotClassNames[index % tooltipDotClassNames.length])} />
              {item.name}
            </span>
            <span className="font-mono font-black text-foreground dark:text-white">
              {formatValue(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartAxis({ dataKey }: { dataKey?: string }) {
  const palette = useChartPalette();

  return (
    <>
      <XAxis
        dataKey={dataKey ?? "label"}
        axisLine={false}
        tickLine={false}
        tick={{ fill: palette.axis, fontSize: 11, fontWeight: 700 }}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: palette.axis, fontSize: 11, fontWeight: 700 }}
        width={42}
      />
    </>
  );
}

export function RevenueAreaChart({ data, className }: { data: RevenuePoint[]; className?: string }) {
  const palette = useChartPalette();

  return (
    <div className={cn("h-64 w-full", className)} role="img" aria-label="Revenue over time area chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="elvRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette.iris} stopOpacity={0.36} />
              <stop offset="95%" stopColor={palette.iris} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.grid} vertical={false} />
          <ChartAxis />
          <Tooltip content={<GlassTooltip />} cursor={{ stroke: palette.iris, strokeOpacity: 0.18 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={palette.iris}
            strokeWidth={3}
            fill="url(#elvRevenueGradient)"
            activeDot={{ r: 4, strokeWidth: 0, fill: palette.iris }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function JobsByCategoryBarChart({ data, className }: { data: JobsByCategoryPoint[]; className?: string }) {
  const palette = useChartPalette();

  return (
    <div className={cn("h-72 w-full", className)} role="img" aria-label="Jobs by category bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={palette.grid} vertical={false} />
          <ChartAxis />
          <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(79,70,229,0.06)" }} />
          <Bar dataKey="cctv" name="CCTV" stackId="jobs" fill={palette.iris} radius={[0, 0, 4, 4]} />
          <Bar dataKey="fire" name="Fire" stackId="jobs" fill={palette.danger} />
          <Bar dataKey="access" name="Access" stackId="jobs" fill={palette.success} />
          <Bar dataKey="network" name="Network" stackId="jobs" fill={palette.sky} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EngineerEarningsLineChart({ data, className }: { data: EarningsPoint[]; className?: string }) {
  const palette = useChartPalette();

  return (
    <div className={cn("h-44 w-full", className)} role="img" aria-label="Engineer earnings line chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={palette.grid} vertical={false} />
          <ChartAxis />
          <Tooltip content={<GlassTooltip />} cursor={{ stroke: palette.iris, strokeOpacity: 0.18 }} />
          <Line
            type="monotone"
            dataKey="earnings"
            name="Earnings"
            stroke={palette.success}
            strokeWidth={3}
            dot={{ r: 3, fill: palette.success, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: palette.success, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function JobStatusPieChart({ data, className }: { data: StatusDistributionPoint[]; className?: string }) {
  const palette = useChartPalette();
  const colors = [palette.iris, palette.success, palette.warning, palette.sky, palette.danger];

  return (
    <div className={cn("h-72 w-full", className)} role="img" aria-label="Job status distribution pie chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 12, right: 8, left: 8, bottom: 12 }}>
          <Tooltip content={<GlassTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={3}
            stroke="transparent"
          >
            {data.map((item, index) => (
              <Cell key={item.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
