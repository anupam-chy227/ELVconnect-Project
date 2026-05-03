"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  Crown,
  Gauge,
  IndianRupee,
  Map,
  MapPin,
  Radio,
  ShieldCheck,
  Star,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card, Progress } from "@/components/ui";

type CityInsight = {
  city: string;
  region: string;
  revenue: number;
  projects: number;
  activeProjects: number;
  vendors: number;
  avgScore: number;
  growth: number;
  sla: number;
  mapPosition: {
    left: string;
    top: string;
  };
  categories: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  topVendors: Array<{
    name: string;
    category: string;
    score: number;
    revenue: string;
    status: "verified" | "watch" | "top";
  }>;
};

const cityInsights: CityInsight[] = [
  {
    city: "Mumbai",
    region: "West",
    revenue: 4860000,
    projects: 318,
    activeProjects: 74,
    vendors: 126,
    avgScore: 91,
    growth: 18.4,
    sla: 96,
    mapPosition: { left: "28%", top: "55%" },
    categories: [
      { label: "CCTV", value: 42, color: "from-indigo-500 to-violet-500" },
      { label: "Fire Safety", value: 26, color: "from-rose-500 to-orange-400" },
      { label: "Access", value: 18, color: "from-emerald-500 to-teal-400" },
      { label: "Networking", value: 14, color: "from-sky-500 to-indigo-400" },
    ],
    topVendors: [
      { name: "SecureVision Projects", category: "CCTV", score: 94, revenue: "Rs 48.6L", status: "top" },
      { name: "Aegis Fire Controls", category: "Fire Safety", score: 90, revenue: "Rs 31.4L", status: "verified" },
      { name: "MetroLink ELV", category: "Networking", score: 86, revenue: "Rs 19.8L", status: "verified" },
    ],
  },
  {
    city: "Delhi NCR",
    region: "North",
    revenue: 3920000,
    projects: 274,
    activeProjects: 61,
    vendors: 108,
    avgScore: 87,
    growth: 13.7,
    sla: 92,
    mapPosition: { left: "48%", top: "25%" },
    categories: [
      { label: "Fire Safety", value: 34, color: "from-rose-500 to-orange-400" },
      { label: "CCTV", value: 30, color: "from-indigo-500 to-violet-500" },
      { label: "Access", value: 21, color: "from-emerald-500 to-teal-400" },
      { label: "Networking", value: 15, color: "from-sky-500 to-indigo-400" },
    ],
    topVendors: [
      { name: "Ignis Safety Systems", category: "Fire Safety", score: 88, revenue: "Rs 31.2L", status: "verified" },
      { name: "NorthGrid Security", category: "CCTV", score: 85, revenue: "Rs 24.9L", status: "verified" },
      { name: "AccessOne NCR", category: "Access Control", score: 79, revenue: "Rs 15.1L", status: "watch" },
    ],
  },
  {
    city: "Bengaluru",
    region: "South",
    revenue: 3410000,
    projects: 232,
    activeProjects: 49,
    vendors: 96,
    avgScore: 89,
    growth: 16.2,
    sla: 94,
    mapPosition: { left: "47%", top: "72%" },
    categories: [
      { label: "Access", value: 36, color: "from-emerald-500 to-teal-400" },
      { label: "Networking", value: 25, color: "from-sky-500 to-indigo-400" },
      { label: "CCTV", value: 24, color: "from-indigo-500 to-violet-500" },
      { label: "Fire Safety", value: 15, color: "from-rose-500 to-orange-400" },
    ],
    topVendors: [
      { name: "GateGrid Technologies", category: "Access Control", score: 91, revenue: "Rs 39.8L", status: "top" },
      { name: "SouthLink Networks", category: "Networking", score: 88, revenue: "Rs 22.6L", status: "verified" },
      { name: "CivicVision ELV", category: "CCTV", score: 84, revenue: "Rs 17.2L", status: "verified" },
    ],
  },
  {
    city: "Pune",
    region: "West",
    revenue: 2280000,
    projects: 168,
    activeProjects: 34,
    vendors: 72,
    avgScore: 86,
    growth: 10.9,
    sla: 93,
    mapPosition: { left: "34%", top: "59%" },
    categories: [
      { label: "Networking", value: 38, color: "from-sky-500 to-indigo-400" },
      { label: "CCTV", value: 27, color: "from-indigo-500 to-violet-500" },
      { label: "Access", value: 21, color: "from-emerald-500 to-teal-400" },
      { label: "Fire Safety", value: 14, color: "from-rose-500 to-orange-400" },
    ],
    topVendors: [
      { name: "CoreLink Infra", category: "Networking", score: 89, revenue: "Rs 26.4L", status: "top" },
      { name: "Pune SecureWorks", category: "CCTV", score: 84, revenue: "Rs 13.7L", status: "verified" },
      { name: "RackOps India", category: "Networking", score: 81, revenue: "Rs 11.8L", status: "verified" },
    ],
  },
  {
    city: "Ahmedabad",
    region: "West",
    revenue: 1840000,
    projects: 126,
    activeProjects: 28,
    vendors: 51,
    avgScore: 78,
    growth: 8.1,
    sla: 88,
    mapPosition: { left: "30%", top: "43%" },
    categories: [
      { label: "CCTV", value: 40, color: "from-indigo-500 to-violet-500" },
      { label: "Fire Safety", value: 24, color: "from-rose-500 to-orange-400" },
      { label: "Networking", value: 19, color: "from-sky-500 to-indigo-400" },
      { label: "Access", value: 17, color: "from-emerald-500 to-teal-400" },
    ],
    topVendors: [
      { name: "SignalOps Security", category: "CCTV", score: 72, revenue: "Rs 12.7L", status: "watch" },
      { name: "Gujarat Fire Grid", category: "Fire Safety", score: 82, revenue: "Rs 10.6L", status: "verified" },
      { name: "Amdavad ELV Co.", category: "Access Control", score: 79, revenue: "Rs 8.8L", status: "verified" },
    ],
  },
];

