"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Timer,
  Users,
} from "lucide-react";
import { DataCard, StatusPill, WorkspaceShell } from "@/components/ELVConnect/WorkspaceShell";
import { useExperiencePreferences } from "@/hooks/useExperiencePreferences";
import { useQuery } from "@/hooks/useQuery";
import { appendLocationSearchParams, locationMatchesPlace } from "@/lib/experience-preferences";
import { vendors as demoVendors } from "@/lib/elv-demo-data";
import type { Job, LocationMatchResponse, User } from "@/types";

type SortKey = "rating" | "distance" | "responseTime";

type MatchVendorCard = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  response: string;
  responseMinutes: number;
  radius: string;
  distance: number;
  projectCount: number;
  certifications: string[];
  source: "live" | "demo";
};

const categories = ["All", "CCTV", "Fire", "Networking", "Access Control", "BMS"];
const certificationFilters = ["All", "ISO 9001", "Hikvision", "NBC Compliance", "Cisco", "HID", "BACnet"];

const categoryLabels: Record<string, string> = {
  cctv: "CCTV",
  fire_alarm: "Fire",
  access_control: "Access Control",
  structured_cabling: "Networking",
  bms: "BMS",
  pa_system: "PA System",
  intercom: "Intercom",
  gate_automation: "Gate Automation",
  av_integration: "AV",
  other: "ELV",
};

function getMatchUrl(category: string, location: ReturnType<typeof useExperiencePreferences>["location"]) {
  const params = new URLSearchParams({ limit: "12" });

  if (category !== "All") {
    params.set("category", category);
  }

  return appendLocationSearchParams(`/matches/location?${params.toString()}`, location);
}

function toLiveVendorCard(user: User): MatchVendorCard {
  const serviceProvider = user.serviceProvider;
  const primaryCategory = serviceProvider?.specializations?.[0] || "other";
  const serviceRadius = serviceProvider?.serviceRadius || 25;

  return {
    id: user._id,
    name: user.profile.companyName || user.profile.fullName,
    category: categoryLabels[primaryCategory] || primaryCategory.replace(/_/g, " "),
    city: serviceProvider?.serviceArea?.city || "Matched location",
    rating: serviceProvider?.averageRating || 4.6,
    response: "Live profile",
    responseMinutes: 30,
    radius: `${serviceRadius} km`,
    distance: serviceRadius,
    projectCount: serviceProvider?.totalJobsCompleted || 0,
    certifications: serviceProvider?.certifications?.length ? serviceProvider.certifications : ["Verified ELV profile"],
    source: "live",
  };
}

function toDemoVendorCard(vendor: (typeof demoVendors)[number]): MatchVendorCard {
  return {
    ...vendor,
    source: "demo",
  };
}

function getCustomerName(customer: User) {
  return customer.profile.companyName || customer.profile.fullName || "Verified customer";
}

function getJobBudget(job: Job) {
  if (job.budget.type === "get_quotes") {
    return "Get quotes";
  }

  const currency = job.budget.currency || "INR";
  if (job.budget.min && job.budget.max) {
    return `${currency} ${job.budget.min.toLocaleString()} - ${job.budget.max.toLocaleString()}`;
  }

  if (job.budget.min) {
    return `${currency} ${job.budget.min.toLocaleString()}`;
  }

  return "Budget shared after survey";
}

