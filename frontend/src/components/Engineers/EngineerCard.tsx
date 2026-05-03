"use client";

import Link from "next/link";
import { BadgeCheck, Briefcase, MapPin, ShieldCheck, Star, Wrench } from "lucide-react";
import { User } from "@/types";

interface EngineerCardProps {
  engineer: User;
}

export function EngineerCard({ engineer }: EngineerCardProps) {
  if (!engineer.serviceProvider) return null;

  const initials = engineer.profile.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href="/register" className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-md border border-border-subtle bg-surface shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
        <div className="relative h-24 bg-gradient-to-br from-slate-950 via-indigo-800 to-primary">
          <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5" />
              {engineer.serviceProvider.isVerified ? "Verified engineer" : "Profile review"}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-xl">
              {engineer.serviceProvider.serviceRadius || 25} km
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5">
          <div className="-mt-9 flex items-end gap-3">
            <div className="grid h-18 w-18 place-items-center overflow-hidden rounded-md border-4 border-white bg-primary-subtle shadow-md dark:border-slate-900">
              {engineer.profile.avatar ? (
                <img src={engineer.profile.avatar} alt={engineer.profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-black text-primary">{initials}</span>
              )}
            </div>
            {engineer.serviceProvider.isVerified ? <BadgeCheck className="mb-2 h-5 w-5 text-success" /> : null}
          </div>

          <h3 className="mt-4 truncate text-lg font-black text-foreground">{engineer.profile.fullName}</h3>
          {engineer.profile.companyName ? <p className="truncate text-sm font-semibold text-muted-foreground">{engineer.profile.companyName}</p> : null}

          {engineer.serviceProvider.serviceArea ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="truncate">
                {engineer.serviceProvider.serviceArea.city}, {engineer.serviceProvider.serviceArea.country}
              </span>
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {engineer.serviceProvider.specializations?.slice(0, 3).map((spec) => (
              <span key={spec} className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary-subtle px-2.5 py-1 text-[11px] font-black capitalize text-primary">
                <Wrench className="h-3 w-3" />
                {spec.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border-subtle py-3 text-center">
            <div>
              <p className="flex items-center justify-center gap-1 text-sm font-black text-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {engineer.serviceProvider.averageRating?.toFixed(1) || "N/A"}
              </p>
              <p className="text-[11px] text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-sm font-black text-foreground">
                <Briefcase className="h-4 w-4 text-secondary" />
                {engineer.serviceProvider.totalJobsCompleted || 0}
              </p>
              <p className="text-[11px] text-muted-foreground">Jobs</p>
            </div>
            <div>
              <p className="text-sm font-black text-foreground">{engineer.serviceProvider.yearsOfExperience || 0}y</p>
              <p className="text-[11px] text-muted-foreground">Experience</p>
            </div>
          </div>

          {engineer.profile.bio ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{engineer.profile.bio}</p> : null}

          <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-4 py-2.5 text-sm font-black text-on-primary shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
            Connect Now
          </span>
        </div>
      </article>
    </Link>
  );
}
