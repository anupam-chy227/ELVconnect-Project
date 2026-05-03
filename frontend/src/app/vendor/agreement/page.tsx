"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gavel,
  Handshake,
  LockKeyhole,
  PenLine,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Input, Select, Stepper, Textarea, VerificationBadge } from "@/components/ui";
import { cn, progressWidthClass } from "@/components/ui/utils";

type VendorAgreementStatus = "draft" | "review" | "accepted" | "submitted";
type AgreementSection = "responsibility" | "controls" | "risk" | "acceptance" | "preview";
type SubcontractorStatus = "" | "Independent subcontractor" | "Authorized vendor firm" | "Specialist execution team";
type AcknowledgementKey = "scopeAuthority" | "qualityOwnership" | "siteConduct" | "noPoaching" | "payoutGate" | "blacklisting";

type VendorAgreementForm = {
  agreementTitle: string;
  vendorFirm: string;
  authorizedSigner: string;
  subcontractorStatus: SubcontractorStatus;
  qualityResponsibility: string;
  siteDiscipline: string;
  timelineAdherence: string;
  documentation: string;
  safetyCompliance: string;
  noDirectClientPoaching: string;
  defectCorrectionResponsibility: string;
  paymentReleaseCondition: string;
  penaltyForReworkDelay: string;
  confidentiality: string;
  blacklistingClause: string;
  signatureName: string;
  signatureDesignation: string;
};

type VendorAgreementErrors = Partial<Record<keyof VendorAgreementForm | AcknowledgementKey, string>>;

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

type RiskWarning = {
  title: string;
  detail: string;
  severity: "high" | "medium";
  icon: LucideIcon;
};

const formIdPrefix = "vendor-agreement";

const sections: SectionDefinition[] = [
  {
    id: "responsibility",
    label: "Responsibility",
    eyebrow: "Vendor role",
    description: "Define subcontractor status, quality ownership, site discipline, and timeline adherence.",
    icon: Handshake,
  },
  {
    id: "controls",
    label: "Controls",
    eyebrow: "Execution gates",
    description: "Capture documentation, safety compliance, defect correction, and payment release conditions.",
    icon: ClipboardCheck,
  },
  {
    id: "risk",
    label: "Risk",
    eyebrow: "Legal guardrails",
    description: "Confirm no client poaching, penalties, confidentiality, and blacklisting terms.",
    icon: ShieldAlert,
  },
  {
    id: "acceptance",
    label: "Acceptance",
    eyebrow: "Acknowledgment",
    description: "Vendor must acknowledge the operating rules before signing the work order.",
    icon: PenLine,
  },
  {
    id: "preview",
    label: "Preview",
    eyebrow: "Agreement summary",
    description: "Review the digital agreement package before sending it for platform records.",
    icon: FileCheck2,
  },
];

const statusDefinitions: Record<VendorAgreementStatus, StatusDefinition> = {
  draft: {
    label: "Draft",
    tone: "neutral",
    description: "Agreement is being prepared for vendor review.",
  },
  review: {
    label: "In review",
    tone: "warning",
    description: "Terms are ready for internal or platform review before acceptance.",
  },
  accepted: {
    label: "Accepted",
    tone: "success",
    description: "Vendor acceptance and signature are captured locally.",
  },
  submitted: {
    label: "Submitted",
    tone: "primary",
    description: "Agreement package is ready for platform records and work order execution.",
  },
};

const subcontractorOptions = [
  { label: "Independent subcontractor", value: "Independent subcontractor" },
  { label: "Authorized vendor firm", value: "Authorized vendor firm" },
  { label: "Specialist execution team", value: "Specialist execution team" },
];

const initialForm: VendorAgreementForm = {
  agreementTitle: "",
  vendorFirm: "",
  authorizedSigner: "",
  subcontractorStatus: "",
  qualityResponsibility: "",
  siteDiscipline: "",
  timelineAdherence: "",
  documentation: "",
  safetyCompliance: "",
  noDirectClientPoaching: "",
  defectCorrectionResponsibility: "",
  paymentReleaseCondition: "",
  penaltyForReworkDelay: "",
  confidentiality: "",
  blacklistingClause: "",
  signatureName: "",
  signatureDesignation: "",
};

