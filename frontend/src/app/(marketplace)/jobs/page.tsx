"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { JobCard } from "@/components/Jobs/JobCard";
import { PaymentTrustCard, VerificationBadge } from "@/components/ui";
import { useQuery } from "@/hooks/useQuery";
import { useExperiencePreferences } from "@/hooks/useExperiencePreferences";
import { ELVCategory, Job, PaginatedResponse } from "@/types";

const categories = [
  "cctv",
  "access_control",
  "fire_alarm",
  "structured_cabling",
  "pa_system",
  "bms",
  "intercom",
  "gate_automation",
  "av_integration",
  "other",
];

const statuses = [
  { value: "open", label: "Open Projects" },
  { value: "applications_received", label: "Receiving Applications" },
  { value: "in_progress", label: "In Progress" },
];

const recentJobs = [
  {
    title: "CCTV upgrade for warehouse",
    city: "Mumbai",
    budget: "Rs 75k - 1.4L",
    category: "CCTV",
    scope: "Replace 24 analog cameras with IP cameras, configure NVR, mobile viewing, and two days of commissioning support.",
    brands: "Hikvision, CP Plus, Dahua",
    timeline: "Site visit in 48 hours",
  },
  {
    title: "Fire alarm AMC for school",
    city: "Delhi NCR",
    budget: "Get quotes",
    category: "Fire Safety",
    scope: "Quarterly preventive maintenance for detectors, hooters, MCPs, panel health checks, and compliance report.",
    brands: "Honeywell, Bosch, Notifier",
    timeline: "Start this week",
  },
  {
    title: "Biometric access for office",
    city: "Bengaluru",
    budget: "Rs 45k - 90k",
    category: "Access",
    scope: "Install biometric readers for two doors, configure attendance exports, user groups, and admin handover.",
    brands: "HID, Matrix, Suprema, ZKTeco",
    timeline: "Weekend deployment",
  },
  {
    title: "Cat6A cabling and rack dressing",
    city: "Pune",
    budget: "Rs 1.2L",
    category: "Networking",
    scope: "Pull 70 Cat6A points, certify links, label patch panels, rack dressing, and submit test report.",
    brands: "CommScope, D-Link, Cisco, Aruba",
    timeline: "5 working days",
  },
];

const productCompanies = [
  { name: "Hikvision / Dahua / CP Plus", focus: "Camera, NVR, VMS and analytics work" },
  { name: "Honeywell / Notifier / Bosch", focus: "Fire alarm, detector and panel projects" },
  { name: "HID / Matrix / ZKTeco", focus: "Reader, biometric and access workflows" },
  { name: "Cisco / Aruba / CommScope", focus: "Switching, Wi-Fi, rack and fiber jobs" },
];

const jobFormFields = ["Job title", "City / site", "Category", "Budget range"];

function isElvCategory(value: string): value is ELVCategory {
  return categories.includes(value);
}

