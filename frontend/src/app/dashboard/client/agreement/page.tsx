"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  Gavel,
  IndianRupee,
  LockKeyhole,
  MapPin,
  PenLine,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge, Button, Card, Input, Select, Stepper, Textarea, VerificationBadge } from "@/components/ui";
import { cn, progressWidthClass } from "@/components/ui/utils";
import { useAuth } from "@/hooks/useAuth";

type AgreementStatus = "draft" | "approval" | "signed" | "submitted";
type AgreementSection = "scope" | "commercials" | "legal" | "review";
type SystemCategory = "" | "CCTV" | "Fire Safety" | "Access Control" | "Data Networking";
type AmcOption = "" | "Included" | "Optional" | "Not required";
type DisputeResolution = "" | "Client escalation desk" | "Mediator review" | "Delhi arbitration";

type AgreementFormState = {
  workOrderTitle: string;
  clientCompany: string;
  vendorName: string;
  scopeOfWork: string;
  siteAddress: string;
  systemCategory: SystemCategory;
  boqQuantity: string;
  timeline: string;
  paymentMilestones: string;
  advanceAmount: string;
  changeOrderProcess: string;
  warrantyPeriod: string;
  amcOption: AmcOption;
  testingCommissioning: string;
  handoverDocuments: string;
  liabilityLimits: string;
  delayClause: string;
  disputeResolution: DisputeResolution;
  terminationTerms: string;
};

type AgreementErrors = Partial<Record<keyof AgreementFormState, string>>;

type SectionDefinition = {
  id: AgreementSection;
  label: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
};

type StatusDefinition = {
  label: string;
  tone: "neutral" | "primary" | "success" | "warning" | "danger";
  description: string;
};

const formIdPrefix = "client-agreement";

const sections: SectionDefinition[] = [
  {
    id: "scope",
    label: "Scope",
    eyebrow: "Execution brief",
    description: "Work definition, site context, BOQ, and category.",
    icon: Wrench,
  },
  {
    id: "commercials",
    label: "Commercials",
    eyebrow: "Payment control",
    description: "Timeline, milestones, advance, warranty, AMC, and change orders.",
    icon: WalletCards,
  },
  {
    id: "legal",
    label: "Legal",
    eyebrow: "Risk terms",
    description: "Testing, handover, liability, delay, dispute, and termination clauses.",
    icon: Gavel,
  },
  {
    id: "review",
    label: "Review",
    eyebrow: "Digital agreement",
    description: "Approval summary, agreement preview, and signing actions.",
    icon: FileCheck2,
  },
];

const statusDefinitions: Record<AgreementStatus, StatusDefinition> = {
  draft: {
    label: "Draft",
    tone: "neutral",
    description: "Saved locally for client review before approval routing.",
  },
  approval: {
    label: "Sent for approval",
    tone: "warning",
    description: "Ready for internal approval, vendor acknowledgement, and legal review.",
  },
  signed: {
    label: "Signed",
    tone: "success",
    description: "Client signature captured. Submit to lock the work order.",
  },
  submitted: {
    label: "Submitted",
    tone: "primary",
    description: "Agreement package is ready for execution tracking.",
  },
};

const categoryOptions = [
  { label: "CCTV", value: "CCTV" },
  { label: "Fire Safety", value: "Fire Safety" },
  { label: "Access Control", value: "Access Control" },
  { label: "Data Networking", value: "Data Networking" },
];

const amcOptions = [
  { label: "Included", value: "Included" },
  { label: "Optional", value: "Optional" },
  { label: "Not required", value: "Not required" },
];

const disputeOptions = [
  { label: "Client escalation desk", value: "Client escalation desk" },
  { label: "Mediator review", value: "Mediator review" },
  { label: "Delhi arbitration", value: "Delhi arbitration" },
];

