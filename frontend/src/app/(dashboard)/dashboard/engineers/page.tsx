"use client";

import Link from "next/link";
import { Search, Users } from "lucide-react";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { EngineerCard } from "@/components/Engineers/EngineerCard";
import { useQuery } from "@/hooks/useQuery";
import { PaginatedResponse, User } from "@/types";

export default function DashboardEngineersPage() {
  const { data, loading } = useQuery<PaginatedResponse<User>>("/users/engineers", {
    retry: false,
    showErrorToast: false,
  });

  const engineers = data?.data ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Engineers</h2>
            <p className="mt-1 text-gray-600">
              Find verified ELV specialists for CCTV, fire safety, access control, and networking work.
            </p>
          </div>
          <Link
            href="/engineers"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition-colors hover:bg-purple-700"
          >
            <Search className="h-4 w-4" />
            Browse Directory
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-r-purple-600" />
          </div>
        ) : engineers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-200 bg-white p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-purple-300" />
            <h3 className="text-xl font-semibold text-gray-900">
              No engineers loaded yet
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-gray-600">
              The dashboard is ready. Live engineers will appear here once MongoDB Atlas access is restored.
            </p>
            <Link
              href="/engineers"
              className="mt-6 inline-flex items-center rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition-colors hover:bg-purple-700"
            >
              Open public engineer directory
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {engineers.map((engineer) => (
              <EngineerCard key={engineer._id} engineer={engineer} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
