"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Download, IndianRupee, WalletCards } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Badge,
  Button,
  Card,
  DataTable,
  DynamicDataTable,
  ErrorCard,
  SkeletonCard,
  type BadgeTone,
  type ColumnDef,
} from "@/components/ui";
import { progressWidthClass } from "@/components/ui/utils";
import { ApiClientError, invoicesAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useMyAMCs, useMyInvoices, useMyProfile } from "@/hooks/useSWRData";
import type { AMCContract, AMCStatus, Invoice, InvoiceStatus } from "@/types/api";

type EarningsRow = {
  invoice: Invoice;
  invoiceNumber: string;
  jobTitle: string;
  clientId: string;
  amount: number;
  milestone: string;
  status: InvoiceStatus;
  dueDate: string;
};

type MonthPoint = {
  key: string;
  label: string;
  amount: number;
  amcAmount: number;
};

type AMCRow = {
  contract: AMCContract;
  systemName: string;
  clientId: string;
  nextVisit: string;
  annualAmount: number;
  status: AMCStatus;
};

const statusTone: Record<InvoiceStatus, BadgeTone> = {
  pending: "warning",
  paid: "success",
  disputed: "danger",
  refunded: "primary",
};

const amcStatusTone: Record<AMCStatus, BadgeTone> = {
  active: "success",
  expiring_soon: "warning",
  expired: "danger",
  cancelled: "neutral",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: InvoiceStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function amcStatusLabel(status: AMCStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLastSixMonths() {
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date),
      amount: 0,
      amcAmount: 0,
    };
  });
}

