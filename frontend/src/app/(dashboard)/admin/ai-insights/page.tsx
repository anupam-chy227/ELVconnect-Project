"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BrainCircuit,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Gauge,
  Lightbulb,
  MapPin,
  Radio,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card, Progress } from "@/components/ui";

type DelayRisk = "critical" | "high" | "medium" | "low";

type PredictionAlert = {
  id: string;
  project: string;
  city: string;
  category: string;
  predictedDelay: string;
  probability: number;
  risk: DelayRisk;
  reason: string;
  action: string;
};

type ForecastPoint = {
  week: string;
  cctv: number;
  fire: number;
  access: number;
  network: number;
};

type VendorRecommendation = {
  vendor: string;
  city: string;
  category: string;
  match: number;
  response: string;
  score: number;
  reason: string;
  status: "recommended" | "backup" | "watch";
};

type InsightCard = {
  label: string;
  value: string;
  detail: string;
  tone: "primary" | "success" | "warning" | "danger";
  icon: LucideIcon;
};

const predictionAlerts: PredictionAlert[] = [
  {
    id: "AI-DLY-884",
    project: "Phoenix Mall CCTV Command Center",
    city: "Mumbai",
    category: "CCTV",
    predictedDelay: "14-18 hrs",
    probability: 86,
    risk: "critical",
    reason: "QA proof pending, NVR failover validation missing, vendor queue overloaded.",
    action: "Assign senior QA reviewer and block payout until proof is verified.",
  },
  {
    id: "AI-DLY-883",
    project: "Northline Fire Alarm Retrofit",
    city: "Delhi NCR",
    category: "Fire Safety",
    predictedDelay: "8-10 hrs",
    probability: 74,
    risk: "high",
    reason: "Material dispatch delay and detector tag mismatch from latest inspection.",
    action: "Escalate material confirmation and schedule second inspector.",
  },
  {
    id: "AI-DLY-882",
    project: "Metro Logistics VMS Expansion",
    city: "Ahmedabad",
    category: "CCTV",
    predictedDelay: "5-7 hrs",
    probability: 63,
    risk: "medium",
    reason: "Vendor compliance warning and retention policy approval pending.",
    action: "Move to verified backup vendor if compliance remains unresolved.",
  },
  {
    id: "AI-DLY-881",
    project: "Zenith CoWorks Access Upgrade",
    city: "Bengaluru",
    category: "Access Control",
    predictedDelay: "<2 hrs",
    probability: 21,
    risk: "low",
    reason: "Engineer checked in, proof quality high, client signoff window confirmed.",
    action: "Keep normal monitoring cadence.",
  },
];

const forecastData: ForecastPoint[] = [
  { week: "W1", cctv: 64, fire: 42, access: 38, network: 30 },
  { week: "W2", cctv: 72, fire: 45, access: 44, network: 34 },
  { week: "W3", cctv: 78, fire: 52, access: 49, network: 39 },
  { week: "W4", cctv: 86, fire: 58, access: 53, network: 41 },
  { week: "W5", cctv: 92, fire: 61, access: 60, network: 47 },
  { week: "W6", cctv: 88, fire: 66, access: 64, network: 52 },
];

const vendorRecommendations: VendorRecommendation[] = [
  {
    vendor: "SecureVision Projects",
    city: "Mumbai",
    category: "CCTV",
    match: 94,
    response: "14 min",
    score: 96,
    reason: "Best historical performance for large CCTV command rooms and fastest Mumbai response.",
    status: "recommended",
  },
  {
    vendor: "GateGrid Technologies",
    city: "Bengaluru",
    category: "Access Control",
    match: 91,
    response: "18 min",
    score: 93,
    reason: "Strong access-control QA score and low rework rate in coworking environments.",
    status: "recommended",
  },
  {
    vendor: "CoreLink Infra",
    city: "Pune",
    category: "Networking",
    match: 88,
    response: "19 min",
    score: 89,
    reason: "Reliable network audit completion and strong documentation quality.",
    status: "backup",
  },
  {
    vendor: "Ignis Safety Systems",
    city: "Delhi NCR",
    category: "Fire Safety",
    match: 76,
    response: "22 min",
    score: 82,
    reason: "Good fire safety coverage, but current material dispatch variance needs monitoring.",
    status: "watch",
  },
];

const insightCards: InsightCard[] = [
  {
    label: "Delay risk",
    value: "3 flagged",
    detail: "Critical or high probability delay predictions",
    tone: "danger",
    icon: ShieldAlert,
  },
  {
    label: "Demand lift",
    value: "+18.6%",
    detail: "Forecasted ELV demand over next six weeks",
    tone: "success",
    icon: TrendingUp,
  },
  {
    label: "Vendor match",
    value: "94%",
    detail: "Top recommendation confidence",
    tone: "primary",
    icon: Target,
  },
  {
    label: "Automation",
    value: "12 actions",
    detail: "Suggested queue moves and escalation actions",
    tone: "warning",
    icon: Zap,
  },
];

