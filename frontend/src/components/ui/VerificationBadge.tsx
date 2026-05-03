import { BadgeCheck, Clock3, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "./utils";

export type VerificationLevel = "verified" | "kyc" | "escrow" | "review" | "risk";

export type VerificationBadgeProps = {
  level?: VerificationLevel;
  label?: string;
  score?: number;
  className?: string;
};

const badgeStyles: Record<VerificationLevel, string> = {
  verified: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  kyc: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200",
  escrow: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  review: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  risk: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
};

const defaultLabels: Record<VerificationLevel, string> = {
  verified: "Verified",
  kyc: "KYC cleared",
  escrow: "Escrow-ready",
  review: "In review",
  risk: "Risk watch",
};

const icons = {
  verified: ShieldCheck,
  kyc: BadgeCheck,
  escrow: ShieldCheck,
  review: Clock3,
  risk: ShieldAlert,
} satisfies Record<VerificationLevel, typeof ShieldCheck>;

export function VerificationBadge({
  level = "verified",
  label,
  score,
  className,
}: VerificationBadgeProps) {
  const Icon = icons[level];
  const text = score ? `${label ?? "Trust score"} ${score}` : (label ?? defaultLabels[level]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black",
        badgeStyles[level],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {text}
    </span>
  );
}