const initialAcknowledgements: Record<AcknowledgementKey, boolean> = {
  scopeAuthority: false,
  qualityOwnership: false,
  siteConduct: false,
  noPoaching: false,
  payoutGate: false,
  blacklisting: false,
};

const requiredFields: Array<keyof VendorAgreementForm> = [
  "agreementTitle",
  "vendorFirm",
  "authorizedSigner",
  "subcontractorStatus",
  "qualityResponsibility",
  "siteDiscipline",
  "timelineAdherence",
  "documentation",
  "safetyCompliance",
  "noDirectClientPoaching",
  "defectCorrectionResponsibility",
  "paymentReleaseCondition",
  "penaltyForReworkDelay",
  "confidentiality",
  "blacklistingClause",
  "signatureName",
  "signatureDesignation",
];

const acknowledgementItems: Array<{
  key: AcknowledgementKey;
  label: string;
  detail: string;
}> = [
  {
    key: "scopeAuthority",
    label: "Subcontractor authority confirmed",
    detail: "The signer confirms they are authorized to accept work orders and assign field teams.",
  },
  {
    key: "qualityOwnership",
    label: "Quality responsibility accepted",
    detail: "The vendor accepts responsibility for workmanship, commissioning proof, and defect correction.",
  },
  {
    key: "siteConduct",
    label: "Site discipline accepted",
    detail: "The vendor team will follow access rules, safety checks, attendance, and supervisor instructions.",
  },
  {
    key: "noPoaching",
    label: "No direct client poaching accepted",
    detail: "The vendor will not bypass ELV Connect for the same client, site, or discovered opportunity.",
  },
  {
    key: "payoutGate",
    label: "Payment release gate accepted",
    detail: "Payout depends on approved milestone evidence, QA status, and client acceptance.",
  },
  {
    key: "blacklisting",
    label: "Risk and blacklisting clause accepted",
    detail: "Fraud, poaching, unsafe conduct, or repeated quality failure may trigger hold, suspension, or blacklist review.",
  },
];

const riskWarnings: RiskWarning[] = [
  {
    title: "Client poaching is a high-risk breach",
    detail: "Directly soliciting the client or moving the work order outside ELV Connect can trigger payout hold, account review, and blacklist escalation.",
    severity: "high",
    icon: ShieldAlert,
  },
  {
    title: "Payment release is evidence-led",
    detail: "Invoices, site photos, testing records, handover documents, and QA acceptance control release readiness.",
    severity: "medium",
    icon: LockKeyhole,
  },
  {
    title: "Rework and delay penalties apply",
    detail: "Repeated defects, missed timelines without notice, or unsafe work can create deduction, rework, or suspension exposure.",
    severity: "high",
    icon: AlertTriangle,
  },
];

function validateAgreement(form: VendorAgreementForm, acknowledgements: Record<AcknowledgementKey, boolean>) {
  const nextErrors: VendorAgreementErrors = {};

  if (form.agreementTitle.trim().length < 6) {
    nextErrors.agreementTitle = "Add a clear work order or agreement title.";
  }

  if (form.vendorFirm.trim().length < 2) {
    nextErrors.vendorFirm = "Add the vendor firm or subcontractor name.";
  }

  if (form.authorizedSigner.trim().length < 2) {
    nextErrors.authorizedSigner = "Add the authorized signer name.";
  }

  if (!form.subcontractorStatus) {
    nextErrors.subcontractorStatus = "Select subcontractor status.";
  }

  if (form.qualityResponsibility.trim().length < 20) {
    nextErrors.qualityResponsibility = "Define quality ownership, acceptance criteria, and proof requirements.";
  }

  if (form.siteDiscipline.trim().length < 20) {
    nextErrors.siteDiscipline = "Define site discipline, access, attendance, and supervisor compliance.";
  }

  if (form.timelineAdherence.trim().length < 15) {
    nextErrors.timelineAdherence = "Define timeline adherence, notice, and escalation rules.";
  }

  if (form.documentation.trim().length < 15) {
    nextErrors.documentation = "Define documentation expected for milestone and handover.";
  }

  if (form.safetyCompliance.trim().length < 15) {
    nextErrors.safetyCompliance = "Define safety compliance responsibilities.";
  }

  if (form.noDirectClientPoaching.trim().length < 15) {
    nextErrors.noDirectClientPoaching = "Define no direct client poaching restrictions.";
  }

  if (form.defectCorrectionResponsibility.trim().length < 15) {
    nextErrors.defectCorrectionResponsibility = "Define defect correction responsibility and response window.";
  }

  if (form.paymentReleaseCondition.trim().length < 15) {
    nextErrors.paymentReleaseCondition = "Define payment release conditions.";
  }

  if (form.penaltyForReworkDelay.trim().length < 15) {
    nextErrors.penaltyForReworkDelay = "Define penalty for rework, delay, or non-compliance.";
  }

  if (form.confidentiality.trim().length < 15) {
    nextErrors.confidentiality = "Define confidentiality obligations.";
  }

  if (form.blacklistingClause.trim().length < 15) {
    nextErrors.blacklistingClause = "Define blacklisting or suspension triggers.";
  }

  if (form.signatureName.trim().length < 2) {
    nextErrors.signatureName = "Add signer name before acceptance.";
  }

  if (form.signatureDesignation.trim().length < 2) {
    nextErrors.signatureDesignation = "Add signer designation.";
  }

  acknowledgementItems.forEach((item) => {
    if (!acknowledgements[item.key]) {
      nextErrors[item.key] = "Required acknowledgment.";
    }
  });

  return nextErrors;
}

