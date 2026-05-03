"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Radio,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LiveOperationsPanel } from "@/components/Admin/LiveOperationsPanel";
import { Badge, Card, Progress } from "@/components/ui";

type StatCard = {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: LucideIcon;
  tone: "indigo" | "emerald" | "amber" | "rose";
};

type ActivityItem = {
  title: string;
  meta: string;
  time: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "danger";
};

type ModuleCard = {
  title: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "danger";
};

const stats: StatCard[] = [
  {
    label: "Active Projects",
    value: "4,289",
    change: "+12.4%",
    detail: "312 new jobs this week",
    icon: BriefcaseBusiness,
    tone: "indigo",
  },
  {
    label: "Platform Revenue",
    value: "Rs 2.4M",
    change: "+18.2%",
    detail: "UPI and escrow settled",
    icon: IndianRupee,
    tone: "emerald",
  },
  {
    label: "Verified Engineers",
    value: "1,842",
    change: "+9.6%",
    detail: "45 pending KYC reviews",
    icon: UsersRound,
    tone: "indigo",
  },
  {
    label: "Delayed Projects",
    value: "27",
    change: "-6.1%",
    detail: "8 need admin escalation",
    icon: Clock3,
    tone: "rose",
  },
];

const projectCategories = [
  { label: "CCTV & Surveillance", value: 38, color: "from-indigo-500 to-violet-500" },
  { label: "Fire Safety", value: 24, color: "from-rose-500 to-orange-400" },
  { label: "Access Control", value: 21, color: "from-emerald-500 to-teal-400" },
  { label: "Networking", value: 17, color: "from-sky-500 to-indigo-400" },
];

const revenueTrend = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 58 },
  { month: "Mar", value: 51 },
  { month: "Apr", value: 76 },
  { month: "May", value: 63 },
  { month: "Jun", value: 88 },
  { month: "Jul", value: 92 },
  { month: "Aug", value: 84 },
];

const activityFeed: ActivityItem[] = [
  {
    title: "Payment released for Mumbai CCTV rollout",
    meta: "Escrow settlement completed",
    time: "now",
    icon: CreditCard,
    tone: "success",
  },
  {
    title: "Engineer KYC approved in Delhi NCR",
    meta: "Amit S. joined verified network",
    time: "1m ago",
    icon: ShieldCheck,
    tone: "primary",
  },
  {
    title: "Project SLA warning triggered",
    meta: "Fire panel installation delayed",
    time: "3m ago",
    icon: AlertTriangle,
    tone: "warning",
  },
  {
    title: "Enterprise requirement posted",
    meta: "Access control project in Bengaluru",
    time: "6m ago",
    icon: BriefcaseBusiness,
    tone: "primary",
  },
  {
    title: "Engineer arrived on site",
    meta: "Pune network rack audit started",
    time: "9m ago",
    icon: CheckCircle2,
    tone: "success",
  },
];

const alerts = [
  {
    title: "Delayed Projects",
    value: "8 critical",
    detail: "SLA breach risk across Mumbai, Pune, and Delhi NCR",
    icon: Clock3,
    tone: "warning" as const,
    progress: 68,
  },
  {
    title: "Payment Issues",
    value: "5 holds",
    detail: "UPI confirmation pending for enterprise invoices",
    icon: CreditCard,
    tone: "danger" as const,
    progress: 42,
  },
  {
    title: "Verification Queue",
    value: "45 pending",
    detail: "KYC and specialization reviews awaiting admin action",
    icon: ShieldCheck,
    tone: "primary" as const,
    progress: 81,
  },
];

const moduleCards: ModuleCard[] = [
  {
    title: "Live Ops Panel",
    detail: "Real-time queue, filters, priority color, and quick actions.",
    href: "#live-ops",
    icon: Radio,
    tone: "success",
  },
  {
    title: "Project Management",
    detail: "Tables, milestones, delay indicators, and expandable detail views.",
    href: "/admin/projects",
    icon: BriefcaseBusiness,
    tone: "primary",
  },
  {
    title: "Vendor Management",
    detail: "Verification, weighted scores, profile modals, and performance charts.",
    href: "/admin/vendors",
    icon: UsersRound,
    tone: "primary",
  },
  {
    title: "Payments",
    detail: "Pending, held, released transactions with suspicious-payment warnings.",
    href: "/admin/payments",
    icon: CreditCard,
    tone: "warning",
  },
  {
    title: "QA & Audits",
    detail: "Checklist table, inspection logs, image proof viewer, and QA score.",
    href: "/admin/qa-audit",
    icon: CheckCircle2,
    tone: "success",
  },
  {
    title: "AI Insights",
    detail: "Delay prediction alerts, demand forecast, and vendor recommendations.",
    href: "/admin/ai-insights",
    icon: Zap,
    tone: "primary",
  },
  {
    title: "Reports",
    detail: "Report generation options, filters, CSV export, and PDF export.",
    href: "/admin/reports",
    icon: BarChart3,
    tone: "primary",
  },
];

const toneClasses = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-800",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800",
  amber: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
  rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-800",
};

