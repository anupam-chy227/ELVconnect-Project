"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Search,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { Badge, Button, Card, EmptyState, Progress, Table, type TableColumn } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@/hooks/useQuery";
import type { Invoice, Job } from "@/types";

interface ApiCollectionResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type ProjectRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  budget: number;
  progress: number;
  due: string;
  trust: string;
};

const demoProjects: ProjectRow[] = [
  {
    id: "demo-cctv",
    title: "Factory CCTV deployment",
    category: "CCTV Systems",
    location: "Manesar, Haryana",
    status: "in_progress",
    budget: 240000,
    progress: 72,
    due: "May 08",
    trust: "Verified vendor assigned",
  },
  {
    id: "demo-fire",
    title: "Fire NOC readiness audit",
    category: "Fire Safety",
    location: "Delhi NCR",
    status: "open",
    budget: 110000,
    progress: 34,
    due: "May 14",
    trust: "3 proposals expected",
  },
  {
    id: "demo-access",
    title: "Access control upgrade",
    category: "Access Control",
    location: "Noida Sector 62",
    status: "applications_received",
    budget: 180000,
    progress: 48,
    due: "May 19",
    trust: "Shortlist in review",
  },
  {
    id: "demo-network",
    title: "Structured cabling handover",
    category: "Networking",
    location: "Gurugram",
    status: "completed",
    budget: 320000,
    progress: 100,
    due: "Done",
    trust: "QA proof uploaded",
  },
];

const quickJobs = [
  {
    title: "IP camera health check",
    location: "Mumbai",
    budget: 45000,
    urgency: "High",
  },
  {
    title: "Boom barrier service",
    location: "Bengaluru",
    budget: 28000,
    urgency: "Medium",
  },
  {
    title: "Fire alarm panel testing",
    location: "Pune",
    budget: 36000,
    urgency: "High",
  },
];

function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function cleanStatus(status: string) {
  return status.replace(/_/g, " ");
}

function statusTone(status: string): "primary" | "success" | "warning" | "danger" | "neutral" {
  if (["completed", "paid", "in_progress"].includes(status)) return "success";
  if (["applications_received", "partially_paid", "draft"].includes(status)) return "warning";
  if (["cancelled", "overdue", "disputed"].includes(status)) return "danger";
  if (["open", "sent", "viewed"].includes(status)) return "primary";
  return "neutral";
}

function invoiceOutstanding(invoice: Invoice) {
  return invoice.balanceDue ?? Math.max(invoice.grandTotal - (invoice.totalPaid ?? 0), 0);
}

