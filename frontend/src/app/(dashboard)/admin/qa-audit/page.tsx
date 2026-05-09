"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarCheck2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  ImageIcon,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card, Progress } from "@/components/ui";

type AuditStatus = "pass" | "fail" | "review";
type ProofStatus = "verified" | "rejected" | "pending";

type AuditItem = {
  id: string;
  project: string;
  city: string;
  category: string;
  checkpoint: string;
  owner: string;
  status: AuditStatus;
  score: number;
  due: string;
  issue: string;
};

type InspectionLog = {
  id: string;
  time: string;
  title: string;
  detail: string;
  inspector: string;
  status: AuditStatus;
};

type ProofItem = {
  id: string;
  title: string;
  project: string;
  city: string;
  capturedBy: string;
  capturedAt: string;
  status: ProofStatus;
  score: number;
  caption: string;
  tone: string;
};

const auditItems: AuditItem[] = [
  {
    id: "QA-1208",
    project: "Phoenix Mall CCTV Command Center",
    city: "Mumbai",
    category: "CCTV",
    checkpoint: "NVR failover and camera angle verification",
    owner: "Ananya R.",
    status: "review",
    score: 78,
    due: "Today, 6:00 PM",
    issue: "One blind spot needs final camera angle proof.",
  },
  {
    id: "QA-1207",
    project: "Northline Fire Alarm Retrofit",
    city: "Delhi NCR",
    category: "Fire Safety",
    checkpoint: "Panel loop test and detector tagging",
    owner: "Rohan M.",
    status: "fail",
    score: 62,
    due: "Today, 4:30 PM",
    issue: "Zone 3 detector report mismatch.",
  },
  {
    id: "QA-1206",
    project: "Zenith CoWorks Access Upgrade",
    city: "Bengaluru",
    category: "Access Control",
    checkpoint: "Reader sync, door relay, and access logs",
    owner: "Priya S.",
    status: "pass",
    score: 94,
    due: "May 2, 11:00 AM",
    issue: "No open issue.",
  },
  {
    id: "QA-1205",
    project: "FinCore Network Rack Audit",
    city: "Pune",
    category: "Networking",
    checkpoint: "Rack dressing, thermal review, labeling",
    owner: "Nikhil A.",
    status: "pass",
    score: 91,
    due: "Completed",
    issue: "Audit report accepted.",
  },
  {
    id: "QA-1204",
    project: "Metro Logistics VMS Expansion",
    city: "Ahmedabad",
    category: "CCTV",
    checkpoint: "Camera mapping and retention policy",
    owner: "Mehul P.",
    status: "review",
    score: 74,
    due: "May 3, 2:00 PM",
    issue: "Retention setting proof pending.",
  },
];

const inspectionLogs: InspectionLog[] = [
  {
    id: "LOG-904",
    time: "01:42 PM",
    title: "Image proof reviewed",
    detail: "Mumbai camera corridor proof marked for secondary angle validation.",
    inspector: "QA Ops",
    status: "review",
  },
  {
    id: "LOG-903",
    time: "12:55 PM",
    title: "Fire panel inspection failed",
    detail: "Zone 3 detector sequence does not match submitted checklist.",
    inspector: "Rohan M.",
    status: "fail",
  },
  {
    id: "LOG-902",
    time: "11:20 AM",
    title: "Access control proof approved",
    detail: "Reader sync screenshots and entry logs verified.",
    inspector: "Priya S.",
    status: "pass",
  },
  {
    id: "LOG-901",
    time: "10:10 AM",
    title: "Network rack audit closed",
    detail: "Thermal report, labels, and cable dressing photos accepted.",
    inspector: "Nikhil A.",
    status: "pass",
  },
];

const proofItems: ProofItem[] = [
  {
    id: "PROOF-441",
    title: "Camera corridor angle",
    project: "Phoenix Mall CCTV Command Center",
    city: "Mumbai",
    capturedBy: "Ravi K.",
    capturedAt: "Today, 1:18 PM",
    status: "pending",
    score: 78,
    caption: "Corridor camera angle proof requires one extra reference image.",
    tone: "from-indigo-500 via-violet-500 to-fuchsia-500",
  },
  {
    id: "PROOF-440",
    title: "Fire panel loop test",
    project: "Northline Fire Alarm Retrofit",
    city: "Delhi NCR",
    capturedBy: "Aman S.",
    capturedAt: "Today, 12:44 PM",
    status: "rejected",
    score: 62,
    caption: "Loop test image does not match detector tag sequence.",
    tone: "from-rose-500 via-orange-500 to-amber-400",
  },
  {
    id: "PROOF-439",
    title: "Access reader sync",
    project: "Zenith CoWorks Access Upgrade",
    city: "Bengaluru",
    capturedBy: "Priya S.",
    capturedAt: "Today, 11:09 AM",
    status: "verified",
    score: 94,
    caption: "Reader sync, door relay test, and access logs accepted.",
    tone: "from-emerald-500 via-teal-400 to-cyan-400",
  },
  {
    id: "PROOF-438",
    title: "Rack dressing proof",
    project: "FinCore Network Rack Audit",
    city: "Pune",
    capturedBy: "Nikhil A.",
    capturedAt: "Yesterday, 5:40 PM",
    status: "verified",
    score: 91,
    caption: "Cable labels, thermal state, and rack dressing verified.",
    tone: "from-sky-500 via-indigo-500 to-violet-500",
  },
];

