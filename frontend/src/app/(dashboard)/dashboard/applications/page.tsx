"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ApplicationsPage() {
  const { user } = useAuth();

  const isServiceProvider = user?.role === "service_provider";

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Applications</h2>
            <p className="text-gray-600 mt-1">
              {isServiceProvider
                ? "Track the jobs you've applied for"
                : "Manage applications received on your jobs"}
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-600 mb-6">
              {isServiceProvider
                ? "Start applying to jobs to see them here"
                : "When you receive applications on your jobs, they'll appear here"}
            </p>
            {isServiceProvider ? (
              <Link
                href="/jobs"
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Browse Jobs
              </Link>
            ) : (
              <Link
                href="/dashboard/jobs/create"
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Post a Job
              </Link>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