export default function MatchesPage() {
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [category, setCategory] = useState("All");
  const [certification, setCertification] = useState("All");
  const [maxDistance, setMaxDistance] = useState("All");
  const [query, setQuery] = useState("");
  const { location } = useExperiencePreferences();

  const matchUrl = useMemo(() => getMatchUrl(category, location), [category, location]);
  const { data: rawMatchData, loading } = useQuery<LocationMatchResponse>(matchUrl, {
    retry: false,
    showErrorToast: false,
  });
  const matchData = rawMatchData && !Array.isArray(rawMatchData) ? rawMatchData : null;

  const liveVendorCards = useMemo(
    () => (matchData?.vendors || matchData?.engineers || []).map(toLiveVendorCard),
    [matchData],
  );

  const demoVendorCards = useMemo(
    () =>
      demoVendors
        .filter((vendor) => locationMatchesPlace(vendor.city, location.name))
        .map(toDemoVendorCard),
    [location.name],
  );

  const vendorCards = liveVendorCards.length ? liveVendorCards : demoVendorCards;
  const filteredVendors = useMemo(() => {
    return vendorCards
      .filter((vendor) => category === "All" || vendor.category === category)
      .filter((vendor) => certification === "All" || vendor.certifications.includes(certification))
      .filter((vendor) => maxDistance === "All" || vendor.distance <= Number(maxDistance))
      .filter((vendor) => {
        const searchText = `${vendor.name} ${vendor.category} ${vendor.city} ${vendor.certifications.join(" ")}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === "distance") return a.distance - b.distance;
        if (sortBy === "responseTime") return a.responseMinutes - b.responseMinutes;
        return b.rating - a.rating;
      })
      .slice(0, 6);
  }, [category, certification, maxDistance, query, sortBy, vendorCards]);

  const jobs = matchData?.jobs || [];
  const customers = matchData?.customers || matchData?.clients || [];
  const topRating = filteredVendors.length ? Math.max(...filteredVendors.map((vendor) => vendor.rating)).toFixed(1) : "0.0";
  const locationLabel = matchData?.location.name || location.name;

  return (
    <WorkspaceShell
      title="Matched Vendors"
      subtitle={`Same-location matching for vendors, engineers, jobs, clients, and customers in ${locationLabel}.`}
      actions={<Link href="/post-requirement" className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-on-primary">New Requirement</Link>}
    >
      <section className="grid gap-3 md:grid-cols-4">
        <DataCard title="Vendors" value={String(matchData?.counts.vendors ?? filteredVendors.length)} caption="Same-location supply" icon={ShieldCheck} />
        <DataCard title="Engineers" value={String(matchData?.counts.engineers ?? filteredVendors.length)} caption="Verified profiles" icon={Users} />
        <DataCard title="Jobs" value={String(matchData?.counts.jobs ?? jobs.length)} caption="Client demand" icon={Briefcase} />
        <DataCard title="Top Rating" value={topRating} caption={loading ? "Loading matches" : "Best match score"} icon={Star} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_340px]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Filters</h2>
          </div>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-slate-600">Search vendor</span>
              <span className="mt-1 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Company, city, cert..."
                  className="w-full bg-transparent text-xs outline-none"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-600">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="rating">Rating</option>
                <option value="distance">Service radius</option>
                <option value="responseTime">Response time</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-600">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-600">Certification</span>
              <select
                value={certification}
                onChange={(event) => setCertification(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
              >
                {certificationFilters.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-slate-600">Max radius</span>
              <select
                value={maxDistance}
                onChange={(event) => setMaxDistance(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="All">All radiuses</option>
                <option value="10">Within 10 km</option>
                <option value="15">Within 15 km</option>
                <option value="25">Within 25 km</option>
                <option value="100">Within 100 km</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setCertification("All");
                setMaxDistance("All");
                setQuery("");
                setSortBy("rating");
              }}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-primary/40 hover:text-primary"
            >
              Reset filters
            </button>
          </div>
        </aside>

        <div className="grid gap-3">
          {filteredVendors.map((vendor, index) => (
            <article key={`${vendor.source}-${vendor.id}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Rank #{index + 1}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">{vendor.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary-container/10 px-2 py-1 font-bold text-primary">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {vendor.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {vendor.city}
                    </span>
                    <StatusPill status="approved" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-bold text-slate-950">{vendor.rating.toFixed(1)}</p>
                    <p className="text-slate-500">Rating</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-bold text-slate-950">{vendor.radius}</p>
                    <p className="text-slate-500">Radius</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-bold text-slate-950">{vendor.response}</p>
                    <p className="text-slate-500">Response</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-bold text-slate-950">{vendor.projectCount}</p>
                    <p className="text-slate-500">Projects</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {vendor.certifications.map((certificationItem) => (
                  <span
                    key={certificationItem}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600"
                  >
                    {certificationItem}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={vendor.source === "live" ? `/engineers/${vendor.id}` : `/vendor/${vendor.id}`}
                  className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary-container"
                >
                  View Profile
                </Link>
                <Link
                  href={`/project/project-factory-cctv?bookVisit=${vendor.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-white px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary-container/10"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Book Site Visit
                </Link>
              </div>
            </article>
          ))}

          {filteredVendors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-bold text-slate-950">No vendors match this location</p>
              <p className="mt-1 text-xs text-slate-500">Try All India, a larger GPS radius, or a broader category.</p>
            </div>
          ) : null}
        </div>

        <aside className="grid content-start gap-3">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Client jobs in {locationLabel}</h2>
            </div>
            <div className="mt-3 grid gap-2">
              {jobs.slice(0, 4).map((job) => (
                <Link key={job._id} href={`/jobs/${job._id}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:border-primary/30 hover:bg-primary-subtle">
                  <p className="text-sm font-bold text-slate-950">{job.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {job.location.city}
                  </p>
                  <p className="mt-2 text-xs font-bold text-primary">{getJobBudget(job)}</p>
                </Link>
              ))}
              {!jobs.length ? <p className="rounded-md border border-dashed border-slate-200 p-4 text-xs font-semibold text-slate-500">No live client jobs found for this location yet.</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Clients and customers</h2>
            </div>
            <div className="mt-3 grid gap-2">
              {customers.slice(0, 4).map((customer) => (
                <article key={customer._id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-950">{getCustomerName(customer)}</p>
                  <p className="mt-1 text-xs text-slate-500">{customer.profile.fullName}</p>
                </article>
              ))}
              {!customers.length ? <p className="rounded-md border border-dashed border-slate-200 p-4 text-xs font-semibold text-slate-500">Customer list appears when same-location jobs exist.</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-primary/15 bg-primary-container/10 p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-slate-950">Matching mode</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              {matchData?.signals.sameRadiusOnly
                ? `GPS radius matching within ${matchData.location.radiusKm} km.`
                : matchData?.signals.sameCityOnly
                  ? "City and NCR cluster matching is active."
                  : "All India marketplace matching is active."}
            </p>
          </section>
        </aside>
      </section>
    </WorkspaceShell>
  );
}
