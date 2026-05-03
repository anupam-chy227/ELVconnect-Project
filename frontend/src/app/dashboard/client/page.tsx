"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bell,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  DoorOpen,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Flame,
  IndianRupee,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RevenueAreaChart, type RevenuePoint } from "@/components/charts/DashboardCharts";
import { Button, Card, PaymentTrustCard, VerificationBadge } from "@/components/ui";
import { cn, progressWidthClass } from "@/components/ui/utils";
import { useAuth } from "@/hooks/useAuth";

type StatTone = "blue" | "purple" | "orange" | "green";
type ProjectStatus = "Planning" | "Survey Done" | "In Progress" | "QA" | "Completed";
type StatusFilter = ProjectStatus | "All";
type EngineerTier = "Gold" | "Platinum" | "Specialist";
type RiskState = "low" | "medium" | "high";
type ActivityTone = "primary" | "success" | "warning";
type DocumentType = "Work order" | "BOQ" | "QA evidence" | "Invoice" | "Compliance";

type StatCardData = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: StatTone;
  sparkline: number[];
};

type ProjectRow = {
  id: string;
  name: string;
  category: "CCTV" | "Fire Safety" | "Access Control" | "Data Networking";
  city: string;
  area: string;
  site: string;
  engineer: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  applications: number;
  trustScore: number;
  risk: RiskState;
  nextAction: string;
  documents: number;
  paymentState: "Escrow funded" | "Release ready" | "Invoice review" | "Settled";
  surveySlot: string;
  href: string;
};

type ActivityEvent = {
  title: string;
  site: string;
  city: string;
  timestamp: string;
  tone: ActivityTone;
};

type PaymentSummary = {
  escrowHeld: number;
  released: number;
  pendingRelease: number;
  milestoneMet: boolean;
  releaseProject: string;
  releaseSite: string;
  upiRail: string;
  checklist: Array<{
    label: string;
    complete: boolean;
  }>;
};

type Engineer = {
  name: string;
  initials: string;
  city: string;
  area: string;
  specialization: string;
  rating: number;
  trustScore: number;
  jobsDone: number;
  responseTime: string;
  tier: EngineerTier;
  siteFit: string;
};

type SurveyDay = {
  day: string;
  date: string;
  surveys: Array<{
    time: string;
    project: string;
    city: string;
    area: string;
    site: string;
  }>;
};

type FollowUpAction = {
  title: string;
  detail: string;
  city: string;
  site: string;
  due: string;
  tone: "primary" | "warning" | "success";
  href: string;
};

type VaultItem = {
  title: string;
  type: DocumentType;
  project: string;
  city: string;
  site: string;
  updated: string;
  status: "Ready" | "Needs review" | "Signed";
};

const projectStatuses = ["Planning", "Survey Done", "In Progress", "QA", "Completed"] as const satisfies readonly ProjectStatus[];

const statCards: StatCardData[] = [
  {
    label: "Active Jobs",
    value: "6",
    change: "+18% vs last month",
    icon: BriefcaseBusiness,
    tone: "blue",
    sparkline: [18, 24, 21, 30, 34, 42, 48],
  },
  {
    label: "Engineers Applied",
    value: "23",
    change: "+31% vs last month",
    icon: UsersRound,
    tone: "purple",
    sparkline: [14, 18, 16, 24, 29, 33, 39],
  },
  {
    label: "In Progress Jobs",
    value: "4",
    change: "+12% vs last month",
    icon: Clock3,
    tone: "orange",
    sparkline: [10, 12, 18, 16, 22, 27, 32],
  },
  {
    label: "Monthly Spend",
    value: "Rs 1,84,000",
    change: "-8% vs last month",
    icon: IndianRupee,
    tone: "green",
    sparkline: [42, 38, 34, 36, 30, 27, 24],
  },
];

