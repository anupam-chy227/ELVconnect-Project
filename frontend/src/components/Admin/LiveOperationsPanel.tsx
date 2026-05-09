"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Radio,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  UserPlus,
  Zap,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";

type ProjectStatus = "on-track" | "delayed" | "risk";
type ProjectPriority = "critical" | "high" | "medium" | "low";
type ProjectUrgency = "Immediate" | "Today" | "This week" | "Scheduled";

type LiveProject = {
  id: string;
  title: string;
  client: string;
  city: string;
  category: string;
  urgency: ProjectUrgency;
  priority: ProjectPriority;
  status: ProjectStatus;
  engineer: string;
  eta: string;
  budget: string;
};

const projects: LiveProject[] = [
  {
    id: "ELV-2048",
    title: "Mall CCTV command room audit",
    client: "Aster Retail Parks",
    city: "Mumbai",
    category: "CCTV",
    urgency: "Immediate",
    priority: "critical",
    status: "risk",
    engineer: "Unassigned",
    eta: "24 min",
    budget: "Rs 86k",
  },
  {
    id: "ELV-2047",
    title: "Fire alarm panel handover",
    client: "Northline Tech Park",
    city: "Delhi NCR",
    category: "Fire Safety",
    urgency: "Today",
    priority: "high",
    status: "delayed",
    engineer: "Ravi K.",
    eta: "46 min",
    budget: "Rs 1.2L",
  },
  {
    id: "ELV-2046",
    title: "Access control reader replacement",
    client: "Zenith CoWorks",
    city: "Bengaluru",
    category: "Access Control",
    urgency: "Today",
    priority: "medium",
    status: "on-track",
    engineer: "Priya S.",
    eta: "12 min",
    budget: "Rs 42k",
  },
  {
    id: "ELV-2045",
    title: "Network rack thermal inspection",
    client: "FinCore Operations",
    city: "Pune",
    category: "Networking",
    urgency: "This week",
    priority: "medium",
    status: "on-track",
    engineer: "Nikhil A.",
    eta: "1h 15m",
    budget: "Rs 64k",
  },
  {
    id: "ELV-2044",
    title: "Enterprise VMS camera mapping",
    client: "Metro Secure Logistics",
    city: "Ahmedabad",
    category: "CCTV",
    urgency: "Scheduled",
    priority: "low",
    status: "on-track",
    engineer: "Mehul P.",
    eta: "Tomorrow",
    budget: "Rs 2.1L",
  },
  {
    id: "ELV-2043",
    title: "Basement fire sensor fault review",
    client: "Skyline Infra",
    city: "Hyderabad",
    category: "Fire Safety",
    urgency: "Immediate",
    priority: "critical",
    status: "delayed",
    engineer: "Unassigned",
    eta: "31 min",
    budget: "Rs 78k",
  },
];

const cities = ["All cities", "Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Ahmedabad", "Hyderabad"];
const categories = ["All categories", "CCTV", "Fire Safety", "Access Control", "Networking"];
const urgencies = ["All urgency", "Immediate", "Today", "This week", "Scheduled"];

const statusMeta: Record<ProjectStatus, { label: string; tone: "success" | "warning" | "danger"; className: string }> = {
  "on-track": {
    label: "On track",
    tone: "success",
    className: "text-emerald-600 bg-emerald-50 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
  },
  delayed: {
    label: "Delayed",
    tone: "warning",
    className: "text-amber-600 bg-amber-50 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
  },
  risk: {
    label: "Risk",
    tone: "danger",
    className: "text-rose-600 bg-rose-50 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900",
  },
};

const priorityMeta: Record<ProjectPriority, { label: string; rail: string; chip: string }> = {
  critical: {
    label: "Critical",
    rail: "from-rose-500 to-orange-400",
    chip: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900",
  },
  high: {
    label: "High",
    rail: "from-amber-500 to-orange-400",
    chip: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
  },
  medium: {
    label: "Medium",
    rail: "from-indigo-500 to-violet-500",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900",
  },
  low: {
    label: "Low",
    rail: "from-emerald-500 to-teal-400",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
  },
};

const quickActions = [
  { label: "Assign", icon: UserPlus },
  { label: "Escalate", icon: BellRing },
  { label: "Message", icon: MessageSquareText },
];

