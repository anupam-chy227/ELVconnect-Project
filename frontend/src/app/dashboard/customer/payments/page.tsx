"use client";

import { useMemo, useState } from "react";
import { CreditCard, FileText, IndianRupee, LockKeyhole, ShieldCheck } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorCard,
  Modal,
  SkeletonCard,
  type BadgeTone,
  type ColumnDef,
} from "@/components/ui";
import { invoicesAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useMyInvoices } from "@/hooks/useSWRData";
import type { Invoice, InvoiceStatus } from "@/types/api";

type InvoiceRow = {
  invoice: Invoice;
  invoiceNumber: string;
  jobTitle: string;
  engineerName: string;
  amount: number;
  milestone: string;
  status: InvoiceStatus;
  dueDate: string;
};

const statusTone: Record<InvoiceStatus, BadgeTone> = {
  pending: "warning",
  paid: "success",
  disputed: "danger",
  refunded: "primary",
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

function getEngineerName(invoice: Invoice) {
  const profile = invoice.engineer?.profile;
  if (!profile) return invoice.engineerId;
  return `${profile.firstName} ${profile.lastName}`.trim();
}

function PaymentModal({
  invoice,
  loading,
  onClose,
  onPay,
}: {
  invoice: Invoice | null;
  loading: boolean;
  onClose: () => void;
  onPay: () => void;
}) {
  return (
    <Modal
      open={Boolean(invoice)}
      title="Secure Payment Release"
      description="Review the invoice milestone before confirming payment."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={loading}
            onClick={onPay}
            leftIcon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
          >
            Pay Now
          </Button>
        </div>
      }
    >
      {invoice ? (
        <div className="grid gap-4">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-elv-iris">Invoice summary</p>
                <p className="mt-2 text-xl font-black text-foreground">{formatCurrency(invoice.amount)}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  {invoice.job?.title ?? invoice.jobId} · {invoice.milestone}
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white text-elv-iris shadow-sm">
                <IndianRupee className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-black text-emerald-900">Payments secured by Razorpay</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">
                UPI-first checkout is prepared for gateway activation. This confirmation updates the invoice status through the existing API.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function CustomerPaymentsContent() {
  const { data, isLoading, error, mutate } = useMyInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const rows = useMemo<InvoiceRow[]>(
    () =>
      (data ?? []).map((invoice) => ({
        invoice,
        invoiceNumber: invoice.invoiceNumber ?? `ELV-${invoice._id.slice(-6).toUpperCase()}`,
        jobTitle: invoice.job?.title ?? invoice.jobId,
        engineerName: getEngineerName(invoice),
        amount: invoice.amount,
        milestone: invoice.milestone,
        status: invoice.status,
        dueDate: formatDate(invoice.dueDate),
      })),
    [data],
  );

  const totals = useMemo(() => {
    const invoices = data ?? [];

    return {
      pending: invoices.filter((invoice) => invoice.status === "pending").reduce((sum, invoice) => sum + invoice.amount, 0),
      paid: invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0),
      disputed: invoices.filter((invoice) => invoice.status === "disputed").length,
    };
  }, [data]);

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      { id: "invoice", header: "Invoice #", accessorKey: "invoiceNumber" },
      { id: "job", header: "Job Title", accessorKey: "jobTitle", searchValue: (row) => row.jobTitle },
      { id: "engineer", header: "Engineer", accessorKey: "engineerName" },
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
      {
        id: "action",
        header: "Action",
        enableSorting: false,
        cell: (row) =>
          row.status === "pending" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setSelectedInvoice(row.invoice)}
              leftIcon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
            >
              Pay Now
            </Button>
          ) : (
            <span className="text-xs font-bold text-muted-foreground">No action</span>
          ),
      },
    ],
    [],
  );

  const handlePay = async () => {
    if (!selectedInvoice) return;
    setIsPaying(true);

    try {
      // TODO: Replace this status update with Razorpay checkout when gateway keys are available.
      await invoicesAPI.updateInvoiceStatus(selectedInvoice._id, "paid");
      await mutate();
      toast.success("Payment successful!");
      setSelectedInvoice(null);
    } catch (payError) {
      toast.error(payError instanceof Error ? payError.message : "Payment failed. Try again.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.12),transparent_32%),linear-gradient(180deg,#fbfaff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="rounded-lg border border-white/60 bg-white/75 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge tone="primary">UPI-first escrow payments</Badge>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Client Payments</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review invoices, release secure payments, and keep milestone spend traceable across every ELV project.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
            >
              Secure release policy
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
          <ErrorCard message={error.message} onRetry={() => mutate()} />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card variant="stat" accent="warning" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Pending release</p>
                <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(totals.pending)}</p>
              </Card>
              <Card variant="stat" accent="success" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Paid invoices</p>
                <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(totals.paid)}</p>
              </Card>
              <Card variant="stat" accent="danger" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Disputes</p>
                <p className="mt-2 text-2xl font-black text-foreground">{totals.disputed}</p>
              </Card>
            </section>

            <Card
              variant="glass"
              padding="lg"
              title="Invoice Ledger"
              description="Track invoice status, milestone context, due dates, and payment release actions."
              action={<Badge tone="success">Razorpay-ready</Badge>}
            >
              <DataTable
                columns={columns}
                data={rows}
                searchPlaceholder="Search invoices..."
                emptyMessage="No invoices are currently available for this client account."
              />
            </Card>

            <Card variant="dark-glass" padding="lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-indigo-100/70">Payment assurance</p>
                  <h2 className="mt-2 text-xl font-black text-white">Release only after milestone evidence is accepted.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
                    ELV Connect keeps invoice decisions tied to job milestones, QA evidence, and auditable payment status.
                  </p>
                </div>
                <FileText className="h-12 w-12 shrink-0 text-indigo-100" aria-hidden="true" />
              </div>
            </Card>
          </>
        )}
      </div>

      <PaymentModal
        invoice={selectedInvoice}
        loading={isPaying}
        onClose={() => setSelectedInvoice(null)}
        onPay={() => void handlePay()}
      />
    </main>
  );
}

export default function CustomerPaymentsPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerPaymentsContent />
    </ProtectedRoute>
  );
}
