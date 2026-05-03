"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  BadgeCheck,
  CalendarCheck,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Timer,
} from "lucide-react";
import { DataCard, StatusPill, WorkspaceShell } from "@/components/ELVConnect/WorkspaceShell";
import { vendors } from "@/lib/elv-demo-data";

type SortKey = "rating" | "distance" | "responseTime";

const categories = ["All", "CCTV", "Fire", "Networking", "Access Control", "BMS"];
const certificationFilters = ["All", "ISO 9001", "Hikvision", "NBC Compliance", "Cisco", "HID", "BACnet"];

export default function MatchesPage() {
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [category, setCategory] = useState("All");
  const [certification, setCertification] = useState("All");
  const [maxDistance, setMaxDistance] = useState("All");
  const [query, setQuery] = useState("");

  const filteredVendors = useMemo(() => {
    return vendors
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
      .slice(0, 5);
  }, [category, certification, maxDistance, query, sortBy]);

  const bestRating = Math.max(...vendors.map((vendor) => vendor.rating)).toFixed(1);
  const fastestResponse = Math.min(...vendors.map((vendor) => vendor.responseMinutes));

  return (
    <WorkspaceShell
      title="Matched Vendors"
      subtitle="Top vendors sorted by category fit, location radius, rating, response time, and delivery performance."
      actions={<Link href="/post-requirement" className="rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary">New Requirement</Link>}
    >
      <section className="grid gap-3 md:grid-cols-3">
        <DataCard title="Top Matches" value={String(filteredVendors.length)} caption="Best vendors shown" icon={ShieldCheck} />
        <DataCard title="Best Rating" value={bestRating} caption="Verified profile score" icon={Star} />
        <DataCard title="Fastest Response" value={`${fastestResponse}m`} caption="Average first response" icon={Timer} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
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
                <option value="distance">Distance</option>
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
              <span className="text-xs font-bold text-slate-600">Max distance</span>
              <select
                value={maxDistance}
                onChange={(event) => setMaxDistance(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
              >
                <option value="All">All distances</option>
                <option value="10">Within 10 km</option>
                <option value="15">Within 15 km</option>
                <option value="25">Within 25 km</option>
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
            <article key={vendor.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                    <p className="font-bold text-slate-950">{vendor.rating}</p>
                    <p className="text-slate-500">Rating</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p className="font-bold text-slate-950">{vendor.distance} km</p>
                    <p className="text-slate-500">Distance</p>
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
                  href={`/vendor/${vendor.id}`}
                  className="rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-sm transition hover:opacity-90"
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
              <p className="text-sm font-bold text-slate-950">No vendors match these filters</p>
              <p className="mt-1 text-xs text-slate-500">Try expanding the distance, category, or certification filter.</p>
            </div>
          ) : null}
        </div>
      </section>
    </WorkspaceShell>
  );
}