const statusMeta: Record<
  AuditStatus,
  { label: string; tone: "success" | "danger" | "warning"; icon: LucideIcon; progressTone: "success" | "danger" | "warning" }
> = {
  pass: {
    label: "Pass",
    tone: "success",
    icon: CheckCircle2,
    progressTone: "success",
  },
  fail: {
    label: "Fail",
    tone: "danger",
    icon: XCircle,
    progressTone: "danger",
  },
  review: {
    label: "Review",
    tone: "warning",
    icon: AlertTriangle,
    progressTone: "warning",
  },
};

const proofMeta: Record<ProofStatus, { label: string; tone: "success" | "danger" | "warning"; icon: LucideIcon }> = {
  verified: { label: "Verified", tone: "success", icon: BadgeCheck },
  rejected: { label: "Rejected", tone: "danger", icon: XCircle },
  pending: { label: "Pending", tone: "warning", icon: AlertTriangle },
};

const categories = ["All categories", "CCTV", "Fire Safety", "Access Control", "Networking"];
const statuses = ["All statuses", "pass", "fail", "review"];

export default function AdminQaAuditPage() {
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [search, setSearch] = useState("");
  const [selectedProofId, setSelectedProofId] = useState(proofItems[0].id);

  const filteredAudits = useMemo(() => {
    return auditItems.filter((audit) => {
      const categoryMatch = category === "All categories" || audit.category === category;
      const statusMatch = status === "All statuses" || audit.status === status;
      const searchMatch = `${audit.id} ${audit.project} ${audit.city} ${audit.owner} ${audit.checkpoint}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return categoryMatch && statusMatch && searchMatch;
    });
  }, [category, search, status]);

  const selectedProof = proofItems.find((proof) => proof.id === selectedProofId) ?? proofItems[0];
  const qaScore = Math.round(
    filteredAudits.reduce((total, audit) => total + audit.score, 0) / Math.max(filteredAudits.length, 1),
  );
  const passCount = filteredAudits.filter((audit) => audit.status === "pass").length;
  const failCount = filteredAudits.filter((audit) => audit.status === "fail").length;
  const reviewCount = filteredAudits.filter((audit) => audit.status === "review").length;

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.13),transparent_30%)]" />

      <div className="space-y-6">
        <section className="rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="px-3 py-1">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  QA & audit
                </Badge>
                <Badge tone={failCount ? "danger" : "success"} className="px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {failCount} fail flags
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                QA & Audit Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Review audit checklists, inspection logs, image proofs, pass/fail
                status, and QA score before milestone payments or handover approval.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[620px]">
              <MiniMetric label="QA score" value={`${qaScore}`} icon={Gauge} />
              <MiniMetric label="Pass" value={String(passCount)} icon={CheckCircle2} />
              <MiniMetric label="Review" value={String(reviewCount)} icon={AlertTriangle} />
              <MiniMetric label="Fail" value={String(failCount)} icon={XCircle} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Audit Checklist"
            description="Checklist table for survey, installation, testing, documentation, and handover QA."
            action={
              <Badge tone={qaScore >= 88 ? "success" : qaScore >= 75 ? "warning" : "danger"} className="px-3 py-1">
                <Gauge className="h-3.5 w-3.5" />
                QA {qaScore}
              </Badge>
            }
          >
            <div className="space-y-4">
              <div className="grid gap-3 rounded-md border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 lg:grid-cols-[1.3fr_1fr_1fr]">
                <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  Search
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Project, city, owner..."
                      className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-primary/45 focus:ring-4 focus:ring-primary-ring dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>
                </label>
                <FilterSelect label="Category" value={category} options={categories} onChange={setCategory} />
                <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="hidden grid-cols-[minmax(260px,1.25fr)_120px_115px_150px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 xl:grid">
                  <span>Checklist item</span>
                  <span>City</span>
                  <span>Status</span>
                  <span>QA score</span>
                  <span>Owner</span>
                </div>

                <AnimatePresence initial={false}>
                  {filteredAudits.map((audit) => (
                    <AuditRow key={audit.id} audit={audit} />
                  ))}
                </AnimatePresence>

                {!filteredAudits.length ? (
                  <div className="p-10 text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
                      No audit items match these filters.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Adjust category, status, or search term to return to the checklist.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            title="Inspection Logs"
            description="Latest QA events across inspections, proof review, and issue resolution."
            action={
              <Badge tone="primary">
                <CalendarCheck2 className="h-3.5 w-3.5" />
                Live log
              </Badge>
            }
          >
            <div className="space-y-3">
              {inspectionLogs.map((log, index) => {
                const meta = statusMeta[log.status];
                const Icon = meta.icon;

                return (
                  <motion.article
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950 dark:text-white">{log.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{log.detail}</p>
                          </div>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </div>
                        <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          {log.time} - {log.inspector}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Image Proof Viewer"
            description="Select installation, testing, and handover proof to inspect QA evidence."
            action={
              <Badge tone={proofMeta[selectedProof.status].tone}>
                <ImageIcon className="h-3.5 w-3.5" />
                {proofMeta[selectedProof.status].label}
              </Badge>
            }
          >
            <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/20 dark:border-slate-800">
              <div className={`relative flex min-h-[360px] items-center justify-center bg-gradient-to-br ${selectedProof.tone}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.38),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.12),rgba(15,23,42,0.48))]" />
                <div className="absolute inset-x-8 top-8 h-px bg-white/40" />
                <div className="absolute inset-x-8 bottom-8 h-px bg-white/30" />
                <div className="absolute inset-y-8 left-8 w-px bg-white/30" />
                <div className="absolute inset-y-8 right-8 w-px bg-white/30" />
                <div className="relative rounded-md border border-white/30 bg-white/15 p-6 text-center text-white shadow-2xl backdrop-blur-md">
                  <Camera className="mx-auto h-10 w-10" />
                  <p className="mt-3 font-mono text-xs font-black uppercase tracking-[0.2em] opacity-80">{selectedProof.id}</p>
                  <h2 className="mt-2 text-2xl font-black">{selectedProof.title}</h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 opacity-85">{selectedProof.caption}</p>
                </div>
              </div>
              <div className="border-t border-white/10 bg-slate-950 p-4 text-white">
                <div className="grid gap-3 sm:grid-cols-4">
                  <ProofDetail label="Project" value={selectedProof.project} />
                  <ProofDetail label="City" value={selectedProof.city} />
                  <ProofDetail label="Captured by" value={selectedProof.capturedBy} />
                  <ProofDetail label="QA score" value={`${selectedProof.score}`} />
                </div>
              </div>
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            title="Proof Queue"
            description="Image evidence cards with verification status and QA scoring."
            action={
              <Badge tone="primary">
                <Sparkles className="h-3.5 w-3.5" />
                {proofItems.length} proofs
              </Badge>
            }
          >
            <div className="grid gap-3">
              {proofItems.map((proof, index) => {
                const meta = proofMeta[proof.status];
                const Icon = meta.icon;
                const active = proof.id === selectedProof.id;

                return (
                  <motion.button
                    key={proof.id}
                    type="button"
                    onClick={() => setSelectedProofId(proof.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`grid gap-3 rounded-md border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[112px_1fr] ${
                      active
                        ? "border-indigo-300 bg-indigo-50/75 ring-4 ring-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:ring-indigo-950"
                        : "border-slate-200 bg-white hover:border-primary/35 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className={`flex min-h-24 items-center justify-center rounded-md bg-gradient-to-br ${proof.tone} text-white shadow-inner`}>
                      <Camera className="h-7 w-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={meta.tone}>
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </Badge>
                        <span className="font-mono text-[11px] font-black text-slate-400">{proof.id}</span>
                      </div>
                      <h3 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{proof.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {proof.project}
                      </p>
                      <div className="mt-3">
                        <Progress
                          value={proof.score}
                          tone={proof.score >= 88 ? "success" : proof.score >= 75 ? "warning" : "danger"}
                          showValue={false}
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function AuditRow({ audit }: { audit: AuditItem }) {
  const meta = statusMeta[audit.status];
  const StatusIcon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`grid gap-4 border-b border-slate-200 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-900/60 xl:grid-cols-[minmax(260px,1.25fr)_120px_115px_150px_150px] xl:items-center ${
        audit.status === "fail" ? "bg-rose-50/35 dark:bg-rose-950/10" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-black text-slate-400">{audit.id}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500 dark:bg-slate-900">
            {audit.category}
          </span>
        </div>
        <h2 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{audit.checkpoint}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {audit.project} - {audit.issue}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <MapPin className="h-4 w-4 text-indigo-500" />
        {audit.city}
      </div>

      <Badge tone={meta.tone} className="w-fit px-2.5 py-1">
        <StatusIcon className="h-3.5 w-3.5" />
        {meta.label}
      </Badge>

      <div className="space-y-2">
        <Progress value={audit.score} tone={meta.progressTone} showValue />
        <p className="text-xs font-bold text-slate-500">Due {audit.due}</p>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        <UserRoundCheck className="h-4 w-4 text-indigo-500" />
        {audit.owner}
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

function ProofDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
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
            {option.includes("All") ? option : option[0]?.toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