export function LiveOperationsPanel() {
  const [city, setCity] = useState("All cities");
  const [category, setCategory] = useState("All categories");
  const [urgency, setUrgency] = useState("All urgency");
  const [refreshTick, setRefreshTick] = useState(0);
  const [lastRefresh, setLastRefresh] = useState("Auto sync");
  const [actionLog, setActionLog] = useState("No admin action queued");

  useEffect(() => {
    const refresh = () => {
      setRefreshTick((current) => current + 1);
      setLastRefresh(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    refresh();
    const timer = window.setInterval(refresh, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleProjects = useMemo(() => {
    const filteredProjects = projects.filter((project) => {
      const cityMatch = city === "All cities" || project.city === city;
      const categoryMatch = category === "All categories" || project.category === category;
      const urgencyMatch = urgency === "All urgency" || project.urgency === urgency;

      return cityMatch && categoryMatch && urgencyMatch;
    });

    if (!filteredProjects.length) return [];

    const offset = refreshTick % filteredProjects.length;
    return [
      ...filteredProjects.slice(offset),
      ...filteredProjects.slice(0, offset),
    ];
  }, [category, city, refreshTick, urgency]);

  const delayedCount = visibleProjects.filter((project) => project.status !== "on-track").length;

  return (
    <Card
      id="live-ops"
      variant="glass"
      padding="lg"
      title="Live Operations"
      description="Real-time project queue with filters, priority color, auto-refresh, and admin quick actions."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success" className="px-3 py-1">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Auto-refresh
          </Badge>
          <Badge tone={delayedCount ? "warning" : "success"} className="px-3 py-1">
            {delayedCount} attention
          </Badge>
        </div>
      }
      className="border-indigo-100/80 dark:border-indigo-950/60"
    >
      <div className="grid gap-4">
        <div className="grid gap-3 rounded-md border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 md:grid-cols-[1fr_1fr_1fr_auto]">
          <FilterSelect label="City" value={city} options={cities} onChange={setCity} />
          <FilterSelect label="Category" value={category} options={categories} onChange={setCategory} />
          <FilterSelect label="Urgency" value={urgency} options={urgencies} onChange={setUrgency} />
          <div className="flex items-end">
            <div className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
              <SlidersHorizontal className="h-4 w-4" />
              {visibleProjects.length} live
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="hidden grid-cols-[minmax(260px,1.3fr)_110px_120px_110px_190px] gap-4 px-3 text-[11px] font-black uppercase tracking-wide text-slate-400 lg:grid">
            <span>Project</span>
            <span>Status</span>
            <span>Priority</span>
            <span>ETA</span>
            <span>Actions</span>
          </div>

          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project, index) => {
              const status = statusMeta[project.status];
              const priority = priorityMeta[project.priority];

              return (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.2, delay: index * 0.025 }}
                  className="relative overflow-hidden rounded-md border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${priority.rail}`} />

                  <div className="grid gap-4 pl-2 lg:grid-cols-[minmax(260px,1.3fr)_110px_120px_110px_190px] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-black text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                          {project.id}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                          <Building2 className="h-3.5 w-3.5" />
                          {project.city}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-black text-slate-950 dark:text-white">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {project.client} - {project.category} - {project.budget}
                      </p>
                    </div>

                    <Badge tone={status.tone} className="w-fit px-2.5 py-1">
                      {project.status === "on-track" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : project.status === "delayed" ? (
                        <Clock3 className="h-3.5 w-3.5" />
                      ) : (
                        <ShieldAlert className="h-3.5 w-3.5" />
                      )}
                      {status.label}
                    </Badge>

                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ring-1 ${priority.chip}`}>
                      {priority.label}
                    </span>

                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <Zap className="h-4 w-4 text-indigo-500" />
                      {project.eta}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => setActionLog(`${action.label} queued for ${project.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-md active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary/45 dark:hover:text-primary"
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>

          {!visibleProjects.length ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
              <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                No projects match these filters.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Change city, category, or urgency to return to the live queue.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-slate-950 dark:to-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Last refresh
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
              {lastRefresh}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
            <Send className="h-4 w-4 text-indigo-500" />
            {actionLog}
          </div>
        </div>
      </div>
    </Card>
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
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
