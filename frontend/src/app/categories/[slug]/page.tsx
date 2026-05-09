"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  IndianRupee,
  PackageCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { EngineerCard } from "@/components/Engineers/EngineerCard";
import { JobCard } from "@/components/Jobs/JobCard";
import { MaterialSymbol } from "@/components/MaterialSymbol";
import PublicImageSlider from "@/components/PublicImageSlider";
import { categoryContent, getCategoryBySlug } from "@/lib/category-content";
import { useExperiencePreferences } from "@/hooks/useExperiencePreferences";
import { appendLocationSearchParams } from "@/lib/experience-preferences";
import { useQuery } from "@/hooks/useQuery";
import { Job, PaginatedResponse, User } from "@/types";

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const selectedCategory = getCategoryBySlug(params.slug);
  const category = selectedCategory || categoryContent[0];
  const { location } = useExperiencePreferences();

  const { data: jobsData, loading: jobsLoading } = useQuery<PaginatedResponse<Job>>(
    appendLocationSearchParams(`/jobs?status=open&category=${category.category}`, location),
    { enabled: Boolean(selectedCategory), retry: false, showErrorToast: false }
  );
  const { data: engineersData, loading: engineersLoading } = useQuery<PaginatedResponse<User>>(
    appendLocationSearchParams(`/users/engineers?specialization=${category.category}`, location),
    { enabled: Boolean(selectedCategory), retry: false, showErrorToast: false }
  );

  if (!selectedCategory) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Category not found</h1>
          <p className="mt-2 text-sm text-slate-500">Choose a discipline from the home page.</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-primary-container px-5 py-2 text-sm font-bold text-on-primary"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const jobs = Array.isArray(jobsData) ? jobsData : jobsData?.data || [];
  const engineers = Array.isArray(engineersData) ? engineersData : engineersData?.data || [];
  const displayJobs = jobs.length > 0 ? jobs : getSampleJobs(category.category, location.name);
  const displayEngineers =
    engineers.length > 0 ? engineers : getSampleEngineers(category.category, location.name);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-white !py-7">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative mx-auto grid max-w-5xl gap-5 px-5 lg:grid-cols-[0.95fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <Link
              href="/"
              className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-primary"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Back to home
            </Link>
            <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <MaterialSymbol name={category.icon} className="text-[13px]" />
              {category.shortTitle}
            </div>
            <h1 className="max-w-2xl text-2xl font-bold leading-tight md:text-3xl">
              {category.title}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
              {category.summary}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/jobs?category=${category.category}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-md shadow-primary/20 hover:opacity-90"
              >
                <Briefcase className="h-3.5 w-3.5" />
                View related jobs
              </Link>
              <Link
                href={`/engineers?specialization=${category.category}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-white px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5"
              >
                <Users className="h-3.5 w-3.5" />
                Hire specialists
              </Link>
            </div>
          </div>
          <PublicImageSlider images={category.gallery} className="h-[220px] lg:h-[260px]" />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 !py-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">Full category information</h2>
          <p className="mt-2 text-xs leading-5 text-slate-600">{category.overview}</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InfoList title="Systems covered" items={category.systems} />
            <InfoList title="Used in" items={category.applications} />
            <InfoList title="Standards and checks" items={category.standards} />
            <InfoList title="Buyer checklist" items={category.buyerChecklist} />
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold">Major brands in this category</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Commonly used brands and platforms seen in Indian ELV projects.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {category.brands.map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
              >
                {brand}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-5xl px-5 !pb-6 !pt-0">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <PackageCheck className="h-3.5 w-3.5" />
              Product catalog
            </div>
            <h2 className="mt-2 text-lg font-bold">Popular products and buying guidance</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Practical catalog cards for clients to understand scope, product fit, and budget bands before creating a job.
            </p>
          </div>
          <Link
            href={`/dashboard/jobs/create?category=${category.category}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-md shadow-primary/20"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Create project request
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {category.catalog.map((item) => (
            <article
              key={item.name}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10"
            >
              <div className="h-28 overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-slate-950">{item.name}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.description}</p>
                <div className="mt-3 space-y-2 rounded-md bg-slate-50 p-3">
                  <p className="flex gap-1.5 text-xs font-semibold text-slate-700">
                    <IndianRupee className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {item.budget}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Best fit
                  </p>
                  <p className="text-xs text-slate-600">{item.fitFor}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 !pb-6 !pt-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Related jobs in {location.name}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Live projects matching {category.shortTitle}.
            </p>
          </div>
          <Link href={`/jobs?category=${category.category}`} className="text-xs font-bold text-primary">
            See all jobs
          </Link>
        </div>
        {jobsLoading ? (
          <LoadingStrip label="Loading related jobs..." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayJobs.slice(0, 3).map((job) => (
              <JobCard key={job._id} job={job} showStatus={false} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-5 !pb-8 !pt-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Hireable specialists in {location.name}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Engineers and service providers matching this category.
            </p>
          </div>
          <Link
            href={`/engineers?specialization=${category.category}`}
            className="text-xs font-bold text-primary"
          >
            See all engineers
          </Link>
        </div>
        {engineersLoading ? (
          <LoadingStrip label="Loading hireable workers..." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayEngineers.slice(0, 3).map((engineer) => (
              <EngineerCard key={engineer._id} engineer={engineer} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5 text-xs leading-5 text-slate-600">
            <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingStrip({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-center text-xs font-semibold text-slate-500">
      {label}
    </div>
  );
}

function getSampleJobs(category: Job["category"][number], locationName: string): Job[] {
  const city = locationName === "All India" || locationName === "Current Location" ? "Delhi NCR" : locationName;
  const titles: Record<Job["category"][number], string[]> = {
    fire_alarm: [
      "Fire alarm AMC and detector testing for commercial tower",
      "Addressable fire panel installation for warehouse",
      "Fire safety audit and cause-effect programming",
    ],
    cctv: [
      "IP CCTV upgrade with NVR and remote viewing",
      "ANPR camera installation for gated parking",
      "Factory surveillance analytics and control room setup",
    ],
    access_control: [
      "Biometric access control for office entry points",
      "Turnstile and RFID integration for corporate lobby",
      "Door controller upgrade with fire alarm release",
    ],
    structured_cabling: [
      "Cat6A structured cabling and rack dressing",
      "Fiber backbone testing with OTDR report",
      "PoE switching and Wi-Fi deployment for ELV network",
    ],
    bms: ["BMS integration support"],
    av_integration: ["AV room integration support"],
    gate_automation: ["Gate automation service"],
    intercom: ["Intercom installation"],
    other: ["ELV project support"],
    pa_system: ["PA system installation"],
  };

  return titles[category].slice(0, 3).map((title, index) => ({
    _id: `sample-${category}-${index}`,
    customerId: "sample-customer",
    title,
    description:
      "Sample marketplace requirement shown until live API data is available. Clients can post similar work and matching specialists will see it here.",
    category: [category],
    status: "open",
    visibility: "public",
    budget: {
      type: index === 0 ? "range" : "get_quotes",
      min: 25000 + index * 15000,
      max: 75000 + index * 25000,
      currency: "INR ",
    },
    location: {
      address: `${city} project site`,
      city,
      country: "India",
    },
    timeline: {
      startDate: "2026-05-05T09:00:00.000Z",
      deadline: "2026-05-20T18:00:00.000Z",
    },
    applications: [],
    createdAt: "2026-04-29T12:00:00.000Z",
    updatedAt: "2026-04-29T12:00:00.000Z",
  }));
}

function getSampleEngineers(category: Job["category"][number], locationName: string): User[] {
  const city = locationName === "All India" || locationName === "Current Location" ? "Mumbai" : locationName;
  const names: Record<Job["category"][number], string[]> = {
    fire_alarm: ["Aarav Fire Systems", "Secure Flame Engineers", "Agni Shield Services"],
    cctv: ["VisionGrid CCTV Team", "Suraksha Camera Works", "NVR Pro India"],
    access_control: ["EntryPoint Automation", "BioGate Security", "RFID Access Pro"],
    structured_cabling: ["FiberLink Networks", "RackReady Engineers", "CableCore Solutions"],
    bms: ["BMS Support Team"],
    av_integration: ["AV Integration Team"],
    gate_automation: ["Gate Automation Team"],
    intercom: ["Intercom Support Team"],
    other: ["ELV Service Team"],
    pa_system: ["PA System Team"],
  };

  return names[category].slice(0, 3).map((name, index) => ({
    _id: `sample-engineer-${category}-${index}`,
    email: `sample-${category}-${index}@elvconnect.local`,
    role: "service_provider",
    profile: {
      fullName: name,
      companyName: index === 0 ? "Verified ELV Partner" : "Independent Service Provider",
      bio: "Sample specialist profile shown until live database data is available.",
    },
    serviceProvider: {
      specializations: [category],
      yearsOfExperience: 5 + index * 3,
      certifications: ["Site survey", "Installation", "Testing and handover"],
      serviceArea: {
        city,
        country: "India",
      },
      serviceRadius: 100,
      isVerified: index !== 2,
      averageRating: 4.7 - index * 0.1,
      totalReviews: 18 + index * 9,
      totalJobsCompleted: 24 + index * 17,
    },
    createdAt: "2026-04-29T12:00:00.000Z",
    updatedAt: "2026-04-29T12:00:00.000Z",
  }));
}
