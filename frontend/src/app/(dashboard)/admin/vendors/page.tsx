"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Gauge,
  MapPin,
  PauseCircle,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Modal, Progress } from "@/components/ui";

type VerificationStatus = "verified" | "pending" | "rejected" | "suspended";

type VendorMetrics = {
  quality: number;
  on_time: number;
  customer_rating: number;
  compliance: number;
  response_time: number;
};

type Vendor = {
  id: string;
  name: string;
  owner: string;
  city: string;
  category: string;
  verification: VerificationStatus;
  projects: number;
  revenue: string;
  response: string;
  documents: string;
  risk: "low" | "medium" | "high";
  metrics: VendorMetrics;
};

const vendors: Vendor[] = [
  {
    id: "VEN-1024",
    name: "SecureVision Projects",
    owner: "Rahul Mehta",
    city: "Mumbai",
    category: "CCTV",
    verification: "verified",
    projects: 42,
    revenue: "Rs 48.6L",
    response: "14 min",
    documents: "GST, MSME, Insurance, KYC",
    risk: "low",
    metrics: {
      quality: 94,
      on_time: 91,
      customer_rating: 96,
      compliance: 98,
      response_time: 90,
    },
  },
  {
    id: "VEN-1023",
    name: "Ignis Safety Systems",
    owner: "Aman Sharma",
    city: "Delhi NCR",
    category: "Fire Safety",
    verification: "pending",
    projects: 27,
    revenue: "Rs 31.2L",
    response: "22 min",
    documents: "GST, Fire license, KYC pending",
    risk: "medium",
    metrics: {
      quality: 88,
      on_time: 76,
      customer_rating: 90,
      compliance: 82,
      response_time: 78,
    },
  },
  {
    id: "VEN-1022",
    name: "GateGrid Technologies",
    owner: "Priya Nair",
    city: "Bengaluru",
    category: "Access Control",
    verification: "verified",
    projects: 34,
    revenue: "Rs 39.8L",
    response: "18 min",
    documents: "GST, OEM certificate, KYC",
    risk: "low",
    metrics: {
      quality: 91,
      on_time: 87,
      customer_rating: 94,
      compliance: 95,
      response_time: 84,
    },
  },
  {
    id: "VEN-1021",
    name: "CoreLink Infra",
    owner: "Nikhil Arora",
    city: "Pune",
    category: "Networking",
    verification: "verified",
    projects: 29,
    revenue: "Rs 26.4L",
    response: "19 min",
    documents: "GST, ISO, KYC",
    risk: "low",
    metrics: {
      quality: 89,
      on_time: 92,
      customer_rating: 91,
      compliance: 93,
      response_time: 86,
    },
  },
  {
    id: "VEN-1020",
    name: "SignalOps Security",
    owner: "Mehul Patel",
    city: "Ahmedabad",
    category: "CCTV",
    verification: "suspended",
    projects: 18,
    revenue: "Rs 12.7L",
    response: "41 min",
    documents: "Insurance expired",
    risk: "high",
    metrics: {
      quality: 72,
      on_time: 61,
      customer_rating: 74,
      compliance: 52,
      response_time: 58,
    },
  },
  {
    id: "VEN-1019",
    name: "SafeLayer ELV Works",
    owner: "Farhan Khan",
    city: "Hyderabad",
    category: "Fire Safety",
    verification: "rejected",
    projects: 9,
    revenue: "Rs 7.8L",
    response: "35 min",
    documents: "KYC mismatch",
    risk: "high",
    metrics: {
      quality: 69,
      on_time: 66,
      customer_rating: 70,
      compliance: 48,
      response_time: 63,
    },
  },
];

const categories = ["All categories", "CCTV", "Fire Safety", "Access Control", "Networking"];
const cities = ["All cities", "Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Ahmedabad", "Hyderabad"];
const verificationStatuses = ["All statuses", "verified", "pending", "rejected", "suspended"];

const verificationMeta: Record<
  VerificationStatus,
  { label: string; tone: "success" | "warning" | "danger" | "neutral"; icon: LucideIcon }
> = {
  verified: { label: "Verified", tone: "success", icon: BadgeCheck },
  pending: { label: "Pending", tone: "warning", icon: Clock3 },
  rejected: { label: "Rejected", tone: "danger", icon: XCircle },
  suspended: { label: "Suspended", tone: "neutral", icon: PauseCircle },
};

const riskClasses = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
  medium: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
  high: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-900",
};

const metricLabels: Array<{ key: keyof VendorMetrics; label: string; weight: string }> = [
  { key: "quality", label: "Quality", weight: "30%" },
  { key: "on_time", label: "On time", weight: "25%" },
  { key: "customer_rating", label: "Customer rating", weight: "20%" },
  { key: "compliance", label: "Compliance", weight: "15%" },
  { key: "response_time", label: "Response time", weight: "10%" },
];

