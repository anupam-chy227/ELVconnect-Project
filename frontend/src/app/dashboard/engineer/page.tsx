"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileUp,
  IndianRupee,
  MapPin,
  Navigation,
  Send,
  Upload,
} from "lucide-react";
import { jobsAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Badge, Button, Card, ErrorCard, Input, Modal, Select, SkeletonCard, Textarea, VerificationBadge } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useJobsBoard, useJobsNearMe, useMyApplications, useMyInvoices, useMyJobs, useMyProfile } from "@/hooks/useSWRData";
import type { Job, JobCategory, JobFilterParams, JobUrgency } from "@/types/api";

type SortFilter = "newest" | "budget" | "urgency" | "distance";
type ViewMode = "list" | "map";
type RadiusOption = 10 | 25 | 50 | 100;

type ApplyFormState = {
  coverNote: string;
  proposedBudget: string;
};

const categoryOptions = [
  { label: "All categories", value: "" },
  { label: "CCTV", value: "cctv" },
  { label: "Fire Safety", value: "fire_safety" },
  { label: "Access Control", value: "access_control" },
  { label: "Data Networking", value: "data_networking" },
];

const urgencyOptions = [
  { label: "All urgency", value: "" },
  { label: "Normal", value: "normal" },
  { label: "Urgent", value: "urgent" },
  { label: "Emergency", value: "emergency" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Budget high to low", value: "budget" },
  { label: "Urgency", value: "urgency" },
  { label: "Distance", value: "distance" },
];

const appliedStorageKey = "elv_applied_jobs";
const radiusOptions: RadiusOption[] = [10, 25, 50, 100];

const JobMapPreview = dynamic(() => import("@/components/maps/JobMapPreview"), {
  loading: () => <SkeletonCard lines={4} className="h-[300px]" />,
  ssr: false,
});

function formatCurrency(value: number) {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function getAppliedSet() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(appliedStorageKey) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function saveAppliedSet(values: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(appliedStorageKey, JSON.stringify(Array.from(values)));
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof BriefcaseBusiness;
}) {
  return (
    <Card variant="stat" padding="md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{detail}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md border border-primary/15 bg-primary-subtle text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}

function VerificationBanner({
  status,
  reason,
  onNavigate,
}: {
  status?: "pending" | "verified" | "rejected";
  reason?: string;
  onNavigate: () => void;
}) {
  if (status === "verified") return null;

  const rejected = status === "rejected";
  const title =
    status === "pending"
      ? "Verification under review - we'll notify you shortly"
      : rejected
        ? `Verification rejected${reason ? ` - ${reason}` : ""} - Re-submit documents`
        : "Complete your engineer verification";

  return (
    <Card variant={rejected ? "danger-zone" : "glass"} padding="md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className={cn("grid h-10 w-10 place-items-center rounded-md", rejected ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-black text-foreground">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Verified profiles receive higher ranking, payout confidence, and client trust badges.
            </p>
          </div>
        </div>
        {status !== "pending" ? (
          <Button type="button" onClick={onNavigate} leftIcon={<Upload className="h-4 w-4" aria-hidden="true" />}>
            Complete Now
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function JobCard({
  job,
  applied,
  onApply,
}: {
  job: Job;
  applied: boolean;
  onApply: () => void;
}) {
  return (
    <article className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm transition hover:border-primary/30 hover:shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{job.category.replace(/_/g, " ")}</Badge>
            <Badge tone={job.urgency === "emergency" ? "danger" : job.urgency === "urgent" ? "warning" : "neutral"}>
              {job.urgency}
            </Badge>
          </div>
          <h3 className="mt-3 text-base font-black text-foreground">{job.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{job.description}</p>
        </div>
        <VerificationBadge level={job.complianceLevel === "critical" ? "risk" : "kyc"} label={job.complianceLevel} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md bg-primary-subtle p-3">
          <p className="text-[11px] font-black uppercase text-primary">Budget</p>
          <p className="mt-1 font-mono text-sm font-black text-foreground">
            {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)}
          </p>
        </div>
        <div className="rounded-md bg-surface-muted p-3">
          <p className="text-[11px] font-black uppercase text-muted-foreground">Location</p>
          <p className="mt-1 text-sm font-black text-foreground">
            {job.city}, {job.area}
          </p>
        </div>
        <div className="rounded-md bg-surface-muted p-3">
          <p className="text-[11px] font-black uppercase text-muted-foreground">Site</p>
          <p className="mt-1 text-sm font-black text-foreground">{job.siteType}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
          Posted {new Date(job.createdAt).toLocaleDateString("en-IN")}
        </p>
        <Button
          type="button"
          size="sm"
          disabled={applied}
          onClick={onApply}
          leftIcon={applied ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        >
          {applied ? "Applied" : "Apply Now"}
        </Button>
      </div>
    </article>
  );
}

function ApplyModal({
  job,
  open,
  submitting,
  form,
  onChange,
  onClose,
  onConfirm,
}: {
  job: Job | null;
  open: boolean;
  submitting: boolean;
  form: ApplyFormState;
  onChange: (field: keyof ApplyFormState, value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply to job"
      description={job?.title}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} loading={submitting} leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}>
            Submit application
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <Textarea
          id="coverNote"
          label="Cover note"
          value={form.coverNote}
          onChange={(event) => onChange("coverNote", event.target.value)}
          hint="Mention availability, relevant site experience, and execution proof you can provide."
        />
        <Input
          id="proposedBudget"
          label="Proposed budget"
          inputMode="numeric"
          value={form.proposedBudget}
          onChange={(event) => onChange("proposedBudget", event.target.value)}
          leftIcon={<IndianRupee className="h-4 w-4" aria-hidden="true" />}
        />
      </div>
    </Modal>
  );
}

function ChecklistItem({ label, complete, onUpload }: { label: string; complete: boolean; onUpload: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface p-3">
      <span className="flex items-center gap-2 text-sm font-bold text-foreground">
        {complete ? <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" /> : <FileUp className="h-4 w-4 text-warning" aria-hidden="true" />}
        {label}
      </span>
      {!complete ? (
        <Button type="button" size="xs" variant="secondary" onClick={onUpload}>
          Upload Now
        </Button>
      ) : null}
    </div>
  );
}

function DashboardLoading() {
  return (
    <main className="premium-shell min-h-screen px-4 py-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <SkeletonCard lines={3} />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} lines={2} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
        </div>
      </div>
    </main>
  );
}

export default function EngineerDashboardPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading, error: profileError, mutate: mutateProfile } = useMyProfile();
  const [category, setCategory] = useState<JobCategory | "">("");
  const [urgency, setUrgency] = useState<JobUrgency | "">("");
  const [city, setCity] = useState("");
  const [sortBy, setSortBy] = useState<SortFilter>("newest");
  const [radius, setRadius] = useState<RadiusOption>(25);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(() => getAppliedSet());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyForm, setApplyForm] = useState<ApplyFormState>({ coverNote: "", proposedBudget: "" });
  const [submitting, setSubmitting] = useState(false);

  const effectiveCity = city || profile?.profile.city || "";
  const location = useGeolocation(profile?.profile.city ?? "");
  const hasCoordinates = location.lat !== null && location.lng !== null && !location.permissionDenied;
  const filters = useMemo<JobFilterParams>(
    () => ({
      city: effectiveCity,
      category: category || undefined,
      urgency: urgency || undefined,
      sort: sortBy,
    }),
    [category, effectiveCity, sortBy, urgency],
  );

  const { data: jobsBoard, isLoading: jobsLoading, error: jobsError, mutate: mutateJobs } = useJobsBoard(filters);
  const {
    data: nearbyJobs,
    isLoading: nearbyJobsLoading,
    error: nearbyJobsError,
    mutate: mutateNearbyJobs,
  } = useJobsNearMe(hasCoordinates ? location.lat : null, hasCoordinates ? location.lng : null, radius);
  const { data: myJobs, isLoading: myJobsLoading, error: myJobsError, mutate: mutateMyJobs } = useMyJobs();
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError, mutate: mutateInvoices } = useMyInvoices();
  const { data: applications, error: applicationsError, mutate: mutateApplications } = useMyApplications();

  const isLoading = profileLoading || (hasCoordinates ? nearbyJobsLoading : jobsLoading) || myJobsLoading || invoicesLoading;
  const error = profileError ?? (hasCoordinates ? nearbyJobsError : jobsError) ?? myJobsError ?? invoicesError;

  const jobs = useMemo(() => {
    const sourceJobs = hasCoordinates ? nearbyJobs ?? [] : jobsBoard?.jobs ?? [];
    const filteredJobs = sourceJobs.filter((job) => {
      const categoryMatch = category ? job.category === category : true;
      const urgencyMatch = urgency ? job.urgency === urgency : true;
      return categoryMatch && urgencyMatch;
    });

    return [...filteredJobs].sort((left, right) => {
      if (sortBy === "budget") return right.budgetMax - left.budgetMax;
      if (sortBy === "urgency") {
        const urgencyWeight: Record<JobUrgency, number> = { emergency: 3, urgent: 2, normal: 1 };
        return urgencyWeight[right.urgency] - urgencyWeight[left.urgency];
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [category, hasCoordinates, jobsBoard?.jobs, nearbyJobs, sortBy, urgency]);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const applicationCount = applicationsError ? appliedJobs.size : applications?.length ?? appliedJobs.size;

  const stats = useMemo(() => {
    const earnedThisMonth = (invoices ?? [])
      .filter((invoice) => {
        const date = new Date(invoice.createdAt);
        return invoice.status === "paid" && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((total, invoice) => total + invoice.amount, 0);

    return {
      jobsNearMe: jobs.length,
      applicationsSent: applicationCount,
      activeWork: (myJobs ?? []).filter((job) => job.status === "in_progress").length,
      earnedThisMonth,
    };
  }, [applicationCount, currentMonth, currentYear, invoices, jobs.length, myJobs]);

  const checklist = useMemo(
    () => [
      { label: "Phone Verified", complete: Boolean(profile?.profile.phone) },
      { label: "GST Number", complete: Boolean(profile?.serviceProvider?.gstNumber) },
      { label: "Certifications Uploaded", complete: Boolean(profile?.serviceProvider?.certifications?.length) },
      { label: "Identity Verified", complete: profile?.serviceProvider?.verificationStatus === "verified" },
    ],
    [profile],
  );

  function updateApplyForm(field: keyof ApplyFormState, value: string) {
    setApplyForm((current) => ({ ...current, [field]: value }));
  }

  async function submitApplication() {
    if (!selectedJob) return;
    setSubmitting(true);

    try {
      await jobsAPI.applyToJob(selectedJob._id, {
        coverNote: applyForm.coverNote || undefined,
        proposedBudget: applyForm.proposedBudget ? Number(applyForm.proposedBudget) : undefined,
      });
      const nextApplied = new Set(appliedJobs);
      nextApplied.add(selectedJob._id);
      setAppliedJobs(nextApplied);
      saveAppliedSet(nextApplied);
      toast.success("Application submitted!");
      setSelectedJob(null);
      setApplyForm({ coverNote: "", proposedBudget: "" });
      void mutateJobs();
      void mutateNearbyJobs();
      void mutateApplications();
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <DashboardLoading />;

  if (error || !profile || (!jobsBoard && !nearbyJobs) || !myJobs || !invoices) {
    return (
      <main className="premium-shell min-h-screen px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <ErrorCard
            message={error?.message}
            onRetry={() => {
              void mutateProfile();
              void mutateJobs();
              void mutateNearbyJobs();
              void mutateMyJobs();
              void mutateInvoices();
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="premium-shell min-h-screen px-4 py-6 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-6">
        <VerificationBanner
          status={profile.serviceProvider?.verificationStatus}
          onNavigate={() => router.push("/dashboard/engineer/verification")}
        />

        <Card variant="glass" padding="lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <VerificationBadge level="kyc" label="Engineer workbench" />
                <VerificationBadge level="escrow" label="Payout visible" />
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">
                {hasCoordinates ? `Jobs within ${radius}km of your location` : `Jobs near you in ${effectiveCity || "your city"}`}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {location.permissionDenied
                  ? "Location permission was denied, so we are using your profile city for text-based search."
                  : "Discover location-first ELV work, apply with a clear budget, and track active projects from one execution dashboard."}
              </p>
            </div>
            <div className="flex min-w-64 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              <input
                aria-label="City selector"
                value={effectiveCity}
                onChange={(event) => setCity(event.target.value)}
                className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
                placeholder="Select city"
              />
            </div>
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Engineer dashboard stats">
          <StatCard label="Jobs Near Me" value={String(stats.jobsNearMe)} detail="From live job board" icon={Navigation} />
          <StatCard label="Applications Sent" value={String(stats.applicationsSent)} detail="API or local applied state" icon={Send} />
          <StatCard label="Active Work" value={String(stats.activeWork)} detail="In-progress assignments" icon={BriefcaseBusiness} />
          <StatCard label="Earned This Month" value={formatCurrency(stats.earnedThisMonth)} detail="Paid invoices this month" icon={IndianRupee} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
            <Card variant="glass" padding="md">
              <div className="grid gap-3 lg:grid-cols-4">
                <Select
                  id="category"
                  label="Category"
                  value={category}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategory(event.target.value as JobCategory | "")}
                  options={categoryOptions}
                />
                <Select
                  id="urgency"
                  label="Urgency"
                  value={urgency}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => setUrgency(event.target.value as JobUrgency | "")}
                  options={urgencyOptions}
                />
                <Input id="city-filter" label="City" value={effectiveCity} onChange={(event) => setCity(event.target.value)} />
                <Select
                  id="sort"
                  label="Sort"
                  value={sortBy}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => setSortBy(event.target.value as SortFilter)}
                  options={sortOptions}
                />
              </div>
              <div className="mt-4 grid gap-4 border-t border-border-subtle pt-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="radius" className="text-xs font-black uppercase text-muted-foreground">
                      Radius: {radius}km
                    </label>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {hasCoordinates ? "Coordinate search active" : "City fallback active"}
                    </span>
                  </div>
                  <input
                    id="radius"
                    type="range"
                    min={0}
                    max={radiusOptions.length - 1}
                    step={1}
                    value={radiusOptions.indexOf(radius)}
                    onChange={(event) => setRadius(radiusOptions[Number(event.target.value)] ?? 25)}
                    className="mt-2 w-full accent-elv-iris"
                    aria-label="Nearby job search radius"
                    disabled={!hasCoordinates}
                  />
                  <div className="mt-1 flex justify-between text-[11px] font-bold text-muted-foreground">
                    {radiusOptions.map((option) => (
                      <span key={option}>{option}km</span>
                    ))}
                  </div>
                </div>
                <div className="inline-flex rounded-md border border-border-subtle bg-surface p-1">
                  {(["list", "map"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "rounded px-3 py-1.5 text-xs font-black transition",
                        viewMode === mode ? "bg-primary text-on-primary" : "text-muted-foreground hover:bg-primary-subtle hover:text-primary",
                      )}
                      aria-pressed={viewMode === mode}
                    >
                      {mode === "list" ? "List View" : "Map View"}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {viewMode === "map" && hasCoordinates ? (
              <JobMapPreview
                jobs={jobs}
                center={[location.lat ?? 28.6139, location.lng ?? 77.209]}
                onSelectJob={(job) => setSelectedJob(job)}
              />
            ) : null}

            <div className="grid gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  applied={appliedJobs.has(job._id) || Boolean(applications?.some((application) => application.jobId === job._id))}
                  onApply={() => setSelectedJob(job)}
                />
              ))}
              {!jobs.length ? (
                <Card variant="panel" padding="lg">
                  <p className="text-sm font-black text-foreground">No jobs match these filters.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Adjust city, category, or urgency to discover more work.</p>
                </Card>
              ) : null}
            </div>
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-6 xl:self-start">
            <Card variant="glass" padding="lg" title="Verification Checklist" description="Complete missing items to improve trust ranking.">
              <div className="grid gap-3">
                {checklist.map((item) => (
                  <ChecklistItem
                    key={item.label}
                    label={item.label}
                    complete={item.complete}
                    onUpload={() => router.push("/dashboard/engineer/verification")}
                  />
                ))}
              </div>
            </Card>

            <Card variant="dark-glass" padding="lg">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-200">Active work</p>
              <h2 className="mt-3 text-xl font-black text-white">Milestone control</h2>
              <div className="mt-4 grid gap-3">
                {(myJobs ?? []).filter((job) => job.status === "in_progress").slice(0, 3).map((job) => (
                  <div key={job._id} className="rounded-md border border-white/10 bg-white/10 p-3">
                    <p className="text-sm font-black text-white">{job.title}</p>
                    <p className="mt-1 text-xs text-white/65">{job.city}, {job.area}</p>
                  </div>
                ))}
              </div>
              <Button type="button" className="mt-4" fullWidth onClick={() => router.push("/dashboard/jobs")}>
                Update status
              </Button>
            </Card>
          </aside>
        </section>
      </div>

      <ApplyModal
        job={selectedJob}
        open={Boolean(selectedJob)}
        submitting={submitting}
        form={applyForm}
        onChange={updateApplyForm}
        onClose={() => setSelectedJob(null)}
        onConfirm={submitApplication}
      />
    </main>
  );
}