const riskMeta: Record<DelayRisk, { label: string; tone: "danger" | "warning" | "success"; color: string }> = {
  critical: {
    label: "Critical",
    tone: "danger",
    color: "from-rose-600 to-orange-500",
  },
  high: {
    label: "High",
    tone: "danger",
    color: "from-orange-500 to-amber-400",
  },
  medium: {
    label: "Medium",
    tone: "warning",
    color: "from-amber-500 to-yellow-400",
  },
  low: {
    label: "Low",
    tone: "success",
    color: "from-emerald-500 to-teal-400",
  },
};

const probabilityRingClassNames: Record<number, string> = {
  86: "bg-[conic-gradient(rgb(99_102_241)_309.6deg,rgba(226,232,240,0.9)_0deg)]",
  74: "bg-[conic-gradient(rgb(99_102_241)_266.4deg,rgba(226,232,240,0.9)_0deg)]",
  63: "bg-[conic-gradient(rgb(99_102_241)_226.8deg,rgba(226,232,240,0.9)_0deg)]",
  21: "bg-[conic-gradient(rgb(99_102_241)_75.6deg,rgba(226,232,240,0.9)_0deg)]",
};

const recommendationMeta = {
  recommended: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900",
  backup: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-900",
  watch: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
};

function getForecastTotal(point: ForecastPoint) {
  return point.cctv + point.fire + point.access + point.network;
}