const metricColors = {
  top: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
  watch: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
};

function getCityMapClassName(city: string) {
  switch (city) {
    case "Mumbai":
      return "left-[28%] top-[55%]";
    case "Delhi NCR":
      return "left-[48%] top-[25%]";
    case "Bengaluru":
      return "left-[47%] top-[72%]";
    case "Pune":
      return "left-[34%] top-[59%]";
    case "Ahmedabad":
      return "left-[30%] top-[43%]";
    default:
      return "left-1/2 top-1/2";
  }
}

function getCityBubbleClassName(city: string) {
  switch (city) {
    case "Mumbai":
      return "h-[52px] w-[52px]";
    case "Delhi NCR":
      return "h-[47px] w-[47px]";
    case "Bengaluru":
      return "h-[43px] w-[43px]";
    case "Pune":
      return "h-9 w-9";
    case "Ahmedabad":
      return "h-8 w-8";
    default:
      return "h-9 w-9";
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(amount);
}

export default function AdminCityInsightsPage() {
  const [selectedCity, setSelectedCity] = useState(cityInsights[0].city);

  const activeCity = useMemo(
    () => cityInsights.find((city) => city.city === selectedCity) ?? cityInsights[0],
    [selectedCity],
  );

  const totalRevenue = cityInsights.reduce((total, city) => total + city.revenue, 0);
  const totalProjects = cityInsights.reduce((total, city) => total + city.projects, 0);
  const totalVendors = cityInsights.reduce((total, city) => total + city.vendors, 0);
  const bestCity = cityInsights.reduce((best, city) => (city.avgScore > best.avgScore ? city : best), cityInsights[0]);
  const maxRevenue = Math.max(...cityInsights.map((city) => city.revenue));

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.13),transparent_30%)]" />

      <div className="space-y-6">
        <section className="rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="px-3 py-1">
                  <Map className="h-3.5 w-3.5" />
                  City insights
                </Badge>
                <Badge tone="success" className="px-3 py-1">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  India marketplace pulse
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                City Insights
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Compare city performance, revenue concentration, project
                distribution, and top vendor strength across active ELV markets.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[620px]">
              <MiniMetric label="Revenue" value={formatAmount(totalRevenue)} icon={IndianRupee} />
              <MiniMetric label="Projects" value={String(totalProjects)} icon={Building2} />
              <MiniMetric label="Vendors" value={String(totalVendors)} icon={UsersRound} />
              <MiniMetric label="Best city" value={bestCity.city} icon={Crown} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cityInsights.map((city, index) => (
            <motion.button
              key={city.city}
              type="button"
              onClick={() => setSelectedCity(city.city)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 320, damping: 30 }}
              className={`rounded-md border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                activeCity.city === city.city
                  ? "border-indigo-300 bg-indigo-50/80 ring-4 ring-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/35 dark:ring-indigo-950"
                  : "border-slate-200 bg-white/85 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950/75"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{city.region}</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{city.city}</h2>
                </div>
                <Badge tone={city.avgScore >= 88 ? "success" : city.avgScore >= 82 ? "primary" : "warning"}>
                  {city.avgScore}
                </Badge>
              </div>
              <p className="mt-4 text-2xl font-black text-slate-950 dark:text-white">
                {formatAmount(city.revenue)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <MetricInline label="Projects" value={String(city.projects)} />
                <MetricInline label="SLA" value={`${city.sla}%`} />
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +{city.growth}% growth
              </div>
            </motion.button>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Revenue Per City"
            description="Monthly GMV concentration across top ELV markets."
            action={
              <Badge tone="success">
                <TrendingUp className="h-3.5 w-3.5" />
                +14.6% blended
              </Badge>
            }
          >
            <div className="space-y-5">
              {cityInsights.map((city, index) => (
                <div key={city.city} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => setSelectedCity(city.city)}
                      className="font-black text-slate-900 transition hover:text-indigo-700 dark:text-white dark:hover:text-indigo-200"
                    >
                      {city.city}
                    </button>
                    <span className="font-mono text-xs font-black text-slate-500">{formatAmount(city.revenue)}</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((city.revenue / maxRevenue) * 100)}%` }}
                      transition={{ delay: index * 0.05, duration: 0.55, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-400 shadow-[0_12px_28px_rgba(99,102,241,0.25)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            title={`${activeCity.city} Performance`}
            description="Selected city service mix, SLA, and vendor density."
            action={
              <Badge tone={activeCity.avgScore >= 88 ? "success" : "primary"}>
                <Gauge className="h-3.5 w-3.5" />
                Score {activeCity.avgScore}
              </Badge>
            }
          >
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <InsightPill label="Active" value={String(activeCity.activeProjects)} icon={Building2} />
                <InsightPill label="Vendors" value={String(activeCity.vendors)} icon={UsersRound} />
                <InsightPill label="SLA" value={`${activeCity.sla}%`} icon={CheckCircle2} />
              </div>
              <Progress value={activeCity.sla} tone={activeCity.sla >= 94 ? "success" : "warning"} label="SLA performance" />
              <div className="space-y-4">
                {activeCity.categories.map((category) => (
                  <div key={category.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{category.label}</span>
                      <span className="font-mono text-xs font-black text-slate-500">{category.value}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.value}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Project Distribution Map"
            description="Relative project volume and market activity by city."
            action={
              <Badge tone="primary">
                <MapPin className="h-3.5 w-3.5" />
                Live map
              </Badge>
            }
          >
            <div className="relative min-h-[430px] overflow-hidden rounded-md border border-slate-200 bg-[radial-gradient(circle_at_50%_42%,rgba(99,102,241,0.15),transparent_24%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#ecfdf5)] p-5 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_50%_42%,rgba(99,102,241,0.18),transparent_24%),linear-gradient(135deg,#020617,#111827_48%,#052e2b)]">
              <div className="absolute left-[34%] top-[12%] h-[72%] w-[34%] rounded-[42%_58%_47%_53%] border border-indigo-300/70 bg-white/25 shadow-inner backdrop-blur dark:border-indigo-700/60 dark:bg-slate-950/25" />
              <div className="absolute left-[38%] top-[21%] h-[52%] w-[23%] rounded-[55%_45%_56%_44%] border border-emerald-300/60 bg-emerald-100/20 dark:border-emerald-800/60 dark:bg-emerald-950/20" />
              {cityInsights.map((city) => {
                const active = activeCity.city === city.city;

                return (
                  <button
                    key={city.city}
                    type="button"
                    onClick={() => setSelectedCity(city.city)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${getCityMapClassName(city.city)}`}
                    aria-label={`View ${city.city}`}
                  >
                    <span
                      className={`relative flex items-center justify-center rounded-full border text-[10px] font-black shadow-xl transition ${getCityBubbleClassName(city.city)} ${
                        active
                          ? "border-indigo-200 bg-indigo-600 text-white shadow-indigo-500/30"
                          : "border-white/80 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-950 dark:text-indigo-200"
                      }`}
                    >
                      {active ? <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" /> : null}
                      <span className="relative">{city.projects}</span>
                    </span>
                    <span className="mt-2 block rounded-full bg-white/90 px-2 py-1 text-[11px] font-black text-slate-700 shadow-sm dark:bg-slate-950/90 dark:text-slate-200">
                      {city.city}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            title={`Top Vendors In ${activeCity.city}`}
            description="Highest-performing vendors by score, category, and city revenue."
            action={
              <Badge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ranked
              </Badge>
            }
          >
            <div className="space-y-3">
              {activeCity.topVendors.map((vendor, index) => (
                <motion.article
                  key={vendor.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900">
                          {index + 1}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${metricColors[vendor.status]}`}>
                          {vendor.status === "top" ? "Top vendor" : vendor.status === "watch" ? "Watch" : "Verified"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-black text-slate-950 dark:text-white">{vendor.name}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {vendor.category} - {vendor.revenue}
                      </p>
                    </div>
                    <Badge tone={vendor.score >= 90 ? "success" : vendor.score >= 80 ? "primary" : "warning"}>
                      <Star className="h-3.5 w-3.5" />
                      {vendor.score}
                    </Badge>
                  </div>
                  <Progress
                    value={vendor.score}
                    tone={vendor.score >= 90 ? "success" : vendor.score >= 80 ? "primary" : "warning"}
                    showValue={false}
                    className="mt-4"
                  />
                </motion.article>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-lg font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function InsightPill({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-lg font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function MetricInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white/70 p-2 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 font-bold text-slate-500">{label}</p>
    </div>
  );
}
