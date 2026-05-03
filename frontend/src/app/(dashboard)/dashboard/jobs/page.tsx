"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Briefcase, CalendarDays, MapPin, Plus, Tag } from "lucide-react";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useQuery } from "@/hooks/useQuery";
import { Job, PaginatedResponse } from "@/types";

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  open: "bg-emerald-100 text-emerald-700",
  applications_received: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-violet-100 text-violet-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function DashboardJobsPage() {
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window === "undefined") return "all";
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    return status && ["all", "draft", "open", "applications_received", "in_progress", "completed", "cancelled"].includes(status)
      ? status
      : "all";
  });
  const { data, loading } = useQuery<PaginatedResponse<Job>>("/jobs/my", {
    enabled: true,
    retry: false,
    showErrorToast: false,
  });

  const jobs = useMemo(() => data?.data ?? [], [data?.data]);
  const filteredJobs = useMemo(
    () => (statusFilter === "all" ? jobs : jobs.filter((job) => job.status === statusFilter)),
    [jobs, statusFilter]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Jobs</h2>
            <p className="mt-1 text-gray-600">
              Track ELV project postings, responses, and delivery timelines.
            </p>
          </div>
          <Link
            href="/dashboard/jobs/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-r-purple-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-200 bg-white p-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-purple-300" />
            <h3 className="text-xl font-semibold text-gray-900">
              No jobs posted yet
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-gray-600">
              Start by posting your first CCTV, access control, fire alarm, or
              structured cabling requirement.
            </p>
            <Link
              href="/dashboard/jobs/create"
              className="mt-6 inline-flex items-center rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition-colors hover:bg-purple-700"
            >
              Create your first job
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredJobs.map((job) => (
              <article
                key={job._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statusStyles[job.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {job.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-gray-600">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.category.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                        >
                          {category.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-[220px] rounded-2xl bg-slate-50 p-4">
                    <div className="space-y-3 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        {job.location.city}, {job.location.country}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-purple-500" />
                        Deadline: {new Date(job.timeline.deadline).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-500" />
                        {job.budget.type === "get_quotes"
                          ? "Collecting quotes"
                          : `${job.budget.currency ?? "AED"} ${job.budget.min ?? 0}${
                              job.budget.type === "range" && job.budget.max
                                ? ` - ${job.budget.max}`
                                : ""
                            }`}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Link
                        href={`/jobs/${job._id}`}
                        className="flex-1 rounded-lg border border-purple-200 px-4 py-2 text-center text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50"
                      >
                        View public
                      </Link>
                      <Link
                        href="/dashboard/applications"
                        className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-purple-700"
                      >
                        Applications
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