function BriefField({ label }: { label: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-black uppercase text-muted-foreground">{label}</span>
      <input
        aria-label={label}
        className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs font-semibold shadow-sm outline-none focus:border-primary focus:shadow-focus"
      />
    </label>
  );
}

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.location.search ? new URLSearchParams(window.location.search).get("category") || "" : "";
  });
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedDummyJob, setSelectedDummyJob] = useState(recentJobs[0]);
  const { location } = useExperiencePreferences();

  const locationParams =
    location.name === "All India"
      ? ""
      : location.name === "Current Location" && location.lat && location.lng
        ? `&lat=${location.lat}&lng=${location.lng}&radius=100`
        : `&city=${encodeURIComponent(location.name)}`;

  const { data, loading } = useQuery<PaginatedResponse<Job>>(
    `/jobs?status=${statusFilter}${selectedCategory ? `&category=${selectedCategory}` : ""}${locationParams}`,
    { enabled: !!statusFilter, retry: false, showErrorToast: false }
  );

  const jobs = data?.data || [];
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || (isElvCategory(selectedCategory) && job.category.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="premium-shell min-h-screen text-foreground">
      <section className="premium-mesh border-b border-border-subtle !py-6">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <Briefcase className="h-3.5 w-3.5" />
              Location-first work marketplace
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
              Find premium ELV work near you
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Browse verified jobs in {location.name}, compare budgets, and respond to secure UPI-ready client requirements.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <VerificationBadge level="verified" label="Verified clients" />
              <VerificationBadge level="escrow" label="UPI-first payouts" />
              <VerificationBadge level="kyc" label={`${location.name} priority`} />
            </div>

            <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_170px_170px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  aria-label="Search jobs by title"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface py-2 pl-9 pr-3 text-xs shadow-sm focus:border-primary focus:outline-none focus:shadow-focus"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-sm focus:border-primary focus:outline-none focus:shadow-focus"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-sm focus:border-primary focus:outline-none focus:shadow-focus"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="premium-glass rounded-md p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">Structured job brief</h2>
                <p className="mt-1 text-xs text-muted-foreground">Create a project brief with site, budget, and category context.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {jobFormFields.map((field) => (
                <BriefField key={field} label={field} />
              ))}
            </div>
            <label className="mt-2 grid gap-1.5">
              <span className="text-[11px] font-black uppercase text-muted-foreground">Scope details</span>
            <textarea
              aria-label="Scope details"
              className="mt-2 h-16 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-sm outline-none focus:border-primary"
            />
            </label>
            <Link
              href="/dashboard/jobs/create"
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-b from-primary to-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Post detailed job
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-5">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Live recent job postings</h2>
                <p className="text-xs text-muted-foreground">Recent work feed for marketplace density.</p>
              </div>
              <Link href="/dashboard/jobs/create" className="text-xs font-bold text-primary">Post job</Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {recentJobs.map((job) => (
                <button
                  key={job.title}
                  type="button"
                  onClick={() => setSelectedDummyJob(job)}
                  className={`rounded-md border p-3 text-left transition ${
                    selectedDummyJob.title === job.title
                      ? "border-primary bg-primary-subtle"
                      : "border-border-subtle bg-surface-muted hover:border-primary/40"
                  }`}
                >
                  <h3 className="text-sm font-bold">{job.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {job.city} - {job.category}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span>{job.budget}</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      New
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
            <h2 className="text-base font-bold">Product companies in demand</h2>
            <p className="mt-1 text-xs text-slate-500">Brands and products clients often mention in job briefs.</p>
            <div className="mt-3 space-y-2">
              {productCompanies.map((company) => (
                <div key={company.name} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {company.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{company.focus}</p>
                </div>
              ))}
            </div>
            <PaymentTrustCard className="mt-4" amount="UPI protected" method="upi" status="Quote responses show payment readiness before dispatch." />
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]" id="available-work">
          <div className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
            <h2 className="text-base font-bold">Selected work details</h2>
            <p className="mt-1 text-xs text-slate-500">Click any recent job to view scope, brands, and quote form.</p>
            <div className="mt-3 rounded-md border border-primary/20 bg-primary-container/10 p-3">
              <h3 className="text-sm font-bold">{selectedDummyJob.title}</h3>
              <p className="mt-1 text-xs text-slate-600">
                {selectedDummyJob.city} - {selectedDummyJob.category} - {selectedDummyJob.budget}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-700">{selectedDummyJob.scope}</p>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-md bg-white p-2">
                  <span className="font-bold">Preferred brands</span>
                  <p className="mt-1 text-slate-600">{selectedDummyJob.brands}</p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <span className="font-bold">Timeline</span>
                  <p className="mt-1 text-slate-600">{selectedDummyJob.timeline}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-bold">Quick quote form</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {["Your name / company", "Expected quote", "Available visit date", "Phone / WhatsApp"].map((label) => (
                  <label key={label} className="grid gap-1">
                    <span className="text-[11px] font-black text-slate-600">{label}</span>
                    <input aria-label={label} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary" />
                  </label>
                ))}
              </div>
              <label className="mt-2 grid gap-1">
                <span className="text-[11px] font-black text-slate-600">Proposal, tools, team size, warranty</span>
                <textarea aria-label="Proposal, tools, team size, warranty" className="h-14 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary" />
              </label>
              <button className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Save quote draft
              </button>
            </div>
          </div>

          <div className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Available work</h2>
              <p className="text-xs text-slate-500">Live API jobs appear here; dummy postings show when the marketplace is empty.</p>
            </div>
            <span className="rounded-full bg-primary-container/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {filteredJobs.length || recentJobs.length} visible
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-200 border-r-purple-600" />
                </div>
                <p className="text-xs text-gray-600">Loading jobs...</p>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {recentJobs.map((job) => (
                <div key={`dummy-${job.title}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h3 className="mt-2 text-sm font-bold">{job.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{job.city} - {job.budget}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedDummyJob(job)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-primary-container px-3 py-1.5 text-xs font-bold text-on-primary"
                  >
                    View / quote
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} showStatus={false} />
              ))}
            </div>
          )}
          </div>
        </section>
      </main>
    </div>
  );
}
