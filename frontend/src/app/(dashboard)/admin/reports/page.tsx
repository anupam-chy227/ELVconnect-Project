"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeIndianRupee,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Download,
  FileArchive,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  MapPin,
  PieChart,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Progress } from "@/components/ui";

type ReportType = "operations" | "payments" | "vendors" | "qa" | "city";
type ReportStatus = "ready" | "scheduled" | "processing";

type ReportOption = {
  id: ReportType;
  title: string;
  description: string;
  icon: LucideIcon;
  freshness: string;
  records: number;
  tone: "primary" | "success" | "warning";
};

type ReportRow = {
  id: string;
  name: string;
  type: ReportType;
  city: string;
  category: string;
  date: string;
  records: number;
  status: ReportStatus;
  owner: string;
};

const reportOptions: ReportOption[] = [
  {
    id: "operations",
    title: "Operations Summary",
    description: "Projects, delays, SLA health, city activity, and live operations status.",
    icon: ClipboardList,
    freshness: "Updated 4 min ago",
    records: 4289,
    tone: "primary",
  },
  {
    id: "payments",
    title: "Payments & Escrow",
    description: "Pending, held, released, suspicious, and vendor payout transactions.",
    icon: BadgeIndianRupee,
    freshness: "Updated 2 min ago",
    records: 836,
    tone: "success",
  },
  {
    id: "vendors",
    title: "Vendor Performance",
    description: "Verification status, score formula, response time, QA score, and revenue.",
    icon: ShieldCheck,
    freshness: "Updated 9 min ago",
    records: 312,
    tone: "primary",
  },
  {
    id: "qa",
    title: "QA & Audit",
    description: "Checklist pass/fail, image proof status, inspection logs, and QA score.",
    icon: Gauge,
    freshness: "Updated 7 min ago",
    records: 148,
    tone: "warning",
  },
  {
    id: "city",
    title: "City Insights",
    description: "Revenue per city, project distribution, category demand, and top vendors.",
    icon: PieChart,
    freshness: "Updated 12 min ago",
    records: 72,
    tone: "success",
  },
];

const reports: ReportRow[] = [
  {
    id: "RPT-9042",
    name: "April Operations Summary",
    type: "operations",
    city: "All cities",
    category: "All categories",
    date: "2026-05-01",
    records: 4289,
    status: "ready",
    owner: "Admin Ops",
  },
  {
    id: "RPT-9041",
    name: "Mumbai CCTV Vendor Payouts",
    type: "payments",
    city: "Mumbai",
    category: "CCTV",
    date: "2026-04-30",
    records: 186,
    status: "ready",
    owner: "Finance",
  },
  {
    id: "RPT-9040",
    name: "Delhi NCR Fire Safety QA",
    type: "qa",
    city: "Delhi NCR",
    category: "Fire Safety",
    date: "2026-04-29",
    records: 74,
    status: "processing",
    owner: "QA Ops",
  },
  {
    id: "RPT-9039",
    name: "Bengaluru Access Vendor Scorecard",
    type: "vendors",
    city: "Bengaluru",
    category: "Access Control",
    date: "2026-04-28",
    records: 96,
    status: "ready",
    owner: "Vendor Ops",
  },
  {
    id: "RPT-9038",
    name: "Weekly City Insights",
    type: "city",
    city: "All cities",
    category: "All categories",
    date: "2026-04-27",
    records: 72,
    status: "scheduled",
    owner: "Strategy",
  },
];

const cities = ["All cities", "Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Ahmedabad", "Hyderabad"];
const categories = ["All categories", "CCTV", "Fire Safety", "Access Control", "Networking"];

const statusMeta: Record<ReportStatus, { label: string; tone: "success" | "warning" | "primary"; icon: LucideIcon }> = {
  ready: {
    label: "Ready",
    tone: "success",
    icon: CheckCircle2,
  },
  scheduled: {
    label: "Scheduled",
    tone: "primary",
    icon: CalendarClock,
  },
  processing: {
    label: "Processing",
    tone: "warning",
    icon: RefreshCcw,
  },
};

const typeLabel: Record<ReportType, string> = {
  operations: "Operations",
  payments: "Payments",
  vendors: "Vendors",
  qa: "QA & Audit",
  city: "City Insights",
};

