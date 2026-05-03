"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Building2,
  Flame,
  IndianRupee,
  Lock,
  MapPin,
  RadioTower,
  Send,
  ShieldCheck,
  UsersRound,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/components/ui/utils";

export type JobCategory = "CCTV" | "Fire" | "Access" | "Network";
export type JobUrgency = "Normal" | "Urgent" | "Emergency";
export type JobComplianceLevel = "Standard" | "High" | "Critical";
export type JobCardState = "default" | "applied" | "accepted" | "expired";

type JobCardProps = {
  title: string;
  category: JobCategory;
  city: string;
  area: string;
  budgetMin: number;
  budgetMax: number;
  urgency: JobUrgency;
  timePosted: string;
  clientTrustScore: number;
  applicants: number;
  complianceLevel: JobComplianceLevel;
  state?: JobCardState;
  bookmarked?: boolean;
  onApply?: () => void;
  onBookmark?: () => void;
  className?: string;
};

type CategoryStyle = {
  icon: LucideIcon;
  className: string;
};

const categoryStyles: Record<JobCategory, CategoryStyle> = {
  CCTV: {
    icon: RadioTower,
    className: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  },
  Fire: {
    icon: Flame,
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  },
  Access: {
    icon: Building2,
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
  },
  Network: {
    icon: Wifi,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
};

const urgencyTone: Record<JobUrgency, "neutral" | "warning" | "danger"> = {
  Normal: "neutral",
  Urgent: "warning",
  Emergency: "danger",
};

const complianceClassNames: Record<JobComplianceLevel, string> = {
  Standard:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  High: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  Critical: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
};

const stateClassNames: Record<JobCardState, string> = {
  default: "border-border-subtle bg-surface",
  applied:
    "border-blue-200 bg-blue-50/70 shadow-blue-950/[0.04] dark:border-blue-900/70 dark:bg-blue-950/20",
  accepted:
    "border-emerald-200 bg-emerald-50/70 shadow-emerald-950/[0.04] dark:border-emerald-900/70 dark:bg-emerald-950/20",
  expired:
    "border-slate-200 bg-slate-100/80 text-muted-foreground opacity-75 dark:border-slate-800 dark:bg-slate-900/70",
};

function formatIndianCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatBudget(min: number, max: number) {
  return `${formatIndianCurrency(min)} - ${formatIndianCurrency(max)}`;
}

function StateBadge({ state }: { state: JobCardState }) {
  if (state === "default") return null;

  const styles: Record<Exclude<JobCardState, "default">, string> = {
    applied: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
    accepted:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
    expired: "border-slate-300 bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black", styles[state])}>
      {state === "expired" ? <Lock className="h-3 w-3" /> : null}
      {state === "applied" ? "Applied" : state === "accepted" ? "Accepted" : "Expired"}
    </span>
  );
}

export function JobCard({
  title,
  category,
  city,
  area,
  budgetMin,
  budgetMax,
  urgency,
  timePosted,
  clientTrustScore,
  applicants,
  complianceLevel,
  state = "default",
  bookmarked = false,
  onApply,
  onBookmark,
  className,
}: JobCardProps) {
  const categoryStyle = categoryStyles[category];
  const CategoryIcon = categoryStyle.icon;
  const isExpired = state === "expired";
  const budget = useMemo(() => formatBudget(budgetMin, budgetMax), [budgetMin, budgetMax]);

  return (
    <motion.article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border p-4 shadow-sm transition-colors duration-200 hover:border-primary hover:shadow-lg",
        stateClassNames[state],
        className,
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isExpired ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black",
                categoryStyle.className,
              )}
            >
              <CategoryIcon className="h-3.5 w-3.5" />
              {category}
            </span>
            <Badge tone={urgencyTone[urgency]} urgency={urgency} className="font-black" />
            <StateBadge state={state} />
          </div>

          <h3 className="truncate text-base font-semibold leading-6 text-foreground transition group-hover:text-primary">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onBookmark}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border-subtle bg-surface text-muted-foreground shadow-xs transition hover:-translate-y-px hover:border-primary/30 hover:bg-primary-subtle hover:text-primary disabled:pointer-events-none"
          aria-label={bookmarked ? "Remove saved job" : "Save job for later"}
          disabled={isExpired}
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-secondary" />
          <span className="min-w-0 truncate font-semibold">
            {city} · {area}
          </span>
        </div>

        <div className="flex items-center gap-2 text-foreground">
          <IndianRupee className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-sm font-black">{budget}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-y border-border-subtle py-3 text-xs sm:grid-cols-4">
        <div>
          <p className="font-bold text-muted-foreground">Posted</p>
          <p className="mt-1 truncate font-black text-foreground">{timePosted}</p>
        </div>
        <div>
          <p className="font-bold text-muted-foreground">Trust</p>
          <p className="mt-1 inline-flex items-center gap-1 font-black text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {clientTrustScore}
          </p>
        </div>
        <div>
          <p className="font-bold text-muted-foreground">Applicants</p>
          <p className="mt-1 inline-flex items-center gap-1 font-black text-foreground">
            <UsersRound className="h-3.5 w-3.5 text-secondary" />
            {applicants}
          </p>
        </div>
        <div>
          <p className="font-bold text-muted-foreground">Compliance</p>
          <span
            className={cn(
              "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black",
              complianceClassNames[complianceLevel],
            )}
          >
            {complianceLevel}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          fullWidth
          onClick={onApply}
          disabled={isExpired || state === "applied" || state === "accepted"}
          leftIcon={isExpired ? <Lock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          variant={state === "accepted" ? "success" : "primary"}
        >
          {isExpired ? "Expired" : state === "applied" ? "Applied" : state === "accepted" ? "Accepted" : "Apply Now"}
        </Button>
      </div>
    </motion.article>
  );
}

export default JobCard;