export default function AdminAiInsightsPage() {
  const [selectedAlertId, setSelectedAlertId] = useState(predictionAlerts[0].id);
  const [selectedVendor, setSelectedVendor] = useState(vendorRecommendations[0].vendor);

  const selectedAlert = useMemo(
    () => predictionAlerts.find((alert) => alert.id === selectedAlertId) ?? predictionAlerts[0],
    [selectedAlertId],
  );

  const activeVendor = useMemo(
    () => vendorRecommendations.find((vendor) => vendor.vendor === selectedVendor) ?? vendorRecommendations[0],
    [selectedVendor],
  );

  const maxForecast = Math.max(...forecastData.map(getForecastTotal));
  const aggregateRisk = Math.round(
    predictionAlerts.reduce((total, alert) => total + alert.probability, 0) / predictionAlerts.length,
  );
  const forecastLift = Math.round(
    ((getForecastTotal(forecastData[forecastData.length - 1]) - getForecastTotal(forecastData[0])) /
      getForecastTotal(forecastData[0])) *
      100,
  );

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_38%)]" />

      <div className="space-y-6">
        <section className="rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="px-3 py-1">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  AI insights
                </Badge>
                <Badge tone="success" className="px-3 py-1">
                  <Radio className="h-3.5 w-3.5 animate-pulse" />
                  Live inference
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                AI Insights Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Predict project delays, forecast demand by service category,
                rank vendor recommendations, and visualize operational risk.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <MiniMetric label="Aggregate risk" value={`${aggregateRisk}%`} icon={Gauge} />
              <MiniMetric label="Forecast lift" value={`+${forecastLift}%`} icon={TrendingUp} />
              <MiniMetric label="AI actions" value="12" icon={Sparkles} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {insightCards.map((insight, index) => {
            const Icon = insight.icon;

            return (
              <Card
                key={insight.label}
                variant="stat"
                padding="lg"
                transition={{ delay: index * 0.04, type: "spring", stiffness: 320, damping: 30 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {insight.label}
                    </p>
                    <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{insight.value}</p>
                  </div>
                  <div className="rounded-md bg-indigo-50 p-3 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-200 dark:ring-indigo-900">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <Badge tone={insight.tone} className="mt-5 px-3 py-1">
                  {insight.detail}
                </Badge>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Delay Prediction Alerts"
            description="AI-ranked delay probabilities with recommended operations actions."
            action={
              <Badge tone={riskMeta[selectedAlert.risk].tone}>
                <AlertTriangle className="h-3.5 w-3.5" />
                {riskMeta[selectedAlert.risk].label}
              </Badge>
            }
          >
            <div className="grid gap-3">
              {predictionAlerts.map((alert, index) => {
                const meta = riskMeta[alert.risk];
                const active = alert.id === selectedAlert.id;

                return (
                  <motion.button
                    key={alert.id}
                    type="button"
                    onClick={() => setSelectedAlertId(alert.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                      active
                        ? "border-indigo-300 bg-indigo-50/80 ring-4 ring-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:ring-indigo-950"
                        : "border-slate-200 bg-white/85 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950/75"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-black text-slate-400">{alert.id}</span>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500 dark:bg-slate-900">
                            {alert.category}
                          </span>
                        </div>
                        <h2 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{alert.project}</h2>
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {alert.city} - Predicted delay {alert.predictedDelay}
                        </p>
                      </div>
                      <div className="min-w-[180px]">
                        <Progress value={alert.probability} tone={meta.tone} showValue />
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
            title="Risk Score Visualization"
            description="Selected prediction model confidence and intervention reason."
            action={
              <Badge tone={riskMeta[selectedAlert.risk].tone}>
                Risk {selectedAlert.probability}
              </Badge>
            }
          >
            <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-full bg-slate-100 p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className={`absolute inset-4 rounded-full ${probabilityRingClassNames[selectedAlert.probability]}`} />
              <div className="relative flex h-44 w-44 flex-col items-center justify-center rounded-full border border-white/80 bg-white text-center shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                <Gauge className="h-7 w-7 text-indigo-600" />
                <p className="mt-2 text-5xl font-black text-slate-950 dark:text-white">{selectedAlert.probability}</p>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">risk score</p>
              </div>
            </div>
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-black text-slate-950 dark:text-white">Why AI flagged this</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedAlert.reason}</p>
              <div className="mt-4 rounded-md border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
                <p className="flex items-start gap-2 text-sm font-bold text-indigo-800 dark:text-indigo-100">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  {selectedAlert.action}
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <Card
            variant="glass"
            padding="lg"
            title="Demand Forecast Chart"
            description="Six-week category demand forecast across CCTV, fire safety, access control, and networking."
            action={
              <Badge tone="success">
                <TrendingUp className="h-3.5 w-3.5" />
                AI forecast
              </Badge>
            }
          >
            <div className="flex h-80 items-end gap-3 rounded-md border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              {forecastData.map((point, index) => {
                const total = getForecastTotal(point);

                return (
                  <div key={point.week} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div className="flex h-full flex-col justify-end overflow-hidden rounded-t-md bg-slate-100 shadow-inner dark:bg-slate-800">
                      <ForecastSegment value={point.network} total={maxForecast} color="bg-sky-500" delay={index * 0.04} />
                      <ForecastSegment value={point.access} total={maxForecast} color="bg-emerald-500" delay={index * 0.04 + 0.03} />
                      <ForecastSegment value={point.fire} total={maxForecast} color="bg-rose-500" delay={index * 0.04 + 0.06} />
                      <ForecastSegment value={point.cctv} total={maxForecast} color="bg-indigo-600" delay={index * 0.04 + 0.09} />
                    </div>
                    <span className="text-center text-[11px] font-black text-slate-500">{point.week}</span>
                    <span className="text-center font-mono text-[11px] font-black text-slate-400">{total}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Legend color="bg-indigo-600" label="CCTV" />
              <Legend color="bg-rose-500" label="Fire" />
              <Legend color="bg-emerald-500" label="Access" />
              <Legend color="bg-sky-500" label="Network" />
            </div>
          </Card>

          <Card
            variant="elevated"
            padding="lg"
            title="Vendor Recommendation Panel"
            description="AI-ranked vendors using category fit, response time, QA score, and city capacity."
            action={
              <Badge tone="primary">
                <Target className="h-3.5 w-3.5" />
                Match {activeVendor.match}
              </Badge>
            }
          >
            <div className="space-y-3">
              {vendorRecommendations.map((vendor, index) => {
                const active = vendor.vendor === activeVendor.vendor;

                return (
                  <motion.button
                    key={vendor.vendor}
                    type="button"
                    onClick={() => setSelectedVendor(vendor.vendor)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`w-full rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                      active
                        ? "border-indigo-300 bg-indigo-50/75 ring-4 ring-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:ring-indigo-950"
                        : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ring-1 ${recommendationMeta[vendor.status]}`}>
                            {vendor.status}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500 dark:bg-slate-900">
                            {vendor.category}
                          </span>
                        </div>
                        <h3 className="mt-3 text-sm font-black text-slate-950 dark:text-white">{vendor.vendor}</h3>
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {vendor.city} - {vendor.response}
                        </p>
                      </div>
                      <Badge tone={vendor.match >= 90 ? "success" : vendor.match >= 82 ? "primary" : "warning"}>
                        {vendor.match}%
                      </Badge>
                    </div>
                    <Progress
                      value={vendor.match}
                      tone={vendor.match >= 90 ? "success" : vendor.match >= 82 ? "primary" : "warning"}
                      showValue={false}
                      className="mt-4"
                    />
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </section>

        <Card
          variant="glass"
          padding="lg"
          title="Selected Recommendation"
          description="Explainable recommendation details for operator review."
          action={
            <Badge tone="success">
              <BadgeCheck className="h-3.5 w-3.5" />
              Confidence {activeVendor.score}
            </Badge>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Recommended vendor</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{activeVendor.vendor}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoPill label="City" value={activeVendor.city} icon={MapPin} />
                <InfoPill label="Category" value={activeVendor.category} icon={Building2} />
                <InfoPill label="Response" value={activeVendor.response} icon={Clock3} />
                <InfoPill label="Match" value={`${activeVendor.match}%`} icon={Target} />
              </div>
            </div>
            <div className="rounded-md border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-slate-950 dark:to-emerald-950/20">
              <p className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
                <BrainCircuit className="h-4 w-4 text-indigo-600" />
                AI explanation
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{activeVendor.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="primary">Category fit</Badge>
                <Badge tone="success">Capacity available</Badge>
                <Badge tone={activeVendor.status === "watch" ? "warning" : "success"}>Risk adjusted</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ForecastSegment({
  value,
  total,
  color,
  delay,
}: {
  value: number;
  total: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: `${(value / total) * 100}%` }}
      transition={{ delay, duration: 0.55, ease: "easeOut" }}
      className={color}
    />
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

function InfoPill({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
