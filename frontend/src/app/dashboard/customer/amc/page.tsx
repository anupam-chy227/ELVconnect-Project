"use client";

import { useMemo, useState } from "react";
import { CalendarClock, IndianRupee, Repeat2, ShieldCheck } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Badge,
  Button,
  Card,
  DynamicDataTable,
  ErrorCard,
  Input,
  Modal,
  Select,
  SkeletonCard,
  type BadgeTone,
  type ColumnDef,
} from "@/components/ui";
import { ApiClientError, amcAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useEngineerDirectory, useMyAMCs, useMyJobs, useMyProfile } from "@/hooks/useSWRData";
import type {
  AMCContract,
  AMCStatus,
  AMCVisitFrequency,
  CreateAMCPayload,
  Engineer,
  Job,
} from "@/types/api";

type AMCRow = {
  contract: AMCContract;
  systemName: string;
  engineer: string;
  validUntil: string;
  nextVisit: string;
  annualAmount: number;
  status: AMCStatus;
};

type AMCFormState = {
  jobId: string;
  engineerId: string;
  durationYears: "1" | "2" | "3";
  visitFrequency: AMCVisitFrequency;
  annualAmount: string;
};

const initialForm: AMCFormState = {
  jobId: "",
  engineerId: "",
  durationYears: "1",
  visitFrequency: "quarterly",
  annualAmount: "",
};

const frequencyOptions: Array<{ label: string; value: AMCVisitFrequency }> = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Biannual", value: "biannual" },
  { label: "Annual", value: "annual" },
];

const durationOptions = [
  { label: "1 year", value: "1" },
  { label: "2 years", value: "2" },
  { label: "3 years", value: "3" },
];

