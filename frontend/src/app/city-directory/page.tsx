"use client";

import Link from "next/link";
import { MapPin, Search, ShieldCheck, Wrench } from "lucide-react";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import PublicImageSlider from "@/components/PublicImageSlider";

const cityGroups = [
  {
    region: "North India",
    cities: ["Delhi NCR", "Gurugram", "Noida", "Jaipur", "Lucknow", "Chandigarh"],
    strengths: ["Access control", "CCTV AMC", "Fire safety audit"],
  },
  {
    region: "West India",
    cities: ["Mumbai", "Pune", "Ahmedabad", "Vadodara", "Surat", "Nashik"],
    strengths: ["Networking", "Warehousing CCTV", "Industrial fire systems"],
  },
  {
    region: "South India",
    cities: ["Bengaluru", "Hyderabad", "Chennai", "Kochi", "Coimbatore", "Mysuru"],
    strengths: ["Data cabling", "Biometric access", "Campus surveillance"],
  },
  {
    region: "East India",
    cities: ["Kolkata", "Bhubaneswar", "Patna", "Ranchi", "Guwahati", "Siliguri"],
    strengths: ["Branch rollouts", "Retail CCTV", "Maintenance teams"],
  },
];

const projectTypes = [
  "Fire alarm installation",
  "IP CCTV commissioning",
  "Access control setup",
  "Structured cabling",
  "Fiber testing",
  "ELV AMC support",
];

const cityDirectoryImages = [
  {
    src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
    alt: "India city infrastructure",
  },
  {
    src: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=900&q=80",
    alt: "Mumbai city deployment",
  },
  {
    src: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
    alt: "Delhi city project",
  },
  {
    src: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=900&q=80",
    alt: "Bengaluru technology city",
  },
  {
    src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
    alt: "Chennai city coverage",
  },
  {
    src: "https://images.unsplash.com/photo-1551161242-b5af797b7233?auto=format&fit=crop&w=900&q=80",
    alt: "Pan India field support",
  },
];

export default function CityDirectoryPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-white !py-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,70,193,0.16),transparent_34%),linear-gradient(135deg,rgba(20,184,166,0.12),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-5xl gap-5 px-5 lg:grid-cols-[0.95fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Pan-India ELV coverage
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">
              City directory for verified ELV work
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Find city-wise professionals for Fire Safety, CCTV, Access Control, and Networking projects across India.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/engineers"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-md shadow-primary/20"
              >
                <Search className="h-3.5 w-3.5" />
                Find city engineers
              </Link>
              <Link
                href="/dashboard/jobs/create"
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-white px-3 py-2 text-xs font-bold text-primary"
              >
                <Wrench className="h-3.5 w-3.5" />
                Post local work
              </Link>
            </div>
          </div>
          <PublicImageSlider images={cityDirectoryImages} className="h-[220px] lg:h-[260px]" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 !py-6">
        <div className="grid gap-4 md:grid-cols-2">
          {cityGroups.map((group) => (
            <article key={group.region} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{group.region}</h2>
                  <p className="mt-1 text-xs text-slate-500">Available coverage and common ELV demand.</p>
                </div>
                <MaterialSymbol name="travel_explore" className="text-[24px] text-primary" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.cities.map((city) => (
                  <Link
                    key={city}
                    href={`/engineers?city=${encodeURIComponent(city)}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
                  >
                    {city}
                  </Link>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {group.strengths.map((strength) => (
                  <div key={strength} className="rounded-md bg-primary-container/10 p-2 text-xs font-semibold text-primary">
                    {strength}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 !pb-8 !pt-0">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-bold">Popular city work catalog</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {projectTypes.map((type) => (
              <Link
                key={type}
                href={`/jobs?query=${encodeURIComponent(type)}`}
                className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-primary-container/10 hover:text-primary"
              >
                {type}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
