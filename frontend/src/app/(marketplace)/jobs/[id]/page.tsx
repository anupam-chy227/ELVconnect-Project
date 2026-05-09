"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Briefcase, Calendar, FileText, MapPin, Send, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { Job, JobApplication } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/Toast";
import { Button, PaymentTrustCard, VerificationBadge } from "@/components/ui";

interface JobDetailPageProps {
  params: { id: string };
}

interface JobResponse {
  status: string;
  message: string;
  data: Job;
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

function formatCategory(category: string) {
  return category.replace(/_/g, " ");
}

function getTrustScore(job: Job) {
  const applicationCount = job.applications?.length ?? 0;
  return Math.min(98, 88 + Math.min(applicationCount, 8));
}

function DetailTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-muted p-4">
      <p className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = params;
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");

  const { data: jobData, loading } = useQuery<JobResponse>(`/jobs/${id}`, { enabled: !!id });

  const job = jobData?.data ?? null;

  const applyMutation = useMutation({
    method: "post",
    url: `/jobs/${id}/apply`,
    onSuccess: () => {
      addToast("Application submitted successfully!", "success");
      setShowApplicationForm(false);
      setCoverNote("");
      setProposedAmount("");
    },
    successMessage: "Application submitted",
  });

  const handleApplyToJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!coverNote.trim()) {
      addToast("Please provide a cover note", "error");
      return;
    }

    await applyMutation.mutate({
      coverNote,
      proposedAmount: proposedAmount ? parseFloat(proposedAmount) : undefined,
    });
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-r-primary" />
          <p className="text-sm font-bold text-muted-foreground">Loading job details</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Link href="/jobs" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-primary hover:text-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to jobs
          </Link>
          <div className="rounded-md border border-border-subtle bg-surface p-12 text-center shadow-card">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-black text-foreground">Job not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">This job does not exist or has been removed.</p>
            <Link href="/jobs" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 text-sm font-black text-on-primary">
              Browse other jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === job.customerId;
  const isServiceProvider = user?.role === "service_provider";
  const hasApplied = user && job.applications?.some((app: JobApplication) => app.serviceProviderId === user._id);
  const applicationCount = job.applications?.length ?? 0;
  const trustScore = getTrustScore(job);

  return (
    <main className="premium-shell min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Link href="/jobs" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-primary hover:text-secondary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>

        <section className="overflow-hidden rounded-md border border-border-subtle bg-surface shadow-floating">
          <div className="premium-mesh border-b border-border-subtle p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2">
                  {job.category.map((category) => (
                    <span key={category} className="rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-black capitalize text-primary shadow-sm dark:bg-slate-950/60">
                      {formatCategory(category)}
                    </span>
                  ))}
                  <VerificationBadge level="kyc" score={trustScore} />
                  <VerificationBadge level="escrow" label="UPI escrow-ready" />
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-5xl">{job.title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Verified ELV requirement with city, budget, timeline, and application context for faster quoting.
                </p>
              </div>
              <div className="rounded-md border border-white/70 bg-white/82 p-4 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/72">
                <p className="text-xs font-black uppercase text-muted-foreground">Budget</p>
                <p className="mt-1 text-2xl font-black text-foreground">{getBudgetDisplay(job)}</p>
                <p className="mt-2 text-xs font-semibold capitalize text-muted-foreground">{job.status.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
            <div className="space-y-6">
              <section className="rounded-md border border-border-subtle bg-surface p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  Project description
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{job.description}</p>
              </section>

              <section className="grid gap-3 md:grid-cols-2">
                <DetailTile icon={MapPin} label="Site location" value={`${job.location.address || job.location.city}, ${job.location.city}, ${job.location.country}`} />
                <DetailTile icon={Calendar} label="Timeline" value={`Start ${new Date(job.timeline.startDate).toLocaleDateString("en-IN")} - Due ${new Date(job.timeline.deadline).toLocaleDateString("en-IN")}`} />
                <DetailTile icon={UsersRound} label="Applications" value={`${applicationCount} proposal${applicationCount === 1 ? "" : "s"} received`} />
                <DetailTile icon={ShieldCheck} label="Trust posture" value={`Client trust score ${trustScore}, secure payment workflow`} />
              </section>
            </div>

            <aside className="space-y-4" aria-label="Job actions and secure payment">
              <PaymentTrustCard amount={getBudgetDisplay(job)} method="escrow" status="Payments are released against approved milestones and site proof." />

              {isOwner ? (
                <div className="rounded-md border border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950/30">
                  <p className="text-sm font-black text-sky-900 dark:text-sky-100">You posted this job</p>
                  <div className="mt-4 grid gap-2">
                    <Link href="/dashboard/jobs" className="rounded-md bg-primary px-4 py-2 text-center text-sm font-black text-on-primary shadow-sm shadow-primary/20 hover:bg-primary-container">
                      View applications
                    </Link>
                    <button type="button" className="rounded-md border border-primary/35 px-4 py-2 text-sm font-black text-primary hover:bg-primary-subtle dark:text-primary">
                      Edit job
                    </button>
                  </div>
                </div>
              ) : isServiceProvider ? (
                <div id="quote" className="rounded-md border border-primary/20 bg-primary-subtle p-5">
                  {hasApplied ? (
                    <div className="rounded-md border border-emerald-200 bg-success-subtle p-3 text-sm font-black text-success">
                      You have applied to this job
                    </div>
                  ) : job.status === "open" ? (
                    <>
                      <Button type="button" fullWidth onClick={() => setShowApplicationForm((value) => !value)} leftIcon={<BadgeCheck className="h-4 w-4" />}>
                        {showApplicationForm ? "Cancel application" : "Apply now"}
                      </Button>

                      {showApplicationForm ? (
                        <form onSubmit={handleApplyToJob} className="mt-4 space-y-4">
                          <label className="grid gap-2">
                            <span className="text-sm font-black text-foreground">Cover note</span>
                            <textarea
                              value={coverNote}
                              onChange={(event) => setCoverNote(event.target.value)}
                              rows={4}
                              required
                              aria-required="true"
                              className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:shadow-focus"
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="text-sm font-black text-foreground">Proposed amount</span>
                            <input
                              type="number"
                              value={proposedAmount}
                              onChange={(event) => setProposedAmount(event.target.value)}
                              step="0.01"
                              aria-label="Proposed amount"
                              className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:shadow-focus"
                            />
                          </label>
                          <Button type="submit" loading={applyMutation.loading} fullWidth leftIcon={<Send className="h-4 w-4" />}>
                            Submit application
                          </Button>
                        </form>
                      ) : null}
                    </>
                  ) : (
                    <p className="rounded-md border border-border-subtle bg-surface p-3 text-sm font-bold text-muted-foreground">This job is no longer open.</p>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-border-subtle bg-surface p-5">
                  <p className="text-sm font-semibold text-muted-foreground">Sign in to apply for this job.</p>
                  <Link href="/login" className="mt-4 block rounded-md bg-primary px-4 py-2 text-center text-sm font-black text-on-primary">
                    Sign in
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
