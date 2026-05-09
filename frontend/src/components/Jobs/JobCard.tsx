"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  IndianRupee,
  MapPin,
} from "lucide-react";
import type { Job } from "@/types";
import { VerificationBadge } from "@/components/ui";

interface JobCardProps {
  job: Job;
  showStatus?: boolean;
}

function formatCurrency(amount?: number, currency = "INR") {
  if (!amount) return "Get quotes";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

function getBudgetDisplay(job: Job) {
  const currency = job.budget.currency || "INR";

  if (job.budget.type === "get_quotes") return "Get quotes";
  if (job.budget.type === "fixed") return formatCurrency(job.budget.min || job.budget.max, currency);

  return `${formatCurrency(job.budget.min, currency)} - ${formatCurrency(job.budget.max, currency)}`;
}

function getUrgency(job: Job) {
  if (!job.timeline?.deadline) {
    return { label: "Flexible", className: "border-slate-200 bg-slate-100 text-slate-700" };
  }

  const daysLeft = Math.ceil(
    (new Date(job.timeline.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (daysLeft <= 3) {
    return { label: "Urgent", className: "border-rose-200 bg-rose-50 text-rose-700" };
  }

  if (daysLeft <= 10) {
    return { label: "Priority", className: "border-amber-200 bg-amber-50 text-amber-700" };
  }

  return { label: "Planned", className: "border-blue-200 bg-blue-50 text-blue-700" };
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    draft: "border-slate-200 bg-slate-100 text-slate-700",
    open: "border-emerald-200 bg-emerald-50 text-emerald-700",
    applications_received: "border-blue-200 bg-blue-50 text-blue-700",
    in_progress: "border-indigo-200 bg-indigo-50 text-indigo-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return classes[status] || classes.draft;
}

function formatCategory(category: string) {
  return category.replace(/_/g, " ");
}

function getTrustScore(job: Job) {
  const applicationCount = job.applications?.length ?? 0;
  const base = job.status === "open" || job.status === "applications_received" ? 88 : 82;
  return Math.min(98, base + Math.min(applicationCount, 8));
}

export function JobCard({ job, showStatus = true }: JobCardProps) {
  const urgency = getUrgency(job);
  const primaryCategory = job.category[0] ? formatCategory(job.category[0]) : "ELV";
  const area = job.location.address || job.location.city;
  const siteContext = area && area !== job.location.city ? area : `${job.location.city} service site`;
  const trustScore = getTrustScore(job);
  const payoutDisplay =
    job.budget.type === "range" && job.budget.max
      ? formatCurrency(Math.round(job.budget.max * 0.9), job.budget.currency || "INR")
      : getBudgetDisplay(job);
  const applicationCount = job.applications?.length ?? 0;
  const postedAt = job.createdAt
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
    : "Recently posted";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-border-subtle bg-surface shadow-card transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
      <div className="border-b border-border-subtle bg-gradient-to-br from-white via-white to-primary-subtle p-4 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/25">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-white/70 px-2.5 py-1 text-[11px] font-black capitalize text-primary shadow-sm dark:bg-slate-950/60">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                {primaryCategory}
              </span>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${urgency.className}`}>
                {urgency.label}
              </span>
              {showStatus ? (
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black capitalize ${getStatusClass(job.status)}`}>
                  {job.status.replace(/_/g, " ")}
                </span>
              ) : null}
            </div>

            <Link href={`/jobs/${job._id}`} className="mt-3 block">
              <h3 className="text-base font-black leading-snug text-foreground transition group-hover:text-primary">
                {job.title}
              </h3>
            </Link>
          </div>

          <div className="shrink-0 rounded-md border border-white/70 bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/70">
            <p className="flex items-center justify-end gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <IndianRupee className="h-3.5 w-3.5" />
              Budget
            </p>
            <p className="mt-1 text-sm font-black text-foreground">{getBudgetDisplay(job)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/70 px-2 py-1 shadow-sm dark:bg-slate-950/60">
            <MapPin className="h-3.5 w-3.5 text-secondary" />
            {job.location.city}
            {area && area !== job.location.city ? `, ${area}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/70 px-2 py-1 shadow-sm dark:bg-slate-950/60">
            <CalendarClock className="h-3.5 w-3.5 text-secondary" />
            {postedAt}
          </span>
          <VerificationBadge level="kyc" score={trustScore} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="min-h-12 text-sm leading-6 text-muted-foreground">
          {job.description.length > 150 ? `${job.description.slice(0, 150)}...` : job.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <VerificationBadge level="verified" label="Verified client" />
          <VerificationBadge level="escrow" label="UPI escrow-ready" />
          {applicationCount > 0 ? (
            <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-700">
              {applicationCount} proposal{applicationCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-subtle pt-4 text-xs">
          <div>
            <p className="font-bold text-muted-foreground">Deadline</p>
            <p className="mt-1 font-black text-foreground">
              {job.timeline?.deadline ? new Date(job.timeline.deadline).toLocaleDateString("en-IN") : "To be planned"}
            </p>
          </div>
          <div>
            <p className="font-bold text-muted-foreground">Site context</p>
            <p className="mt-1 font-black capitalize text-foreground">
              {siteContext}
            </p>
          </div>
          <div>
            <p className="font-bold text-muted-foreground">Payout</p>
            <p className="mt-1 font-black text-foreground">{payoutDisplay}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/jobs/${job._id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-black text-on-primary shadow-sm shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-container hover:shadow-md"
          >
            View project
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/jobs/${job._id}#quote`}
            className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-surface px-3 py-2 text-xs font-black text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary"
          >
            Send quote
          </Link>
        </div>
      </div>
    </article>
  );
}
