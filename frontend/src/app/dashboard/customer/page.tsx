"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileCheck2,
  HelpCircle,
  IndianRupee,
  Menu,
  MessageCircle,
  PhoneCall,
  MapPin,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Badge, Button, Card, DataTable, ErrorCard, Modal, SkeletonCard, SkeletonTable, VerificationBadge } from "@/components/ui";
import { cn, progressWidthClass } from "@/components/ui/utils";
import { useEngineerDirectory, useMyInvoices, useMyJobs, useMyProfile } from "@/hooks/useSWRData";
import type { ColumnDef } from "@/components/ui/DataTable";
import type { Engineer, JobCategory, JobStatus } from "@/types/api";

type ProjectRow = {
  _id: string;
  title: string;
  category: JobCategory;
  city: string;
  area: string;
  budget: string;
  status: JobStatus;
  statusLabel: string;
  progress: number;
  applicantCount: number;
};

type CustomerMenuAction = {
  label: string;
  description: string;
  icon: typeof BriefcaseBusiness;
  href?: string;
  external?: boolean;
  action?: () => void;
};

const statusLabels: Record<JobStatus, string> = {
  open: "Posted",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusProgress: Record<JobStatus, number> = {
  open: 10,
  assigned: 30,
  in_progress: 65,
  completed: 100,
  cancelled: 0,
};

const categoryLabels: Record<JobCategory, string> = {
  cctv: "CCTV",
  fire_safety: "Fire Safety",
  access_control: "Access Control",
  data_networking: "Networking",
};

const defaultClientCategories: JobCategory[] = ["cctv", "fire_safety", "access_control", "data_networking"];

function formatCurrency(value: number) {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function statusTone(status: JobStatus) {
  if (status === "completed") return "success";
  if (status === "in_progress" || status === "assigned") return "primary";
  if (status === "cancelled") return "danger";
  return "warning";
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

function CustomerCategoryBar({
  categories,
  activeCategory,
  onCategoryChange,
  menu,
}: {
  categories: Array<{ category: JobCategory | "all"; label: string; count: number }>;
  activeCategory: JobCategory | "all";
  onCategoryChange: (category: JobCategory | "all") => void;
  menu?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-subtle bg-white/90 shadow-sm backdrop-blur-xl" aria-label="Client category shortcuts">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto pb-1 lg:pb-0">
          {categories.map((item) => {
            const active = item.category === activeCategory;
            return (
              <button
                key={item.category}
                type="button"
                onClick={() => onCategoryChange(item.category)}
                className={cn(
                  "group relative inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap text-sm font-black text-muted-foreground transition hover:text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                  active && "text-foreground",
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-black transition",
                    active ? "bg-primary text-on-primary" : "bg-surface-muted text-muted-foreground group-hover:bg-primary-subtle group-hover:text-primary",
                  )}
                >
                  {item.count}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-3 h-0.5 rounded-full bg-primary opacity-0 transition",
                    active && "opacity-100",
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        {menu ? <div className="shrink-0 self-start lg:self-auto">{menu}</div> : null}
      </div>
    </section>
  );
}

function CustomerActionMenu({
  open,
  actions,
  onToggle,
}: {
  open: boolean;
  actions: CustomerMenuAction[];
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm font-black text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary-subtle hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
        Menu
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-40 w-[min(88vw,360px)] rounded-lg border border-border-subtle bg-surface-raised p-2 shadow-floating backdrop-blur-2xl" role="menu">
          <div className="border-b border-border-subtle px-3 py-3">
            <p className="text-sm font-black text-foreground">Client control center</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Open the pages and support channels you need most.</p>
          </div>
          <div className="mt-2 grid gap-1">
            {actions.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-black text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-xs font-semibold leading-4 text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </>
              );

              if (item.href && !item.external) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                    role="menuitem"
                  >
                    {content}
                  </Link>
                );
              }

              if (item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                    role="menuitem"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                  role="menuitem"
                >
                  {content}
                </button>
              );
            })}
          </div>
          <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
            Helpline numbers can be connected here when you add the final support contacts.
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReleasePaymentModal({ job, open, onClose }: { job: ProjectRow | null; open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Release payment"
      description="Payment release remains gated by milestone evidence and client approval."
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onClose} leftIcon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}>
            Confirm release
          </Button>
        </div>
      }
    >
      <div className="rounded-md border border-border-subtle bg-surface p-4">
        <p className="text-sm font-black text-foreground">{job?.title ?? "Selected project"}</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Confirm that QA evidence, handover documents, and site acceptance are complete before releasing the next UPI-linked milestone.
        </p>
      </div>
    </Modal>
  );
}

function EngineerCard({ engineer }: { engineer: Engineer }) {
  return (
    <article className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-foreground">
            {engineer.profile.firstName} {engineer.profile.lastName}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {engineer.profile.city} - {engineer.serviceProvider.categories.join(", ")}
          </p>
        </div>
        <VerificationBadge level={engineer.serviceProvider.verificationStatus === "verified" ? "verified" : "review"} score={Math.round(engineer.serviceProvider.rating * 20)} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-primary-subtle p-2">
          <p className="font-mono text-sm font-black text-primary">{engineer.serviceProvider.rating.toFixed(1)}</p>
          <p className="text-[11px] font-bold text-muted-foreground">Rating</p>
        </div>
        <div className="rounded-md bg-surface-muted p-2">
          <p className="font-mono text-sm font-black text-foreground">{engineer.serviceProvider.completionRate}%</p>
          <p className="text-[11px] font-bold text-muted-foreground">Complete</p>
        </div>
        <div className="rounded-md bg-surface-muted p-2">
          <p className="font-mono text-sm font-black text-foreground">{engineer.serviceProvider.totalJobs}</p>
          <p className="text-[11px] font-bold text-muted-foreground">Jobs</p>
        </div>
      </div>
    </article>
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
        <SkeletonTable columns={5} rows={5} />
      </div>
    </main>
  );
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading, error: profileError, mutate: mutateProfile } = useMyProfile();
  const { data: jobs, isLoading: jobsLoading, error: jobsError, mutate: mutateJobs } = useMyJobs();
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError, mutate: mutateInvoices } = useMyInvoices();
  const [releaseJob, setReleaseJob] = useState<ProjectRow | null>(null);
  const [activeCategory, setActiveCategory] = useState<JobCategory | "all">("all");
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);

  const myJobs = useMemo(() => {
    if (!jobs || !profile) return [];
    return jobs.filter((job) => job.clientId === profile._id);
  }, [jobs, profile]);

  const visibleJobs = useMemo(() => {
    if (activeCategory === "all") return myJobs;
    return myJobs.filter((job) => job.category === activeCategory);
  }, [activeCategory, myJobs]);

  const mostRecentJobCategory = myJobs[0]?.category;
  const { data: engineers, isLoading: engineersLoading, error: engineersError, mutate: mutateEngineers } = useEngineerDirectory(
    mostRecentJobCategory ? { category: mostRecentJobCategory, limit: 3 } : { limit: 3 },
  );

  const isLoading = profileLoading || jobsLoading || invoicesLoading;
  const error = profileError ?? jobsError ?? invoicesError;

  const stats = useMemo(() => {
    const paidInvoices = (invoices ?? []).filter((invoice) => invoice.status === "paid");
    const activeJobs = visibleJobs.filter((job) => ["open", "assigned", "in_progress"].includes(job.status)).length;
    const engineersApplied = visibleJobs.filter((job) => job.status === "open").reduce((total, job) => total + job.applicantCount, 0);
    const completed = visibleJobs.filter((job) => job.status === "completed").length;
    const spent = paidInvoices.reduce((total, invoice) => total + invoice.amount, 0);

    return { activeJobs, engineersApplied, completed, spent };
  }, [invoices, visibleJobs]);

  const categoryTabs = useMemo(() => {
    const counts = new Map<JobCategory, number>();
    myJobs.forEach((job) => counts.set(job.category, (counts.get(job.category) ?? 0) + 1));
    const categories = counts.size ? Array.from(counts.keys()) : defaultClientCategories;

    return [
      { category: "all" as const, label: "All work", count: myJobs.length },
      ...categories.map((category) => ({
        category,
        label: categoryLabels[category],
        count: counts.get(category) ?? 0,
      })),
    ];
  }, [myJobs]);

  const rows = useMemo<ProjectRow[]>(
    () =>
      visibleJobs.map((job) => ({
        _id: job._id,
        title: job.title,
        category: job.category,
        city: job.city,
        area: job.area,
        budget: `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)}`,
        status: job.status,
        statusLabel: statusLabels[job.status],
        progress: statusProgress[job.status],
        applicantCount: job.applicantCount,
      })),
    [visibleJobs],
  );

  const columns = useMemo<ColumnDef<ProjectRow>[]>(
    () => [
      {
        id: "project",
        header: "Project",
        cell: (row) => (
          <div>
            <p className="font-black text-foreground">{row.title}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {row.category.replace(/_/g, " ")} - {row.city}, {row.area}
            </p>
          </div>
        ),
        searchValue: (row) => `${row.title} ${row.category} ${row.city} ${row.area}`,
      },
      { id: "budget", header: "Budget", cell: (row) => <span className="font-mono text-xs font-black">{row.budget}</span>, sortValue: (row) => row.budget },
      {
        id: "status",
        header: "Status",
        status: true,
        cell: (row) => <Badge tone={statusTone(row.status)}>{row.statusLabel}</Badge>,
        sortValue: (row) => row.statusLabel,
      },
      {
        id: "progress",
        header: "Progress",
        cell: (row) => (
          <div className="min-w-36">
            <div className="mb-1 flex justify-between text-[11px] font-black text-muted-foreground">
              <span>{row.progress}%</span>
              <span>{row.applicantCount} applicants</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div className={cn("h-full rounded-full bg-gradient-to-r from-primary to-secondary", progressWidthClass(row.progress))} />
            </div>
          </div>
        ),
        sortValue: (row) => row.progress,
      },
    ],
    [],
  );

  const customerName = useMemo(() => {
    const firstName = profile?.profile.firstName?.trim();
    const fullName = `${profile?.profile.firstName ?? ""} ${profile?.profile.lastName ?? ""}`.trim();
    const emailName = profile?.email?.split("@")[0];

    return firstName || fullName || emailName || "Client";
  }, [profile]);

  const customerActions = useMemo<CustomerMenuAction[]>(
    () => [
      {
        label: "Dashboard overview",
        description: "Return to your customer command center.",
        href: "/dashboard/customer",
        icon: BriefcaseBusiness,
      },
      {
        label: "Manage profile",
        description: "Update contact, city, avatar, and company details.",
        href: "/dashboard/profile",
        icon: UserRound,
      },
      {
        label: "Post a new job",
        description: "Create a CCTV, fire, access, or networking requirement.",
        href: "/dashboard/customer/post-job",
        icon: ClipboardList,
      },
      {
        label: "Projects and jobs",
        description: "Track applications, work status, and site progress.",
        href: "/dashboard/customer/jobs",
        icon: CalendarCheck2,
      },
      {
        label: "Payments and invoices",
        description: "Review milestone releases, invoices, and payout status.",
        href: "/dashboard/customer/payments",
        icon: WalletCards,
      },
      {
        label: "Work agreements",
        description: "Open client agreements and work order documents.",
        href: "/dashboard/client/agreement",
        icon: FileCheck2,
      },
      {
        label: "AMC and service plans",
        description: "Manage recurring maintenance and site service coverage.",
        href: "/dashboard/customer/amc",
        icon: ShieldCheck,
      },
      {
        label: "WhatsApp community",
        description: "Connect with the ELV Verse client support community.",
        href: "https://wa.me/?text=Hi%20ELV%20Verse%2C%20I%20want%20to%20join%20the%20client%20WhatsApp%20community.",
        external: true,
        icon: MessageCircle,
      },
      {
        label: "Help and helpline",
        description: "Support numbers can be added here when ready.",
        href: "/trust-safety",
        icon: PhoneCall,
      },
      {
        label: "Trust and support center",
        description: "Review verification, safety, and marketplace trust cues.",
        href: "/trust-safety",
        icon: HelpCircle,
      },
    ],
    [],
  );

  if (isLoading) return <DashboardLoading />;

  if (error || !profile || !jobs || !invoices) {
    return (
      <main className="premium-shell min-h-screen px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <ErrorCard
            message={error?.message}
            onRetry={() => {
              void mutateProfile();
              void mutateJobs();
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
        <CustomerCategoryBar
          categories={categoryTabs}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          menu={
            <CustomerActionMenu
              open={customerMenuOpen}
              actions={customerActions}
              onToggle={() => setCustomerMenuOpen((current) => !current)}
            />
          }
        />

        <Card variant="glass" padding="lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <VerificationBadge level="verified" label="Customer workspace" />
                <VerificationBadge level="escrow" label="UPI milestone ready" />
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">
                Welcome, {customerName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Track active ELV projects, engineer applications, spend, and payment release actions from one customer dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:items-center">
              <Button type="button" onClick={() => router.push("/dashboard/customer/post-job")} leftIcon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}>
                Post New Job
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/customer/jobs")} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                View All Jobs
              </Button>
            </div>
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Customer dashboard stats">
          <StatCard label="Active Jobs" value={String(stats.activeJobs)} detail="Open, assigned, and in progress" icon={BriefcaseBusiness} />
          <StatCard label="Engineers Applied" value={String(stats.engineersApplied)} detail="Across posted jobs" icon={UsersRound} />
          <StatCard label="Completed" value={String(stats.completed)} detail="Closed work orders" icon={CheckCircle2} />
          <StatCard label="Total Spent" value={formatCurrency(stats.spent)} detail="Paid invoices" icon={IndianRupee} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card
            variant="glass"
            padding="none"
            title="Active Projects"
            description="Live jobs from the API with status, progress, and row-level customer actions."
            className="p-0"
          >
            <DataTable
              columns={columns}
              data={rows}
              searchable
              emptyMessage="No customer jobs found."
              actions={(row) => {
                const actions = [
                  {
                    label: "View Details",
                    onClick: () => router.push(`/dashboard/customer/jobs/${row._id}`),
                  },
                ];

                if (row.status === "open") {
                  actions.push({
                    label: "View Applications",
                    onClick: () => router.push(`/dashboard/customer/jobs/${row._id}/applications`),
                  });
                }

                if (row.status === "in_progress") {
                  actions.push({
                    label: "Release Payment",
                    onClick: () => setReleaseJob(row),
                  });
                }

                return actions;
              }}
            />
          </Card>

          <Card variant="glass" padding="lg" title="Recommended Engineers" description="Matched from your latest job category.">
            {engineersLoading ? (
              <div className="grid gap-3">
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
              </div>
            ) : engineersError ? (
              <ErrorCard message={engineersError.message} onRetry={() => void mutateEngineers()} />
            ) : (
              <div className="grid gap-3">
                {(engineers ?? []).slice(0, 3).map((engineer) => (
                  <EngineerCard key={engineer._id} engineer={engineer} />
                ))}
                {!engineers?.length ? (
                  <div className="rounded-md border border-border-subtle bg-surface p-4 text-sm font-semibold text-muted-foreground">
                    No recommended engineers yet.
                  </div>
                ) : null}
              </div>
            )}
          </Card>
        </section>

        <section className="grid gap-4 rounded-lg border border-border-subtle bg-white/70 p-4 shadow-sm backdrop-blur-xl sm:grid-cols-2" aria-label="Quick actions">
          <button
            type="button"
            onClick={() => router.push("/dashboard/customer/post-job")}
            className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface px-4 py-3 text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
          >
            <span className="inline-flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
              Post New Job
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/customer/jobs")}
            className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface px-4 py-3 text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
          >
            <span className="inline-flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
              View All Jobs
            </span>
            <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </section>
      </div>

      <ReleasePaymentModal job={releaseJob} open={Boolean(releaseJob)} onClose={() => setReleaseJob(null)} />
    </main>
  );
}
