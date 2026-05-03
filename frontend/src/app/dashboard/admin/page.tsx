"use client";

import { type ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileArchive,
  FileCheck2,
  Flag,
  PauseCircle,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
  XCircle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorCard,
  Modal,
  Select,
  SkeletonCard,
  SkeletonTable,
  Textarea,
  VerificationBadge,
  type ColumnDef,
} from "@/components/ui";
import { progressWidthClass } from "@/components/ui/utils";
import { adminAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useEngineerDirectory, usePendingVerifications } from "@/hooks/useSWRData";
import type {
  AdminStats,
  Engineer,
  EngineerTier,
  Job,
  User,
  UserDocument,
} from "@/types/api";

type RiskLevel = "Low" | "Medium" | "High";
type VendorScoreState = "Excellent" | "Good" | "At Risk";

type VerificationRow = {
  user: User;
  name: string;
  city: string;
  categories: string[];
  docsCount: number;
  appliedDate: string;
  risk: RiskLevel;
};

type VendorRow = {
  engineer: Engineer;
  name: string;
  tier: EngineerTier;
  rating: number;
  completionRate: number;
  totalJobs: number;
  complaints: number;
  score: number;
  state: VendorScoreState;
};

type JobModerationRow = {
  job: Job;
  risk: RiskLevel;
  escrowExposure: number;
};

const tierOptions: Array<{ label: string; value: EngineerTier }> = [
  { label: "Silver", value: "silver" },
  { label: "Gold", value: "gold" },
  { label: "Platinum", value: "platinum" },
  { label: "Specialist", value: "specialist" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value?: string) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function categoryLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function tierLabel(value: EngineerTier) {
  return (value.charAt(0).toUpperCase() + value.slice(1)) as "Silver" | "Gold" | "Platinum" | "Specialist";
}

function statusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getRiskTone(risk: RiskLevel) {
  if (risk === "Low") return "success";
  if (risk === "Medium") return "warning";
  return "danger";
}

function getScoreState(score: number): VendorScoreState {
  if (score >= 80) return "Excellent";
  if (score >= 50) return "Good";
  return "At Risk";
}

function getScoreTone(state: VendorScoreState) {
  if (state === "Excellent") return "success";
  if (state === "Good") return "warning";
  return "danger";
}

function getDocuments(user: User): UserDocument[] {
  return user.documents ?? [];
}

function hasDocument(documents: UserDocument[], keyword: string) {
  const normalizedKeyword = keyword.toLowerCase();
  return documents.some((document) => {
    const haystack = `${document.documentType} ${document.fileName ?? ""}`.toLowerCase();
    return haystack.includes(normalizedKeyword);
  });
}

function calculateVerificationRisk(user: User): RiskLevel {
  const provider = user.serviceProvider;
  const documents = getDocuments(user);
  const hasGst = Boolean(provider?.gstNumber || hasDocument(documents, "gst"));
  const hasExperience = Boolean(provider?.yearsOfExperience || hasDocument(documents, "experience"));
  const hasThreeCategories = (provider?.categories.length ?? 0) >= 3;

  if (hasGst && hasExperience && hasThreeCategories) return "Low";
  if (documents.length > 0 || hasGst || Boolean(provider?.yearsOfExperience)) return "Medium";
  return "High";
}

function calculateVendorScore(engineer: Engineer) {
  const complaints = engineer.serviceProvider.complaints ?? 0;
  const rawScore =
    engineer.serviceProvider.rating * 20 +
    engineer.serviceProvider.completionRate * 0.4 +
    engineer.serviceProvider.totalJobs * 0.5 -
    complaints * 10;

  return clampScore(rawScore);
}

function calculateJobRisk(job: Job): RiskLevel {
  if (job.complianceLevel === "critical" || job.urgency === "emergency") return "High";
  if (job.complianceLevel === "high" || job.urgency === "urgent") return "Medium";
  return "Low";
}

function exportCsv(fileName: string, rows: string[][]) {
  const content = rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: "primary" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <Card variant="stat" accent={tone === "info" ? "info" : tone} padding="lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">{detail}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-md border border-indigo-100 bg-indigo-50 text-elv-iris">
          {icon}
        </span>
      </div>
    </Card>
  );
}