const projects: ProjectRow[] = [
  {
    id: "ELV-CCTV-1184",
    name: "Factory CCTV deployment",
    category: "CCTV",
    city: "Manesar",
    area: "IMT Sector 8",
    site: "Plant 2 loading bay",
    engineer: "Raju Sharma",
    status: "In Progress",
    progress: 68,
    budget: 240000,
    applications: 8,
    trustScore: 94,
    risk: "low",
    nextAction: "Approve cable route photos",
    documents: 9,
    paymentState: "Escrow funded",
    surveySlot: "Thu, 09:30",
    href: "/dashboard/jobs",
  },
  {
    id: "ELV-FIRE-2207",
    name: "Fire NOC readiness audit",
    category: "Fire Safety",
    city: "Delhi NCR",
    area: "Okhla Phase II",
    site: "Corporate office tower",
    engineer: "Nisha Khan",
    status: "Survey Done",
    progress: 42,
    budget: 110000,
    applications: 5,
    trustScore: 91,
    risk: "medium",
    nextAction: "Review survey checklist",
    documents: 7,
    paymentState: "Invoice review",
    surveySlot: "Mon, 10:00",
    href: "/dashboard/jobs",
  },
  {
    id: "ELV-ACS-3041",
    name: "Access control upgrade",
    category: "Access Control",
    city: "Noida",
    area: "Sector 62",
    site: "R&D campus entry gates",
    engineer: "Amit Verma",
    status: "Planning",
    progress: 24,
    budget: 180000,
    applications: 6,
    trustScore: 88,
    risk: "medium",
    nextAction: "Confirm visitor turnstile scope",
    documents: 5,
    paymentState: "Escrow funded",
    surveySlot: "Wed, 12:30",
    href: "/dashboard/jobs",
  },
  {
    id: "ELV-NET-4490",
    name: "Structured cabling handover",
    category: "Data Networking",
    city: "Gurugram",
    area: "Cyber City",
    site: "Tower B floors 8-10",
    engineer: "Karthik Rao",
    status: "QA",
    progress: 88,
    budget: 320000,
    applications: 4,
    trustScore: 96,
    risk: "low",
    nextAction: "Release QA milestone",
    documents: 14,
    paymentState: "Release ready",
    surveySlot: "Sat, 15:00",
    href: "/dashboard/jobs",
  },
  {
    id: "ELV-CCTV-5112",
    name: "Warehouse camera analytics",
    category: "CCTV",
    city: "Pune",
    area: "Chakan MIDC",
    site: "Warehouse C cold aisle",
    engineer: "Sandeep Patel",
    status: "Completed",
    progress: 100,
    budget: 164000,
    applications: 3,
    trustScore: 97,
    risk: "low",
    nextAction: "Download completion pack",
    documents: 18,
    paymentState: "Settled",
    surveySlot: "Completed",
    href: "/dashboard/jobs",
  },
];

const followUpActions: FollowUpAction[] = [
  {
    title: "Approve QA milestone",
    detail: "Structured cabling evidence is ready for client release.",
    city: "Gurugram",
    site: "Tower B floors 8-10",
    due: "Today, 6:00 PM",
    tone: "primary",
    href: "/dashboard/payments",
  },
  {
    title: "Review fire survey checklist",
    detail: "Two compliance notes need acceptance before quotation lock.",
    city: "Delhi NCR",
    site: "Corporate office tower",
    due: "Tomorrow, 11:00 AM",
    tone: "warning",
    href: "/dashboard/jobs",
  },
  {
    title: "Upload revised BOQ",
    detail: "Access control scope changed for visitor turnstile lane.",
    city: "Noida",
    site: "R&D campus entry gates",
    due: "May 6, 2026",
    tone: "success",
    href: "/post-requirement",
  },
];

const activityFeed: ActivityEvent[] = [
  {
    title: "Raju uploaded cable route and NVR rack photos",
    site: "Plant 2 loading bay",
    city: "Manesar",
    timestamp: "12 min ago",
    tone: "success",
  },
  {
    title: "Nisha confirmed fire panel survey findings",
    site: "Corporate office tower",
    city: "Delhi NCR",
    timestamp: "36 min ago",
    tone: "primary",
  },
  {
    title: "3 engineers applied to the access control upgrade",
    site: "R&D campus entry gates",
    city: "Noida",
    timestamp: "1h ago",
    tone: "primary",
  },
  {
    title: "Escrow created for structured cabling handover",
    site: "Tower B floors 8-10",
    city: "Gurugram",
    timestamp: "2h ago",
    tone: "success",
  },
  {
    title: "Completion pack needs client download confirmation",
    site: "Warehouse C cold aisle",
    city: "Pune",
    timestamp: "4h ago",
    tone: "warning",
  },
];

