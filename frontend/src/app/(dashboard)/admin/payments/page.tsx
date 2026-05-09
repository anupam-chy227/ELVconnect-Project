"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeIndianRupee,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Landmark,
  LockKeyhole,
  Search,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Modal, Progress } from "@/components/ui";

type PaymentStatus = "pending" | "held" | "released";

type Payment = {
  id: string;
  project: string;
  party: string;
  city: string;
  category: string;
  method: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  riskScore: number;
  invoice: string;
  reference: string;
  notes: string;
  flags: string[];
};

const initialPayments: Payment[] = [
  {
    id: "TXN-ELV-5028",
    project: "Phoenix Mall CCTV Command Center",
    party: "SecureVision Projects",
    city: "Mumbai",
    category: "CCTV",
    method: "UPI Escrow",
    amount: 286000,
    date: "2026-05-01",
    status: "held",
    riskScore: 82,
    invoice: "INV-2048-A",
    reference: "UPI/AXIS/928104",
    notes: "Milestone release requested before final NVR failover validation.",
    flags: ["Early release request", "QA proof pending"],
  },
  {
    id: "TXN-ELV-5027",
    project: "Northline Fire Alarm Retrofit",
    party: "Ignis Safety Systems",
    city: "Delhi NCR",
    category: "Fire Safety",
    method: "Net Banking",
    amount: 420000,
    date: "2026-04-30",
    status: "pending",
    riskScore: 46,
    invoice: "INV-2047-B",
    reference: "NEFT/HDFC/771244",
    notes: "Bank confirmation pending for material dispatch milestone.",
    flags: [],
  },
  {
    id: "TXN-ELV-5026",
    project: "Zenith CoWorks Access Upgrade",
    party: "GateGrid Technologies",
    city: "Bengaluru",
    category: "Access Control",
    method: "Razorpay",
    amount: 118000,
    date: "2026-04-29",
    status: "released",
    riskScore: 18,
    invoice: "INV-2046-C",
    reference: "RZP/pay_Q91K2",
    notes: "Payment released after site install proof and client confirmation.",
    flags: [],
  },
  {
    id: "TXN-ELV-5025",
    project: "FinCore Network Rack Audit",
    party: "CoreLink Infra",
    city: "Pune",
    category: "Networking",
    method: "UPI",
    amount: 64000,
    date: "2026-04-28",
    status: "pending",
    riskScore: 31,
    invoice: "INV-2045-D",
    reference: "UPI/ICICI/661904",
    notes: "Awaiting final audit report acknowledgement.",
    flags: [],
  },
  {
    id: "TXN-ELV-5024",
    project: "Metro Logistics VMS Expansion",
    party: "SignalOps Security",
    city: "Ahmedabad",
    category: "CCTV",
    method: "Manual Bank Transfer",
    amount: 735000,
    date: "2026-04-27",
    status: "held",
    riskScore: 91,
    invoice: "INV-2044-E",
    reference: "RTGS/SBI/554829",
    notes: "Vendor compliance expired and payout amount exceeds normal project threshold.",
    flags: ["Expired insurance", "High-value payout", "Manual transfer"],
  },
  {
    id: "TXN-ELV-5023",
    project: "Skyline Fire Sensor Fault Review",
    party: "SafeLayer ELV Works",
    city: "Hyderabad",
    category: "Fire Safety",
    method: "UPI Escrow",
    amount: 78000,
    date: "2026-04-26",
    status: "held",
    riskScore: 76,
    invoice: "INV-2043-F",
    reference: "UPI/KOTAK/226781",
    notes: "KYC mismatch detected during vendor payout review.",
    flags: ["KYC mismatch"],
  },
];

const statuses = ["All statuses", "pending", "held", "released"];

const statusMeta: Record<
  PaymentStatus,
  { label: string; tone: "warning" | "danger" | "success"; icon: LucideIcon; progressTone: "warning" | "danger" | "success" }