const statusTone: Record<AMCStatus, BadgeTone> = {
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

function statusLabel(status: AMCStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function daysUntil(value: string) {
  const end = new Date(value).getTime();
  const now = new Date().getTime();
  return Math.ceil((end - now) / (24 * 60 * 60 * 1000));
}

function deriveStatus(contract: AMCContract): AMCStatus {
  const remainingDays = daysUntil(contract.endDate);
  if (contract.status === "cancelled") return "cancelled";
  if (remainingDays < 0) return "expired";
  if (remainingDays <= 30) return "expiring_soon";
  return contract.status;
}

function engineerName(engineer?: Engineer) {
  if (!engineer) return "";
  return `${engineer.profile.firstName} ${engineer.profile.lastName}`.trim();
}

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function addFrequency(date: Date, frequency: AMCVisitFrequency) {
  const next = new Date(date);
  if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
  if (frequency === "quarterly") next.setMonth(next.getMonth() + 3);
  if (frequency === "biannual") next.setMonth(next.getMonth() + 6);
  if (frequency === "annual") next.setFullYear(next.getFullYear() + 1);
  return next;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function CreateAMCModal({
  open,
  form,
  completedJobs,
  engineers,
  submitting,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  form: AMCFormState;
  completedJobs: Job[];
  engineers: Engineer[];
  submitting: boolean;
  onClose: () => void;
  onChange: (nextForm: AMCFormState) => void;
  onSubmit: () => void;
}) {
  const selectedJob = completedJobs.find((job) => job._id === form.jobId);
  const engineerOptions = engineers.map((engineer) => ({
    label: `${engineerName(engineer)} · ${engineer.profile.city}`,
    value: engineer._id,
  }));

  return (
    <Modal
      open={open}
      title="Set Up New AMC"
      description="Create a maintenance plan for a completed ELV project."
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" loading={submitting} onClick={onSubmit} leftIcon={<Repeat2 className="h-4 w-4" aria-hidden="true" />}>
            Create AMC
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <Select
          id="amc-job"
          label="Completed job"
          placeholder="Select completed job"
          value={form.jobId}
          onChange={(event) => {
            const job = completedJobs.find((item) => item._id === event.target.value);
            onChange({
              ...form,
              jobId: event.target.value,
              engineerId: job?.assignedEngineerId ?? job?.assignedEngineer?._id ?? form.engineerId,
            });
          }}
          options={completedJobs.map((job) => ({ label: `${job.title} · ${job.city}, ${job.area}`, value: job._id }))}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            id="amc-engineer"
            label="Engineer"
            placeholder="Select engineer"
            value={form.engineerId}
            onChange={(event) => onChange({ ...form, engineerId: event.target.value })}
            options={engineerOptions}
          />
          <Select
            id="amc-duration"
            label="Duration"
            value={form.durationYears}
            onChange={(event) => onChange({ ...form, durationYears: event.target.value as AMCFormState["durationYears"] })}
            options={durationOptions}
          />
          <Select
            id="amc-frequency"
            label="Visit frequency"
            value={form.visitFrequency}
            onChange={(event) => onChange({ ...form, visitFrequency: event.target.value as AMCVisitFrequency })}
            options={frequencyOptions}
          />
          <Input
            id="amc-amount"
            label="Annual amount"
            inputMode="numeric"
            value={form.annualAmount}
            onChange={(event) => onChange({ ...form, annualAmount: event.target.value })}
            leftIcon={<IndianRupee className="h-4 w-4" aria-hidden="true" />}
          />
        </div>

        {selectedJob ? (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-black uppercase text-elv-iris">Selected system</p>
            <p className="mt-2 text-sm font-black text-foreground">{selectedJob.title}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {selectedJob.category.replace(/_/g, " ")} · {selectedJob.city}, {selectedJob.area}
            </p>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function CustomerAMCContent() {
  const profileResult = useMyProfile();
  const jobsResult = useMyJobs();
  const amcResult = useMyAMCs();
  const engineersResult = useEngineerDirectory({ limit: 100 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AMCFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const amcMissing = amcResult.error instanceof ApiClientError && amcResult.error.status === 404;
  const contracts = useMemo(() => (amcMissing ? [] : amcResult.data ?? []), [amcMissing, amcResult.data]);
  const completedJobs = useMemo(() => (jobsResult.data ?? []).filter((job) => job.status === "completed"), [jobsResult.data]);
  const engineers = engineersResult.data ?? [];

  const rows = useMemo<AMCRow[]>(
    () =>
      contracts.map((contract) => ({
        contract,
        systemName: contract.job?.title ?? contract.jobId,
        engineer: engineerName(contract.engineer) || contract.engineerId,
        validUntil: formatDate(contract.endDate),
        nextVisit: formatDate(contract.nextVisitDate),
        annualAmount: contract.annualAmount,
        status: deriveStatus(contract),
      })),
    [contracts],
  );

  const stats = useMemo(() => {
    const activeContracts = contracts.filter((contract) => deriveStatus(contract) === "active");
    const expiringThisMonth = contracts.filter((contract) => {
      const remaining = daysUntil(contract.endDate);
      return remaining >= 0 && remaining <= 30;
    });

    return {
      active: activeContracts.length,
      expiring: expiringThisMonth.length,
      annualValue: contracts
        .filter((contract) => deriveStatus(contract) === "active" || deriveStatus(contract) === "expiring_soon")
        .reduce((sum, contract) => sum + contract.annualAmount, 0),
    };
  }, [contracts]);

  const columns = useMemo<ColumnDef<AMCRow>[]>(
    () => [
      { id: "system", header: "System/Job Name", accessorKey: "systemName", searchValue: (row) => row.systemName },
      { id: "engineer", header: "Engineer", accessorKey: "engineer" },
      { id: "valid", header: "Valid Until", accessorKey: "validUntil" },
      { id: "visit", header: "Next Visit", accessorKey: "nextVisit" },
      {
        id: "amount",
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
        cell: (row) => <Badge tone={statusTone[row.status]}>{statusLabel(row.status)}</Badge>,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: (row) =>
          row.status === "expiring_soon" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setForm({
                  jobId: row.contract.jobId,
                  engineerId: row.contract.engineerId,
                  durationYears: "1",
                  visitFrequency: row.contract.visitFrequency,
                  annualAmount: String(row.contract.annualAmount),
                });
                setOpen(true);
              }}
            >
              Renew
            </Button>
          ) : (
            <span className="text-xs font-bold text-muted-foreground">Scheduled</span>
          ),
      },
    ],
    [],
  );

  const handleSubmit = async () => {
    const profile = profileResult.data;
    if (!profile || !form.jobId || !form.engineerId || !form.annualAmount) {
      toast.error("Select job, engineer, frequency, and annual amount.");
      return;
    }

    const startDate = new Date();
    const frequencyDate = addFrequency(startDate, form.visitFrequency);
    const payload: CreateAMCPayload = {
      jobId: form.jobId,
      clientId: profile._id,
      engineerId: form.engineerId,
      startDate: isoDate(startDate),
      endDate: isoDate(addYears(startDate, Number(form.durationYears))),
      annualAmount: Number(form.annualAmount),
      visitFrequency: form.visitFrequency,
      nextVisitDate: isoDate(frequencyDate),
    };

    setSubmitting(true);
    try {
      // TODO: Connect this flow to the deployed AMC endpoint once it is enabled.
      await amcAPI.createContract(payload);
      toast.success("AMC created successfully.");
      await amcResult.mutate();
      setOpen(false);
      setForm(initialForm);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        toast.info("AMC feature coming soon.");
      } else {
        toast.error(error instanceof Error ? error.message : "Unable to create AMC.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = profileResult.isLoading || jobsResult.isLoading || (!amcMissing && amcResult.isLoading);
  const error = profileResult.error ?? jobsResult.error ?? (amcMissing ? undefined : amcResult.error);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.12),transparent_32%),linear-gradient(180deg,#fbfaff_0%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="rounded-lg border border-white/60 bg-white/75 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge tone="primary">Recurring maintenance revenue</Badge>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Annual Maintenance Contracts</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Keep completed ELV systems under planned maintenance with visit cadence, renewal tracking, and annual value visibility.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setOpen(true);
              }}
              leftIcon={<Repeat2 className="h-4 w-4" aria-hidden="true" />}
            >
              Set Up New AMC
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
          <ErrorCard message={error.message} onRetry={() => void Promise.all([profileResult.mutate(), jobsResult.mutate(), amcResult.mutate()])} />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Card variant="stat" accent="success" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Active AMCs</p>
                <p className="mt-2 text-2xl font-black text-foreground">{stats.active}</p>
              </Card>
              <Card variant="stat" accent="warning" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Expiring this month</p>
                <p className="mt-2 text-2xl font-black text-foreground">{stats.expiring}</p>
              </Card>
              <Card variant="stat" accent="primary" padding="lg">
                <p className="text-xs font-black uppercase text-muted-foreground">Total annual value</p>
                <p className="mt-2 text-2xl font-black text-foreground">{formatCurrency(stats.annualValue)}</p>
              </Card>
            </section>

            <Card
              variant="glass"
              padding="lg"
              title="AMC Portfolio"
              description={amcMissing ? "The AMC endpoint is not enabled yet. Setup actions will show a coming-soon toast." : "Active and expiring maintenance contracts."}
              action={<Badge tone="success">Visit-led retention</Badge>}
            >
              <DynamicDataTable
                columns={columns}
                data={rows}
                searchPlaceholder="Search AMCs..."
                emptyMessage="No AMC contracts yet. Set up a maintenance plan from a completed job."
              />
            </Card>

            <Card variant="dark-glass" padding="lg">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-indigo-100" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black text-white">Compliance continuity</p>
                    <p className="mt-1 text-xs leading-5 text-indigo-100/75">Schedule visits before critical ELV systems drift out of audit readiness.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-1 h-5 w-5 text-indigo-100" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black text-white">Renewal visibility</p>
                    <p className="mt-1 text-xs leading-5 text-indigo-100/75">Contracts expiring within 30 days are promoted with a renewal action.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IndianRupee className="mt-1 h-5 w-5 text-indigo-100" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black text-white">Recurring value</p>
                    <p className="mt-1 text-xs leading-5 text-indigo-100/75">Annual value is tracked alongside project delivery and invoice spend.</p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <CreateAMCModal
        open={open}
        form={form}
        completedJobs={completedJobs}
        engineers={engineers}
        submitting={submitting}
        onClose={() => setOpen(false)}
        onChange={setForm}
        onSubmit={() => void handleSubmit()}
      />
    </main>
  );
}

export default function CustomerAMCPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerAMCContent />
    </ProtectedRoute>
  );
}
