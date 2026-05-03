"use client";

import Link from "next/link";
import { BadgeCheck, ClipboardCheck, FileCheck2, ShieldCheck, Star, UserCheck } from "lucide-react";
import PublicImageSlider from "@/components/PublicImageSlider";

const trustSteps = [
  {
    icon: UserCheck,
    title: "Profile verification",
    text: "Engineers and vendors show specialization, city coverage, experience, and work history before clients shortlist them.",
  },
  {
    icon: ClipboardCheck,
    title: "Project scope clarity",
    text: "Clients can define category, site location, budget band, timeline, and documents before proposals start.",
  },
  {
    icon: FileCheck2,
    title: "Handover documentation",
    text: "Encourage test reports, photos, certificates, as-built notes, and invoice records for professional closure.",
  },
  {
    icon: BadgeCheck,
    title: "Review and reputation",
    text: "Ratings, completed-job count, and review signals help users pick reliable ELV specialists.",
  },
];

const safetyChecks = [
  "Fire alarm cause-and-effect testing",
  "CCTV password and remote access hygiene",
  "Access control emergency release check",
  "Structured cabling labeling and test reports",
  "Payment milestone and invoice visibility",
  "City-wise engineer availability validation",
];

const trustSafetyImages = [
  {
    src: "https://images.unsplash.com/photo-1581092160607-ee22731c7c6f?auto=format&fit=crop&w=900&q=80",
    alt: "Verified safety inspection",
  },
  {
    src: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
    alt: "Engineer verification process",
  },
  {
    src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    alt: "Project documentation",
  },
  {
    src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    alt: "Secure billing records",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    alt: "Professional review meeting",
  },
  {
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    alt: "Team trust workflow",
  },
];

export default function TrustSafetyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-white !py-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_32%),linear-gradient(135deg,rgba(107,70,193,0.12),transparent_48%)]" />
        <div className="relative mx-auto grid max-w-5xl gap-5 px-5 lg:grid-cols-[0.95fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust & Safety
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">
              Safer ELV hiring for clients, vendors, and engineers
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A practical safety layer for verified profiles, clear scopes, secure work records, and reliable project handover.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/engineers"
                className="inline-flex items-center justify-center rounded-md bg-primary-container px-3 py-2 text-xs font-bold text-on-primary shadow-md shadow-primary/20"
              >
                Hire verified specialists
              </Link>
              <Link
                href="/dashboard/jobs/create"
                className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-white px-3 py-2 text-xs font-bold text-primary"
              >
                Create safe project scope
              </Link>
            </div>
          </div>
          <PublicImageSlider images={trustSafetyImages} className="h-[220px] lg:h-[260px]" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 !py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-container/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="mt-3 text-sm font-bold">{step.title}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-600">{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 !pb-8 !pt-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg bg-primary p-4 text-on-primary shadow-md shadow-primary/20">
          <Star className="h-5 w-5 text-tertiary-fixed" />
          <h2 className="mt-3 text-lg font-bold">Professional safety promise</h2>
          <p className="mt-2 text-xs leading-5 text-primary-fixed">
            ELV work affects building security, life safety, network reliability, and payment trust. The platform experience is designed around clear information, verified capability, and documented outcomes.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-bold">Checklist users can follow</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {safetyChecks.map((check) => (
              <div key={check} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700">
                {check}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