function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: "primary" | "secondary" | "success" | "danger";
}) {
  const toneClass = {
    primary: "bg-primary-subtle text-primary ring-primary/10",
    secondary: "bg-secondary-subtle text-secondary ring-secondary/10",
    success: "bg-success-subtle text-success ring-success/10",
    danger: "bg-danger-subtle text-danger ring-danger/10",
  }[tone];

  return (
    <Card variant="stat" className="group overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-xl font-black tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{caption}</p>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ring-1 transition group-hover:scale-105 ${toneClass}`}>
          <Icon className="size-4" />
        </span>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: jobsResponse, loading: jobsLoading } = useQuery<ApiCollectionResponse<Job>>(
    user?.role === "customer" ? "/jobs/my" : null,
    { enabled: user?.role === "customer", retry: false, showErrorToast: false },
  );

  const { data: invoicesResponse, loading: invoicesLoading } = useQuery<ApiCollectionResponse<Invoice>>("/invoices", {
    enabled: Boolean(user),
    retry: false,
    showErrorToast: false,
  });

  const jobs = jobsResponse?.data ?? [];
  const invoices = invoicesResponse?.data ?? [];
  const activeJobs = jobs.filter((job) => !["completed", "cancelled"].includes(job.status));
  const outstanding = invoices
    .filter((invoice) => !["paid", "cancelled"].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoiceOutstanding(invoice), 0);
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  const activeEngineerIds = new Set<string>();

  jobs.forEach((job) => {
    if (job.assignedTo) activeEngineerIds.add(job.assignedTo);
    job.applications?.forEach((application) => {
      if (["accepted", "shortlisted"].includes(application.status)) {
        activeEngineerIds.add(application.serviceProviderId);
      }
    });
  });

  const projects = useMemo<ProjectRow[]>(() => {
    const normalized =
      jobs.length > 0
        ? jobs.map((job) => ({
            id: job._id,
            title: job.title,
            category: job.category.map((item) => item.replace(/_/g, " ")).join(", "),
            location: `${job.location.city}, ${job.location.country}`,
            status: job.status,
            budget: job.budget.max || job.budget.min || 0,
            progress:
              job.status === "completed"
                ? 100
                : job.status === "in_progress"
                  ? 72
                  : job.status === "applications_received"
                    ? 48
                    : job.status === "open"
                      ? 28
                      : 12,
            due: job.timeline.deadline ? new Date(job.timeline.deadline).toLocaleDateString("en-IN") : "Not set",
            trust: job.assignedTo ? "Vendor assigned" : `${job.applications?.length ?? 0} proposals`,
          }))
        : demoProjects;

    return normalized
      .filter((project) => statusFilter === "all" || project.status === statusFilter)
      .filter((project) => {
        const haystack = `${project.title} ${project.category} ${project.location}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      });
  }, [jobs, query, statusFilter]);

  const recentInvoices = invoices.slice(0, 4);
  const isLoading = jobsLoading || invoicesLoading;

  const columns = useMemo<TableColumn<ProjectRow>[]>(
    () => [
      {
        key: "project",
        header: "Project",
        cell: (project) => (
          <div className="min-w-[220px]">
            <p className="font-semibold text-slate-950 dark:text-white">{project.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{project.trust}</p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        cell: (project) => <span className="capitalize text-muted-foreground">{project.category}</span>,
      },
      {
        key: "location",
        header: "Location",
        cell: (project) => (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="size-3.5" />
            {project.location}
          </span>
        ),
      },
      {
        key: "budget",
        header: "Budget",
        cell: (project) => <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(project.budget)}</span>,
      },
      {
        key: "progress",
        header: "Progress",
        cell: (project) => (
          <div className="w-32">
            <Progress value={project.progress} showValue={false} tone={project.progress >= 70 ? "success" : "primary"} />
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{project.progress}% complete</p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (project) => <Badge tone={statusTone(project.status)} className="capitalize">{cleanStatus(project.status)}</Badge>,
      },
    ],
    [],
  );

  return (
    <DashboardLayout>
      <div className="mx-auto grid w-full max-w-7xl gap-4">
        <Card variant="glass" padding="none" className="overflow-hidden">
          <div className="border-b border-border-subtle bg-gradient-to-r from-white via-white to-indigo-50/80 p-5 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge tone="primary">Enterprise operations</Badge>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground">
                  {user?.role === "service_provider" ? "Vendor command dashboard" : "Client command dashboard"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Monitor ELV projects, verified engineers, billing exposure, and live job activity from one premium operations console.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/jobs/create"
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-gradient-to-b from-primary-container to-brand-700 px-4 py-2 text-sm font-semibold text-on-primary shadow-sm shadow-indigo-950/15 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Post requirement
                  <ArrowUpRight className="size-4" />
                </Link>
                <Link
                  href="/dashboard/invoices"
                  className="inline-flex min-h-10 items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-xs transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-sm"
                >
                  Billing
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Projects"
              value={isLoading ? "..." : String(jobs.length || demoProjects.length)}
              caption={`${activeJobs.length || 3} active workstreams`}
              icon={BriefcaseBusiness}
              tone="secondary"
            />
            <StatCard
              label="Revenue"
              value={isLoading ? "..." : formatCurrency(revenue || 530000)}
              caption="Tracked invoices and approved work"
              icon={IndianRupee}
              tone="primary"
            />
            <StatCard
              label="Engineers"
              value={isLoading ? "..." : String(activeEngineerIds.size || 18)}
              caption="Verified or shortlisted specialists"
              icon={UsersRound}
              tone="success"
            />
            <StatCard
              label="Risk & due"
              value={isLoading ? "..." : formatCurrency(outstanding || 120000)}
              caption="Open billing and alerts"
              icon={AlertTriangle}
              tone="danger"
            />
          </div>
        </Card>

        <section className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
          <Card
            title="Job list"
            description="Search, filter, and track the current ELV project pipeline."
            action={
              <Button type="button" variant="secondary" size="sm" onClick={() => { setQuery(""); setStatusFilter("all"); }}>
                Reset
              </Button>
            }
            padding="none"
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-b border-border-subtle p-4 lg:grid-cols-[1fr_180px]">
              <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 shadow-xs transition focus-within:border-secondary focus-within:shadow-focus">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search by job, category, location..."
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="min-h-10 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-xs outline-none transition hover:border-border-strong focus:border-secondary focus:shadow-focus"
              >
                <option value="all">All status</option>
                <option value="open">Open</option>
                <option value="applications_received">Screening</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {projects.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No jobs found"
                  description="Clear filters or post a new requirement to start receiving verified engineer responses."
                />
              </div>
            ) : (
              <Table columns={columns} data={projects} getRowKey={(project) => project.id} className="border-0 shadow-none" />
            )}
          </Card>

          <aside className="grid gap-4">
            <Card title="Live priority jobs" description="High-signal opportunities and follow-ups.">
              <div className="grid gap-3">
                {quickJobs.map((job) => (
                  <div
                    key={job.title}
                    className="rounded-lg border border-border-subtle bg-surface-muted p-3 transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white hover:shadow-sm dark:hover:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{job.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{job.location}</p>
                      </div>
                      <Badge tone={job.urgency === "High" ? "danger" : "warning"}>{job.urgency}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-foreground">{formatCurrency(job.budget)}</span>
                      <Link href="/jobs" className="text-xs font-semibold text-primary hover:underline">
                        View work
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Operations health" description="Quality, billing, and delivery snapshot.">
              <div className="grid gap-3">
                {[
                  { label: "QA ready jobs", value: jobs.filter((job) => job.status === "in_progress").length || 2, icon: CheckCircle2, tone: "success" as const },
                  { label: "Pending invoices", value: invoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.status)).length || 3, icon: CreditCard, tone: "primary" as const },
                  { label: "Verified coverage", value: "28 cities", icon: ShieldCheck, tone: "success" as const },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-muted p-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-md bg-primary-subtle text-primary">
                          <Icon className="size-4" />
                        </span>
                        <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                      </div>
                      <p className="font-black text-foreground">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Recent billing" description="Latest payment exposure.">
              {recentInvoices.length === 0 ? (
                <EmptyState title="No invoices yet" description="Milestone invoices will appear here after billing is created." />
              ) : (
                <div className="divide-y divide-border-subtle">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice._id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{invoice.invoiceNumber}</p>
                        <p className="truncate text-xs text-muted-foreground">{invoice.projectName || invoice.to.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-foreground">{formatCurrency(invoiceOutstanding(invoice), invoice.currency)}</p>
                        <Badge tone={statusTone(invoice.status)} className="capitalize">{cleanStatus(invoice.status)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