function getVendorScore(metrics: VendorMetrics) {
  return Math.round(
    metrics.quality * 0.3 +
      metrics.on_time * 0.25 +
      metrics.customer_rating * 0.2 +
      metrics.compliance * 0.15 +
      metrics.response_time * 0.1,
  );
}

function getScoreTone(score: number): "success" | "warning" | "danger" | "primary" {
  if (score >= 88) return "success";
  if (score >= 78) return "primary";
  if (score >= 68) return "warning";
  return "danger";
}

export default function AdminVendorsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [city, setCity] = useState("All cities");
  const [verification, setVerification] = useState("All statuses");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0]);
  const [profileVendor, setProfileVendor] = useState<Vendor | null>(null);
  const [actionLog, setActionLog] = useState("No vendor action queued");

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const searchMatch = `${vendor.name} ${vendor.owner} ${vendor.city} ${vendor.category}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const categoryMatch = category === "All categories" || vendor.category === category;
      const cityMatch = city === "All cities" || vendor.city === city;
      const verificationMatch = verification === "All statuses" || vendor.verification === verification;

      return searchMatch && categoryMatch && cityMatch && verificationMatch;
    });
  }, [category, city, search, verification]);

  const averageScore = Math.round(
    filteredVendors.reduce((total, vendor) => total + getVendorScore(vendor.metrics), 0) /
      Math.max(filteredVendors.length, 1),
  );

  const verifiedCount = filteredVendors.filter((vendor) => vendor.verification === "verified").length;
  const pendingCount = filteredVendors.filter((vendor) => vendor.verification === "pending").length;

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%)]" />

      <div className="space-y-6">
        <section className="rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="px-3 py-1">
                  <Building2 className="h-3.5 w-3.5" />
                  Vendor management
                </Badge>
                <Badge tone="success" className="px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Weighted score formula
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Vendor Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Verify vendors, compare weighted performance scores, review
                compliance posture, and take approval actions from one admin view.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[480px]">
              <MiniMetric label="Avg score" value={`${averageScore}`} icon={Gauge} />
              <MiniMetric label="Verified" value={String(verifiedCount)} icon={UserCheck} />
              <MiniMetric label="Pending" value={String(pendingCount)} icon={Clock3} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Vendor Table"
            description="Score = quality 30% + on-time 25% + customer rating 20% + compliance 15% + response time 10%."
            action={
              <Badge tone="primary" className="px-3 py-1">
                {filteredVendors.length} vendors
              </Badge>
            }
          >
            <div className="space-y-4">
              <div className="grid gap-3 rounded-md border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
                <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  Search
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Vendor, owner, city..."
                      className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
                    />
                  </div>
                </label>
                <FilterSelect label="City" value={city} options={cities} onChange={setCity} />
                <FilterSelect label="Category" value={category} options={categories} onChange={setCategory} />
                <FilterSelect label="Verification" value={verification} options={verificationStatuses} onChange={setVerification} />
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="hidden grid-cols-[minmax(240px,1.25fr)_130px_130px_110px_260px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 lg:grid">
                  <span>Vendor</span>
                  <span>Verification</span>
                  <span>Score</span>
                  <span>Risk</span>
                  <span>Actions</span>
                </div>

                <AnimatePresence initial={false}>
                  {filteredVendors.map((vendor) => (
                    <VendorRow
                      key={vendor.id}
                      vendor={vendor}
                      selected={selectedVendor?.id === vendor.id}
                      onView={() => {
                        setSelectedVendor(vendor);
                        setProfileVendor(vendor);
                      }}
                      onAction={(action) => setActionLog(`${action} queued for ${vendor.name}`)}
                    />
                  ))}
                </AnimatePresence>

                {!filteredVendors.length ? (
                  <div className="p-10 text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
                      No vendors match these filters.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try another city, category, verification status, or search term.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            title="Performance Chart"
            description="Weighted metrics for the selected vendor."
            action={
              <Badge tone={selectedVendor ? getScoreTone(getVendorScore(selectedVendor.metrics)) : "neutral"}>
                <Star className="h-3.5 w-3.5" />
                {selectedVendor ? getVendorScore(selectedVendor.metrics) : 0}
              </Badge>
            }
          >
            {selectedVendor ? (
              <VendorPerformance vendor={selectedVendor} />
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm font-bold text-slate-500 dark:border-slate-700">
                Select a vendor to inspect performance.
              </div>
            )}
          </Card>
        </section>

        <div className="rounded-md border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-slate-950 dark:to-emerald-950/20">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Latest action</p>
          <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{actionLog}</p>
        </div>
      </div>

      <VendorProfileModal vendor={profileVendor} onClose={() => setProfileVendor(null)} />
    </div>
  );
}

function VendorRow({
  vendor,
  selected,
  onView,
  onAction,
}: {
  vendor: Vendor;
  selected: boolean;
  onView: () => void;
  onAction: (action: string) => void;
}) {
  const verification = verificationMeta[vendor.verification];
  const VerificationIcon = verification.icon;
  const score = getVendorScore(vendor.metrics);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`grid gap-4 border-b border-slate-200 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-900/60 lg:grid-cols-[minmax(240px,1.25fr)_130px_130px_110px_260px] lg:items-center ${
        selected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-black text-slate-400">{vendor.id}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500 dark:bg-slate-900">
            {vendor.category}
          </span>
        </div>
        <h2 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{vendor.name}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{vendor.owner}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {vendor.city}
          </span>
        </p>
      </div>

      <Badge tone={verification.tone} className="w-fit px-2.5 py-1">
        <VerificationIcon className="h-3.5 w-3.5" />
        {verification.label}
      </Badge>

      <ScoreBadge score={score} />

      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ${riskClasses[vendor.risk]}`}>
        {vendor.risk}
      </span>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Eye className="h-3.5 w-3.5" />
          Profile
        </button>
        <ActionButton label="Approve" icon={CheckCircle2} onClick={() => onAction("Approve")} />
        <ActionButton label="Reject" icon={XCircle} danger onClick={() => onAction("Reject")} />
        <ActionButton label="Suspend" icon={Ban} danger onClick={() => onAction("Suspend")} />
      </div>
    </motion.div>
  );
}

function VendorProfileModal({ vendor, onClose }: { vendor: Vendor | null; onClose: () => void }) {
  if (!vendor) return null;

  const score = getVendorScore(vendor.metrics);
  const verification = verificationMeta[vendor.verification];
  const VerificationIcon = verification.icon;

  return (
    <Modal
      open={Boolean(vendor)}
      onClose={onClose}
      title={vendor.name}
      description={`${vendor.category} vendor profile, verification posture, and weighted performance score.`}
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" size="sm" leftIcon={<XCircle className="h-4 w-4" />}>
            Reject
          </Button>
          <Button variant="danger" size="sm" leftIcon={<Ban className="h-4 w-4" />}>
            Suspend
          </Button>
          <Button variant="primary" size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Approve vendor
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Vendor score</p>
                <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{score}</p>
              </div>
              <ScoreBadge score={score} />
            </div>
            <div className="mt-4 space-y-3">
              <ProfileLine label="Owner" value={vendor.owner} />
              <ProfileLine label="City" value={vendor.city} />
              <ProfileLine label="Projects" value={String(vendor.projects)} />
              <ProfileLine label="Revenue" value={vendor.revenue} />
              <ProfileLine label="Response" value={vendor.response} />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-950 dark:text-white">Verification status</p>
              <Badge tone={verification.tone}>
                <VerificationIcon className="h-3.5 w-3.5" />
                {verification.label}
              </Badge>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {vendor.documents}
            </p>
          </div>
        </div>

        <VendorPerformance vendor={vendor} />
      </div>
    </Modal>
  );
}

function VendorPerformance({ vendor }: { vendor: Vendor }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-950 dark:text-white">{vendor.name}</p>
            <p className="mt-1 text-xs text-slate-500">Performance chart</p>
          </div>
          <Badge tone={getScoreTone(getVendorScore(vendor.metrics))}>
            <Gauge className="h-3.5 w-3.5" />
            {getVendorScore(vendor.metrics)}
          </Badge>
        </div>

        <div className="space-y-4">
          {metricLabels.map((metric) => (
            <div key={metric.key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                  {metric.label}
                </span>
                <span className="font-mono text-[11px] font-black text-slate-400">
                  {vendor.metrics[metric.key]} / 100 - {metric.weight}
                </span>
              </div>
              <Progress
                value={vendor.metrics[metric.key]}
                tone={vendor.metrics[metric.key] >= 85 ? "success" : vendor.metrics[metric.key] >= 70 ? "primary" : "danger"}
                showValue={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatPill label="Projects" value={String(vendor.projects)} icon={FileCheck2} />
        <StatPill label="Revenue" value={vendor.revenue} icon={ArrowUpRight} />
        <StatPill label="Response" value={vendor.response} icon={Clock3} />
        <StatPill label="Rating" value={`${(vendor.metrics.customer_rating / 20).toFixed(1)}/5`} icon={Star} />
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <Badge tone={getScoreTone(score)} className="w-fit px-3 py-1">
      <Gauge className="h-3.5 w-3.5" />
      Score {score}
    </Badge>
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

function StatPill({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-lg font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  danger,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
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
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.includes("All")
              ? option
              : option
                  .split("-")
                  .map((part) => part[0]?.toUpperCase() + part.slice(1))
                  .join(" ")}
          </option>
        ))}
      </select>
    </label>
  );
}
