"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BellRing,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  DoorOpen,
  FileCheck2,
  Flame,
  Globe2,
  Languages,
  MapPin,
  MessageCircle,
  Network,
  PhoneCall,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { markDashboardNavigationIntent } from "@/components/Dashboard/DashboardLandingGuard";
import { cn, progressWidthClass } from "@/components/ui/utils";

type ServiceCategory = {
  title: string;
  description: string;
  proof: string;
  href: string;
  icon: LucideIcon;
  demand: number;
};

type LiveStat = {
  label: string;
  value: number;
  suffix?: string;
  delta: string;
  icon: LucideIcon;
  gradient: string;
};

type ActivityItem = {
  title: string;
  city: string;
  detail: string;
  tone: "primary" | "success" | "warning";
};

type CityJob = {
  city: string;
  area: string;
  category: string;
  budget: string;
  payout: string;
  urgency: string;
  trust: number;
};

type EngineerPreview = {
  name: string;
  initials: string;
  city: string;
  area: string;
  category: string;
  trust: number;
  jobs: number;
  response: string;
};

type BusinessSpotlight = {
  company: string;
  location: string;
  scope: string;
  quote: string;
  outcome: string;
  metric: string;
};

type ProcessStep = {
  title: string;
  detail: string;
  icon: LucideIcon;
};

type Review = {
  company: string;
  role: string;
  city: string;
  quote: string;
  score: string;
};

const heroImage =
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2400&q=85";

const serviceCategories: ServiceCategory[] = [
  {
    title: "CCTV",
    description: "IP camera deployment, NVR handover, video analytics, site coverage, and audit evidence.",
    proof: "1,280 live CCTV jobs",
    href: "/categories/cctv-systems",
    icon: Camera,
    demand: 84,
  },
  {
    title: "Fire Safety",
    description: "Fire alarm loops, panel testing, NOC readiness, AMC work, and compliance documentation.",
    proof: "Critical response teams",
    href: "/categories/fire-safety",
    icon: Flame,
    demand: 76,
  },
  {
    title: "Access Control",
    description: "Biometrics, RFID, visitor gates, turnstiles, barriers, attendance, and secure entry flows.",
    proof: "Verified access specialists",
    href: "/categories/access-control",
    icon: DoorOpen,
    demand: 68,
  },
  {
    title: "Data Networking",
    description: "Cat6A, fiber, PoE, rack dressing, switching, OTDR evidence, and handover reports.",
    proof: "SLA-backed cabling work",
    href: "/categories/networking",
    icon: Network,
    demand: 72,
  },
];

const trustBar = [
  { label: "Verified engineers", value: "4,200+", icon: ShieldCheck },
  { label: "City clusters", value: "28", icon: MapPin },
  { label: "Escrow-ready work", value: "Rs 8.4Cr", icon: WalletCards },
  { label: "Avg shortlist window", value: "48h", icon: Clock3 },
];

const activityItems: ActivityItem[] = [
  {
    title: "Fire NOC readiness audit moved to survey",
    city: "Delhi NCR",
    detail: "Verified fire specialist assigned in Okhla Phase II",
    tone: "warning",
  },
  {
    title: "CCTV retrofit quote accepted",
    city: "Mumbai",
    detail: "Warehouse site in Bhiwandi funded through milestone escrow",
    tone: "success",
  },
  {
    title: "Data networking engineer shortlisted",
    city: "Bengaluru",
    detail: "Cat6A and rack dressing work matched in 41 minutes",
    tone: "primary",
  },
  {
    title: "Access control work order signed",
    city: "Pune",
    detail: "Biometric upgrade scheduled for Hinjewadi Phase 2",
    tone: "success",
  },
  {
    title: "Hospital fire panel maintenance opened",
    city: "Hyderabad",
    detail: "Emergency response SLA requested for Banjara Hills",
    tone: "warning",
  },
  {
    title: "Campus CCTV commissioning completed",
    city: "Chennai",
    detail: "QA evidence pack shared with client facilities team",
    tone: "success",
  },
];

