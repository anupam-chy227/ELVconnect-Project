"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Filter,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  UserRoundCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card, Progress } from "@/components/ui";

type ProjectStatus = "on-track" | "delayed" | "risk" | "completed";
type MilestoneStatus = "done" | "active" | "blocked" | "upcoming";

type Project = {
  id: string;
  name: string;
  city: string;
  area: string;
  vendor: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  delayHours: number;
  priority: "critical" | "high" | "medium" | "low";
  value: string;
  due: string;
  owner: string;
  milestones: Array<{
    label: string;
    status: MilestoneStatus;
    date: string;
  }>;
  notes: string;
};

const projects: Project[] = [
  {
    id: "ELV-PM-1048",
    name: "Phoenix Mall CCTV Command Center",
    city: "Mumbai",
    area: "Lower Parel",
    vendor: "SecureVision Projects",
    category: "CCTV",
    status: "risk",
    progress: 62,
    delayHours: 18,
    priority: "critical",
    value: "Rs 8.6L",
    due: "Today, 6:00 PM",
    owner: "Ananya R.",
    notes: "Camera mapping complete. VMS licensing and final NVR failover validation need escalation.",
    milestones: [
      { label: "Scope locked", status: "done", date: "Apr 22" },
      { label: "Engineer assigned", status: "done", date: "Apr 23" },
      { label: "Install phase", status: "active", date: "Today" },
      { label: "QA handover", status: "blocked", date: "Pending" },
    ],
  },
  {
    id: "ELV-PM-1047",
    name: "Northline Fire Alarm Retrofit",
    city: "Delhi NCR",
    area: "Noida Sector 62",
    vendor: "Ignis Safety Systems",
    category: "Fire Safety",
    status: "delayed",
    progress: 48,
    delayHours: 9,
    priority: "high",
    value: "Rs 12.4L",
    due: "Tomorrow, 11:00 AM",
    owner: "Rohan M.",
    notes: "Material dispatch received late. Site access approved for extended evening window.",
    milestones: [
      { label: "Scope locked", status: "done", date: "Apr 24" },
      { label: "Material dispatch", status: "active", date: "Today" },
      { label: "Panel install", status: "upcoming", date: "May 2" },
      { label: "Fire audit", status: "upcoming", date: "May 3" },
    ],
  },
  {
    id: "ELV-PM-1046",
    name: "Zenith CoWorks Access Upgrade",
    city: "Bengaluru",
    area: "Indiranagar",
    vendor: "GateGrid Technologies",
    category: "Access Control",
    status: "on-track",
    progress: 76,
    delayHours: 0,
    priority: "medium",
    value: "Rs 4.2L",
    due: "May 3, 4:30 PM",
    owner: "Priya S.",
    notes: "Reader replacement and controller sync are moving on schedule.",
    milestones: [
      { label: "Scope locked", status: "done", date: "Apr 25" },
      { label: "Device staging", status: "done", date: "Apr 28" },
      { label: "Site install", status: "active", date: "Today" },
      { label: "Client signoff", status: "upcoming", date: "May 3" },
    ],
  },
  {
    id: "ELV-PM-1045",
    name: "FinCore Network Rack Audit",
    city: "Pune",
    area: "Hinjewadi",
    vendor: "CoreLink Infra",
    category: "Networking",
    status: "completed",
    progress: 100,
    delayHours: 0,
    priority: "low",
    value: "Rs 6.4L",
    due: "Completed",
    owner: "Nikhil A.",
    notes: "Audit report delivered. Payment release ready for admin approval.",
    milestones: [
      { label: "Scope locked", status: "done", date: "Apr 20" },
      { label: "Rack audit", status: "done", date: "Apr 27" },
      { label: "Report upload", status: "done", date: "Apr 29" },
      { label: "Payment release", status: "active", date: "Today" },
    ],
  },
  {
    id: "ELV-PM-1044",
    name: "Metro Logistics VMS Expansion",
    city: "Ahmedabad",
    area: "Narol",
    vendor: "SignalOps Security",
    category: "CCTV",
    status: "on-track",
    progress: 34,
    delayHours: 0,
    priority: "medium",
    value: "Rs 21L",
    due: "May 8, 2:00 PM",
    owner: "Mehul P.",
    notes: "Discovery complete. Camera zones and retention policy are under review.",
    milestones: [
      { label: "Discovery", status: "done", date: "Apr 28" },
      { label: "BoQ approval", status: "active", date: "Today" },
      { label: "Deployment", status: "upcoming", date: "May 5" },
      { label: "Handover", status: "upcoming", date: "May 8" },
    ],
  },
];

