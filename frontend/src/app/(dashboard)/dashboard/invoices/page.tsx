"use client";

import React from "react";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useQuery } from "@/hooks/useQuery";
import { PaginatedResponse, Invoice } from "@/types";
import Link from "next/link";
import { CreditCard, FileText } from "lucide-react";

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = React.useState(() => {
    if (typeof window === "undefined") return "all";
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    return status && ["all", "draft", "sent", "viewed", "paid", "partially_paid", "overdue"].includes(status)
      ? status
      : "all";
  });

  const { data, loading } = useQuery<PaginatedResponse<Invoice>>(
    "/invoices",
    { enabled: true, retry: false, showErrorToast: false }
  );

  const invoices = data?.data || [];

  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);

  const statuses = [
    "all",
    "draft",
    "sent",
    "viewed",
    "paid",
    "partially_paid",
    "overdue",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
            <p className="text-gray-600 mt-1">Manage your invoices and payments</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/payments"
              className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-6 py-2 font-medium text-purple-700 transition-colors hover:bg-purple-50"
            >
              <CreditCard className="h-4 w-4" />
              Payments
            </Link>
            <Link
              href="/dashboard/invoices/create"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              + New Invoice
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                const url = status === "all" ? "/dashboard/invoices" : `/dashboard/invoices?status=${status}`;
                window.history.replaceState(null, "", url);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                statusFilter === status
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-r-purple-600"></div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No invoices found
            </h3>
            <Link
              href="/dashboard/invoices/create"
              className="inline-block mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-purple-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">
                      {invoice.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-sm">{invoice.to.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {invoice.currency} {invoice.grandTotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {invoice.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/invoices/${invoice._id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