const cityJobs: CityJob[] = [
  { city: "Delhi NCR", area: "Okhla Phase II", category: "Fire Safety", budget: "Rs 1.1L", payout: "Rs 34k", urgency: "Urgent", trust: 96 },
  { city: "Mumbai", area: "Bhiwandi", category: "CCTV", budget: "Rs 1.4L", payout: "Rs 52k", urgency: "Normal", trust: 92 },
  { city: "Bengaluru", area: "Whitefield", category: "Data Networking", budget: "Rs 2.2L", payout: "Rs 82k", urgency: "Urgent", trust: 94 },
  { city: "Pune", area: "Hinjewadi", category: "Access Control", budget: "Rs 90k", payout: "Rs 38k", urgency: "Normal", trust: 88 },
  { city: "Hyderabad", area: "Banjara Hills", category: "Fire Safety", budget: "Rs 68k", payout: "Rs 27k", urgency: "Emergency", trust: 95 },
  { city: "Chennai", area: "Sriperumbudur", category: "CCTV", budget: "Rs 1.8L", payout: "Rs 64k", urgency: "Urgent", trust: 91 },
];

const engineers: EngineerPreview[] = [
  { name: "Raju Sharma", initials: "RS", city: "Pune", area: "Chakan MIDC", category: "CCTV commissioning", trust: 96, jobs: 82, response: "12 min" },
  { name: "Nisha Khan", initials: "NK", city: "Delhi NCR", area: "Okhla", category: "Fire panel audit", trust: 94, jobs: 61, response: "18 min" },
  { name: "Karthik Rao", initials: "KR", city: "Bengaluru", area: "Whitefield", category: "Data networking", trust: 97, jobs: 91, response: "9 min" },
];

const spotlights: BusinessSpotlight[] = [
  {
    company: "Apex Auto Components",
    location: "Manesar",
    scope: "Factory CCTV and access control rollout",
    quote: "ELV Connect gave us verified engineers, milestone evidence, and payment control without turning the project into a vendor chase.",
    outcome: "16 cameras commissioned in 7 days",
    metric: "98% site coverage verified",
  },
  {
    company: "Northline Warehousing",
    location: "Gurugram",
    scope: "Fire alarm audit and AMC planning",
    quote: "The workflow kept survey notes, quotes, compliance documents, and approvals in one place for our facilities and finance teams.",
    outcome: "Fire audit closed before inspection",
    metric: "42h shortlist window",
  },
  {
    company: "Metro CoWorks",
    location: "Noida",
    scope: "Biometric access control upgrade",
    quote: "Engineer verification and milestone escrow gave our admin team confidence to move fast over a weekend change window.",
    outcome: "3 access points upgraded over a weekend",
    metric: "Zero payment dispute",
  },
];

const clientSteps: ProcessStep[] = [
  { title: "Post verified scope", detail: "Add city, area, site type, budget, urgency, and compliance context.", icon: ClipboardList },
  { title: "Compare trusted engineers", detail: "Review trust score, category fit, response time, and local delivery proof.", icon: Search },
  { title: "Execute with evidence", detail: "Track milestones, site photos, QA checklists, documents, and release-ready payments.", icon: FileCheck2 },
];

const engineerSteps: ProcessStep[] = [
  { title: "Find nearby work", detail: "Filter jobs by city, category, payout, urgency, distance, and trust level.", icon: Radar },
  { title: "Apply with confidence", detail: "See site context, client trust, payment readiness, and follow-up actions before applying.", icon: BriefcaseBusiness },
  { title: "Build reputation", detail: "Complete milestones, upload evidence, receive UPI-first payouts, and grow verified history.", icon: BadgeCheck },
];

const reviews: Review[] = [
  {
    company: "Savera Hospitals",
    role: "Facilities Director",
    city: "Hyderabad",
    quote: "Fire panel maintenance became much easier to audit because engineer verification and evidence uploads were visible to our compliance team.",
    score: "5.0",
  },
  {
    company: "Vector Logistics",
    role: "Operations Head",
    city: "Mumbai",
    quote: "We moved from repeated calls to a workflow where budget, site access, QA proof, and escrow status were clear from day one.",
    score: "4.9",
  },
  {
    company: "Orion Tech Park",
    role: "Admin Lead",
    city: "Bengaluru",
    quote: "The local engineer match quality was strong, but the bigger win was trust: verified profiles, documents, and milestone release control.",
    score: "4.9",
  },
];

