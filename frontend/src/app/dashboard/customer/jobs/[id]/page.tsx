"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, IndianRupee, ShieldCheck, Star, UserRound } from "lucide-react";
import { jobsAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Badge, Button, Card, ErrorCard, Modal, SkeletonCard, Stepper, VerificationBadge } from "@/components/ui";
import { useJobApplications, useJobById } from "@/hooks/useSWRData";
import type { Application, JobStatus } from "@/types/api";

const statusLabels: Record<JobStatus, string> = {
  open: "Posted",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusIndex: Record<JobStatus, number> = {
  open: 1,
  assigned: 2,
  in_progress: 3,
  completed: 4,
  cancelled: 0,
};

const timelineSteps = ["Posted", "Applied", "Assigned", "In Progress", "Completed"];

function formatCurrency(value: number) {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function statusTone(status: JobStatus) {
  if (status === "completed") return "success";
  if (status === "in_progress" || status === "assigned") return "primary";
  if (status === "cancelled") return "danger";
  return "warning";
}

function EngineerName({ application }: { application: Application }) {
  const engineer = application.engineer;
  if (!engineer) return <span>{application.engineerId}</span>;

  return (
    <span>
      {engineer.profile.firstName} {engineer.profile.lastName}
    </span>
  );
}

function ApplicationCard({
  application,
  accepting,
  onAccept,
}: {
  application: Application;
  accepting: boolean;
  onAccept: () => void;
}) {
  const engineer = application.engineer;

  return (
    <article className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-foreground">
              <EngineerName application={application} />
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {engineer ? <Badge tier={engineer.serviceProvider.tier === "specialist" ? "Specialist" : engineer.serviceProvider.tier === "platinum" ? "Platinum" : engineer.serviceProvider.tier === "gold" ? "Gold" : "Silver"} /> : null}
              {engineer ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                  {engineer.serviceProvider.rating.toFixed(1)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <Badge tone={application.status === "accepted" ? "success" : application.status === "rejected" ? "danger" : "warning"}>
          {application.status}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {application.coverNote || "No cover note submitted."}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-1 text-sm font-black text-foreground">
          <IndianRupee className="h-4 w-4 text-primary" aria-hidden="true" />
          {application.proposedBudget ? formatCurrency(application.proposedBudget) : "Budget not proposed"}
        </p>
        <div className="flex gap-2">
          {engineer ? (
            <Link href={`/engineers/${engineer._id}`} className="inline-flex min-h-8 items-center rounded-md border border-border-subtle px-3 py-1.5 text-xs font-black text-primary">
              View Profile
            </Link>
          ) : null}
          <Button type="button" size="sm" onClick={onAccept} loading={accepting} disabled={application.status === "accepted"}>
            Accept
          </Button>
        </div>
      </div>
    </article>
  );
}

function DisputeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Raise dispute"
      description="Dispute capture is ready for backend workflow integration."
      footer={
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
        Capture the reason, evidence, and milestone before routing this dispute to operations.
      </div>
    </Modal>
  );
}

export default function CustomerJobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: job, isLoading: jobLoading, error: jobError, mutate: mutateJob } = useJobById(id);
  const {
    data: applications,
    isLoading: applicationsLoading,
    error: applicationsError,
    mutate: mutateApplications,
  } = useJobApplications(id);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);

  const progressSteps = useMemo(() => {
    const currentIndex = job ? statusIndex[job.status] : 0;
    return timelineSteps.map((step, index) => ({
      label: step,
      description: index === 1 ? `${applications?.length ?? 0} applied` : undefined,
      status: index <= currentIndex ? "complete" as const : index === currentIndex + 1 ? "current" as const : "upcoming" as const,
    }));
  }, [applications?.length, job]);

  async function acceptApplication(applicationId: string) {
    setAcceptingId(applicationId);
    try {
      await jobsAPI.acceptApplication(id, applicationId);
      toast.success("Engineer assigned!");
      await Promise.all([mutateJob(), mutateApplications()]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept application.");
    } finally {
      setAcceptingId(null);
    }
  }

  async function markCompleted() {
    setIsCompleting(true);
    try {
      await jobsAPI.updateJobStatus(id, "completed");
      toast.success("Job marked completed.");
      await mutateJob();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update job.");
    } finally {
      setIsCompleting(false);
    }
  }

  if (jobLoading) {
    return (
      <main className="premium-shell min-h-screen px-4 py-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.6fr_0.4fr]">
          <SkeletonCard lines={8} />
          <SkeletonCard lines={6} />
        </div>
      </main>
    );
  }

  if (jobError || !job) {
    return (
      <main className="premium-shell min-h-screen px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <ErrorCard message={jobError?.message} onRetry={() => void mutateJob()} />
        </div>
      </main>
    );
  }

  return (
    <main className="premium-shell min-h-screen px-4 py-6 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-6">
        <Link href="/dashboard/customer" className="inline-flex w-fit min-h-9 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Customer dashboard
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(360px,0.4fr)]">
          <Card variant="glass" padding="lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="primary">{job.category.replace(/_/g, " ")}</Badge>
                  <Badge tone={statusTone(job.status)}>{statusLabels[job.status]}</Badge>
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight">{job.title}</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{job.description}</p>
              </div>
              <VerificationBadge level={job.complianceLevel === "critical" ? "risk" : "kyc"} label={job.complianceLevel} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-primary-subtle p-3">
                <p className="text-[11px] font-black uppercase text-primary">Budget range</p>
                <p className="mt-1 font-mono text-sm font-black">{formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}</p>
              </div>
              <div className="rounded-md bg-surface-muted p-3">
                <p className="text-[11px] font-black uppercase text-muted-foreground">Location</p>
                <p className="mt-1 text-sm font-black">{job.city}, {job.area}</p>
              </div>
              <div className="rounded-md bg-surface-muted p-3">
                <p className="text-[11px] font-black uppercase text-muted-foreground">Assigned engineer</p>
                <p className="mt-1 text-sm font-black">
                  {job.assignedEngineer ? `${job.assignedEngineer.profile.firstName} ${job.assignedEngineer.profile.lastName}` : job.assignedEngineerId ?? "Not assigned"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Stepper steps={progressSteps} progress={Math.min(100, ((statusIndex[job.status] + 1) / timelineSteps.length) * 100)} />
            </div>

            {job.status === "in_progress" ? (
              <div className="mt-6 flex flex-col gap-2 border-t border-border-subtle pt-5 sm:flex-row">
                <Button type="button" variant="danger" loading={isCompleting} onClick={markCompleted} leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}>
                  Mark as Completed
                </Button>
                <Button type="button" variant="ghost" onClick={() => setDisputeOpen(true)} leftIcon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}>
                  Raise Dispute
                </Button>
              </div>
            ) : null}
          </Card>

          {job.status === "open" ? (
            <Card variant="glass" padding="lg" title={`${applications?.length ?? 0} Engineers Applied`} description="Review proposals and assign the right engineer.">
              {applicationsLoading ? (
                <div className="grid gap-3">
                  <SkeletonCard lines={3} />
                  <SkeletonCard lines={3} />
                </div>
              ) : applicationsError ? (
                <ErrorCard message={applicationsError.message} onRetry={() => void mutateApplications()} />
              ) : applications?.length ? (
                <div className="grid gap-3">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application._id}
                      application={application}
                      accepting={acceptingId === application._id}
                      onAccept={() => void acceptApplication(application._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border-subtle bg-surface p-5 text-center">
                  <ShieldCheck className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-sm font-black text-foreground">No applications yet - check back soon</p>
                  <p className="mt-1 text-xs text-muted-foreground">Verified engineers will appear here as they apply.</p>
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>

      <DisputeModal open={disputeOpen} onClose={() => setDisputeOpen(false)} />
    </main>
  );
}