const paymentSummary: PaymentSummary = {
  escrowHeld: 284000,
  released: 620000,
  pendingRelease: 96000,
  milestoneMet: true,
  releaseProject: "Structured cabling handover",
  releaseSite: "Tower B floors 8-10, Gurugram",
  upiRail: "UPI escrow rail verified",
  checklist: [
    { label: "QA evidence approved", complete: true },
    { label: "Engineer KYC active", complete: true },
    { label: "Client release approval", complete: true },
    { label: "UPI payout rail checked", complete: true },
  ],
};

const paymentRows = [
  { label: "Escrow held", value: paymentSummary.escrowHeld },
  { label: "Released", value: paymentSummary.released },
  { label: "Pending release", value: paymentSummary.pendingRelease },
] satisfies Array<{ label: string; value: number }>;

const revenueTrend: RevenuePoint[] = [
  { label: "Jan", revenue: 72000 },
  { label: "Feb", revenue: 94000 },
  { label: "Mar", revenue: 118000 },
  { label: "Apr", revenue: 146000 },
  { label: "May", revenue: 184000 },
];

const recommendedEngineers: Engineer[] = [
  {
    name: "Raju Sharma",
    initials: "RS",
    city: "Manesar",
    area: "IMT Sector 8",
    specialization: "CCTV commissioning",
    rating: 4.9,
    trustScore: 96,
    jobsDone: 82,
    responseTime: "12 min",
    tier: "Platinum",
    siteFit: "Industrial CCTV and NVR rack audits",
  },
  {
    name: "Amit Verma",
    initials: "AV",
    city: "Noida",
    area: "Sector 62",
    specialization: "Access control",
    rating: 4.8,
    trustScore: 93,
    jobsDone: 64,
    responseTime: "18 min",
    tier: "Gold",
    siteFit: "Turnstile, biometric, and visitor gate flows",
  },
  {
    name: "Karthik Rao",
    initials: "KR",
    city: "Gurugram",
    area: "Cyber City",
    specialization: "Data networking",
    rating: 4.9,
    trustScore: 97,
    jobsDone: 91,
    responseTime: "9 min",
    tier: "Specialist",
    siteFit: "Structured cabling QA and OTDR evidence",
  },
];

const surveyWeek: SurveyDay[] = [
  {
    day: "Mon",
    date: "04",
    surveys: [{ time: "10:00", project: "Fire NOC audit", city: "Delhi NCR", area: "Okhla Phase II", site: "Corporate office tower" }],
  },
  { day: "Tue", date: "05", surveys: [] },
  {
    day: "Wed",
    date: "06",
    surveys: [{ time: "12:30", project: "Access control upgrade", city: "Noida", area: "Sector 62", site: "R&D campus entry gates" }],
  },
  {
    day: "Thu",
    date: "07",
    surveys: [{ time: "09:30", project: "Factory CCTV deployment", city: "Manesar", area: "IMT Sector 8", site: "Plant 2 loading bay" }],
  },
  { day: "Fri", date: "08", surveys: [] },
  {
    day: "Sat",
    date: "09",
    surveys: [{ time: "15:00", project: "Structured cabling handover", city: "Gurugram", area: "Cyber City", site: "Tower B floors 8-10" }],
  },
  { day: "Sun", date: "10", surveys: [] },
];