function PlatformHealthPill({ stats }: { stats?: AdminStats }) {
  const pending = stats?.pendingVerifications ?? 0;
  const activeJobs = stats?.activeJobs ?? 0;
  const healthy = pending < 10 && activeJobs > 0;
  const attention = pending > 20;
  const label = healthy ? "HEALTHY" : attention ? "NEEDS ATTENTION" : "MONITORING";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
        attention
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
      aria-label={`Platform health ${label}`}
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

function OperationsOverview({ stats, jobs }: { stats?: AdminStats; jobs: Job[] }) {
  const chartRows = [
    { label: "Active jobs", value: stats?.activeJobs ?? 0, total: Math.max(stats?.totalJobs ?? 1, 1), tone: "bg-elv-iris" },
    {
      label: "Completed jobs",
      value: stats?.completedJobs ?? 0,
      total: Math.max(stats?.totalJobs ?? 1, 1),
      tone: "bg-emerald-500",
    },
    {
      label: "Pending verification",
      value: stats?.pendingVerifications ?? 0,
      total: Math.max((stats?.pendingVerifications ?? 0) + 25, 25),
      tone: "bg-amber-500",
    },
    {
      label: "Urgent jobs",
      value: jobs.filter((job) => job.urgency !== "normal").length,
      total: Math.max(jobs.length, 1),
      tone: "bg-rose-500",
    },
  ];

  return (
    <Card
      variant="glass"
      padding="lg"
      title="Operations Overview"
      description="Live load, completion, verification pressure, and urgent field demand."
      action={<Badge tone="primary">30s refresh</Badge>}
    >
      <div className="grid gap-4">
        {chartRows.map((row) => {
          const percentage = (row.value / row.total) * 100;

          return (
            <div key={row.label} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-foreground">{row.label}</span>
                <span className="font-black text-muted-foreground">{formatNumber(row.value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${row.tone} ${progressWidthClass(percentage)}`} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AlertFeed({ stats, jobs }: { stats?: AdminStats; jobs: Job[] }) {
  const alerts = [
    {
      id: "verifications",
      icon: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
      tone: stats && stats.pendingVerifications > 20 ? "danger" : "warning",
      message: `${formatNumber(stats?.pendingVerifications ?? 0)} verification files require admin review.`,
      action: "Review queue",
    },
    {
      id: "urgent-jobs",
      icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
      tone: jobs.some((job) => job.urgency === "emergency") ? "danger" : "neutral",
      message: `${jobs.filter((job) => job.urgency === "emergency").length} emergency jobs are visible in moderation.`,
      action: "Check SLA",
    },
    {
      id: "revenue",
      icon: <Banknote className="h-4 w-4" aria-hidden="true" />,
      tone: "success",
      message: `${formatCurrency(stats?.totalRevenue ?? 0)} tracked in platform revenue controls.`,
      action: "Export report",
    },
  ] as const;

  return (
    <Card
      variant="dark-glass"
      padding="lg"
      title="Real-Time Alert Feed"
      description="Compliance and execution signals derived from live platform data."
    >
      <div className="grid gap-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border border-white/10 bg-white/10 p-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/10 text-white">
                {alert.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{alert.message}</p>
                <p className="mt-1 text-xs font-semibold text-indigo-100/75">{alert.action}</p>
              </div>
              <Badge tone={alert.tone}>{alert.tone.toUpperCase()}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DocumentViewerModal({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const documents = user ? getDocuments(user) : [];

  return (
    <Modal
      open={Boolean(user)}
      title="Verification Documents"
      description={user ? `${user.profile.firstName} ${user.profile.lastName}` : undefined}
      size="lg"
      onClose={onClose}
    >
      {documents.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((document) => {
            const url = document.signedUrl ?? document.url;

            return (
              <button
                key={document._id}
                type="button"
                onClick={() => {
                  if (url) window.open(url, "_blank", "noopener,noreferrer");
                }}
                disabled={!url}
                className="flex items-start gap-3 rounded-lg border border-elv-border bg-elv-surface-2 p-3 text-left transition hover:border-elv-iris disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Open ${document.documentType} document`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white text-elv-iris shadow-sm">
                  <FileArchive className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-black text-foreground">{categoryLabel(document.documentType)}</span>
                  <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                    {document.fileName ?? "Secure document"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-elv-border bg-elv-surface-2 p-8 text-center">
          <FileArchive className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-foreground">No documents uploaded for this verification file.</p>
        </div>
      )}
    </Modal>
  );
}

function RejectVerificationModal({
  row,
  reason,
  isSubmitting,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  row: VerificationRow | null;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const error = reason.trim().length > 0 && reason.trim().length < 20 ? "Reason must be at least 20 characters." : undefined;

  return (
    <Modal
      open={Boolean(row)}
      title="Reject Verification"
      description={row ? `Add an auditable reason for rejecting ${row.name}.` : undefined}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={isSubmitting}
            disabled={Boolean(error) || reason.trim().length < 20}
            onClick={onConfirm}
            leftIcon={<XCircle className="h-4 w-4" aria-hidden="true" />}
          >
            Confirm Reject
          </Button>
        </div>
      }
    >
      <Textarea
        id="reject-reason"
        label="Reason for rejection"
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        error={error}
        placeholder="Explain missing legal documents, unclear service area, or technical verification gaps."
      />
    </Modal>
  );
}

function TierModal({
  vendor,
  tier,
  isSubmitting,
  onTierChange,
  onClose,
  onConfirm,
}: {
  vendor: VendorRow | null;
  tier: EngineerTier;
  isSubmitting: boolean;
  onTierChange: (tier: EngineerTier) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={Boolean(vendor)}
      title="Promote Vendor Tier"
      description={vendor ? `Update marketplace tier for ${vendor.name}.` : undefined}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={isSubmitting}
            onClick={onConfirm}
            leftIcon={<BadgeCheck className="h-4 w-4" aria-hidden="true" />}
          >
            Save Tier
          </Button>
        </div>
      }
    >
      <Select
        id="vendor-tier"
        label="New tier"
        value={tier}
        onChange={(event) => onTierChange(event.target.value as EngineerTier)}
        options={tierOptions}
      />
    </Modal>
  );
}

function AdminCommandCenterContent() {
  const router = useRouter();
  const statsResult = useSWR<AdminStats>("/admin/stats", adminAPI.getDashboardStats, {
    refreshInterval: 30000,
  });
  const jobsResult = useSWR<Job[]>("/admin/jobs", () => adminAPI.getAllJobs({ limit: 100 }), {
    refreshInterval: 30000,
  });
  const pendingResult = usePendingVerifications();
  const engineersResult = useEngineerDirectory({ limit: 100 });
  const [documentsUser, setDocumentsUser] = useState<User | null>(null);
  const [rejectRow, setRejectRow] = useState<VerificationRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [tierRow, setTierRow] = useState<VendorRow | null>(null);
  const [selectedTier, setSelectedTier] = useState<EngineerTier>("silver");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const jobs = useMemo(() => jobsResult.data ?? [], [jobsResult.data]);
  const pendingUsers = useMemo(() => pendingResult.data ?? [], [pendingResult.data]);
  const engineers = useMemo(() => engineersResult.data ?? [], [engineersResult.data]);

  const verificationRows = useMemo<VerificationRow[]>(
    () =>
      pendingUsers
        .filter((user) => user.role === "service_provider")
        .map((user) => ({
          user,
          name: `${user.profile.firstName} ${user.profile.lastName}`.trim(),
          city: user.profile.city,
          categories: user.serviceProvider?.categories ?? [],
          docsCount: getDocuments(user).length,
          appliedDate: formatDate(user.createdAt),
          risk: calculateVerificationRisk(user),
        })),
    [pendingUsers],
  );

  const vendorRows = useMemo<VendorRow[]>(
    () =>
      engineers.map((engineer) => {
        const score = calculateVendorScore(engineer);
        const state = getScoreState(score);

        return {
          engineer,
          name: `${engineer.profile.firstName} ${engineer.profile.lastName}`.trim(),
          tier: engineer.serviceProvider.tier,
          rating: engineer.serviceProvider.rating,
          completionRate: engineer.serviceProvider.completionRate,
          totalJobs: engineer.serviceProvider.totalJobs,
          complaints: engineer.serviceProvider.complaints ?? 0,
          score,
          state,
        };
      }),
    [engineers],
  );

  const jobModerationRows = useMemo<JobModerationRow[]>(
    () =>
      jobs.map((job) => ({
        job,
        risk: calculateJobRisk(job),
        escrowExposure: Math.round((job.budgetMin + job.budgetMax) / 2),
      })),
    [jobs],
  );

  const verificationColumns = useMemo<ColumnDef<VerificationRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        searchValue: (row) => row.name,
        cell: (row) => (
          <div>
            <p className="font-black text-foreground">{row.name || "Unnamed engineer"}</p>
            <p className="text-xs font-semibold text-muted-foreground">{row.user.email}</p>
          </div>
        ),
      },
      { id: "city", header: "City", accessorKey: "city" },
      {
        id: "category",
        header: "Category",
        accessorFn: (row) => row.categories.join(" "),
        cell: (row) => (
          <div className="flex flex-wrap gap-1.5">
            {row.categories.slice(0, 2).map((category) => (
              <Badge key={category} tone="primary">
                {categoryLabel(category)}
              </Badge>
            ))}
            {row.categories.length > 2 ? <Badge tone="neutral">+{row.categories.length - 2}</Badge> : null}
          </div>
        ),
      },
      { id: "docs", header: "Docs Count", accessorKey: "docsCount", sortValue: (row) => row.docsCount },
      { id: "date", header: "Applied Date", accessorKey: "appliedDate" },
      {
        id: "risk",
        header: "Risk Score",
        accessorKey: "risk",
        status: true,
        cell: (row) => <Badge tone={getRiskTone(row.risk)}>{row.risk}</Badge>,
      },
    ],
    [],
  );

  const vendorColumns = useMemo<ColumnDef<VendorRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        searchValue: (row) => row.name,
        cell: (row) => (
          <div>
            <p className="font-black text-foreground">{row.name || "Unnamed vendor"}</p>
            <p className="text-xs font-semibold text-muted-foreground">{row.engineer.profile.city}</p>
          </div>
        ),
      },
      { id: "tier", header: "Tier", accessorKey: "tier", cell: (row) => <Badge tier={tierLabel(row.tier)} /> },
      { id: "rating", header: "Rating", accessorKey: "rating", sortValue: (row) => row.rating },
      {
        id: "completion",
        header: "Completion%",
        accessorKey: "completionRate",
        sortValue: (row) => row.completionRate,
        cell: (row) => `${Math.round(row.completionRate)}%`,
      },
      { id: "jobs", header: "Total Jobs", accessorKey: "totalJobs" },
      { id: "complaints", header: "Complaints", accessorKey: "complaints" },
      {
        id: "score",
        header: "Score",
        accessorKey: "score",
        status: true,
        cell: (row) => (
          <Badge tone={getScoreTone(row.state)}>
            {row.state} · {row.score}
          </Badge>
        ),
      },
    ],
    [],
  );

  const jobColumns = useMemo<ColumnDef<JobModerationRow>[]>(
    () => [
      {
        id: "job",
        header: "Job",
        searchValue: (row) => row.job.title,
        cell: (row) => (
          <div>
            <p className="font-black text-foreground">{row.job.title}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              {row.job.city}, {row.job.area}
            </p>
          </div>
        ),
      },
      { id: "category", header: "Category", accessorFn: (row) => categoryLabel(row.job.category) },
      { id: "status", header: "Status", accessorFn: (row) => statusLabel(row.job.status), status: true },
      { id: "urgency", header: "Urgency", accessorFn: (row) => statusLabel(row.job.urgency) },
      {
        id: "budget",
        header: "Escrow Exposure",
        accessorKey: "escrowExposure",
        sortValue: (row) => row.escrowExposure,
        cell: (row) => formatCurrency(row.escrowExposure),
      },
      {
        id: "risk",
        header: "Risk",
        accessorKey: "risk",
        status: true,
        cell: (row) => <Badge tone={getRiskTone(row.risk)}>{row.risk}</Badge>,
      },
    ],
    [],
  );

  const handleApprove = async (row: VerificationRow) => {
    setPendingActionId(row.user._id);
    await pendingResult.mutate(
      (current) => current?.filter((user) => user._id !== row.user._id),
      { revalidate: false },
    );

    try {
      await adminAPI.approveVerification(row.user._id);
      toast.success("Engineer verified!");
      await pendingResult.mutate();
      await statsResult.mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification approval failed.");
      await pendingResult.mutate();
    } finally {
      setPendingActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectRow || rejectReason.trim().length < 20) return;
    setPendingActionId(rejectRow.user._id);

    try {
      await adminAPI.rejectVerification(rejectRow.user._id, rejectReason.trim());
      toast.warning("Verification rejected.");
      await pendingResult.mutate(
        (current) => current?.filter((user) => user._id !== rejectRow.user._id),
        { revalidate: false },
      );
      await statsResult.mutate();
      setRejectRow(null);
      setRejectReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification rejection failed.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleTierSave = async () => {
    if (!tierRow) return;
    setPendingActionId(tierRow.engineer._id);

    try {
      await adminAPI.updateEngineerTier(tierRow.engineer._id, selectedTier);
      toast.success("Vendor tier updated.");
      await engineersResult.mutate();
      setTierRow(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tier update failed.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleSuspend = async (row: VendorRow) => {
    const confirmed = window.confirm(`Pause ${row.name || "this vendor"} account?`);
    if (!confirmed) return;

    setPendingActionId(row.engineer._id);
    try {
      await adminAPI.suspendUser(row.engineer._id);
      toast.warning("Vendor account paused.");
      await engineersResult.mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to pause vendor account.");
    } finally {
      setPendingActionId(null);
    }
  };

  const exportVerificationQueue = () => {
    exportCsv("elv-verification-queue.csv", [
      ["Name", "Email", "City", "Categories", "Docs Count", "Applied Date", "Risk"],
      ...verificationRows.map((row) => [
        row.name,
        row.user.email,
        row.city,
        row.categories.map(categoryLabel).join("; "),
        String(row.docsCount),
        row.appliedDate,
        row.risk,
      ]),
    ]);
    toast.success("Verification export ready.");
  };

  const exportJobs = () => {
    exportCsv("elv-job-moderation.csv", [
      ["Job", "City", "Area", "Category", "Status", "Urgency", "Escrow Exposure", "Risk"],
      ...jobModerationRows.map((row) => [
        row.job.title,
        row.job.city,
        row.job.area,
        categoryLabel(row.job.category),
        statusLabel(row.job.status),
        statusLabel(row.job.urgency),
        String(row.escrowExposure),
        row.risk,
      ]),
    ]);
    toast.success("Job export ready.");
  };

  const stats = statsResult.data;
  const statsError = statsResult.error instanceof Error ? statsResult.error.message : undefined;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.14),transparent_32%),linear-gradient(180deg,#fbfaff_0%,#f8fafc_45%,#ffffff_100%)] px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="overflow-hidden rounded-lg border border-white/60 bg-white/75 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary">Admin Command Center</Badge>
                <PlatformHealthPill stats={stats} />
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-black text-elv-iris">
                  <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                  Live platform status
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 lg:text-4xl">
                ELV Connect Control Tower
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Monitor verification, field execution, escrow exposure, vendor quality, and compliance actions from one auditable surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}
                onClick={exportVerificationQueue}
              >
                Export Queue
              </Button>
              <Button
                type="button"
                leftIcon={<FileCheck2 className="h-4 w-4" aria-hidden="true" />}
                onClick={exportJobs}
              >
                Export Jobs
              </Button>
            </div>
          </div>
        </section>

        {statsResult.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} lines={2} />
            ))}
          </div>
        ) : statsResult.error ? (
          <ErrorCard message={statsError} onRetry={() => statsResult.mutate()} />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Total users"
              value={formatNumber(stats?.totalUsers ?? 0)}
              detail="Customers, engineers, and admins"
              tone="primary"
              icon={<UsersRound className="h-5 w-5" aria-hidden="true" />}
            />
            <MetricCard
              label="Active jobs"
              value={formatNumber(stats?.activeJobs ?? 0)}
              detail="Open, assigned, and in-progress"
              tone="success"
              icon={<BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />}
            />
            <MetricCard
              label="Pending verifications"
              value={formatNumber(stats?.pendingVerifications ?? 0)}
              detail="Files waiting for approval"
              tone={(stats?.pendingVerifications ?? 0) > 20 ? "danger" : "warning"}
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            />
            <MetricCard
              label="Total revenue"
              value={formatCurrency(stats?.totalRevenue ?? 0)}
              detail="Tracked through platform invoices"
              tone="info"
              icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
            />
            <MetricCard
              label="New signups today"
              value={formatNumber(stats?.newSignupsToday ?? 0)}
              detail="Fresh marketplace demand and supply"
              tone="primary"
              icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
            />
            <MetricCard
              label="Jobs posted today"
              value={formatNumber(stats?.jobsPostedToday ?? 0)}
              detail="New execution opportunities"
              tone="success"
              icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
            />
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <OperationsOverview stats={stats} jobs={jobs} />
          <AlertFeed stats={stats} jobs={jobs} />
        </section>

        <section className="grid gap-6">
          <Card
            variant="glass"
            padding="lg"
            title="Verification Queue"
            description="Approve, reject, or review pending service provider files with client-side risk scoring."
            action={<VerificationBadge level="review" label={`${verificationRows.length} pending`} />}
          >
            {pendingResult.isLoading ? (
              <SkeletonTable rows={6} columns={6} />
            ) : pendingResult.error ? (
              <ErrorCard onRetry={() => pendingResult.mutate()} />
            ) : (
              <DataTable
                columns={verificationColumns}
                data={verificationRows}
                searchPlaceholder="Search verification queue..."
                emptyMessage="No pending service provider verifications are waiting for review."
                actions={(row) => [
                  {
                    label: "Approve",
                    icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
                    disabled: pendingActionId === row.user._id,
                    onClick: () => void handleApprove(row),
                  },
                  {
                    label: "Reject",
                    icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
                    destructive: true,
                    disabled: pendingActionId === row.user._id,
                    onClick: () => {
                      setRejectRow(row);
                      setRejectReason("");
                    },
                  },
                  {
                    label: "View Documents",
                    icon: <Eye className="h-4 w-4" aria-hidden="true" />,
                    onClick: () => setDocumentsUser(row.user),
                  },
                ]}
              />
            )}
          </Card>

          <Card
            variant="glass"
            padding="lg"
            title="Vendor Management"
            description="Rank service providers by quality, completion, volume, and complaint-adjusted score."
          >
            {engineersResult.isLoading ? (
              <SkeletonTable rows={6} columns={7} />
            ) : engineersResult.error ? (
              <ErrorCard onRetry={() => engineersResult.mutate()} />
            ) : (
              <DataTable
                columns={vendorColumns}
                data={vendorRows}
                searchPlaceholder="Search vendors..."
                emptyMessage="No service providers are available in the current directory response."
                actions={(row) => [
                  {
                    label: "Promote Tier",
                    icon: <BadgeCheck className="h-4 w-4" aria-hidden="true" />,
                    disabled: pendingActionId === row.engineer._id,
                    onClick: () => {
                      setTierRow(row);
                      setSelectedTier(row.tier);
                    },
                  },
                  {
                    label: "Pause Account",
                    icon: <PauseCircle className="h-4 w-4" aria-hidden="true" />,
                    destructive: true,
                    disabled: pendingActionId === row.engineer._id,
                    onClick: () => void handleSuspend(row),
                  },
                  {
                    label: "View Full Profile",
                    icon: <Eye className="h-4 w-4" aria-hidden="true" />,
                    onClick: () => router.push(`/dashboard/admin/engineers/${row.engineer._id}`),
                  },
                ]}
              />
            )}
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card
            variant="elevated"
            padding="lg"
            title="Job Moderation"
            description="Review risk, compliance level, urgency, and estimated escrow exposure by job."
          >
            {jobsResult.isLoading ? (
              <SkeletonTable rows={5} columns={6} />
            ) : jobsResult.error ? (
              <ErrorCard onRetry={() => jobsResult.mutate()} />
            ) : (
              <DataTable
                columns={jobColumns}
                data={jobModerationRows}
                searchPlaceholder="Search jobs..."
                emptyMessage="No jobs are currently visible for admin moderation."
                actions={(row) => [
                  {
                    label: "Hold",
                    icon: <PauseCircle className="h-4 w-4" aria-hidden="true" />,
                    onClick: () => toast.info(`Hold review logged for ${row.job.title}.`),
                  },
                  {
                    label: "Release",
                    icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
                    onClick: () => toast.success(`Release review logged for ${row.job.title}.`),
                  },
                  {
                    label: "Flag",
                    icon: <Flag className="h-4 w-4" aria-hidden="true" />,
                    destructive: true,
                    onClick: () => toast.warning(`Risk flag logged for ${row.job.title}.`),
                  },
                ]}
              />
            )}
          </Card>

          <div className="grid gap-6">
            <Card
              variant="dark-glass"
              padding="lg"
              title="Payment and Escrow Control"
              description="Escrow exposure is estimated from active job budget ranges."
            >
              <div className="grid gap-3">
                <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-black uppercase text-indigo-100/70">Estimated escrow exposure</p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {formatCurrency(jobModerationRows.reduce((sum, row) => sum + row.escrowExposure, 0))}
                  </p>
                </div>
                <div className="grid gap-2">
                  {jobModerationRows.slice(0, 4).map((row) => (
                    <div key={row.job._id} className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2">
                      <span className="truncate text-sm font-bold text-white">{row.job.title}</span>
                      <span className="shrink-0 text-sm font-black text-indigo-100">{formatCurrency(row.escrowExposure)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card
              variant="glass"
              padding="lg"
              title="QA and Audit"
              description="Evidence and audit checkpoints for high-compliance field execution."
            >
              <div className="grid gap-3">
                {[
                  ["Open audit files", jobs.filter((job) => job.status === "in_progress").length],
                  ["Critical compliance jobs", jobs.filter((job) => job.complianceLevel === "critical").length],
                  ["Completed handovers", stats?.completedJobs ?? 0],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-elv-border bg-white p-3">
                    <span className="text-sm font-bold text-foreground">{label}</span>
                    <Badge tone="primary">{formatNumber(Number(value))}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card
            variant="glass"
            padding="lg"
            title="AI Insights"
            description="Delay prediction based on urgency, active volume, and verification pressure."
          >
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <Sparkles className="h-5 w-5 text-elv-iris" aria-hidden="true" />
              <p className="mt-3 text-sm font-bold text-foreground">
                {jobs.some((job) => job.urgency === "emergency")
                  ? "Emergency work is increasing delay risk. Prioritize verified specialist capacity."
                  : "Current delay risk is controlled. Keep verification throughput under 20 pending files."}
              </p>
            </div>
          </Card>

          <Card
            variant="glass"
            padding="lg"
            title="Dispute Queue"
            description="Payment and quality issues that need admin action."
          >
            <div className="rounded-lg border border-dashed border-elv-border bg-white p-6 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
              <p className="mt-3 text-sm font-black text-foreground">
                No disputed invoices are exposed by the current API response.
              </p>
            </div>
          </Card>

          <Card
            variant="glass"
            padding="lg"
            title="Reports / Exports"
            description="Generate operational CSVs for weekly platform review."
          >
            <div className="grid gap-2">
              <Button
                type="button"
                variant="secondary"
                leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}
                onClick={exportVerificationQueue}
                fullWidth
              >
                Verification CSV
              </Button>
              <Button
                type="button"
                variant="secondary"
                leftIcon={<Download className="h-4 w-4" aria-hidden="true" />}
                onClick={exportJobs}
                fullWidth
              >
                Job Moderation CSV
              </Button>
              <Button
                type="button"
                variant="ghost"
                leftIcon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
                onClick={() => toast.info("Audit pack export will use backend report endpoints when available.")}
                fullWidth
              >
                Audit Pack
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <DocumentViewerModal user={documentsUser} onClose={() => setDocumentsUser(null)} />
      <RejectVerificationModal
        row={rejectRow}
        reason={rejectReason}
        isSubmitting={Boolean(pendingActionId && rejectRow?.user._id === pendingActionId)}
        onReasonChange={setRejectReason}
        onClose={() => {
          setRejectRow(null);
          setRejectReason("");
        }}
        onConfirm={() => void handleReject()}
      />
      <TierModal
        vendor={tierRow}
        tier={selectedTier}
        isSubmitting={Boolean(pendingActionId && tierRow?.engineer._id === pendingActionId)}
        onTierChange={setSelectedTier}
        onClose={() => setTierRow(null)}
        onConfirm={() => void handleTierSave()}
      />
    </main>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminCommandCenterContent />
    </ProtectedRoute>
  );
}