> = {
  pending: {
    label: "Pending",
    tone: "warning",
    icon: Clock3,
    progressTone: "warning",
  },
  held: {
    label: "Held",
    tone: "danger",
    icon: LockKeyhole,
    progressTone: "danger",
  },
  released: {
    label: "Released",
    tone: "success",
    icon: CheckCircle2,
    progressTone: "success",
  },
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function isSuspicious(payment: Payment) {
  return payment.riskScore >= 70 || payment.flags.length > 0;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(initialPayments);
  const [status, setStatus] = useState("All statuses");
  const [fromDate, setFromDate] = useState("2026-04-26");
  const [toDate, setToDate] = useState("2026-05-01");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionLog, setActionLog] = useState("No payment action queued");

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const statusMatch = status === "All statuses" || payment.status === status;
      const fromMatch = !fromDate || payment.date >= fromDate;
      const toMatch = !toDate || payment.date <= toDate;
      const searchMatch = `${payment.id} ${payment.project} ${payment.party} ${payment.city} ${payment.category} ${payment.reference}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return statusMatch && fromMatch && toMatch && searchMatch;
    });
  }, [fromDate, payments, search, status, toDate]);

  const pendingTotal = filteredPayments
    .filter((payment) => payment.status === "pending")
    .reduce((total, payment) => total + payment.amount, 0);
  const heldTotal = filteredPayments
    .filter((payment) => payment.status === "held")
    .reduce((total, payment) => total + payment.amount, 0);
  const releasedTotal = filteredPayments
    .filter((payment) => payment.status === "released")
    .reduce((total, payment) => total + payment.amount, 0);
  const suspiciousPayments = filteredPayments.filter(isSuspicious);

  const releasePayment = (payment: Payment) => {
    setPayments((current) =>
      current.map((item) =>
        item.id === payment.id ? { ...item, status: "released", riskScore: Math.min(item.riskScore, 35) } : item,
      ),
    );
    setSelectedPayment((current) =>
      current?.id === payment.id ? { ...current, status: "released", riskScore: Math.min(current.riskScore, 35) } : current,
    );
    setActionLog(`Release queued for ${payment.id} - ${payment.party}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(244,63,94,0.13),transparent_30%)]" />

      <div className="space-y-6">
        <section className="rounded-md border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="px-3 py-1">
                  <BadgeIndianRupee className="h-3.5 w-3.5" />
                  Payment management
                </Badge>
                <Badge tone={suspiciousPayments.length ? "danger" : "success"} className="px-3 py-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {suspiciousPayments.length} suspicious
                </Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Payment Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Review pending, held, and released transactions with payout
                controls, risk warnings, and detailed transaction evidence.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <MiniMetric label="Pending" value={formatAmount(pendingTotal)} icon={Clock3} />
              <MiniMetric label="Held" value={formatAmount(heldTotal)} icon={LockKeyhole} />
              <MiniMetric label="Released" value={formatAmount(releasedTotal)} icon={CheckCircle2} />
            </div>
          </div>
        </section>

        {suspiciousPayments.length ? (
          <Card
            variant="elevated"
            padding="lg"
            className="border-rose-200 bg-gradient-to-r from-rose-50 via-white to-amber-50 dark:border-rose-950 dark:from-rose-950/30 dark:via-slate-950 dark:to-amber-950/20"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-900">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-950 dark:text-white">
                    Suspicious payment warning
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {suspiciousPayments.length} transaction(s) have elevated risk,
                    high-value payout patterns, missing compliance, or manual transfer
                    flags. Review details before release.
                  </p>
                </div>
              </div>
              <Badge tone="danger" className="w-fit px-3 py-1">
                Max risk {Math.max(...suspiciousPayments.map((payment) => payment.riskScore))}
              </Badge>
            </div>
          </Card>
        ) : null}

        <Card
          variant="glass"
          padding="lg"
          title="Payment Table"
          description="Filter by date and status, inspect transaction details, and release approved payments."
          action={
            <Badge tone="primary" className="px-3 py-1">
              {filteredPayments.length} transactions
            </Badge>
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3 rounded-md border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
              <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                Search
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Project, vendor, transaction..."
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-primary/45 focus:ring-4 focus:ring-primary-ring dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </label>
              <FilterDate label="From date" value={fromDate} onChange={setFromDate} />
              <FilterDate label="To date" value={toDate} onChange={setToDate} />
              <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
            </div>

            <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="hidden grid-cols-[minmax(250px,1.35fr)_125px_120px_125px_120px_210px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 xl:grid">
                <span>Transaction</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Date</span>
                <span>Risk</span>
                <span>Actions</span>
              </div>

              <AnimatePresence initial={false}>
                {filteredPayments.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onView={() => setSelectedPayment(payment)}
                    onRelease={() => releasePayment(payment)}
                  />
                ))}
              </AnimatePresence>

              {!filteredPayments.length ? (
                <div className="p-10 text-center">
                  <AlertTriangle className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
                    No payments match these filters.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Adjust date, status, or search term to return to the payment table.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="rounded-md border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-slate-950 dark:to-emerald-950/20">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Latest action</p>
          <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{actionLog}</p>
        </div>
      </div>

      <TransactionDetailsModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onRelease={releasePayment}
      />
    </div>
  );
}