const requiredFields: Array<keyof AgreementFormState> = [
  "workOrderTitle",
  "clientCompany",
  "vendorName",
  "scopeOfWork",
  "siteAddress",
  "systemCategory",
  "boqQuantity",
  "timeline",
  "paymentMilestones",
  "advanceAmount",
  "changeOrderProcess",
  "warrantyPeriod",
  "amcOption",
  "testingCommissioning",
  "handoverDocuments",
  "liabilityLimits",
  "delayClause",
  "disputeResolution",
  "terminationTerms",
];

const initialForm: AgreementFormState = {
  workOrderTitle: "",
  clientCompany: "",
  vendorName: "",
  scopeOfWork: "",
  siteAddress: "",
  systemCategory: "",
  boqQuantity: "",
  timeline: "",
  paymentMilestones: "",
  advanceAmount: "",
  changeOrderProcess: "",
  warrantyPeriod: "",
  amcOption: "",
  testingCommissioning: "",
  handoverDocuments: "",
  liabilityLimits: "",
  delayClause: "",
  disputeResolution: "",
  terminationTerms: "",
};

function normalizeAmount(value: string) {
  return Number(value.replace(/,/g, "").trim());
}

function formatAmount(value: string) {
  const amount = normalizeAmount(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Pending";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function validateAgreement(form: AgreementFormState) {
  const nextErrors: AgreementErrors = {};

  if (form.workOrderTitle.trim().length < 6) {
    nextErrors.workOrderTitle = "Add a clear work order title.";
  }

  if (form.clientCompany.trim().length < 2) {
    nextErrors.clientCompany = "Add the client company or authorized client name.";
  }

  if (form.vendorName.trim().length < 2) {
    nextErrors.vendorName = "Add the vendor or engineer firm name.";
  }

  if (form.scopeOfWork.trim().length < 30) {
    nextErrors.scopeOfWork = "Describe the work scope with enough detail for execution and QA.";
  }

  if (form.siteAddress.trim().length < 12) {
    nextErrors.siteAddress = "Add complete site address with city, area, and site identifier.";
  }

  if (!form.systemCategory) {
    nextErrors.systemCategory = "Select a system category.";
  }

  if (form.boqQuantity.trim().length < 6) {
    nextErrors.boqQuantity = "Add BOQ line items, quantity, or measurable deliverables.";
  }

  if (form.timeline.trim().length < 6) {
    nextErrors.timeline = "Add timeline with start, completion, or milestone dates.";
  }

  if (form.paymentMilestones.trim().length < 15) {
    nextErrors.paymentMilestones = "Define payment milestones tied to measurable progress.";
  }

  const advanceAmount = normalizeAmount(form.advanceAmount);

  if (!form.advanceAmount.trim()) {
    nextErrors.advanceAmount = "Add the advance amount.";
  } else if (!Number.isFinite(advanceAmount) || advanceAmount < 0) {
    nextErrors.advanceAmount = "Enter a valid advance amount.";
  }

  if (form.changeOrderProcess.trim().length < 15) {
    nextErrors.changeOrderProcess = "Define how scope, BOQ, and pricing changes are approved.";
  }

  if (form.warrantyPeriod.trim().length < 3) {
    nextErrors.warrantyPeriod = "Add the warranty period.";
  }

  if (!form.amcOption) {
    nextErrors.amcOption = "Select the AMC option.";
  }

  if (form.testingCommissioning.trim().length < 15) {
    nextErrors.testingCommissioning = "Define testing and commissioning acceptance checks.";
  }

  if (form.handoverDocuments.trim().length < 15) {
    nextErrors.handoverDocuments = "List required handover documents.";
  }

  if (form.liabilityLimits.trim().length < 10) {
    nextErrors.liabilityLimits = "Add practical liability limits.";
  }

  if (form.delayClause.trim().length < 15) {
    nextErrors.delayClause = "Define delay notice, cure period, and impact handling.";
  }

  if (!form.disputeResolution) {
    nextErrors.disputeResolution = "Select a dispute resolution path.";
  }

  if (form.terminationTerms.trim().length < 15) {
    nextErrors.terminationTerms = "Define termination notice, settlement, and handover terms.";
  }

  return nextErrors;
}

function getFieldValue(form: AgreementFormState, field: keyof AgreementFormState) {
  return form[field].trim();
}

function useAgreementCompletion(form: AgreementFormState) {
  return useMemo(() => {
    const completedFields = requiredFields.filter((field) => getFieldValue(form, field).length > 0).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  }, [form]);
}

function getSectionStatus(section: AgreementSection, activeSection: AgreementSection, errors: AgreementErrors) {
  const sectionOrder = sections.findIndex((item) => item.id === section);
  const activeOrder = sections.findIndex((item) => item.id === activeSection);
  const fieldsBySection: Record<AgreementSection, Array<keyof AgreementFormState>> = {
    scope: ["workOrderTitle", "clientCompany", "vendorName", "scopeOfWork", "siteAddress", "systemCategory", "boqQuantity"],
    commercials: ["timeline", "paymentMilestones", "advanceAmount", "changeOrderProcess", "warrantyPeriod", "amcOption"],
    legal: ["testingCommissioning", "handoverDocuments", "liabilityLimits", "delayClause", "disputeResolution", "terminationTerms"],
    review: [],
  };
  const hasErrors = fieldsBySection[section].some((field) => Boolean(errors[field]));

  if (hasErrors) {
    return "error" as const;
  }

  if (section === activeSection) {
    return "current" as const;
  }

  if (sectionOrder < activeOrder) {
    return "complete" as const;
  }

  return "upcoming" as const;
}

function SectionHeader({ section }: { section: SectionDefinition }) {
  const Icon = section.icon;

  return (
    <div className="flex flex-col gap-3 border-b border-border-subtle pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{section.eyebrow}</p>
        <h2 className="mt-2 flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/15 bg-primary-subtle text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          {section.label}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{section.description}</p>
      </div>
      <VerificationBadge level="kyc" label="Legal review ready" />
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning";
}) {
  const toneClassNames = {
    primary: "border-primary/15 bg-primary-subtle text-primary",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  };

  return (
    <div className="rounded-md border border-border-subtle bg-surface px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={cn("grid h-7 w-7 place-items-center rounded-md border", toneClassNames[tone])}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-black text-foreground">{value}</p>
    </div>
  );
}

function ReviewSummaryPanel({
  form,
  status,
  completion,
  errorCount,
}: {
  form: AgreementFormState;
  status: AgreementStatus;
  completion: number;
  errorCount: number;
}) {
  const statusMeta = statusDefinitions[status];
  const advanceLabel = formatAmount(form.advanceAmount);

  return (
    <aside className="xl:sticky xl:top-6" aria-label="Agreement review summary">
      <Card variant="glass" padding="lg" className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Agreement control</p>
            <h2 className="mt-2 text-lg font-black text-foreground">Review summary</h2>
          </div>
          <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-black text-muted-foreground">Completion</span>
            <span className="font-mono text-xs font-black text-foreground">{completion}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-surface-muted"
            role="progressbar"
            aria-label="Agreement form completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
          >
            <div className={cn("h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400", progressWidthClass(completion))} />
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{statusMeta.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <SummaryMetric label="Category" value={form.systemCategory || "Not selected"} icon={ShieldCheck} />
          <SummaryMetric label="Advance" value={advanceLabel} icon={IndianRupee} tone="success" />
          <SummaryMetric label="Site" value={form.siteAddress || "Site address required"} icon={MapPin} />
          <SummaryMetric label="Validation" value={errorCount === 0 ? "No active errors" : `${errorCount} issue${errorCount > 1 ? "s" : ""}`} icon={ClipboardCheck} tone={errorCount === 0 ? "success" : "warning"} />
        </div>

        <div className="rounded-md border border-primary/15 bg-primary-subtle p-3">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-black text-foreground">Secure work order flow</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Payment release, QA evidence, handover documents, and dispute escalation remain visible before the client signs.
          </p>
        </div>
      </Card>
    </aside>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-200/80 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] dark:border-white/10">
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold leading-6 text-foreground">{value || "Awaiting client input"}</dd>
    </div>
  );
}

function DigitalAgreementPreview({ form, status }: { form: AgreementFormState; status: AgreementStatus }) {
  return (
    <article
      aria-label="Digital client agreement preview"
      className="rounded-lg border border-border-subtle bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,247,255,0.9))] p-5 shadow-glass dark:border-elv-dark-border dark:bg-elv-dark-1"
    >
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Digital agreement preview</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">
            {form.workOrderTitle || "Client Agreement / Work Order"}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            This preview is generated from the client-entered work order terms for approval, signing, and execution tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusDefinitions[status].tone}>{statusDefinitions[status].label}</Badge>
          <VerificationBadge level="escrow" label="Escrow aware" />
        </div>
      </div>

      <dl className="mt-4">
        <PreviewLine label="Client" value={form.clientCompany} />
        <PreviewLine label="Vendor" value={form.vendorName} />
        <PreviewLine label="Site address" value={form.siteAddress} />
        <PreviewLine label="System category" value={form.systemCategory} />
        <PreviewLine label="Scope of work" value={form.scopeOfWork} />
        <PreviewLine label="BOQ / quantity" value={form.boqQuantity} />
        <PreviewLine label="Timeline" value={form.timeline} />
        <PreviewLine label="Payment milestones" value={form.paymentMilestones} />
        <PreviewLine label="Advance amount" value={formatAmount(form.advanceAmount)} />
        <PreviewLine label="Change order process" value={form.changeOrderProcess} />
        <PreviewLine label="Warranty period" value={form.warrantyPeriod} />
        <PreviewLine label="AMC option" value={form.amcOption} />
        <PreviewLine label="Testing and commissioning" value={form.testingCommissioning} />
        <PreviewLine label="Handover documents" value={form.handoverDocuments} />
        <PreviewLine label="Liability limits" value={form.liabilityLimits} />
        <PreviewLine label="Delay clause" value={form.delayClause} />
        <PreviewLine label="Dispute resolution" value={form.disputeResolution} />
        <PreviewLine label="Termination terms" value={form.terminationTerms} />
      </dl>
    </article>
  );
}