function completionFor(form: VendorAgreementForm, acknowledgements: Record<AcknowledgementKey, boolean>) {
  const filledFields = requiredFields.filter((field) => form[field].trim().length > 0).length;
  const checkedItems = acknowledgementItems.filter((item) => acknowledgements[item.key]).length;
  return Math.round(((filledFields + checkedItems) / (requiredFields.length + acknowledgementItems.length)) * 100);
}

function getSectionStatus(section: AgreementSection, activeSection: AgreementSection, errors: VendorAgreementErrors) {
  const sectionOrder = sections.findIndex((item) => item.id === section);
  const activeOrder = sections.findIndex((item) => item.id === activeSection);
  const fieldsBySection: Record<AgreementSection, Array<keyof VendorAgreementForm | AcknowledgementKey>> = {
    responsibility: ["agreementTitle", "vendorFirm", "authorizedSigner", "subcontractorStatus", "qualityResponsibility", "siteDiscipline", "timelineAdherence"],
    controls: ["documentation", "safetyCompliance", "defectCorrectionResponsibility", "paymentReleaseCondition"],
    risk: ["noDirectClientPoaching", "penaltyForReworkDelay", "confidentiality", "blacklistingClause"],
    acceptance: ["signatureName", "signatureDesignation", "scopeAuthority", "qualityOwnership", "siteConduct", "noPoaching", "payoutGate", "blacklisting"],
    preview: [],
  };
  const hasErrors = fieldsBySection[section].some((field) => Boolean(errors[field]));

  if (hasErrors) return "error" as const;
  if (section === activeSection) return "current" as const;
  if (sectionOrder < activeOrder) return "complete" as const;
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
      <VerificationBadge level="review" label="Legal acceptance flow" />
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
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const toneClassNames = {
    primary: "border-primary/15 bg-primary-subtle text-primary",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
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

function RiskWarningBlock({ warning }: { warning: RiskWarning }) {
  const Icon = warning.icon;
  const className =
    warning.severity === "high"
      ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100"
      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100";

  return (
    <section className={cn("rounded-lg border p-4", className)} aria-label={warning.title}>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/70 dark:bg-white/10">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-black">{warning.title}</h3>
          <p className="mt-2 text-xs font-semibold leading-5 opacity-80">{warning.detail}</p>
        </div>
      </div>
    </section>
  );
}

function AgreementSummaryPanel({
  form,
  status,
  completion,
  errorCount,
  acknowledgedCount,
}: {
  form: VendorAgreementForm;
  status: VendorAgreementStatus;
  completion: number;
  errorCount: number;
  acknowledgedCount: number;
}) {
  const statusMeta = statusDefinitions[status];

  return (
    <aside className="xl:sticky xl:top-6" aria-label="Vendor agreement summary">
      <Card variant="glass" padding="lg" className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Vendor agreement</p>
            <h2 className="mt-2 text-lg font-black text-foreground">Acceptance summary</h2>
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
            aria-label="Vendor agreement completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
          >
            <div className={cn("h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400", progressWidthClass(completion))} />
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{statusMeta.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <SummaryMetric label="Vendor firm" value={form.vendorFirm || "Vendor required"} icon={BadgeCheck} />
          <SummaryMetric label="Subcontractor" value={form.subcontractorStatus || "Not selected"} icon={Handshake} />
          <SummaryMetric label="Acknowledgments" value={`${acknowledgedCount}/${acknowledgementItems.length} confirmed`} icon={UserCheck} tone={acknowledgedCount === acknowledgementItems.length ? "success" : "warning"} />
          <SummaryMetric label="Validation" value={errorCount === 0 ? "No active errors" : `${errorCount} issue${errorCount > 1 ? "s" : ""}`} icon={ClipboardCheck} tone={errorCount === 0 ? "success" : "danger"} />
        </div>

        <div className="rounded-md border border-primary/15 bg-primary-subtle p-3">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-black text-foreground">Trust-first vendor terms</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Acceptance connects workmanship, safety, documentation, payment release, client non-solicit, and blacklisting guardrails in one reviewable workflow.
          </p>
        </div>
      </Card>
    </aside>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-200/80 py-3 last:border-b-0 sm:grid-cols-[210px_minmax(0,1fr)] dark:border-white/10">
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold leading-6 text-foreground">{value || "Awaiting vendor input"}</dd>
    </div>
  );
}

function AgreementPreview({
  form,
  status,
  acknowledgements,
}: {
  form: VendorAgreementForm;
  status: VendorAgreementStatus;
  acknowledgements: Record<AcknowledgementKey, boolean>;
}) {
  return (
    <article
      aria-label="Vendor agreement preview"
      className="rounded-lg border border-border-subtle bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,247,255,0.9))] p-5 shadow-glass dark:border-elv-dark-border dark:bg-elv-dark-1"
    >
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Digital agreement preview</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">
            {form.agreementTitle || "Vendor Agreement / Work Order"}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            This preview summarizes the vendor acceptance package before platform record submission.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusDefinitions[status].tone}>{statusDefinitions[status].label}</Badge>
          <VerificationBadge level="kyc" label="Vendor acceptance" />
        </div>
      </div>

      <dl className="mt-4">
        <PreviewLine label="Vendor firm" value={form.vendorFirm} />
        <PreviewLine label="Authorized signer" value={form.authorizedSigner} />
        <PreviewLine label="Subcontractor status" value={form.subcontractorStatus} />
        <PreviewLine label="Quality responsibility" value={form.qualityResponsibility} />
        <PreviewLine label="Site discipline" value={form.siteDiscipline} />
        <PreviewLine label="Timeline adherence" value={form.timelineAdherence} />
        <PreviewLine label="Documentation" value={form.documentation} />
        <PreviewLine label="Safety compliance" value={form.safetyCompliance} />
        <PreviewLine label="No direct client poaching" value={form.noDirectClientPoaching} />
        <PreviewLine label="Defect correction" value={form.defectCorrectionResponsibility} />
        <PreviewLine label="Payment release condition" value={form.paymentReleaseCondition} />
        <PreviewLine label="Penalty for rework / delay" value={form.penaltyForReworkDelay} />
        <PreviewLine label="Confidentiality" value={form.confidentiality} />
        <PreviewLine label="Blacklisting clause" value={form.blacklistingClause} />
        <PreviewLine label="Signature" value={`${form.signatureName}${form.signatureDesignation ? `, ${form.signatureDesignation}` : ""}`} />
      </dl>

      <div className="mt-5 rounded-md border border-primary/15 bg-primary-subtle p-4">
        <p className="text-sm font-black text-foreground">Acknowledgment record</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {acknowledgementItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              {acknowledgements[item.key] ? (
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              )}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function VendorAgreementPage() {
  const [activeSection, setActiveSection] = useState<AgreementSection>("responsibility");
  const [form, setForm] = useState<VendorAgreementForm>(initialForm);
  const [acknowledgements, setAcknowledgements] = useState<Record<AcknowledgementKey, boolean>>(initialAcknowledgements);
  const [errors, setErrors] = useState<VendorAgreementErrors>({});
  const [status, setStatus] = useState<VendorAgreementStatus>("draft");
  const [lastAction, setLastAction] = useState("Draft ready. Complete terms and acknowledgments before acceptance.");

  const completion = useMemo(() => completionFor(form, acknowledgements), [form, acknowledgements]);
  const acknowledgedCount = acknowledgementItems.filter((item) => acknowledgements[item.key]).length;
  const errorCount = Object.keys(errors).length;
  const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];
  const activeIndex = sections.findIndex((section) => section.id === activeSection);
  const stepperSteps = sections.map((section) => ({
    label: section.label,
    description: section.eyebrow,
    status: getSectionStatus(section.id, activeSection, errors),
  }));

  function updateField<K extends keyof VendorAgreementForm>(field: K) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value as VendorAgreementForm[K];

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

  function updateAcknowledgement(key: AcknowledgementKey) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setAcknowledgements((current) => ({
        ...current,
        [key]: event.target.checked,
      }));

      if (errors[key]) {
        setErrors((current) => {
          const nextErrors = { ...current };
          delete nextErrors[key];
          return nextErrors;
        });
      }
    };
  }

  function saveDraft() {
    setStatus("draft");
    setLastAction("Vendor agreement draft saved locally.");
  }

  function moveToSection(direction: "next" | "previous") {
    const nextIndex = direction === "next" ? Math.min(activeIndex + 1, sections.length - 1) : Math.max(activeIndex - 1, 0);
    setActiveSection(sections[nextIndex].id);
  }

  function runValidation(nextStatus: VendorAgreementStatus, successMessage: string) {
    const nextErrors = validateAgreement(form, acknowledgements);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setLastAction("Review highlighted fields and acknowledgments before changing agreement status.");
      return;
    }

    setStatus(nextStatus);
    setActiveSection("preview");
    setLastAction(successMessage);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.16),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f7f5ff_48%,#eef2ff_100%)] px-4 py-6 text-foreground dark:from-elv-dark-0 dark:to-elv-dark-2 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="overflow-hidden rounded-lg border border-white/60 bg-white/75 shadow-glass backdrop-blur-xl dark:border-elv-dark-border dark:bg-elv-dark-1/80">
          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6">
            <div className="min-w-0">
              <Link
                href="/vendor"
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Vendor dashboard
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <VerificationBadge level="verified" label="Vendor work order" />
                <VerificationBadge level="escrow" label="Payout gate aware" />
                <Badge tone="primary">Legal acceptance</Badge>
              </div>
              <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Vendor Agreement / Work Order
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                Capture vendor execution responsibilities, safety obligations, non-solicit terms, payout release conditions, penalties, confidentiality, and blacklisting acceptance before work begins.
              </p>
            </div>

            <div className="rounded-lg border border-white/60 bg-gradient-to-br from-elv-iris to-elv-purple p-4 text-white shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">Acceptance status</p>
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
                  <p className="text-[11px] font-bold uppercase text-white/65">Ack</p>
                  <p className="mt-1 font-mono text-xl font-black">{acknowledgedCount}/{acknowledgementItems.length}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Stepper steps={stepperSteps} progress={completion} className="bg-white/75 backdrop-blur-xl dark:bg-elv-dark-1/80" />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6">
            <nav
              className="grid gap-2 rounded-lg border border-border-subtle bg-white/70 p-2 shadow-sm backdrop-blur-xl sm:grid-cols-5 dark:bg-elv-dark-1/70"
              aria-label="Vendor agreement sections"
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

              {activeSection === "responsibility" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-responsibility-heading`}>
                  <h3 id={`${formIdPrefix}-responsibility-heading`} className="sr-only">
                    Vendor responsibility details
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      id={`${formIdPrefix}-title`}
                      label="Agreement / work order title"
                      value={form.agreementTitle}
                      onChange={updateField("agreementTitle")}
                      error={errors.agreementTitle}
                    />
                    <Select
                      id={`${formIdPrefix}-status`}
                      label="Subcontractor status"
                      value={form.subcontractorStatus}
                      onChange={updateField("subcontractorStatus")}
                      options={subcontractorOptions}
                      placeholder="Select status"
                      error={errors.subcontractorStatus}
                    />
                    <Input
                      id={`${formIdPrefix}-firm`}
                      label="Vendor firm / subcontractor"
                      value={form.vendorFirm}
                      onChange={updateField("vendorFirm")}
                      error={errors.vendorFirm}
                    />
                    <Input
                      id={`${formIdPrefix}-signer`}
                      label="Authorized signer"
                      value={form.authorizedSigner}
                      onChange={updateField("authorizedSigner")}
                      error={errors.authorizedSigner}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Textarea
                      id={`${formIdPrefix}-quality`}
                      label="Quality responsibility"
                      value={form.qualityResponsibility}
                      onChange={updateField("qualityResponsibility")}
                      error={errors.qualityResponsibility}
                      hint="Define workmanship ownership, acceptance criteria, and QA evidence responsibility."
                    />
                    <Textarea
                      id={`${formIdPrefix}-discipline`}
                      label="Site discipline"
                      value={form.siteDiscipline}
                      onChange={updateField("siteDiscipline")}
                      error={errors.siteDiscipline}
                      hint="Define site access, attendance, conduct, supervision, and client-facing behavior."
                    />
                  </div>
                  <Textarea
                    id={`${formIdPrefix}-timeline`}
                    label="Timeline adherence"
                    value={form.timelineAdherence}
                    onChange={updateField("timelineAdherence")}
                    error={errors.timelineAdherence}
                    hint="Define deadline commitments, delay notices, dependency reporting, and escalation timing."
                    className="min-h-32"
                  />
                </section>
              ) : null}

              {activeSection === "controls" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-controls-heading`}>
                  <h3 id={`${formIdPrefix}-controls-heading`} className="sr-only">
                    Execution controls
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Textarea
                      id={`${formIdPrefix}-documentation`}
                      label="Documentation"
                      value={form.documentation}
                      onChange={updateField("documentation")}
                      error={errors.documentation}
                      hint="Define required photos, test records, attendance, BOQ updates, handover packs, and invoice support."
                    />
                    <Textarea
                      id={`${formIdPrefix}-safety`}
                      label="Safety compliance"
                      value={form.safetyCompliance}
                      onChange={updateField("safetyCompliance")}
                      error={errors.safetyCompliance}
                      hint="Define PPE, ladder work, electrical safety, site induction, and incident reporting."
                    />
                    <Textarea
                      id={`${formIdPrefix}-defects`}
                      label="Defect correction responsibility"
                      value={form.defectCorrectionResponsibility}
                      onChange={updateField("defectCorrectionResponsibility")}
                      error={errors.defectCorrectionResponsibility}
                      hint="Define response window, rework ownership, revisit rules, and proof of correction."
                    />
                    <Textarea
                      id={`${formIdPrefix}-payment`}
                      label="Payment release condition"
                      value={form.paymentReleaseCondition}
                      onChange={updateField("paymentReleaseCondition")}
                      error={errors.paymentReleaseCondition}
                      hint="Define milestone evidence, QA acceptance, client sign-off, and payout hold conditions."
                    />
                  </div>
                </section>
              ) : null}

              {activeSection === "risk" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-risk-heading`}>
                  <h3 id={`${formIdPrefix}-risk-heading`} className="sr-only">
                    Vendor risk and legal clauses
                  </h3>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {riskWarnings.map((warning) => (
                      <RiskWarningBlock key={warning.title} warning={warning} />
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Textarea
                      id={`${formIdPrefix}-poaching`}
                      label="No direct client poaching"
                      value={form.noDirectClientPoaching}
                      onChange={updateField("noDirectClientPoaching")}
                      error={errors.noDirectClientPoaching}
                      hint="Define non-solicit restrictions for clients, sites, follow-up work, and discovered opportunities."
                    />
                    <Textarea
                      id={`${formIdPrefix}-penalty`}
                      label="Penalty for rework / delay"
                      value={form.penaltyForReworkDelay}
                      onChange={updateField("penaltyForReworkDelay")}
                      error={errors.penaltyForReworkDelay}
                      hint="Define deductions, hold conditions, revisit obligations, and delay escalation."
                    />
                    <Textarea
                      id={`${formIdPrefix}-confidentiality`}
                      label="Confidentiality"
                      value={form.confidentiality}
                      onChange={updateField("confidentiality")}
                      error={errors.confidentiality}
                      hint="Define handling of client sites, layouts, credentials, rates, BOQ, and project information."
                    />
                    <Textarea
                      id={`${formIdPrefix}-blacklisting`}
                      label="Blacklisting clause"
                      value={form.blacklistingClause}
                      onChange={updateField("blacklistingClause")}
                      error={errors.blacklistingClause}
                      hint="Define triggers for suspension, payout hold, delisting, or blacklist review."
                    />
                  </div>
                </section>
              ) : null}

              {activeSection === "acceptance" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-acceptance-heading`}>
                  <h3 id={`${formIdPrefix}-acceptance-heading`} className="sr-only">
                    Vendor acknowledgments and signature
                  </h3>
                  <div className="grid gap-3">
                    {acknowledgementItems.map((item) => (
                      <label
                        key={item.key}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border bg-surface p-4 shadow-sm transition hover:border-primary/30 focus-within:ring-4 focus-within:ring-primary-ring",
                          errors[item.key] ? "border-rose-300" : "border-border-subtle",
                        )}
                        htmlFor={`${formIdPrefix}-${item.key}`}
                      >
                        <input
                          id={`${formIdPrefix}-${item.key}`}
                          type="checkbox"
                          checked={acknowledgements[item.key]}
                          onChange={updateAcknowledgement(item.key)}
                          className="mt-1 h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary"
                          aria-describedby={`${formIdPrefix}-${item.key}-detail`}
                          aria-invalid={errors[item.key] ? true : undefined}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-foreground">{item.label}</span>
                          <span id={`${formIdPrefix}-${item.key}-detail`} className="mt-1 block text-xs font-semibold leading-5 text-muted-foreground">
                            {item.detail}
                          </span>
                          {errors[item.key] ? <span className="mt-1 block text-xs font-semibold text-rose-600">{errors[item.key]}</span> : null}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      id={`${formIdPrefix}-signature`}
                      label="Signature name"
                      value={form.signatureName}
                      onChange={updateField("signatureName")}
                      error={errors.signatureName}
                      leftIcon={<PenLine className="h-4 w-4" aria-hidden="true" />}
                    />
                    <Input
                      id={`${formIdPrefix}-designation`}
                      label="Signature designation"
                      value={form.signatureDesignation}
                      onChange={updateField("signatureDesignation")}
                      error={errors.signatureDesignation}
                    />
                  </div>
                </section>
              ) : null}

              {activeSection === "preview" ? (
                <section className="grid gap-5" aria-labelledby={`${formIdPrefix}-preview-heading`}>
                  <h3 id={`${formIdPrefix}-preview-heading`} className="sr-only">
                    Vendor agreement preview
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryMetric label="Vendor" value={form.vendorFirm || "Vendor required"} icon={BadgeCheck} />
                    <SummaryMetric label="Signer" value={form.signatureName || "Signature required"} icon={PenLine} />
                    <SummaryMetric label="Status" value={statusDefinitions[status].label} icon={FileCheck2} tone={status === "accepted" || status === "submitted" ? "success" : "warning"} />
                  </div>
                  <AgreementPreview form={form} status={status} acknowledgements={acknowledgements} />
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
                        onClick={() => runValidation("review", "Vendor agreement moved into review state.")}
                        leftIcon={<FileText className="h-4 w-4" aria-hidden="true" />}
                      >
                        Mark review
                      </Button>
                      <Button
                        type="button"
                        variant="success"
                        onClick={() => runValidation("accepted", "Vendor agreement accepted and signature captured.")}
                        leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                      >
                        Accept / sign
                      </Button>
                      <Button
                        type="button"
                        onClick={() => runValidation("submitted", "Vendor agreement submitted for work order records.")}
                        leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
                      >
                        Submit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <AgreementSummaryPanel
            form={form}
            status={status}
            completion={completion}
            errorCount={errorCount}
            acknowledgedCount={acknowledgedCount}
          />
        </div>

        <section
          className="grid gap-4 rounded-lg border border-border-subtle bg-white/70 p-4 shadow-sm backdrop-blur-xl md:grid-cols-3 dark:bg-elv-dark-1/70"
          aria-label="Vendor agreement legal hierarchy"
        >
          {[
            {
              title: "Operational duty",
              detail: "Subcontractor status, site discipline, quality responsibility, and timeline adherence form the execution baseline.",
              icon: Wrench,
            },
            {
              title: "Release gate",
              detail: "Payment release is tied to documentation, QA evidence, safety compliance, and client acceptance.",
              icon: LockKeyhole,
            },
            {
              title: "Trust enforcement",
              detail: "Client poaching, confidentiality breach, repeated defects, or unsafe work can trigger hold, suspension, or blacklist review.",
              icon: Gavel,
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