function isCurrentMonth(value: string) {
  const date = new Date(value);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function BarChartWidget({ points }: { points: MonthPoint[] }) {
  const maxValue = Math.max(...points.map((point) => point.amount + point.amcAmount), 1);

  return (
    <div className="grid gap-3" aria-label="Monthly earnings for the last six months">
      {points.map((point) => {
        const percentage = (point.amount / maxValue) * 100;
        const amcPercentage = (point.amcAmount / maxValue) * 100;

        return (
          <div key={point.key} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3 text-xs font-bold">
              <span className="text-muted-foreground">{point.label}</span>
              <span className="text-foreground">{formatCurrency(point.amount + point.amcAmount)}</span>
            </div>
            <div className="grid gap-1">
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className={`h-full rounded-full bg-gradient-to-r from-elv-iris to-elv-purple ${progressWidthClass(percentage)}`} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 ${progressWidthClass(amcPercentage)}`} />
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-3 pt-2 text-[11px] font-black uppercase text-indigo-100/75">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-elv-iris" aria-hidden="true" />
          Project invoices
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-emerald-400" aria-hidden="true" />
          AMC income
        </span>
      </div>
    </div>
  );
}

function EngineerEarningsContent() {
  const profileResult = useMyProfile();
  const invoicesResult = useMyInvoices();
  const amcResult = useMyAMCs();
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const userId = profileResult.data?._id;
  const amcMissing = amcResult.error instanceof ApiClientError && amcResult.error.status === 404;

  const engineerInvoices = useMemo(
    () => (userId ? (invoicesResult.data ?? []).filter((invoice) => invoice.engineerId === userId) : []),
    [invoicesResult.data, userId],
  );
  const engineerAMCs = useMemo(
    () => (userId ? (amcMissing ? [] : amcResult.data ?? []).filter((contract) => contract.engineerId === userId) : []),
    [amcMissing, amcResult.data, userId],
  );

  const rows = useMemo<EarningsRow[]>(
    () =>
      engineerInvoices.map((invoice) => ({
        invoice,
        invoiceNumber: invoice.invoiceNumber ?? `ELV-${invoice._id.slice(-6).toUpperCase()}`,
        jobTitle: invoice.job?.title ?? invoice.jobId,
        clientId: invoice.clientId,
        amount: invoice.amount,
        milestone: invoice.milestone,
        status: invoice.status,
        dueDate: formatDate(invoice.dueDate),
      })),
    [engineerInvoices],
  );

  const totals = useMemo(() => {
    const paidInvoices = engineerInvoices.filter((invoice) => invoice.status === "paid");

    return {
      totalEarned: paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
      thisMonth: paidInvoices
        .filter((invoice) => isCurrentMonth(invoice.createdAt))
        .reduce((sum, invoice) => sum + invoice.amount, 0),
      pendingPayout: engineerInvoices
        .filter((invoice) => invoice.status === "pending")
        .reduce((sum, invoice) => sum + invoice.amount, 0),
    };
  }, [engineerInvoices]);

  const monthlyPoints = useMemo<MonthPoint[]>(() => {
    const points = getLastSixMonths();
    const amountByMonth = new Map(points.map((point) => [point.key, { invoice: point.amount, amc: point.amcAmount }]));

    engineerInvoices
      .filter((invoice) => invoice.status === "paid")
      .forEach((invoice) => {
        const key = monthKey(new Date(invoice.createdAt));
        const current = amountByMonth.get(key);
        if (current) {
          amountByMonth.set(key, { ...current, invoice: current.invoice + invoice.amount });
        }
      });

    engineerAMCs
      .filter((contract) => contract.status === "active" || contract.status === "expiring_soon")
      .forEach((contract) => {
        const monthlyAmount = contract.annualAmount / 12;
        points.forEach((point) => {
          const pointDate = new Date(`${point.key}-01T00:00:00`);
          const startsBeforeMonthEnd = new Date(contract.startDate).getTime() <= new Date(pointDate.getFullYear(), pointDate.getMonth() + 1, 0).getTime();
          const endsAfterMonthStart = new Date(contract.endDate).getTime() >= pointDate.getTime();
          const current = amountByMonth.get(point.key);
          if (current && startsBeforeMonthEnd && endsAfterMonthStart) {
            amountByMonth.set(point.key, { ...current, amc: current.amc + monthlyAmount });
          }
        });
      });

    return points.map((point) => ({
      ...point,
      amount: amountByMonth.get(point.key)?.invoice ?? 0,
      amcAmount: amountByMonth.get(point.key)?.amc ?? 0,
    }));
  }, [engineerAMCs, engineerInvoices]);

  const columns = useMemo<ColumnDef<EarningsRow>[]>(
    () => [
      { id: "invoice", header: "Invoice #", accessorKey: "invoiceNumber" },
      { id: "job", header: "Job Title", accessorKey: "jobTitle", searchValue: (row) => row.jobTitle },
      { id: "client", header: "Client", accessorKey: "clientId" },
      {
        id: "amount",
        header: "Amount",
        accessorKey: "amount",
        sortValue: (row) => row.amount,
        cell: (row) => <span className="font-black">{formatCurrency(row.amount)}</span>,
      },
      { id: "milestone", header: "Milestone", accessorKey: "milestone" },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        status: true,
        cell: (row) => <Badge tone={statusTone[row.status]}>{statusLabel(row.status)}</Badge>,
      },
      { id: "due", header: "Due Date", accessorKey: "dueDate" },
    ],
    [],
  );

  const amcRows = useMemo<AMCRow[]>(
    () =>
      engineerAMCs.map((contract) => ({
        contract,
        systemName: contract.job?.title ?? contract.jobId,
        clientId: contract.clientId,
        nextVisit: formatDate(contract.nextVisitDate),
        annualAmount: contract.annualAmount,
        status: contract.status,
      })),
    [engineerAMCs],
  );

  const amcColumns = useMemo<ColumnDef<AMCRow>[]>(
    () => [
      { id: "system", header: "System", accessorKey: "systemName", searchValue: (row) => row.systemName },
      { id: "client", header: "Client Contact", accessorKey: "clientId" },
      { id: "nextVisit", header: "Next Visit", accessorKey: "nextVisit" },
      {
        id: "annual",
        header: "Annual",
        accessorKey: "annualAmount",
        sortValue: (row) => row.annualAmount,
        cell: (row) => <span className="font-black">{formatCurrency(row.annualAmount)}</span>,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        status: true,
        cell: (row) => <Badge tone={amcStatusTone[row.status]}>{amcStatusLabel(row.status)}</Badge>,
      },
    ],
    [],
  );

  const handleRequestPayout = async () => {
    setIsRequestingPayout(true);

    try {
      await invoicesAPI.requestPayout();
      toast.success("Payout request submitted.");
      await invoicesResult.mutate();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        toast.info("Feature coming soon.");
      } else {
        toast.error(error instanceof Error ? error.message : "Unable to request payout.");
      }
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const isLoading = profileResult.isLoading || invoicesResult.isLoading || (!amcMissing && amcResult.isLoading);
  const error = profileResult.error ?? invoicesResult.error ?? (amcMissing ? undefined : amcResult.error);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.12),transparent_32%),linear-gradient(180deg,#fbfaff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="rounded-lg border border-white/60 bg-white/75 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge tone="primary">Engineer earnings</Badge>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Payout Control</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Track paid invoices, monthly earnings, pending payout value, and milestone payment status.
              </p>
            </div>
            <Button
              type="button"
              disabled={totals.pendingPayout <= 0}
              loading={isRequestingPayout}
              onClick={() => void handleRequestPayout()}
              leftIcon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
            >
              Request Payout
            </Button>
          </div>
        </section>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} lines={2} />
            ))}
          </div>
        ) : error ? (
          <ErrorCard message={error.message} onRetry={() => void Promise.all([profileResult.mutate(), invoicesResult.mutate()])} />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card variant="stat" accent="success" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Total earned</p>
                <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(totals.totalEarned)}</p>
              </Card>
              <Card variant="stat" accent="primary" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">This month</p>
                <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(totals.thisMonth)}</p>
              </Card>
              <Card variant="stat" accent="warning" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Pending payout</p>
                <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(totals.pendingPayout)}</p>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card
                variant="dark-glass"
                padding="lg"
                title="Last 6 Months"
                description="Paid invoice value grouped by invoice creation month."
              >
                <BarChartWidget points={monthlyPoints} />
              </Card>

              <Card
                variant="glass"
                padding="lg"
                title="Invoice Ledger"
                description="Milestone earnings from the engineer perspective."
                action={<Badge tone="success">Paid work only counts toward earnings</Badge>}
              >
                <DataTable
                  columns={columns}
                  data={rows}
                  searchPlaceholder="Search earnings..."
                  emptyMessage="No invoices are currently assigned to this engineer account."
                />
              </Card>
            </section>

            <Card
              variant="glass"
              padding="lg"
              title="My AMC Contracts"
              description={amcMissing ? "The AMC endpoint is not enabled yet. Contracts will appear here when the backend is available." : "Upcoming maintenance visits and recurring income by client."}
              action={<Badge tone="success">{formatCurrency(engineerAMCs.reduce((sum, contract) => sum + contract.annualAmount / 12, 0))} monthly AMC</Badge>}
            >
              <DynamicDataTable
                columns={amcColumns}
                data={amcRows}
                searchPlaceholder="Search AMC contracts..."
                emptyMessage="No AMC maintenance contracts are assigned yet."
              />
            </Card>

            <Card variant="glass" padding="lg">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <IndianRupee className="mt-1 h-5 w-5 text-elv-iris" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black text-foreground">UPI-first settlement</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                      Payout requests stay tied to invoice status and milestone approval.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-1 h-5 w-5 text-elv-iris" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black text-foreground">Monthly visibility</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                      Paid invoices are grouped into a six-month operating trend.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download className="mt-1 h-5 w-5 text-elv-iris" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black text-foreground">Audit-ready ledger</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                      Invoice references, clients, milestones, and due dates remain visible in one table.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

export default function EngineerEarningsPage() {
  return (
    <ProtectedRoute requiredRole="service_provider">
      <EngineerEarningsContent />
    </ProtectedRoute>
  );
}