const cities = ["All cities", "Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Ahmedabad"];
const categories = ["All categories", "CCTV", "Fire Safety", "Access Control", "Networking"];
const statuses = ["All statuses", "on-track", "delayed", "risk", "completed"];

const statusMeta: Record<ProjectStatus, { label: string; tone: "success" | "warning" | "danger" | "primary"; icon: LucideIcon; progressTone: "success" | "warning" | "danger" | "primary" }> = {
  "on-track": {
    label: "On track",
    tone: "success",
    icon: CheckCircle2,
    progressTone: "success",
  },
  delayed: {
    label: "Delayed",
    tone: "warning",
    icon: Clock3,
    progressTone: "warning",
  },
  risk: {
    label: "At risk",
    tone: "danger",
    icon: AlertTriangle,
    progressTone: "danger",
  },
  completed: {
    label: "Completed",
    tone: "primary",
    icon: ShieldCheck,
    progressTone: "primary",
  },
};

const priorityClasses = {
  critical: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900",
  high: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
  medium: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
};

const milestoneClasses: Record<MilestoneStatus, string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  active: "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-[0_0_0_6px_rgba(99,102,241,0.08)] dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200",
  blocked: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
  upcoming: "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
};

export default function AdminProjectsPage() {
  const [city, setCity] = useState("All cities");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [expandedId, setExpandedId] = useState(projects[0]?.id ?? "");

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      const cityMatch = city === "All cities" || project.city === city;
      const categoryMatch = category === "All categories" || project.category === category;
      const statusMatch = status === "All statuses" || project.status === status;

      return cityMatch && categoryMatch && statusMatch;
    });
  }, [category, city, status]);

  const delayedProjects = visibleProjects.filter((project) => project.delayHours > 0);
  const avgProgress = Math.round(
    visibleProjects.reduce((total, project) => total + project.progress, 0) /
      Math.max(visibleProjects.length, 1),
  );

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.13),transparent_30%)]" />

      <div className="space-y-6">
        <section className="rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="px-3 py-1">
                  <Workflow className="h-3.5 w-3.5" />
                  Project command center
                </Badge>
                <Badge tone={delayedProjects.length ? "warning" : "success"} className="px-3 py-1">
                  {delayedProjects.length} delay flags
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Project Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Monitor city-level delivery, vendor ownership, milestone progress,
                delay exposure, and expandable project details from one operator view.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
              <MiniMetric label="Projects" value={String(visibleProjects.length)} icon={Building2} />
              <MiniMetric label="Avg progress" value={`${avgProgress}%`} icon={CircleDot} />
              <MiniMetric label="Delayed" value={String(delayedProjects.length)} icon={AlertTriangle} />
            </div>
          </div>
        </section>

        <Card
          variant="glass"
          padding="lg"
          title="Project Table"
          description="Filter projects by city, category, or status and expand any row for milestone-level context."
          action={
            <Badge tone="primary" className="px-3 py-1">
              <Filter className="h-3.5 w-3.5" />
              {visibleProjects.length} visible
            </Badge>
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3 rounded-md border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 md:grid-cols-3">
              <FilterSelect label="City" value={city} options={cities} onChange={setCity} />
              <FilterSelect label="Category" value={category} options={categories} onChange={setCategory} />
              <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
            </div>

            <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="hidden grid-cols-[minmax(260px,1.35fr)_120px_minmax(150px,0.8fr)_120px_160px_48px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 lg:grid">
                <span>Project name</span>
                <span>City</span>
                <span>Vendor</span>
                <span>Status</span>
                <span>Progress</span>
                <span />
              </div>

              <AnimatePresence initial={false}>
                {visibleProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    expanded={expandedId === project.id}
                    onToggle={() => setExpandedId((current) => (current === project.id ? "" : project.id))}
                  />
                ))}
              </AnimatePresence>

              {!visibleProjects.length ? (
                <div className="p-10 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
                    No projects match these filters.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Adjust city, category, or status to return to the project table.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  expanded,
  onToggle,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = statusMeta[project.status];
  const StatusIcon = meta.icon;

  return (
    <motion.div layout className="border-b border-slate-200 last:border-b-0 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full gap-4 px-4 py-4 text-left transition hover:bg-slate-50/80 dark:hover:bg-slate-900/60 lg:grid-cols-[minmax(260px,1.35fr)_120px_minmax(150px,0.8fr)_120px_160px_48px] lg:items-center"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-black capitalize ring-1 ${priorityClasses[project.priority]}`}>
              {project.priority}
            </span>
            <span className="font-mono text-[11px] font-black text-slate-400">
              {project.id}
            </span>
          </div>
          <h2 className="mt-2 text-sm font-black text-slate-950 dark:text-white">
            {project.name}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {project.category} - {project.value}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
          <MapPin className="h-4 w-4 text-indigo-500" />
          <span>
            {project.city}
            <span className="block text-xs font-medium text-slate-400">{project.area}</span>
          </span>
        </div>

        <div className="text-sm">
          <p className="font-bold text-slate-900 dark:text-white">{project.vendor}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <UserRoundCheck className="h-3.5 w-3.5" />
            {project.owner}
          </p>
        </div>

        <Badge tone={meta.tone} className="w-fit px-2.5 py-1">
          <StatusIcon className="h-3.5 w-3.5" />
          {meta.label}
        </Badge>

        <div className="space-y-2">
          <Progress value={project.progress} tone={meta.progressTone} showValue />
          <DelayIndicator delayHours={project.delayHours} />
        </div>

        <div className="flex justify-end">
          <ChevronDown className={`h-5 w-5 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 bg-slate-50/80 px-4 py-5 dark:bg-slate-900/45 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <MilestoneTracker milestones={project.milestones} />
              <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Detail view
                    </p>
                    <h3 className="mt-2 text-base font-black text-slate-950 dark:text-white">
                      Delivery notes
                    </h3>
                  </div>
                  <Badge tone={project.delayHours ? "warning" : "success"}>
                    <CalendarClock className="h-3.5 w-3.5" />
                    {project.due}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {project.notes}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton icon={UserRoundCheck}>Assign</ActionButton>
                  <ActionButton icon={MessageSquareText}>Message</ActionButton>
                  <ActionButton icon={ArrowUpRight}>Open project</ActionButton>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function MilestoneTracker({ milestones }: { milestones: Project["milestones"] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Milestone tracker
          </p>
          <h3 className="mt-2 text-base font-black text-slate-950 dark:text-white">
            Delivery workflow
          </h3>
        </div>
        <Badge tone="primary">
          <Workflow className="h-3.5 w-3.5" />
          {milestones.filter((milestone) => milestone.status === "done").length}/{milestones.length}
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {milestones.map((milestone, index) => (
          <div key={milestone.label} className="relative">
            {index < milestones.length - 1 ? (
              <span className="absolute left-[calc(50%+18px)] top-5 hidden h-px w-[calc(100%-36px)] bg-slate-200 dark:bg-slate-800 md:block" />
            ) : null}
            <div className={`relative rounded-md border p-3 ${milestoneClasses[milestone.status]}`}>
              <div className="flex items-center gap-2">
                {milestone.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : milestone.status === "blocked" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CircleDot className="h-4 w-4" />
                )}
                <span className="text-xs font-black capitalize">{milestone.status}</span>
              </div>
              <p className="mt-3 text-sm font-black">{milestone.label}</p>
              <p className="mt-1 text-xs opacity-75">{milestone.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DelayIndicator({ delayHours }: { delayHours: number }) {
  if (!delayHours) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        No delay
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-300">
      <Clock3 className="h-3.5 w-3.5" />
      {delayHours}h delay
    </span>
  );
}

function MiniMetric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-md active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-primary/45 focus:ring-4 focus:ring-primary-ring dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "on-track" ? "On track" : option === "risk" ? "At risk" : option[0]?.toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
