import type { HTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "./utils";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";
export type StatusBadgeValue = "Active" | "Pending" | "Completed" | "Cancelled" | "Rejected";
export type TierBadgeValue = "Silver" | "Gold" | "Platinum" | "Specialist";
export type UrgencyBadgeValue = "Normal" | "Urgent" | "Emergency";
export type ComplianceBadgeValue = "Verified" | "Unverified" | "Expired" | "In Review";
export type RiskBadgeValue = "Low" | "Medium" | "High";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "style"> & {
  tone?: BadgeTone;
  status?: StatusBadgeValue;
  tier?: TierBadgeValue;
  urgency?: UrgencyBadgeValue;
  compliance?: ComplianceBadgeValue;
  risk?: RiskBadgeValue;
};

const tones: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  primary: "border-primary/25 bg-primary-subtle text-primary dark:border-primary/35 dark:bg-primary-subtle dark:text-primary",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
};

const statusStyles: Record<StatusBadgeValue, string> = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  Pending: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-200",
  Completed: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  Cancelled: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
  Rejected: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
};

const tierStyles: Record<TierBadgeValue, string> = {
  Silver: "border-slate-200 bg-gradient-to-r from-slate-100 to-slate-300 text-slate-800 dark:border-slate-600 dark:from-slate-700 dark:to-slate-500 dark:text-white",
  Gold: "border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-400 text-amber-950 dark:border-amber-700 dark:from-amber-700 dark:to-yellow-500 dark:text-white",
  Platinum: "border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-indigo-200 text-indigo-900 dark:border-cyan-700 dark:from-cyan-950 dark:via-slate-900 dark:to-indigo-800 dark:text-cyan-50",
  Specialist: "border-purple-200 bg-gradient-to-r from-elv-iris to-elv-purple text-white dark:border-purple-800",
};

const urgencyStyles: Record<UrgencyBadgeValue, string> = {
  Normal: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Urgent: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-200",
  Emergency: "border-red-300 bg-red-50 text-red-700 shadow-[0_0_0_0_rgba(220,38,38,0.45)] animate-elv-emergency-pulse dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
};

const complianceStyles: Record<ComplianceBadgeValue, string> = {
  Verified: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  Unverified: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Expired: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
  "In Review": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
};

const riskStyles: Record<RiskBadgeValue, string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  Medium: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-200",
  High: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
};

function resolveBadge(props: BadgeProps) {
  if (props.status) return { label: props.status, className: statusStyles[props.status], verified: false };
  if (props.tier) return { label: props.tier, className: tierStyles[props.tier], verified: false };
  if (props.urgency) return { label: props.urgency, className: urgencyStyles[props.urgency], verified: false };
  if (props.compliance) {
    return {
      label: props.compliance,
      className: complianceStyles[props.compliance],
      verified: props.compliance === "Verified",
    };
  }
  if (props.risk) return { label: props.risk, className: riskStyles[props.risk], verified: false };

  return {
    label: undefined,
    className: tones[props.tone ?? "neutral"],
    verified: false,
  };
}

export function Badge({
  tone = "neutral",
  status,
  tier,
  urgency,
  compliance,
  risk,
  className,
  children,
  ...props
}: BadgeProps) {
  const resolved = resolveBadge({ tone, status, tier, urgency, compliance, risk });

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-tight transition-colors",
        resolved.className,
        className,
      )}
      {...props}
    >
      {resolved.verified ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
      {children ?? resolved.label}
    </span>
  );
}