const complianceItems = [
  "Engineer KYC",
  "GST and invoice trail",
  "Work order acceptance",
  "Fire safety license review",
  "QA evidence pack",
  "UPI payout verification",
  "Milestone escrow",
  "Audit-ready documents",
];

const languagePreview = [
  { language: "Hindi", line: "Verified engineer chahiye? City, budget, aur urgency ke saath job post karein." },
  { language: "Marathi", line: "Site survey, payment, ani engineer follow-up ekach workflow madhye." },
  { language: "Tamil", line: "CCTV, fire safety, access control work-ku verified engineer match." },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 42;
    const interval = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setDisplayValue(Math.round(value * progress));
      if (frame >= totalFrames) window.clearInterval(interval);
    }, 26);

    return () => window.clearInterval(interval);
  }, [value]);

  return (
    <>
      {displayValue.toLocaleString("en-IN")}
      {suffix}
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function LiveStatsHub() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo<LiveStat[]>(
    () => [
      { label: "Live jobs", value: 142 + (tick % 6), delta: "+11 today", icon: BriefcaseBusiness, gradient: "from-indigo-500 to-violet-600" },
      { label: "Engineers online", value: 384 + (tick % 9), delta: "+26 active", icon: UsersRound, gradient: "from-sky-500 to-blue-600" },
      { label: "Escrow guarded", value: 84 + (tick % 4), suffix: "L", delta: "UPI-ready", icon: WalletCards, gradient: "from-emerald-500 to-teal-600" },
    ],
    [tick],
  );

  const city = ["Delhi NCR", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Chennai"][tick % 6];

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="relative overflow-hidden rounded-lg border border-white/35 bg-white/76 p-4 text-foreground shadow-floating backdrop-blur-2xl"
      aria-label="Floating live stats hub"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(99,91,255,0.18),transparent_12rem),radial-gradient(circle_at_100%_30%,rgba(14,165,233,0.14),transparent_12rem)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            National live market
          </p>
          <h3 className="mt-2 text-lg font-black text-foreground">{city} demand rising</h3>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-white shadow-md">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-md border border-white/70 bg-white/70 p-3 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br text-white shadow-sm", stat.gradient)}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-[10px] font-black text-success">{stat.delta}</span>
              </div>
              <p className="mt-3 font-mono text-2xl font-black tracking-tight text-foreground">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[10px] font-black uppercase text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>
      <div className="relative mt-3 rounded-md border border-slate-900/10 bg-slate-950 p-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-300">
            <Banknote className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            Payment confidence
          </span>
          <span className="font-mono text-sm font-black text-emerald-300">98.4%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            key={tick}
            initial={{ width: "54%" }}
            animate={{ width: `${70 + (tick % 5) * 5}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 shadow-[0_0_22px_rgba(56,189,248,0.55)]"
          />
        </div>
      </div>
    </motion.aside>
  );
}

function BusinessSpotlightWidget() {
  const [index, setIndex] = useState(0);
  const active = spotlights[index];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % spotlights.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  const goPrevious = () => setIndex((current) => (current === 0 ? spotlights.length - 1 : current - 1));
  const goNext = () => setIndex((current) => (current + 1) % spotlights.length);

  return (
    <aside className="overflow-hidden rounded-lg border border-white/35 bg-white/78 text-foreground shadow-floating backdrop-blur-2xl" aria-label="Rotating business spotlight widget">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-gradient-to-r from-primary-subtle via-white to-sky-50 px-4 py-3">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Business spotlight
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrevious}
            className="grid h-8 w-8 place-items-center rounded-md border border-border-subtle bg-white/70 text-muted-foreground transition hover:border-primary/30 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
            aria-label="Previous business spotlight"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="grid h-8 w-8 place-items-center rounded-md border border-border-subtle bg-white/70 text-muted-foreground transition hover:border-primary/30 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
            aria-label="Next business spotlight"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.company}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24 }}
          className="p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-foreground">{active.company}</h3>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {active.location} - {active.scope}
              </p>
            </div>
            <div className="flex text-amber-500" aria-label="Five star review">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-foreground">&quot;{active.quote}&quot;</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
              <p className="text-[11px] font-black uppercase">Outcome</p>
              <p className="mt-1 text-sm font-black">{active.outcome}</p>
            </div>
            <div className="rounded-md border border-primary/20 bg-primary-subtle p-3 text-primary">
              <p className="text-[11px] font-black uppercase">Signal</p>
              <p className="mt-1 text-sm font-black">{active.metric}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-1">
            {spotlights.map((item, itemIndex) => (
              <button
                type="button"
                key={item.company}
                onClick={() => setIndex(itemIndex)}
                className={cn("h-1.5 rounded-full transition-all", itemIndex === index ? "w-8 bg-primary" : "w-3 bg-primary/20")}
                aria-label={`Show spotlight for ${item.company}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

function TrustBar() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Marketplace trust bar">
      {trustBar.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-md border border-white/45 bg-white/78 px-4 py-3 shadow-md shadow-indigo-950/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary-subtle text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-xl font-black text-foreground">{item.value}</p>
                <p className="text-xs font-black text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeroSection({ onPostJob }: { onPostJob: () => void }) {
  return (
    <section className="relative isolate min-h-[820px] overflow-hidden border-b border-border-subtle">
      <Image
        src={heroImage}
        alt="National network operations room monitoring secure ELV infrastructure"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_42%,rgba(255,255,255,0.42)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(99,91,255,0.28),transparent_30rem),radial-gradient(circle_at_78%_20%,rgba(14,165,233,0.16),transparent_24rem),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(248,249,255,0.88))]" />
      <div className="relative mx-auto flex min-h-[820px] max-w-[1500px] flex-col justify-between px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/78 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            National ELV execution marketplace
          </div>
          <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[0.98] tracking-tight text-foreground md:text-7xl">
            Hire trusted ELV teams or find verified work across India.
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-muted-foreground">
            ELV Connect brings CCTV, fire safety, access control, and data networking work into one trust-first marketplace with city context, verified engineers, milestone proof, and secure UPI-ready payments.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onPostJob}
              className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-6 py-4 text-base font-black text-on-primary shadow-glow transition hover:-translate-y-1 hover:shadow-floating active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Post a Job
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
            <Link
              href="/jobs"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md border border-border-subtle bg-white/82 px-6 py-4 text-base font-black text-foreground shadow-md backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary/35 hover:text-primary hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
            >
              <BriefcaseBusiness className="h-4 w-4 text-primary" aria-hidden="true" />
              Find Work
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-end">
          <TrustBar />
          <div className="grid gap-4">
            <LiveStatsHub />
            <BusinessSpotlightWidget />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCategoriesSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeader
          eyebrow="Service categories"
          title="Four ELV workstreams, one national execution layer."
          description="Every category carries location context, scope detail, trust signals, and payment visibility so clients and engineers can move without guesswork."
          action={
            <Link href="/services" className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-black text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary-subtle">
              View services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.title} href={category.href} className="group rounded-lg border border-border-subtle bg-white/78 p-5 shadow-card backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-primary-subtle text-primary ring-1 ring-primary/10 transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">{category.proof}</span>
                </div>
                <h3 className="mt-5 text-lg font-black text-foreground">{category.title}</h3>
                <p className="mt-2 min-h-[96px] text-sm leading-6 text-muted-foreground">{category.description}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-muted-foreground">National demand</span>
                    <span className="text-primary">{category.demand}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div className={cn("h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400", progressWidthClass(category.demand))} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LiveActivitySection() {
  const scrollingItems = [...activityItems, ...activityItems];
  const toneClass = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
  } satisfies Record<ActivityItem["tone"], string>;

  return (
    <section className="border-y border-border-subtle bg-white/72 px-4 py-16 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="Live activity"
            title="A national marketplace pulse, not a static directory."
            description="Demand, verification, site survey movement, escrow readiness, and engineer response activity stay visible across major city clusters."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["2.8k", "site visits coordinated"],
              ["96%", "verified completion packs"],
              ["18 min", "median engineer response"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md border border-border-subtle bg-surface p-4 shadow-sm">
                <p className="font-mono text-2xl font-black text-foreground">{value}</p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[360px] overflow-hidden rounded-lg border border-border-subtle bg-slate-950 p-4 text-white shadow-floating">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-slate-950 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
          <div className="animate-scroll-up space-y-3">
            {scrollingItems.map((item, index) => (
              <article key={`${item.title}-${index}`} className="rounded-md border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
                    <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-70", toneClass[item.tone])} />
                    <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", toneClass[item.tone])} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white">{item.title}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-200">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.city}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">{item.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CityJobsAndEngineersSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div>
          <SectionHeader
            eyebrow="Location-first discovery"
            title="Nearby jobs by city, area, payout, and trust."
            description="Clients see regional supply and engineers see nearby work with enough context to decide fast."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {cityJobs.map((job) => (
              <article key={`${job.city}-${job.area}`} className="rounded-lg border border-border-subtle bg-white/78 p-4 shadow-card backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-primary">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {job.city}
                    </p>
                    <h3 className="mt-2 text-base font-black text-foreground">{job.category}</h3>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">{job.area}</p>
                  </div>
                  <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-black", job.urgency === "Emergency" ? "border-red-200 bg-red-50 text-red-700" : job.urgency === "Urgent" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-slate-100 text-slate-700")}>
                    {job.urgency}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-border-subtle bg-surface p-2">
                    <p className="text-[11px] font-black text-muted-foreground">Budget</p>
                    <p className="mt-1 text-sm font-black text-foreground">{job.budget}</p>
                  </div>
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
                    <p className="text-[11px] font-black text-emerald-700">Payout</p>
                    <p className="mt-1 text-sm font-black text-emerald-800">{job.payout}</p>
                  </div>
                  <div className="rounded-md border border-primary/20 bg-primary-subtle p-2">
                    <p className="text-[11px] font-black text-primary">Trust</p>
                    <p className="mt-1 text-sm font-black text-primary">{job.trust}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader
            eyebrow="Engineer discovery"
            title="Verified specialists ready for real site execution."
            description="Preview engineers by city, category fit, trust score, response speed, and completed work."
          />
          <div className="grid gap-3">
            {engineers.map((engineer) => (
              <article key={engineer.name} className="rounded-lg border border-border-subtle bg-white/78 p-4 shadow-card backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-black text-on-primary shadow-md">
                    {engineer.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-foreground">{engineer.name}</h3>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700">Trust {engineer.trust}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">{engineer.category}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {engineer.area}, {engineer.city}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border-subtle bg-surface p-2">
                    <p className="font-bold text-muted-foreground">Completed</p>
                    <p className="mt-1 font-black text-foreground">{engineer.jobs} jobs</p>
                  </div>
                  <div className="rounded-md border border-border-subtle bg-surface p-2">
                    <p className="font-bold text-muted-foreground">Response</p>
                    <p className="mt-1 font-black text-foreground">{engineer.response}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Link href="/engineers" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-4 py-3 text-sm font-black text-on-primary shadow-glow transition hover:-translate-y-0.5">
            Discover engineers
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CredibilitySection() {
  return (
    <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeader
          eyebrow="Client trust"
          title="Built for facilities, operations, compliance, and finance teams."
          description="ELV Connect keeps proof, profile quality, work orders, payout state, and site follow-up visible from first request to final handover."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Verified supply", detail: "KYC, category fit, work history, and city radius visible before shortlist.", icon: ShieldCheck },
            { title: "Secure payments", detail: "Escrow-style milestones and UPI-first payouts make release timing explicit.", icon: CreditCard },
            { title: "Operational audit", detail: "Evidence packs, QA checklists, and documents stay attached to the job.", icon: FileCheck2 },
            { title: "Fast follow-up", detail: "Clients and engineers see next action, due date, city, and site context.", icon: BellRing },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.05] p-5 shadow-lg backdrop-blur-xl">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-white/10 text-indigo-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const renderSteps = (steps: ProcessStep[], label: string) => (
    <div className="rounded-lg border border-border-subtle bg-white/78 p-5 shadow-card backdrop-blur-xl">
      <h3 className="text-xl font-black text-foreground">{label}</h3>
      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className="rounded-md border border-border-subtle bg-surface p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase text-muted-foreground">Step {index + 1}</p>
                  <h4 className="mt-1 text-sm font-black text-foreground">{step.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeader
          eyebrow="How it works"
          title="Two journeys, one marketplace operating model."
          description="Clients get accountable execution. Engineers get trusted demand, payout visibility, and a reputation loop."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {renderSteps(clientSteps, "For clients")}
          {renderSteps(engineerSteps, "For engineers")}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section className="border-y border-border-subtle bg-white/72 px-4 py-16 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeader
          eyebrow="Reviews and reputation"
          title="Reputation is earned through verified delivery, not directory placement."
          description="Reviews connect business outcomes to city, category, engineer quality, and evidence-backed handover."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.company} className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div className="flex text-amber-500" aria-label={`${review.score} star review`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <span className="font-mono text-sm font-black text-foreground">{review.score}</span>
              </div>
              <p className="mt-5 text-sm font-semibold leading-7 text-foreground">&quot;{review.quote}&quot;</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border-subtle pt-4">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-primary text-xs font-black text-on-primary">{review.company.slice(0, 2).toUpperCase()}</span>
                <div>
                  <p className="text-sm font-black text-foreground">{review.company}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {review.role} - {review.city}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MultilingualContactSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="rounded-lg border border-border-subtle bg-white/78 p-6 shadow-card backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Multilingual preview</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Regional teams can move faster in familiar language.</h2>
            </div>
            <Languages className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-6 grid gap-3">
            {languagePreview.map((item) => (
              <article key={item.language} className="rounded-md border border-border-subtle bg-surface p-4 shadow-sm">
                <p className="text-xs font-black uppercase text-primary">{item.language}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{item.line}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary-subtle via-white to-sky-50 p-6 shadow-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Fast follow-up</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Need an engineer, survey, or callback today?</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Route urgent ELV requirements to the right city cluster with contact-ready actions for clients and verified engineers.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Call back", detail: "15 min response", icon: PhoneCall },
              { label: "Message", detail: "Scope clarification", icon: MessageCircle },
              { label: "Survey", detail: "City visit queue", icon: MapPin },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.label}
                  className="rounded-md border border-border-subtle bg-white/78 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-sm font-black text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.detail}</p>
                </button>
              );
            })}
          </div>
          <Link href="/post-requirement" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-5 py-2 text-sm font-black text-on-primary shadow-glow transition hover:-translate-y-0.5">
            Start follow-up
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ComplianceSection() {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] rounded-lg border border-border-subtle bg-white/78 p-6 shadow-card backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Compliance layer</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Trust and compliance cues are built into the marketplace flow.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              ELV jobs need site access, safety checks, audit evidence, payment clarity, and accountability. The platform keeps these signals visible across discovery, execution, and handover.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {complianceItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface p-3 shadow-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span className="text-sm font-black text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBanner({ onPostJob }: { onPostJob: () => void }) {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-elv-indigo via-elv-violet to-elv-purple p-6 text-white shadow-glow md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-indigo-100">
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              National ELV marketplace
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Post trusted work or start finding verified ELV jobs today.</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/72">
              One marketplace for site surveys, verified engineers, milestone evidence, work orders, payments, and reputation.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onPostJob}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-black text-elv-indigo shadow-md transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              Post a Job
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link href="/jobs" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/16 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30">
              Find Work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PremiumLanding() {
  const router = useRouter();

  const postRequirement = () => {
    markDashboardNavigationIntent();
    router.push("/post-requirement");
  };

  return (
    <main className="premium-shell text-foreground">
      <HeroSection onPostJob={postRequirement} />
      <ServiceCategoriesSection />
      <LiveActivitySection />
      <CityJobsAndEngineersSection />
      <CredibilitySection />
      <HowItWorksSection />
      <ReviewsSection />
      <MultilingualContactSection />
      <ComplianceSection />
      <CtaBanner onPostJob={postRequirement} />
    </main>
  );
}
