"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { useToast } from "@/components/Toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { generateInvoicePDF } from "@/lib/invoice-pdf";
import { Invoice as AppInvoice } from "@/types";
import {
  Download,
  Edit2,
  Trash2,
  Send,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  Eye,
  type LucideIcon,
} from "lucide-react";

type InvoiceDetail = AppInvoice & {
  totalAmount?: number;
  amountPaid?: number;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");

  const invoiceId = params.id as string;

  const { data: invoice, loading, error, refetch } = useQuery<InvoiceDetail>(
    `/invoices/${invoiceId}`,
    { enabled: !!invoiceId, retry: false, showErrorToast: false }
  );

  const deleteInvoiceMutation = useMutation({
    method: "delete",
    url: `/invoices/${invoiceId}`,
    onSuccess: () => {
      addToast("Invoice deleted successfully", "success");
      router.push("/dashboard/invoices");
    },
  });

  const addPaymentMutation = useMutation({
    method: "post",
    url: `/invoices/${invoiceId}/payments`,
    onSuccess: () => {
      addToast("Payment recorded successfully", "success");
      setShowPaymentForm(false);
      setPaymentAmount(0);
      refetch();
    },
  });

  const sendEmailMutation = useMutation({
    method: "post",
    url: `/invoices/${invoiceId}/send`,
    onSuccess: () => {
      addToast("Invoice sent to customer", "success");
      refetch();
    },
  });

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      await generateInvoicePDF(invoice, "/ELVLOGO-HQ.png");
    } catch {
      addToast("Failed to generate PDF", "error");
    }
  };

  const handleDeleteInvoice = async () => {
    if (
      confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone."
      )
    ) {
      await deleteInvoiceMutation.mutate();
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0 || paymentAmount > (invoice?.balanceDue || 0)) {
      addToast("Invalid payment amount", "error");
      return;
    }
    await addPaymentMutation.mutate({ amount: paymentAmount, method: paymentMethod });
  };

  const handleSendEmail = async () => {
    await sendEmailMutation.mutate();
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="service_provider">
        <DashboardLayout>
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading invoice...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute requiredRole="service_provider">
        <DashboardLayout>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">Invoice not found</p>
            <button
              onClick={() => router.push("/dashboard/invoices")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Invoices
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const statusColors: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-800", icon: Clock },
    sent: { bg: "bg-blue-100", text: "text-blue-800", icon: Send },
    viewed: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Eye },
    partially_paid: { bg: "bg-orange-100", text: "text-orange-800", icon: TrendingDown },
    paid: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
    overdue: { bg: "bg-red-100", text: "text-red-800", icon: AlertCircle },
  };

  const statusConfig = statusColors[invoice.status] || statusColors.draft;
  const StatusIcon = statusConfig.icon;
  const invoiceTotal = invoice.totalAmount ?? invoice.grandTotal;
  const amountPaid = invoice.amountPaid ?? invoice.totalPaid ?? 0;
  const balanceDue = invoice.balanceDue ?? Math.max(invoiceTotal - amountPaid, 0);
  const globalDiscount = invoice.globalDiscount ?? 0;
  const retentionPercentage = invoice.retentionPercentage ?? 0;

  return (
    <ProtectedRoute requiredRole="service_provider">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice #{invoice.invoiceNumber}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span className="capitalize font-semibold text-sm">
                    {invoice.status.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">
                  {invoice.createdAt
                    ? new Date(invoice.createdAt).toLocaleDateString()
                    : "Recently created"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>

              {invoice.status !== "sent" && invoice.status !== "paid" && (
                <button
                  onClick={handleSendEmail}
                  disabled={sendEmailMutation.loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendEmailMutation.loading ? "Sending..." : "Send"}
                </button>
              )}

              {invoice.status === "draft" && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}

              {invoice.status === "draft" && (
                <button
                  onClick={handleDeleteInvoice}
                  disabled={deleteInvoiceMutation.loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteInvoiceMutation.loading ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* From/To Section */}
              <div className="bg-white rounded-lg shadow p-6 grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
                    From
                  </h3>
                  <p className="font-semibold text-gray-900">{user?.profile.fullName}</p>
                  {user?.profile.companyName && (
                    <p className="text-gray-600">{user.profile.companyName}</p>
                  )}
                  {user?.profile.phone && <p className="text-gray-600">{user.profile.phone}</p>}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
                    Bill To
                  </h3>
                  <p className="font-semibold text-gray-900">{invoice.to.name}</p>
                  {invoice.to.companyName && (
                    <p className="text-gray-600">{invoice.to.companyName}</p>
                  )}
                  {invoice.to.email && (
                    <p className="text-gray-600">{invoice.to.email}</p>
                  )}
                  {invoice.to.phone && (
                    <p className="text-gray-600">{invoice.to.phone}</p>
                  )}
                </div>
              </div>

              {/* Project Details */}
              {(invoice.projectName || invoice.poNumber || invoice.siteAddress) && (
                <div className="bg-white rounded-lg shadow p-6 grid grid-cols-3 gap-4 text-sm">
                  {invoice.projectName && (
                    <div>
                      <p className="text-gray-500 font-semibold">Project</p>
                      <p className="text-gray-900">{invoice.projectName}</p>
                    </div>
                  )}
                  {invoice.poNumber && (
                    <div>
                      <p className="text-gray-500 font-semibold">PO Number</p>
                      <p className="text-gray-900">{invoice.poNumber}</p>
                    </div>
                  )}
                  {invoice.siteAddress && (
                    <div>
                      <p className="text-gray-500 font-semibold">Site Address</p>
                      <p className="text-gray-900">{invoice.siteAddress}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Line Items Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                          Item
                        </th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-700">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-right font-semibold text-gray-700">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-right font-semibold text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item, idx: number) => (
                        <tr key={item._id ?? idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <p className="font-semibold text-gray-900">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {item.category.replace(/_/g, " ")}
                            </p>
                          </td>
                          <td className="px-6 py-3 text-center text-gray-900">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-6 py-3 text-right text-gray-900">
                            {invoice.currency} {item.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-right font-semibold text-gray-900">
                            {invoice.currency} {(item.quantity * item.unitPrice).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="bg-gray-50 p-6">
                  <div className="space-y-2 text-sm max-w-xs ml-auto">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{invoice.currency} {(invoiceTotal / 1.05).toFixed(2)}</span>
                    </div>
                    {globalDiscount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Discount ({globalDiscount}%)</span>
                        <span className="text-red-600">
                          -{invoice.currency}{" "}
                          {((invoiceTotal / 1.05) * (globalDiscount / 100)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>VAT (5%)</span>
                      <span>{invoice.currency} {(invoiceTotal * 0.048).toFixed(2)}</span>
                    </div>
                    {retentionPercentage > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Retention ({retentionPercentage}%)</span>
                        <span className="text-red-600">
                          -{invoice.currency}{" "}
                          {(invoiceTotal * (retentionPercentage / 100)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-base text-purple-600">
                      <span>Total</span>
                      <span>
                        {invoice.currency} {invoiceTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column - Payment Info & Summary */}
            <div className="space-y-6">
              {/* Payment Summary Card */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Payment Summary</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {invoice.currency} {invoiceTotal.toFixed(2)}
                    </p>
                  </div>

                  <div className="border-t border-purple-200 pt-3">
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      {invoice.currency} {amountPaid.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white rounded p-3">
                    <p className="text-sm text-gray-600">Balance Due</p>
                    <p
                      className={`text-2xl font-bold ${
                        balanceDue > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {invoice.currency} {balanceDue.toFixed(2)}
                    </p>
                  </div>
                </div>

                {balanceDue > 0 && (
                  <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Record Payment
                  </button>
                )}
              </div>

              {/* Payment Form */}
              {showPaymentForm && balanceDue > 0 && (
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <h3 className="font-bold text-gray-900">Add Payment</h3>
                  <form onSubmit={handleAddPayment} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount *
                      </label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        max={balanceDue}
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max: {invoice.currency} {balanceDue.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                        <option value="credit_card">Credit Card</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addPaymentMutation.loading || paymentAmount <= 0}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-semibold"
                      >
                        {addPaymentMutation.loading ? "Recording..." : "Record Payment"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-900 rounded-lg hover:border-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment History */}
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <h3 className="font-bold text-gray-900">Payment History</h3>
                  <div className="space-y-3">
                    {invoice.payments.map((payment, index) => (
                      <div
                        key={payment._id ?? `${payment.date}-${index}`}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {payment.method.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">
                          +{invoice.currency} {payment.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