function PaymentRow({
  payment,
  onView,
  onRelease,
}: {
  payment: Payment;
  onView: () => void;
  onRelease: () => void;
}) {
  const status = statusMeta[payment.status];
  const StatusIcon = status.icon;
  const suspicious = isSuspicious(payment);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`grid gap-4 border-b border-slate-200 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-900/60 xl:grid-cols-[minmax(250px,1.35fr)_125px_120px_125px_120px_210px] xl:items-center ${
        suspicious ? "bg-rose-50/35 dark:bg-rose-950/10" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-black text-slate-400">{payment.id}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-500 dark:bg-slate-900">
            {payment.method}
          </span>
          {suspicious ? (
            <Badge tone="danger">
              <ShieldAlert className="h-3.5 w-3.5" />
              Suspicious
            </Badge>
          ) : null}
        </div>
        <h2 className="mt-2 text-sm font-black text-slate-950 dark:text-white">{payment.project}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {payment.party} - {payment.city} - {payment.category}
        </p>
      </div>

      <p className="text-sm font-black text-slate-950 dark:text-white">{formatAmount(payment.amount)}</p>

      <Badge tone={status.tone} className="w-fit px-2.5 py-1">
        <StatusIcon className="h-3.5 w-3.5" />
        {status.label}
      </Badge>

      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {new Date(payment.date).toLocaleDateString("en-IN")}
      </p>

      <div className="space-y-2">
        <Progress
          value={payment.riskScore}
          tone={payment.riskScore >= 70 ? "danger" : payment.riskScore >= 45 ? "warning" : "success"}
          showValue={false}
        />
        <p className="text-xs font-bold text-slate-500">Risk {payment.riskScore}/100</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary hover:shadow-md active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Eye className="h-3.5 w-3.5" />
          Details
        </button>
        <button
          type="button"
          disabled={payment.status === "released" || suspicious}
          onClick={onRelease}
          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Release
        </button>
      </div>
    </motion.div>
  );
}

function TransactionDetailsModal({
  payment,
  onClose,
  onRelease,
}: {
  payment: Payment | null;
  onClose: () => void;
  onRelease: (payment: Payment) => void;
}) {
  if (!payment) return null;

  const status = statusMeta[payment.status];
  const StatusIcon = status.icon;
  const suspicious = isSuspicious(payment);

  return (
    <Modal
      open={Boolean(payment)}
      onClose={onClose}
      title={payment.id}
      description={`${payment.project} transaction details and release controls.`}
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
            Download invoice
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={payment.status === "released" || suspicious}
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => onRelease(payment)}
          >
            Release payment
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Amount</p>
                <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                  {formatAmount(payment.amount)}
                </p>
              </div>
              <Badge tone={status.tone}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              <DetailLine label="Vendor" value={payment.party} />
              <DetailLine label="Project" value={payment.project} />
              <DetailLine label="City" value={payment.city} />
              <DetailLine label="Invoice" value={payment.invoice} />
              <DetailLine label="Reference" value={payment.reference} />
              <DetailLine label="Date" value={new Date(payment.date).toLocaleDateString("en-IN")} />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-950 dark:text-white">Risk score</p>
              <Badge tone={payment.riskScore >= 70 ? "danger" : payment.riskScore >= 45 ? "warning" : "success"}>
                {payment.riskScore}/100
              </Badge>
            </div>
            <Progress
              value={payment.riskScore}
              tone={payment.riskScore >= 70 ? "danger" : payment.riskScore >= 45 ? "warning" : "success"}
              showValue={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          {suspicious ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-4 dark:border-rose-950 dark:bg-rose-950/30">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-300" />
                <div>
                  <p className="text-sm font-black text-rose-800 dark:text-rose-100">
                    Suspicious payment warning
                  </p>
                  <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-200">
                    Release is disabled until the warning flags are reviewed.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-black text-slate-950 dark:text-white">Transaction notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{payment.notes}</p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-black text-slate-950 dark:text-white">Warning flags</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {payment.flags.length ? (
                payment.flags.map((flag) => (
                  <Badge key={flag} tone="danger">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {flag}
                  </Badge>
                ))
              ) : (
                <Badge tone="success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  No warning flags
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoPill label="Method" value={payment.method} icon={WalletCards} />
            <InfoPill label="Category" value={payment.category} icon={Landmark} />
            <InfoPill label="Invoice" value={payment.invoice} icon={FileText} />
            <InfoPill label="Security" value={suspicious ? "Review needed" : "Cleared"} icon={ShieldCheck} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MiniMetric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-xl font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function InfoPill({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Icon className="h-4 w-4 text-indigo-500" />
      <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}

function FilterDate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
      {label}
      <div className="relative">
        <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-primary/45 focus:ring-4 focus:ring-primary-ring dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-primary/45 focus:ring-4 focus:ring-primary-ring dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.includes("All") ? option : option[0]?.toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