export default function AdminReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>("operations");
  const [city, setCity] = useState("All cities");
  const [category, setCategory] = useState("All categories");
  const [fromDate, setFromDate] = useState("2026-04-27");
  const [toDate, setToDate] = useState("2026-05-01");
  const [search, setSearch] = useState("");
  const [exportLog, setExportLog] = useState("No export generated yet");

  const selectedOption = reportOptions.find((option) => option.id === selectedType) ?? reportOptions[0];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const cityMatch = city === "All cities" || report.city === city || report.city === "All cities";
      const categoryMatch = category === "All categories" || report.category === category || report.category === "All categories";
      const dateMatch = report.date >= fromDate && report.date <= toDate;
      const searchMatch = `${report.id} ${report.name} ${report.city} ${report.category} ${report.owner}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return cityMatch && categoryMatch && dateMatch && searchMatch;
    });
  }, [category, city, fromDate, search, toDate]);

  const readyCount = filteredReports.filter((report) => report.status === "ready").length;
  const recordCount = filteredReports.reduce((total, report) => total + report.records, 0);

  const handleExport = (format: "CSV" | "PDF") => {
    setExportLog(
      `${format} export queued for ${selectedOption.title} - ${city} - ${category} - ${fromDate} to ${toDate}`,
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%)]" />

      <div className="space-y-6">
        <section className="rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="px-3 py-1">
                  <FileText className="h-3.5 w-3.5" />
                  Reports dashboard
                </Badge>
                <Badge tone="success" className="px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Export ready
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Reports
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Generate operational, payment, vendor, QA, and city reports with
                date, category, and city filters, then export as CSV or PDF.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <MiniMetric label="Ready reports" value={String(readyCount)} icon={CheckCircle2} />
              <MiniMetric label="Records" value={recordCount.toLocaleString("en-IN")} icon={BarChart3} />
              <MiniMetric label="Templates" value={String(reportOptions.length)} icon={FileArchive} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Report Generation Options"
            description="Choose the report template and export format for the selected filter range."
            action={
              <Badge tone={selectedOption.tone}>
                <FileText className="h-3.5 w-3.5" />
                {typeLabel[selectedOption.id]}
              </Badge>
            }
          >
            <div className="grid gap-3">
              {reportOptions.map((option, index) => {
                const Icon = option.icon;
                const active = option.id === selectedType;

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedType(option.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                      active
                        ? "border-indigo-300 bg-indigo-50/80 ring-4 ring-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:ring-indigo-950"
                        : "border-slate-200 bg-white/85 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950/75"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className="text-sm font-black text-slate-950 dark:text-white">{option.title}</h2>
                          <Badge tone={option.tone}>{option.records.toLocaleString("en-IN")} rows</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{option.description}</p>
                        <p className="mt-3 text-[11px] font-black uppercase tracking-wide text-slate-400">{option.freshness}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            title="Filters & Export"
            description="Set report scope by date, category, and city."
            action={
              <Badge tone="primary">
                <Filter className="h-3.5 w-3.5" />
                Scoped
              </Badge>
            }
          >
            <div className="space-y-4">
              <div className="grid gap-3">
                <FilterDate label="From date" value={fromDate} onChange={setFromDate} />
                <FilterDate label="To date" value={toDate} onChange={setToDate} />
                <FilterSelect label="City" value={city} options={cities} onChange={setCity} />
                <FilterSelect label="Category" value={category} options={categories} onChange={setCategory} />
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected report</p>
                    <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">{selectedOption.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{selectedOption.description}</p>
                  </div>
                  <Badge tone={selectedOption.tone}>{selectedOption.records.toLocaleString("en-IN")}</Badge>
                </div>
                <Progress value={Math.min(100, Math.round((filteredReports.length / reports.length) * 100))} tone="primary" className="mt-4" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  leftIcon={<FileSpreadsheet className="h-4 w-4" />}
                  onClick={() => handleExport("CSV")}
                  className="w-full"
                >
                  Export CSV
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  leftIcon={<FileDown className="h-4 w-4" />}
                  onClick={() => handleExport("PDF")}
                  className="w-full"
                >
                  Export PDF
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <Card
          variant="glass"
          padding="lg"
          title="Generated Reports"
          description="Recent reports matching the current filters."
          action={
            <Badge tone="success">
              <Download className="h-3.5 w-3.5" />
              {filteredReports.length} files
            </Badge>
          }
        >
          <div className="space-y-4">
            <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              Search reports
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Report name, city, owner..."
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
                />
              </div>
            </label>

            <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="hidden grid-cols-[minmax(260px,1.3fr)_130px_130px_120px_120px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 xl:grid">
                <span>Report</span>
                <span>Type</span>
                <span>City</span>
                <span>Records</span>
                <span>Status</span>
                <span>Export</span>
              </div>

              {filteredReports.map((report, index) => (
                <ReportRowItem key={report.id} report={report} index={index} onExport={setExportLog} />
              ))}

              {!filteredReports.length ? (
                <div className="p-10 text-center">
                  <FileText className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">No reports match these filters.</p>
                  <p className="mt-1 text-xs text-slate-500">Adjust date, category, city, or search term.</p>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="rounded-md border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-slate-950 dark:to-emerald-950/20">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Latest export</p>
          <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{exportLog}</p>
        </div>
      </div>
    </div>
  );
}

function ReportRowItem({
  report,
  index,
  onExport,
}: {
  report: ReportRow;
  index: number;
  onExport: (message: string) => void;
}) {
  const status = statusMeta[report.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      className="grid gap-4 border-b border-slate-200 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-900/60 xl:grid-cols-[minmax(260px,1.3fr)_130px_130px_120px_120px_150px] xl:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-black text-slate-400">{report.id}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500 dark:bg-slate-900">
            {report.category}
          </span>
        </div>
        <h2 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{report.name}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {report.owner} - {new Date(report.date).toLocaleDateString("en-IN")}
        </p>
      </div>

      <Badge tone="primary">{typeLabel[report.type]}</Badge>

      <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-200">
        <MapPin className="h-4 w-4 text-indigo-500" />
        {report.city}
      </span>

      <span className="font-mono text-sm font-black text-slate-950 dark:text-white">
        {report.records.toLocaleString("en-IN")}
      </span>

      <Badge tone={status.tone}>
        <StatusIcon className="h-3.5 w-3.5" />
        {status.label}
      </Badge>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onExport(`CSV export queued for ${report.id}`)}
          disabled={report.status !== "ready"}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          CSV
        </button>
        <button
          type="button"
          onClick={() => onExport(`PDF export queued for ${report.id}`)}
          disabled={report.status !== "ready"}
          className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200"
        >
          <FileDown className="h-3.5 w-3.5" />
          PDF
        </button>
      </div>
    </motion.div>
  );
}

function MiniMetric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function FilterDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
      {label}
      <div className="relative">
        <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
        />
      </div>
    </label>
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
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
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
