"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeIndianRupee,
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  Landmark,
  QrCode,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useToast } from "@/components/Toast";
import { Card } from "@/components/ui";

type PaymentStatus = "authorized" | "captured" | "pending" | "failed" | "refunded";
type PaymentAudience = "Client" | "Vendor" | "Engineer";

const paymentModes = [
  {
    id: "razorpay",
    title: "Razorpay Checkout",
    description: "Hosted payment gateway for cards, UPI, wallets, net banking, and EMI.",
    icon: ShieldCheck,
    fee: "Gateway authorization",
  },
  {
    id: "upi",
    title: "UPI",
    description: "Accept UPI ID, QR, collect request, and intent payments from Indian apps.",
    icon: QrCode,
    fee: "Fast settlement",
  },
  {
    id: "cards",
    title: "Cards",
    description: "Debit card, credit card, corporate card, OTP, and 3DS authorization.",
    icon: CreditCard,
    fee: "Visa, Mastercard, RuPay",
  },
  {
    id: "netbanking",
    title: "Net Banking",
    description: "Bank redirect flow for enterprise clients and purchase teams.",
    icon: Landmark,
    fee: "Bank verified",
  },
  {
    id: "wallets",
    title: "Wallets",
    description: "Wallet and prepaid balance support for quick low-value settlements.",
    icon: WalletCards,
    fee: "Instant acknowledgement",
  },
  {
    id: "cash",
    title: "Cash / Cheque / Bank Transfer",
    description: "Manual payment recording for site advances, cheques, NEFT, RTGS, and IMPS.",
    icon: Banknote,
    fee: "Manual reconciliation",
  },
];

const paymentHistory = [
  {
    id: "PAY-2026-041",
    party: "SecureVision Projects",
    audience: "Vendor" as PaymentAudience,
    method: "UPI",
    amount: 12500,
    status: "captured" as PaymentStatus,
    date: "2026-04-30",
    note: "CCTV commissioning advance for Mumbai site",
  },
  {
    id: "PAY-2026-039",
    party: "Aarav Fire Systems",
    audience: "Engineer" as PaymentAudience,
    method: "Razorpay Card",
    amount: 8800,
    status: "authorized" as PaymentStatus,
    date: "2026-04-29",
    note: "Fire panel testing milestone authorization",
  },
  {
    id: "PAY-2026-034",
    party: "Urban Shield Facilities",
    audience: "Client" as PaymentAudience,
    method: "Net Banking",
    amount: 42000,
    status: "pending" as PaymentStatus,
    date: "2026-04-28",
    note: "Access control AMC invoice awaiting bank confirmation",
  },
];

const statusStyles: Record<PaymentStatus, string> = {
  authorized: "bg-blue-100 text-blue-700",
  captured: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-100 text-slate-700",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentsPage() {
  const { addToast } = useToast();
  const [audience, setAudience] = useState<"All" | PaymentAudience>("All");
  const [selectedMode, setSelectedMode] = useState(paymentModes[0].id);
  const [amount, setAmount] = useState("15000");
  const [party, setParty] = useState("ELV Project Partner");
  const [note, setNote] = useState("Milestone payment for site work");
  const [status, setStatus] = useState<PaymentStatus>("authorized");

  const filteredHistory = useMemo(
    () =>
      audience === "All"
        ? paymentHistory
        : paymentHistory.filter((payment) => payment.audience === audience),
    [audience]
  );

  const selectedPaymentMode = paymentModes.find((mode) => mode.id === selectedMode) || paymentModes[0];
  const totalCaptured = filteredHistory
    .filter((payment) => payment.status === "captured")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = filteredHistory
    .filter((payment) => ["authorized", "pending"].includes(payment.status))
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h2>
            <p className="mt-1 text-gray-600 dark:text-slate-300">
              Accept, authorize, record, and track payments across clients, vendors, and engineers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/invoices"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Invoices
            </Link>
            <button
              type="button"
              onClick={() => addToast("Payment report prepared for download", "success")}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 font-semibold text-white hover:bg-purple-700"
            >
              <Download className="h-4 w-4" />
              Export History
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Captured" value={formatAmount(totalCaptured)} icon={CheckCircle2} />
          <MetricCard label="Authorized / Pending" value={formatAmount(totalPending)} icon={ShieldCheck} />
          <MetricCard label="Payment Methods" value={`${paymentModes.length}`} icon={BadgeIndianRupee} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card variant="default" padding="lg">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create payment authorization</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Prepare a checkout request or record manual settlement.
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Test mode
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Party name">
                <input
                  value={party}
                  onChange={(event) => setParty(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </Field>
              <Field label="Amount">
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </Field>
              <Field label="Payment status">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as PaymentStatus)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="authorized">Authorized</option>
                  <option value="captured">Captured</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </Field>
              <Field label="Payment for">
                <select
                  value={audience === "All" ? "Client" : audience}
                  onChange={(event) => setAudience(event.target.value as PaymentAudience)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Client">Client</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Engineer">Engineer</option>
                </select>
              </Field>
              <Field label="Notes">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </Field>
              <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/40">
                <p className="text-sm font-bold text-purple-800 dark:text-purple-100">
                  Selected: {selectedPaymentMode.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-purple-700 dark:text-purple-200">
                  {selectedPaymentMode.description}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    addToast(
                      `${selectedPaymentMode.title} ${status} request ready for ${party} (${formatAmount(Number(amount) || 0)})`,
                      "success"
                    )
                  }
                  className="mt-4 w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Create Payment Request
                </button>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Accepted payment modes</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
              Choose the preferred collection method for the payment request.
            </p>
            <div className="mt-5 grid gap-3">
              {paymentModes.map((mode) => {
                const Icon = mode.icon;
                const active = mode.id === selectedMode;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      active
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40"
                        : "border-slate-200 hover:border-purple-300 dark:border-slate-700 dark:hover:border-purple-700"
                    }`}
                  >
                    <Icon className="mt-1 h-5 w-5 text-purple-600" />
                    <span>
                      <span className="block font-bold text-slate-900 dark:text-white">{mode.title}</span>
                      <span className="mt-1 block text-sm text-slate-500 dark:text-slate-300">{mode.description}</span>
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                        {mode.fee}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </section>

        <Card variant="default" padding="lg">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment history and tracking</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Track collections, vendor payouts, engineer milestone releases, and client authorizations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["All", "Client", "Vendor", "Engineer"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAudience(item)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    audience === item
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Party</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredHistory.map((payment) => (
                  <tr key={payment.id} className="bg-white dark:bg-slate-900">
                    <td className="px-4 py-4 font-semibold text-purple-700 dark:text-purple-300">{payment.id}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{payment.party}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{payment.note}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{payment.audience}</td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{payment.method}</td>
                    <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{formatAmount(payment.amount)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[payment.status]}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">
                      {new Date(payment.date).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof BadgeIndianRupee;
}) {
  return (
    <Card variant="stat" padding="lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}