const vaultItems: VaultItem[] = [
  {
    title: "Signed work order",
    type: "Work order",
    project: "Factory CCTV deployment",
    city: "Manesar",
    site: "Plant 2 loading bay",
    updated: "Today, 09:20",
    status: "Signed",
  },
  {
    title: "Fire survey compliance notes",
    type: "Compliance",
    project: "Fire NOC readiness audit",
    city: "Delhi NCR",
    site: "Corporate office tower",
    updated: "Today, 08:45",
    status: "Needs review",
  },
  {
    title: "QA evidence pack",
    type: "QA evidence",
    project: "Structured cabling handover",
    city: "Gurugram",
    site: "Tower B floors 8-10",
    updated: "Yesterday, 18:10",
    status: "Ready",
  },
];

const sidebarItems = [
  { label: "Overview", href: "/dashboard/client", icon: LayoutDashboard },
  { label: "Post Job", href: "/post-requirement", icon: Plus },
  { label: "Agreements", href: "/dashboard/client/agreement", icon: FileCheck2 },
  { label: "Projects", href: "/dashboard/jobs", icon: ClipboardList },
  { label: "Engineers", href: "/dashboard/engineers", icon: UsersRound },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Site Surveys", href: "/dashboard/surveys", icon: CalendarDays },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Sparkline({ values, tone }: { values: number[]; tone: StatTone }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 96;
      const y = 32 - ((value - min) / Math.max(max - min, 1)) * 28;
      return `${x},${y}`;
    })
    .join(" ");
  const stroke = {
    blue: "#2563eb",
    purple: "#7c3aed",
    orange: "#f97316",
    green: "#16a34a",
  } satisfies Record<StatTone, string>;

  return (
    <svg viewBox="0 0 96 36" className="h-10 w-24" aria-hidden="true">
      <polyline points={points} fill="none" stroke={stroke[tone]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusChip({ status }: { status: ProjectStatus }) {
  const className = {
    Planning: "border-slate-200 bg-slate-100 text-slate-700",
    "Survey Done": "border-blue-200 bg-blue-50 text-blue-700",
    "In Progress": "border-orange-200 bg-orange-50 text-orange-700",
    QA: "border-purple-200 bg-purple-50 text-purple-700",
    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  } satisfies Record<ProjectStatus, string>;

  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black", className[status])}>{status}</span>;
}

function RiskChip({ risk }: { risk: RiskState }) {
  const className = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    high: "border-rose-200 bg-rose-50 text-rose-700",
  } satisfies Record<RiskState, string>;

  const label = {
    low: "Low risk",
    medium: "Watch",
    high: "High risk",
  } satisfies Record<RiskState, string>;

  return <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black uppercase", className[risk])}>{label[risk]}</span>;
}

function GradientProgress({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[120px]" aria-label={label}>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div className={cn("h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400", progressWidthClass(value))} />
      </div>
      <p className="mt-1 text-[11px] font-bold text-muted-foreground">{value}% complete</p>
    </div>
  );
}

function CategoryIcon({ category }: { category: ProjectRow["category"] }) {
  const iconMap = {
    CCTV: Camera,
    "Fire Safety": Flame,
    "Access Control": DoorOpen,
    "Data Networking": Network,
  } satisfies Record<ProjectRow["category"], LucideIcon>;
  const Icon = iconMap[category];

  return (
    <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/15 bg-primary-subtle text-primary">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[276px] shrink-0 border-r border-white/60 bg-white/78 px-4 py-5 shadow-glass backdrop-blur-2xl lg:block dark:border-elv-dark-border dark:bg-elv-dark-1/85" aria-label="Client dashboard navigation">
      <Link href="/" className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-gradient-to-b from-primary to-primary-container text-xs font-black text-on-primary shadow-glow">ELV</span>
        <span>
          <span className="block text-sm font-black text-foreground">ELV Connect</span>
          <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-primary">Client Ops</span>
        </span>
      </Link>
      <nav className="mt-8 grid gap-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/dashboard/client";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                active
                  ? "border-primary/20 bg-primary-subtle text-primary shadow-sm"
                  : "border-transparent text-muted-foreground hover:border-border-subtle hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 rounded-lg border border-primary/15 bg-gradient-to-br from-primary-subtle via-white to-white p-4 shadow-sm dark:from-elv-dark-2 dark:via-elv-dark-1 dark:to-elv-dark-1">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        <p className="mt-3 text-sm font-black text-foreground">Trust posture</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Escrow, verified engineers, site survey audit trail, and UPI release controls are active.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <VerificationBadge level="verified" label="Verified client" />
          <VerificationBadge level="escrow" label="Escrow guarded" />
        </div>
      </div>
    </aside>
  );
}

function StatCard({ stat }: { stat: StatCardData }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  } satisfies Record<StatTone, string>;
  const Icon = stat.icon;

  return (
    <Card variant="glass" className="p-4">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("grid h-11 w-11 place-items-center rounded-md border", toneClass[stat.tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <Sparkline values={stat.sparkline} tone={stat.tone} />
      </div>
      <p className="mt-5 text-sm font-bold text-muted-foreground">{stat.label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-foreground">{stat.value}</p>
      <p className="mt-2 inline-flex items-center gap-1 text-xs font-black text-success">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
        {stat.change}
      </p>
    </Card>
  );
}

function ActiveProjectsTable({
  filteredProjects,
  query,
  statusFilter,
  onQueryChange,
  onStatusChange,
}: {
  filteredProjects: ProjectRow[];
  query: string;
  statusFilter: StatusFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}) {
  return (
    <Card variant="glass" className="overflow-hidden p-0">
      <div className="flex flex-col gap-4 border-b border-border-subtle p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Project command table</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Client Project Portfolio</h2>
          <p className="mt-1 text-sm text-muted-foreground">City, site, trust, payment, and delivery status in one scan.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <span className="sr-only">Search projects</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-10 w-full rounded-md border border-border-subtle bg-surface pl-9 pr-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary-ring sm:w-[240px]"
              placeholder="Search city, site, engineer"
              type="search"
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Filter projects by status</span>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
              className="h-10 w-full rounded-md border border-border-subtle bg-surface pl-9 pr-8 text-sm font-black text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary-ring sm:w-[180px]"
            >
              <option value="All">All statuses</option>
              {projectStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left">
          <caption className="sr-only">Client active projects with city, site, status, trust, progress, payment, and actions</caption>
          <thead className="bg-surface-muted text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {["Project and Site", "Category", "Engineer", "Status", "Trust", "Progress", "Budget", "Payment", "Documents", "Action"].map((header) => (
                <th key={header} scope="col" className="px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="transition hover:bg-white/70 dark:hover:bg-elv-dark-2/60">
                <td className="px-4 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">{project.id}</p>
                  <p className="mt-1 font-black text-foreground">{project.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {project.site}, {project.area}, {project.city}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={project.category} />
                    <span className="text-sm font-black text-foreground">{project.category}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-black text-foreground">{project.engineer}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{project.applications} applied</p>
                </td>
                <td className="px-4 py-4">
                  <StatusChip status={project.status} />
                  <p className="mt-2 text-[11px] font-bold text-muted-foreground">{project.surveySlot}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="grid gap-2">
                    <VerificationBadge level={project.risk === "high" ? "risk" : "verified"} score={project.trustScore} />
                    <RiskChip risk={project.risk} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <GradientProgress value={project.progress} label={`${project.name} progress ${project.progress}%`} />
                </td>
                <td className="px-4 py-4 text-sm font-black text-foreground">{formatCurrency(project.budget)}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-primary/20 bg-primary-subtle px-2.5 py-1 text-[11px] font-black text-primary">{project.paymentState}</span>
                </td>
                <td className="px-4 py-4">
                  <Link href="/dashboard/documents" className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface px-3 py-1.5 text-xs font-black text-foreground transition hover:border-primary/30 hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring">
                    <FileText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {project.documents} files
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={project.href} className="inline-flex items-center gap-1 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-black text-primary transition hover:border-primary/30 hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring">
                      Open
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-xs font-black text-on-primary shadow-sm transition hover:bg-primary-container focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring" aria-label={`${project.nextAction} for ${project.name}`}>
                      Review
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t border-border-subtle bg-white/60 px-5 py-3 text-xs font-bold text-muted-foreground sm:flex-row sm:items-center sm:justify-between dark:bg-elv-dark-1/60">
        <span>{filteredProjects.length} projects visible</span>
        <span>Sorted by action priority and site readiness</span>
      </div>
    </Card>
  );
}

function FollowUpActionsCard() {
  const toneClass = {
    primary: "border-primary/20 bg-primary-subtle text-primary",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  } satisfies Record<FollowUpAction["tone"], string>;

  return (
    <Card variant="glass" className="h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Next best actions</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Follow-Up Queue</h2>
        </div>
        <Link href="/post-requirement" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-3 py-2 text-xs font-black text-on-primary shadow-glow transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Post Job
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {followUpActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group rounded-md border border-border-subtle bg-surface p-3 shadow-sm transition hover:border-primary/30 hover:bg-primary-subtle/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-black", toneClass[action.tone])}>{action.due}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-black text-foreground">{action.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{action.detail}</p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {action.site}, {action.city}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function PaymentSummaryCard() {
  const [releaseRequested, setReleaseRequested] = useState(false);

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Escrow control</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Payment Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">{paymentSummary.releaseSite}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-md bg-success-subtle text-success">
          <WalletCards className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <dl className="mt-5 grid gap-3">
        {paymentRows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between rounded-md border border-border-subtle bg-white/72 px-3 py-2.5 dark:bg-elv-dark-2/70">
            <dt className="text-sm font-bold text-muted-foreground">{label}</dt>
            <dd className="text-sm font-black text-foreground">{formatCurrency(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 rounded-md border border-primary/15 bg-primary-subtle p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-foreground">{paymentSummary.releaseProject}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{paymentSummary.upiRail}</p>
          </div>
          <VerificationBadge level="escrow" label="Secure release" />
        </div>
        <div className="mt-4 grid gap-2" aria-label="Secure payment release checklist">
          {paymentSummary.checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-foreground">
              <CheckCircle2 className={cn("h-4 w-4", item.complete ? "text-success" : "text-muted-foreground")} aria-hidden="true" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
      {paymentSummary.milestoneMet ? (
        <Button
          type="button"
          className="mt-5"
          fullWidth
          variant={releaseRequested ? "success" : "primary"}
          leftIcon={releaseRequested ? <CheckCircle2 className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
          onClick={() => setReleaseRequested(true)}
          aria-live="polite"
        >
          {releaseRequested ? "Release Requested" : `Release ${formatCurrency(paymentSummary.pendingRelease)}`}
        </Button>
      ) : null}
      <p className="mt-3 text-xs font-semibold text-muted-foreground">Release stays gated by QA proof, client approval, and verified UPI payout rails.</p>
    </Card>
  );
}

function SpendChartCard() {
  return (
    <Card variant="glass" className="p-5 xl:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Spend intelligence</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Monthly Spend Trend</h2>
          <p className="mt-1 text-sm text-muted-foreground">Client spend across active ELV execution sites.</p>
        </div>
        <VerificationBadge level="verified" label="Ledger matched" />
      </div>
      <RevenueAreaChart data={revenueTrend} className="mt-4 h-56" />
    </Card>
  );
}

function RecommendedEngineersCard() {
  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Verified supply</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Recommended Engineers</h2>
          <p className="mt-1 text-sm text-muted-foreground">Matched to your city, category, and site context.</p>
        </div>
        <Link href="/dashboard/engineers" className="hidden items-center gap-1 text-sm font-black text-primary sm:inline-flex">
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {recommendedEngineers.map((engineer) => (
          <article key={engineer.name} className="rounded-md border border-border-subtle bg-surface p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-black text-on-primary shadow-md">{engineer.initials}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-black text-foreground">{engineer.name}</h3>
                  <span className="rounded-full border border-primary/20 bg-primary-subtle px-2 py-0.5 text-[10px] font-black text-primary">{engineer.tier}</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{engineer.specialization}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {engineer.area}, {engineer.city}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <VerificationBadge level="verified" score={engineer.trustScore} />
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                {engineer.rating}
              </span>
              <span className="rounded-full border border-border-subtle bg-surface-muted px-2.5 py-1 text-[11px] font-black text-muted-foreground">{engineer.jobsDone} jobs</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{engineer.siteFit}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] font-black text-success">Responds in {engineer.responseTime}</span>
              <Link href="/dashboard/engineers" className="rounded-md bg-primary px-3 py-1.5 text-xs font-black text-on-primary transition hover:bg-primary-container focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring">
                Invite
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function RecentActivityCard() {
  const activityTone = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
  } satisfies Record<ActivityTone, string>;

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Live trail</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Recent Activity</h2>
        </div>
        <Clock3 className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <ol className="mt-5 space-y-3" aria-label="Recent client dashboard activity">
        {activityFeed.map((event) => (
          <li key={`${event.title}-${event.timestamp}`} className="flex gap-3 rounded-md border border-border-subtle bg-surface p-3">
            <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", activityTone[event.tone])} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-5 text-foreground">{event.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {event.site}, {event.city}
                <time>{event.timestamp}</time>
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function DocumentVaultCard() {
  const statusClass = {
    Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
    "Needs review": "border-amber-200 bg-amber-50 text-amber-700",
    Signed: "border-primary/20 bg-primary-subtle text-primary",
  } satisfies Record<VaultItem["status"], string>;

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Document vault</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Client Evidence Library</h2>
          <p className="mt-1 text-sm text-muted-foreground">Work orders, BOQs, QA packs, invoices, and compliance files.</p>
        </div>
        <Link href="/dashboard/documents" className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs font-black text-primary transition hover:border-primary/30 hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring">
          Open vault
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {vaultItems.map((item) => (
          <article key={`${item.title}-${item.project}`} className="rounded-md border border-border-subtle bg-surface p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-foreground">{item.title}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {item.type} - {item.project}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black", statusClass[item.status])}>{item.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {item.site}, {item.city}
              </span>
              <span>{item.updated}</span>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function SurveyCalendar() {
  return (
    <Card variant="glass" className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Site calendar</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Upcoming Site Surveys</h2>
          <p className="mt-1 text-sm text-muted-foreground">Week view for confirmed engineer visits across your active cities.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1.5 text-xs font-black uppercase text-primary">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          May 4-10
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-7">
        {surveyWeek.map((day) => (
          <section key={day.day} className="min-h-[166px] rounded-md border border-border-subtle bg-surface-muted p-3" aria-label={`${day.day} ${day.date}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase text-muted-foreground">{day.day}</p>
              <p className="font-mono text-sm font-black text-foreground">{day.date}</p>
            </div>
            <div className="mt-3 grid gap-2">
              {day.surveys.length ? (
                day.surveys.map((survey) => (
                  <article key={`${survey.time}-${survey.project}`} className="rounded-md border border-primary/20 bg-white p-2 shadow-sm dark:bg-elv-dark-1">
                    <p className="text-[11px] font-black text-primary">{survey.time}</p>
                    <p className="mt-1 text-xs font-black leading-4 text-foreground">{survey.project}</p>
                    <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{survey.site}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <MapPin className="h-3 w-3 text-primary" aria-hidden="true" />
                      {survey.area}, {survey.city}
                    </p>
                  </article>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-border-subtle px-2 py-6 text-center text-xs font-bold text-muted-foreground">No visits</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </Card>
  );
}

function CategoryIconStrip() {
  const items = [
    { label: "CCTV", icon: Camera },
    { label: "Fire", icon: Flame },
    { label: "Access", icon: DoorOpen },
    { label: "Network", icon: Network },
  ];

  return (
    <div className="hidden items-center gap-2 xl:flex" aria-label="Active project categories">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-black text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {item.label}
          </span>
        );
      })}
    </div>
  );
}

function LiveOpsHeader({
  firstName,
  dateLabel,
}: {
  firstName: string;
  dateLabel: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/84 px-4 py-4 shadow-sm backdrop-blur-2xl sm:px-6 lg:px-8 dark:border-elv-dark-border dark:bg-elv-dark-1/88">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary">
            <span>{dateLabel}</span>
            <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
            <span>Delhi NCR operating cluster</span>
          </div>
          <h1 className="mt-2 truncate text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">Portfolio health across Manesar, Delhi NCR, Noida, Gurugram, and Pune sites.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CategoryIconStrip />
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 text-sm font-black text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
            aria-label="Change operating city"
          >
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Delhi NCR
          </button>
          <button
            type="button"
            className="relative grid h-11 w-11 place-items-center rounded-md border border-border-subtle bg-surface text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger" />
          </button>
          <Link
            href="/post-requirement"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-4 py-2 text-sm font-black text-on-primary shadow-glow transition hover:-translate-y-0.5 hover:shadow-floating focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post Job
          </Link>
        </div>
      </div>
    </header>
  );
}

function TrustOverviewBand() {
  const items = [
    { label: "Verified engineers", value: "23", icon: ShieldCheck },
    { label: "Site surveys booked", value: "4", icon: CalendarCheck2 },
    { label: "Open documents", value: "36", icon: FileCheck2 },
    { label: "Escrow guarded", value: formatCurrency(paymentSummary.escrowHeld), icon: Banknote },
  ];

  return (
    <section className="rounded-lg border border-white/20 bg-gradient-to-br from-elv-indigo via-elv-violet to-elv-purple p-5 text-white shadow-glow" aria-label="Client trust and compliance overview">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Live trust signals</p>
          <h2 className="mt-2 text-xl font-black">Execution guarded from job post to payment release</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/72">Every active site shows engineer verification, escrow readiness, document coverage, and audit evidence before milestone release.</p>
        </div>
        <Link href="/trust-safety" className="inline-flex w-fit items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/16 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30">
          View trust center
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-md border border-white/14 bg-white/10 p-3 backdrop-blur-xl">
              <Icon className="h-4 w-4 text-white/80" aria-hidden="true" />
              <p className="mt-3 text-2xl font-black">{item.value}</p>
              <p className="mt-1 text-xs font-bold text-white/70">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ClientDashboardContent() {
  const { user } = useAuth();
  const dateLabel = "Today";
  const [projectQuery, setProjectQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const firstName = user?.profile.fullName?.split(" ")[0] || "Rajesh";

  const filteredProjects = useMemo(() => {
    const query = projectQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesStatus = statusFilter === "All" || project.status === statusFilter;
      const matchesQuery =
        !query ||
        [project.name, project.category, project.city, project.area, project.site, project.engineer, project.id].some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [projectQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f9ff_0%,#ffffff_42%,#f3f0ff_100%)] text-foreground dark:bg-[linear-gradient(180deg,#0d0d1a_0%,#13132b_50%,#1c1c3a_100%)]">
      <div className="flex">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">
          <LiveOpsHeader firstName={firstName} dateLabel={dateLabel} />

          <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <TrustOverviewBand />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Client dashboard key metrics">
              {statCards.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(340px,1fr)]">
              <ActiveProjectsTable
                filteredProjects={filteredProjects}
                query={projectQuery}
                statusFilter={statusFilter}
                onQueryChange={setProjectQuery}
                onStatusChange={setStatusFilter}
              />
              <FollowUpActionsCard />
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <PaymentSummaryCard />
              <SpendChartCard />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
              <PaymentTrustCard amount={formatCurrency(paymentSummary.pendingRelease)} method="upi" status="UPI release remains gated by milestone approval." />
              <RecommendedEngineersCard />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
              <SurveyCalendar />
              <div className="grid gap-6">
                <DocumentVaultCard />
                <RecentActivityCard />
              </div>
            </section>

            <section className="grid gap-4 rounded-lg border border-border-subtle bg-white/70 p-4 shadow-sm backdrop-blur-xl sm:grid-cols-3 dark:bg-elv-dark-1/70" aria-label="Client dashboard shortcuts">
              {[
                { label: "Create work order", href: "/dashboard/client/agreement", icon: ClipboardCheck },
                { label: "Download reports", href: "/dashboard/documents", icon: Download },
                { label: "Review payment queue", href: "/dashboard/payments", icon: CreditCard },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface px-4 py-3 text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-primary-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring">
                    <span className="inline-flex items-center gap-3">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      {item.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