function ClientAgreementContent() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AgreementSection>("scope");
  const [form, setForm] = useState<AgreementFormState>({
    ...initialForm,
    clientCompany: user?.profile.companyName || user?.profile.fullName || "",
  });
  const [errors, setErrors] = useState<AgreementErrors>({});
  const [status, setStatus] = useState<AgreementStatus>("draft");
  const [lastAction, setLastAction] = useState("Draft ready. Complete the sections to enable approval and signing.");

  const completion = useAgreementCompletion(form);
  const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];
  const errorCount = Object.keys(errors).length;
  const activeIndex = sections.findIndex((section) => section.id === activeSection);

  const stepperSteps = sections.map((section) => ({
    label: section.label,
    description: section.eyebrow,
    status: getSectionStatus(section.id, activeSection, errors),
  }));

  function updateField<K extends keyof AgreementFormState>(field: K) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value as AgreementFormState[K];

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((current) => {
          const nextErrors = { ...current };
          delete nextErrors[field];
          return nextErrors;
        });
      }
    };
  }

  function saveDraft() {
    setStatus("draft");
    setLastAction("Draft saved locally for client review.");
  }

  function moveToSection(direction: "next" | "previous") {
    const nextIndex = direction === "next" ? Math.min(activeIndex + 1, sections.length - 1) : Math.max(activeIndex - 1, 0);
    setActiveSection(sections[nextIndex].id);
  }

  function runValidation(nextStatus: AgreementStatus, successMessage: string) {
    const nextErrors = validateAgreement(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setLastAction("Review highlighted fields before changing agreement status.");
      return;
    }

    setStatus(nextStatus);
    setActiveSection("review");
    setLastAction(successMessage);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.16),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f7f5ff_48%,#eef2ff_100%)] px-4 py-6 text-foreground dark:from-elv-dark-0 dark:to-elv-dark-2 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="overflow-hidden rounded-lg border border-white/60 bg-white/75 shadow-glass backdrop-blur-xl dark:border-elv-dark-border dark:bg-elv-dark-1/80">
          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6">
            <div className="min-w-0">
              <Link
                href="/dashboard/client"
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Client dashboard
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <VerificationBadge level="verified" label="Client controlled agreement" />
                <VerificationBadge level="escrow" label="Payment milestone aware" />
                <Badge tone="primary">Legal workflow</Badge>
              </div>
              <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Client Agreement / Work Order
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                Convert approved ELV scope into a signed, payment-aware work order with clear execution terms, QA checkpoints, handover documents, and dispute controls.
              </p>
            </div>

            <div className="rounded-lg border border-white/60 bg-gradient-to-br from-elv-iris to-elv-purple p-4 text-white shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">Secure status</p>
                  <h2 className="mt-2 text-2xl font-black">{statusDefinitions[status].label}</h2>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-md bg-white/15">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/78">{statusDefinitions[status].description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white/12 p-3">
                  <p className="text-[11px] font-bold uppercase text-white/65">Completion</p>
                  <p className="mt-1 font-mono text-xl font-black">{completion}%</p>
                </div>
                <div className="rounded-md bg-white/12 p-3">
                  <p className="text-[11px] font-bold uppercase text-white/65">Issues</p>
                  <p className="mt-1 font-mono text-xl font-black">{errorCount}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Stepper steps={stepperSteps} progress={completion} className="bg-white/75 backdrop-blur-xl dark:bg-elv-dark-1/80" />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6">
            <nav
              className="grid gap-2 rounded-lg border border-border-subtle bg-white/70 p-2 shadow-sm backdrop-blur-xl sm:grid-cols-4 dark:bg-elv-dark-1/70"
              aria-label="Agreement sections"
            >
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                      isActive
                        ? "bg-gradient-to-b from-primary to-primary-container text-on-primary shadow-glow"
                        : "text-muted-foreground hover:bg-primary-subtle hover:text-primary",
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {section.label}
                  </button>
                );
              })}
            </nav>

            <Card variant="glass" padding="lg" className="space-y-6">
              <SectionHeader section={currentSection} />

              {activeSection === "scope" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-scope-heading`}>
                  <h3 id={`${formIdPrefix}-scope-heading`} className="sr-only">
                    Scope of work details
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      id={`${formIdPrefix}-title`}
                      label="Work order title"
                      value={form.workOrderTitle}
                      onChange={updateField("workOrderTitle")}
                      error={errors.workOrderTitle}
                      hint="Use the approved project or site name."
                    />
                    <Input
                      id={`${formIdPrefix}-client`}
                      label="Client company / authorized client"
                      value={form.clientCompany}
                      onChange={updateField("clientCompany")}
                      error={errors.clientCompany}
                    />
                    <Input
                      id={`${formIdPrefix}-vendor`}
                      label="Vendor / engineer firm"
                      value={form.vendorName}
                      onChange={updateField("vendorName")}
                      error={errors.vendorName}
                    />
                    <Select
                      id={`${formIdPrefix}-category`}
                      label="System category"
                      value={form.systemCategory}
                      onChange={updateField("systemCategory")}
                      options={categoryOptions}
                      placeholder="Select category"
                      error={errors.systemCategory}
                    />
                  </div>
                  <Textarea
                    id={`${formIdPrefix}-scope`}
                    label="Scope of work"
                    value={form.scopeOfWork}
                    onChange={updateField("scopeOfWork")}
                    error={errors.scopeOfWork}
                    hint="Include deliverables, exclusions, acceptance basis, and site-specific constraints."
                    className="min-h-36"
                  />
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
                    <Textarea
                      id={`${formIdPrefix}-address`}
                      label="Site address"
                      value={form.siteAddress}
                      onChange={updateField("siteAddress")}
                      error={errors.siteAddress}
                      hint="Include city, area, tower, floor, gate, or site contact zone."
                    />
                    <Textarea
                      id={`${formIdPrefix}-boq`}
                      label="BOQ / quantity"
                      value={form.boqQuantity}
                      onChange={updateField("boqQuantity")}
                      error={errors.boqQuantity}
                      hint="List major quantities, equipment count, cable length, or measurable output."
                    />
                  </div>
                </section>
              ) : null}

              {activeSection === "commercials" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-commercials-heading`}>
                  <h3 id={`${formIdPrefix}-commercials-heading`} className="sr-only">
                    Commercial terms and payment controls
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      id={`${formIdPrefix}-timeline`}
                      label="Timeline"
                      value={form.timeline}
                      onChange={updateField("timeline")}
                      error={errors.timeline}
                      leftIcon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
                    />
                    <Input
                      id={`${formIdPrefix}-advance`}
                      label="Advance amount"
                      value={form.advanceAmount}
                      onChange={updateField("advanceAmount")}
                      error={errors.advanceAmount}
                      inputMode="numeric"
                      leftIcon={<IndianRupee className="h-4 w-4" aria-hidden="true" />}
                    />
                    <Input
                      id={`${formIdPrefix}-warranty`}
                      label="Warranty period"
                      value={form.warrantyPeriod}
                      onChange={updateField("warrantyPeriod")}
                      error={errors.warrantyPeriod}
                    />
                    <Select
                      id={`${formIdPrefix}-amc`}
                      label="AMC option"
                      value={form.amcOption}
                      onChange={updateField("amcOption")}
                      options={amcOptions}
                      placeholder="Select AMC option"
                      error={errors.amcOption}
                    />
                  </div>
                  <Textarea
                    id={`${formIdPrefix}-milestones`}
                    label="Payment milestones"
                    value={form.paymentMilestones}
                    onChange={updateField("paymentMilestones")}
                    error={errors.paymentMilestones}
                    hint="Tie release to survey, installation, QA evidence, testing, or handover acceptance."
                    className="min-h-36"
                  />
                  <Textarea
                    id={`${formIdPrefix}-change-order`}
                    label="Change order process"
                    value={form.changeOrderProcess}
                    onChange={updateField("changeOrderProcess")}
                    error={errors.changeOrderProcess}
                    hint="Define who approves scope change, revised BOQ, price impact, and schedule impact."
                    className="min-h-32"
                  />
                </section>
              ) : null}

              {activeSection === "legal" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-legal-heading`}>
                  <h3 id={`${formIdPrefix}-legal-heading`} className="sr-only">
                    Legal and compliance terms
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Textarea
                      id={`${formIdPrefix}-testing`}
                      label="Testing and commissioning"
                      value={form.testingCommissioning}
                      onChange={updateField("testingCommissioning")}
                      error={errors.testingCommissioning}
                      hint="Define test records, commissioning checklist, and acceptance conditions."
                    />
                    <Textarea
                      id={`${formIdPrefix}-handover`}
                      label="Handover documents"
                      value={form.handoverDocuments}
                      onChange={updateField("handoverDocuments")}
                      error={errors.handoverDocuments}
                      hint="Include invoices, BOQ, as-built layouts, warranty, manuals, and QA evidence."
                    />
                    <Textarea
                      id={`${formIdPrefix}-liability`}
                      label="Liability limits"
                      value={form.liabilityLimits}
                      onChange={updateField("liabilityLimits")}
                      error={errors.liabilityLimits}
                    />
                    <Textarea
                      id={`${formIdPrefix}-delay`}
                      label="Delay clause"
                      value={form.delayClause}
                      onChange={updateField("delayClause")}
                      error={errors.delayClause}
                      hint="Include delay notice, dependency handling, cure period, and escalation path."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-[minmax(280px,0.7fr)_minmax(0,1fr)]">
                    <Select
                      id={`${formIdPrefix}-dispute`}
                      label="Dispute resolution"
                      value={form.disputeResolution}
                      onChange={updateField("disputeResolution")}
                      options={disputeOptions}
                      placeholder="Select dispute path"
                      error={errors.disputeResolution}
                    />
                    <Textarea
                      id={`${formIdPrefix}-termination`}
                      label="Termination terms"
                      value={form.terminationTerms}
                      onChange={updateField("terminationTerms")}
                      error={errors.terminationTerms}
                      hint="Define termination notice, payment settlement, document handover, and site demobilization."
                    />
                  </div>
                </section>
              ) : null}

              {activeSection === "review" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-review-heading`}>
                  <h3 id={`${formIdPrefix}-review-heading`} className="sr-only">
                    Agreement review and preview
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryMetric label="Client" value={form.clientCompany || "Client required"} icon={FileText} />
                    <SummaryMetric label="Vendor" value={form.vendorName || "Vendor required"} icon={ClipboardCheck} />
                    <SummaryMetric label="Advance" value={formatAmount(form.advanceAmount)} icon={Banknote} tone="success" />
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-foreground">Approval readiness</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Validation must pass before the work order can be sent, signed, or submitted.
                        </p>
                      </div>
                      <Badge tone={errorCount === 0 ? "success" : "warning"}>
                        {errorCount === 0 ? "Ready for workflow" : `${errorCount} field${errorCount > 1 ? "s" : ""} need review`}
                      </Badge>
                    </div>
                  </div>
                  <DigitalAgreementPreview form={form} status={status} />
                </section>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-xs font-semibold text-muted-foreground" aria-live="polite">
                  {lastAction}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => moveToSection("previous")}
                    disabled={activeIndex === 0}
                    leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={saveDraft}
                    leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}
                  >
                    Save draft
                  </Button>
                  {activeIndex < sections.length - 1 ? (
                    <Button
                      type="button"
                      onClick={() => moveToSection("next")}
                      rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                    >
                      Continue
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => runValidation("approval", "Agreement sent for approval review.")}
                        leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
                      >
                        Send for approval
                      </Button>
                      <Button
                        type="button"
                        variant="success"
                        onClick={() => runValidation("signed", "Agreement signed by the client authority.")}
                        leftIcon={<PenLine className="h-4 w-4" aria-hidden="true" />}
                      >
                        Sign
                      </Button>
                      <Button
                        type="button"
                        onClick={() => runValidation("submitted", "Agreement submitted for execution tracking.")}
                        leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                      >
                        Submit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <ReviewSummaryPanel form={form} status={status} completion={completion} errorCount={errorCount} />
        </div>

        <section
          className="grid gap-4 rounded-lg border border-border-subtle bg-white/70 p-4 shadow-sm backdrop-blur-xl md:grid-cols-3 dark:bg-elv-dark-1/70"
          aria-label="Client agreement trust controls"
        >
          {[
            {
              title: "Approval gate",
              detail: "Work order status separates draft, approval, signing, and submitted states.",
              icon: ShieldCheck,
            },
            {
              title: "Payment clarity",
              detail: "Advance and milestone terms stay visible before release decisions.",
              icon: Banknote,
            },
            {
              title: "Evidence trail",
              detail: "Testing, commissioning, handover, and delay clauses are part of the signed preview.",
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-md border border-border-subtle bg-surface p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md border border-primary/15 bg-primary-subtle text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h2 className="text-sm font-black text-foreground">{item.title}</h2>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.detail}</p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default function ClientAgreementPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ClientAgreementContent />
    </ProtectedRoute>
  );
}