const activityTones = {
  primary: "bg-indigo-500 shadow-indigo-500/30",
  success: "bg-emerald-500 shadow-emerald-500/30",
  warning: "bg-amber-500 shadow-amber-500/30",
  danger: "bg-rose-500 shadow-rose-500/30",
};

export default function AdminDashboardPage() {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPulseIndex((current) => (current + 1) % activityFeed.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const liveFeed = useMemo(() => {
    return [
      ...activityFeed.slice(pulseIndex),
      ...activityFeed.slice(0, pulseIndex),
    ];
  }, [pulseIndex]);

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_28%)]" />

      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="primary" className="px-3 py-1">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live command center
              </Badge>
              <Badge tone="success" className="px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure platform
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Admin Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Track projects, revenue, engineer capacity, delayed work, and
              payment risk across the ELV Connect marketplace in real time.
            </p>
          </div>

          <div className="grid min-w-full grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60 sm:min-w-[360px]">
            <div className="rounded-md bg-white p-3 shadow-sm dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Health
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
                Operational
              </p>
            </div>
            <div className="rounded-md bg-white p-3 shadow-sm dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Response
              </p>
              <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                98.7% SLA
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                variant="stat"
                padding="lg"
                className="min-h-[168px]"
                transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 28 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-md p-3 ring-1 ${toneClasses[stat.tone]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {stat.change}
                  </span>
                  <span className="text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stat.detail}
                  </span>
                </div>
              </Card>
            );
          })}
        </section>

        <Card
          variant="glass"
          padding="lg"
          title="Enterprise Control System"
          description="Connected admin surfaces for overview, live ops, projects, vendors, payments, QA, AI, and reports."
          action={
            <Badge tone="primary" className="px-3 py-1">
              <Activity className="h-3.5 w-3.5" />
              Full system
            </Badge>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {moduleCards.map((module, index) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group rounded-md border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-indigo-800"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035 }}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge tone={module.tone}>Open</Badge>
                    </div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white">{module.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{module.detail}</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              variant="glass"
              padding="lg"
              title="Projects By Category"
              description="Demand concentration across major ELV service lines."
              action={
                <Badge tone="primary">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Live mix
                </Badge>
              }
            >
              <div className="space-y-5">
                {projectCategories.map((category) => (
                  <div key={category.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {category.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {category.value}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.value}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              variant="elevated"
              padding="lg"
              title="Revenue Trend"
              description="Monthly marketplace GMV with escrow and UPI settlement flow."
              action={
                <Badge tone="success">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +18.2%
                </Badge>
              }
            >
              <div className="flex h-64 items-end gap-3 rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                {revenueTrend.map((point, index) => (
                  <div key={point.month} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${point.value}%`, opacity: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.55, ease: "easeOut" }}
                      className="min-h-8 rounded-t-md bg-gradient-to-t from-indigo-600 via-violet-500 to-fuchsia-400 shadow-[0_12px_28px_rgba(99,102,241,0.28)]"
                    />
                    <span className="text-center text-[11px] font-bold text-slate-500">
                      {point.month}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card
            variant="glass"
            padding="lg"
            title="Live Activity Feed"
            description="Rotating real-time platform operations stream."
            action={
              <Badge tone="success">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live
              </Badge>
            }
            className="xl:min-h-[416px]"
          >
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {liveFeed.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={`${item.title}-${pulseIndex}`}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.22, delay: index * 0.025 }}
                      className="flex gap-3 rounded-md border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70"
                    >
                      <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-lg ${activityTones[item.tone]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold leading-5 text-slate-900 dark:text-white">
                            {item.title}
                          </p>
                          <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                            {index === 0 ? "live" : item.time}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {item.meta}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </Card>
        </section>

        <LiveOperationsPanel />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card
            variant="elevated"
            padding="lg"
            title="Alerts Panel"
            description="Delayed projects, payment issues, and verification backlog."
            action={
              <Badge tone="warning">
                <BellRing className="h-3.5 w-3.5" />
                13 active
              </Badge>
            }
          >
            <div className="space-y-4">
              {alerts.map((alert) => {
                const Icon = alert.icon;

                return (
                  <div
                    key={alert.title}
                    className="rounded-md border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-white p-2 text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black text-slate-950 dark:text-white">
                              {alert.title}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {alert.detail}
                            </p>
                          </div>
                          <Badge tone={alert.tone}>{alert.value}</Badge>
                        </div>
                        <Progress
                          value={alert.progress}
                          tone={alert.tone}
                          showValue={false}
                          className="mt-4"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            variant="glass"
            padding="lg"
            title="Operations Snapshot"
            description="Capacity, settlement, and risk signals for today's admin shift."
            action={
              <Badge tone="primary">
                <Zap className="h-3.5 w-3.5" />
                Priority
              </Badge>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                <Activity className="h-5 w-5 text-indigo-600" />
                <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                  96.8%
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Dispatch health
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                  1,206
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Completed visits
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                  3.1%
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Risk exposure
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-slate-950 dark:to-emerald-950/25">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    Recommended action
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Assign two senior reviewers to payment holds before the
                    6 PM settlement window.
                  </p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-indigo-700 active:translate-y-0 dark:bg-white dark:text-slate-950">
                  Review queue
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
