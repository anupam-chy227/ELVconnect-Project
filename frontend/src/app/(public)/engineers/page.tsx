"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  Star,
  UserCheck,
} from "lucide-react";
import { useQuery } from "@/hooks/useQuery";
import { useExperiencePreferences } from "@/hooks/useExperiencePreferences";
import { ELVCategory, PaginatedResponse, User } from "@/types";
import { EngineerCard } from "@/components/Engineers/EngineerCard";

const specializations = [
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

const recentEngineers = [
  { name: "Aarav Fire Systems", city: "Delhi NCR", spec: "Fire Safety", rating: "4.9", jobs: 38 },
  { name: "VisionGrid CCTV Team", city: "Mumbai", spec: "CCTV Systems", rating: "4.8", jobs: 52 },
  { name: "EntryPoint Automation", city: "Bengaluru", spec: "Access Control", rating: "4.7", jobs: 31 },
  { name: "FiberLink Networks", city: "Hyderabad", spec: "Networking", rating: "4.8", jobs: 44 },
];

const hireCompanies = [
  { name: "Honeywell Fire & Security", focus: "Fire panels, detectors, access integrations" },
  { name: "CP Plus Surveillance", focus: "IP cameras, NVR storage, remote monitoring" },
  { name: "HID / Suprema Access", focus: "RFID, biometric readers, credential workflows" },
  { name: "Cisco / Aruba Networks", focus: "PoE switching, Wi-Fi, structured network readiness" },
];

const hireFormFields = ["Project location", "Required category", "Site type", "Expected timeline"];

function isElvCategory(value: string): value is ELVCategory {
  return specializations.includes(value);
}

export default function EngineersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.location.search ? new URLSearchParams(window.location.search).get("specialization") || "" : "";
  });
  const { location } = useExperiencePreferences();

  const locationParams =
    location.name === "All India"
      ? ""
      : location.name === "Current Location" && location.lat && location.lng
        ? `?lat=${location.lat}&lng=${location.lng}&radius=100`
        : `?city=${encodeURIComponent(location.name)}`;

  const { data, loading } = useQuery<PaginatedResponse<User>>(
    `/users/engineers?${selectedSpecialization ? `specialization=${selectedSpecialization}` : ""}${locationParams.replace("?", selectedSpecialization ? "&" : "")}`,
    { enabled: true, retry: false, showErrorToast: false }
  );

  const engineers = data?.data || [];
  const filteredEngineers = engineers.filter((engineer) => {
    const matchesSearch =
      engineer.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineer.profile.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization =
      !selectedSpecialization ||
      (isElvCategory(selectedSpecialization) &&
        engineer.serviceProvider?.specializations?.includes(selectedSpecialization));
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="premium-shell min-h-screen text-foreground">
      <section className="premium-mesh border-b border-border-subtle !py-6">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <UserCheck className="h-3.5 w-3.5" />
              Hire verified talent
            </div>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
              Hire verified ELV engineers
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Browse verified service providers in {location.name}, compare trust signals, and submit a structured hiring brief.
            </p>

            <div className="mt-4 grid gap-2 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or company..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface py-2 pl-9 pr-3 text-xs shadow-sm focus:border-primary focus:outline-none focus:shadow-focus"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <select
                  value={selectedSpecialization}
                  onChange={(event) => setSelectedSpecialization(event.target.value)}
                  className="flex-1 rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-sm focus:border-primary focus:outline-none focus:shadow-focus"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="premium-glass rounded-md p-4">
            <h2 className="text-sm font-bold">Small hiring brief</h2>
            <p className="mt-1 text-xs text-muted-foreground">Quick client brief for city, category, site, and timeline.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {hireFormFields.map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  className="rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-sm outline-none focus:border-primary"
                />
              ))}
            </div>
            <textarea
              placeholder="Scope notes: devices, floors, preferred brands..."
              className="mt-2 h-16 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs shadow-sm outline-none focus:border-primary"
            />
            <button className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-b from-primary to-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-sm">
              <Send className="h-3.5 w-3.5" />
              Submit hire request
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-5">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Live recent engineers</h2>
                <p className="text-xs text-muted-foreground">Verified profile highlights while live API results load.</p>
              </div>
              <Link href="/register" className="text-xs font-bold text-primary">Join</Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {recentEngineers.map((engineer) => (
                <article key={engineer.name} className="rounded-md border border-border-subtle bg-surface-muted p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-container text-xs font-bold text-on-primary">
                      {engineer.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-sm font-bold">{engineer.name}</h3>
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {engineer.city} - {engineer.spec}
                      </p>
                      <div className="mt-2 flex gap-2 text-[11px] font-semibold text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {engineer.rating}
                        </span>
                        <span>{engineer.jobs} jobs</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
            <h2 className="text-base font-bold">Product companies and hiring focus</h2>
            <p className="mt-1 text-xs text-muted-foreground">Common ELV brands clients ask specialists to support.</p>
            <div className="mt-3 space-y-2">
              {hireCompanies.map((company) => (
                <div key={company.name} className="rounded-md border border-border-subtle bg-surface-muted p-3">
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {company.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{company.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-md border border-border-subtle bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Engineer marketplace</h2>
              <p className="text-xs text-muted-foreground">Live API results appear here; dummy profiles keep the page useful when empty.</p>
            </div>
            <span className="rounded-full bg-primary-container/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {filteredEngineers.length || recentEngineers.length} visible
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-200 border-r-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground">Loading engineers...</p>
              </div>
            </div>
          ) : filteredEngineers.length === 0 ? (
            <div className="grid gap-3 md:grid-cols-4">
              {recentEngineers.map((engineer) => (
                <div key={`dummy-${engineer.name}`} className="rounded-md border border-border-subtle bg-surface-muted p-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="mt-2 text-sm font-bold">{engineer.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{engineer.spec} - {engineer.city}</p>
                  <button className="mt-3 w-full rounded-md bg-gradient-to-b from-primary to-primary-container px-3 py-1.5 text-xs font-bold text-on-primary">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {filteredEngineers.map((engineer) => (
                <EngineerCard key={engineer._id} engineer={engineer} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
