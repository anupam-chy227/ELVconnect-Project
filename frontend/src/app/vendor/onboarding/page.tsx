"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Landmark,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Star,
  UserCheck,
  UsersRound,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card, Input, Select, Stepper, Textarea, VerificationBadge } from "@/components/ui";
import { cn, progressWidthClass } from "@/components/ui/utils";

type OnboardingStepId = "company" | "capability" | "banking" | "documents" | "review";
type ReviewDecision = "review" | "approved" | "rejected";
type WorkflowStatus = "complete" | "current" | "upcoming" | "error";
type Category = "CCTV" | "Fire Safety" | "Access Control" | "Data Networking";
type DocumentKey =
  | "gstPan"
  | "ownerKyc"
  | "bankProof"
  | "certifications"
  | "pastWorkPhotos"
  | "teamList"
  | "referenceLetters"
  | "pricingProof";

type VendorFormState = {
  companyName: string;
  ownerName: string;
  gstPan: string;
  cityCoverage: string[];
  categoriesHandled: Category[];
  teamSize: string;
  emergencyResponseTime: string;
  certifications: string;
  pastProjects: string;
  brandExperience: string;
  toolsEquipment: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  referenceOneName: string;
  referenceOnePhone: string;
  referenceTwoName: string;
  referenceTwoPhone: string;
};

type RiskFlag = {
  id: string;
  label: string;
  detail: string;
  active: boolean;
};

type QueueVendor = {
  id: string;
  firm: string;
  owner: string;
  city: string;
  categories: string;
  trustScore: number;
  status: ReviewDecision;
  flags: string[];
  nextStep: string;
};

type WorkflowItem = {
  label: string;
  description: string;
  status: WorkflowStatus;
  icon: LucideIcon;
};

const stepOrder: OnboardingStepId[] = ["company", "capability", "banking", "documents", "review"];

const stepLabels: Record<OnboardingStepId, string> = {
  company: "Company",
  capability: "Capability",
  banking: "Banking",
  documents: "Documents",
  review: "Review",
};

const categories: Category[] = ["CCTV", "Fire Safety", "Access Control", "Data Networking"];
const cities = ["Delhi NCR", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Ahmedabad", "Jaipur"];

const documentLabels: Record<DocumentKey, { label: string; detail: string }> = {
  gstPan: { label: "GST or PAN proof", detail: "Legal identity must match firm and owner details." },
  ownerKyc: { label: "Owner KYC", detail: "Aadhaar, passport, voter ID, or equivalent owner proof." },
  bankProof: { label: "Bank proof", detail: "Cancelled cheque, bank letter, or verified payout proof." },
  certifications: { label: "Certifications", detail: "OEM, fire license, ISO, networking, or safety certificates." },
  pastWorkPhotos: { label: "Past work photos", detail: "Original site photos with project context and no stock images." },
  teamList: { label: "Team and manpower list", detail: "Technicians, supervisors, and city response ownership." },
  referenceLetters: { label: "Reference contacts", detail: "Client references with contactable phone or email." },
  pricingProof: { label: "Pricing proof", detail: "Rate card, sample quote, or BOQ proof for unusually low pricing." },
};

const initialFormState: VendorFormState = {
  companyName: "SecureGrid ELV Services",
  ownerName: "Rahul Mehta",
  gstPan: "27AABCS1429B1Z5",
  cityCoverage: ["Delhi NCR", "Mumbai"],
  categoriesHandled: ["CCTV", "Access Control"],
  teamSize: "18",
  emergencyResponseTime: "45 minutes",
  certifications: "Hikvision partner, CP Plus certified, basic fire safety training, structured cabling supervisor certificate.",
  pastProjects: "Factory CCTV rollout in Manesar, biometric access upgrade for Noida office park, warehouse camera analytics in Bhiwandi.",
  brandExperience: "Hikvision, CP Plus, Honeywell, ZKTeco, Cisco small business switching.",
  toolsEquipment: "Fluke tester, crimping kits, ladders, drilling tools, fusion splicer partner access, laptop with NVR tools.",
  bankName: "HDFC Bank",
  accountHolder: "SecureGrid ELV Services",
  accountNumber: "50200011124567",
  ifsc: "HDFC0001234",
  upiId: "securegrid@hdfcbank",
  referenceOneName: "Apex Auto Components - Facilities Head",
  referenceOnePhone: "+91 98765 43210",
  referenceTwoName: "Metro CoWorks - Admin Lead",
  referenceTwoPhone: "+91 91234 56780",
};

const initialDocuments: Record<DocumentKey, boolean> = {
  gstPan: true,
  ownerKyc: true,
  bankProof: true,
  certifications: true,
  pastWorkPhotos: false,
  teamList: true,
  referenceLetters: false,
  pricingProof: false,
};

const demoQueue: QueueVendor[] = [
  {
    id: "VON-2481",
    firm: "Ignis Safety Systems",
    owner: "Aman Sharma",
    city: "Delhi NCR",
    categories: "Fire Safety",
    trustScore: 82,
    status: "review",
    flags: ["Fire license review", "Reference pending"],
    nextStep: "Technical interview",
  },
  {
    id: "VON-2479",
    firm: "CoreLink Infra",
    owner: "Nikhil Arora",
    city: "Pune",
    categories: "Data Networking",
    trustScore: 91,
    status: "approved",
    flags: ["No active risk"],
    nextStep: "Sample project",
  },
  {
    id: "VON-2476",
    firm: "SignalOps Security",
    owner: "Mehul Patel",
    city: "Ahmedabad",
    categories: "CCTV",
    trustScore: 58,
    status: "rejected",
    flags: ["No legal docs", "Fake photos"],
    nextStep: "Rejected",
  },
];

function formatStepStatus(stepId: OnboardingStepId, currentStep: number): WorkflowStatus {
  const index = stepOrder.indexOf(stepId);
  if (index < currentStep) return "complete";
  if (index === currentStep) return "current";
  return "upcoming";
}

function getDecisionClassName(decision: ReviewDecision) {
  if (decision === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (decision === "rejected") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function MultiToggleGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: T[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  const toggle = (value: T) => {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <fieldset className="grid gap-2">
      <legend className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                active
                  ? "border-primary bg-primary text-on-primary shadow-sm"
                  : "border-border-subtle bg-surface text-muted-foreground hover:border-primary/30 hover:bg-primary-subtle hover:text-primary",
              )}
              aria-pressed={active}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function StatusChip({ decision }: { decision: ReviewDecision }) {
  const label = decision === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : "Needs Review";

  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black", getDecisionClassName(decision))}>{label}</span>;
}

function TrustScoreCard({ score, activeRiskCount }: { score: number; activeRiskCount: number }) {
  const tone = score >= 86 ? "verified" : score >= 70 ? "review" : "risk";

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Vendor trust score</p>
          <p className="mt-2 font-mono text-5xl font-black text-foreground">{score}</p>
        </div>
        <VerificationBadge level={tone} label={score >= 86 ? "Activation ready" : score >= 70 ? "Review needed" : "High risk"} />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}>
        <div className={cn("h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400", progressWidthClass(score))} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-border-subtle bg-surface p-3">
          <p className="text-xs font-bold text-muted-foreground">Active risk flags</p>
          <p className="mt-1 text-2xl font-black text-foreground">{activeRiskCount}</p>
        </div>
        <div className="rounded-md border border-border-subtle bg-surface p-3">
          <p className="text-xs font-bold text-muted-foreground">Activation gate</p>
          <p className="mt-1 text-sm font-black text-foreground">{score >= 86 ? "Rating-based" : "Manual review"}</p>
        </div>
      </div>
    </Card>
  );
}

function WorkflowPanel({ workflow }: { workflow: WorkflowItem[] }) {
  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Activation workflow</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Verification gates</h2>
        </div>
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3">
        {workflow.map((item) => {
          const Icon = item.icon;
          const complete = item.status === "complete";
          const current = item.status === "current";
          const error = item.status === "error";

          return (
            <article
              key={item.label}
              className={cn(
                "rounded-md border p-3",
                complete && "border-emerald-200 bg-emerald-50 text-emerald-800",
                current && "border-primary/25 bg-primary-subtle text-primary",
                error && "border-rose-200 bg-rose-50 text-rose-700",
                !complete && !current && !error && "border-border-subtle bg-surface text-muted-foreground",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/70 text-current shadow-sm dark:bg-elv-dark-1">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-black">{item.label}</p>
                  <p className="mt-1 text-xs font-semibold opacity-80">{item.description}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function RequiredDocumentChecklist({
  documents,
  onToggle,
}: {
  documents: Record<DocumentKey, boolean>;
  onToggle: (key: DocumentKey) => void;
}) {
  return (
    <div className="grid gap-3">
      {(Object.keys(documentLabels) as DocumentKey[]).map((key) => {
        const checked = documents[key];
        const meta = documentLabels[key];

        return (
          <label
            key={key}
            className={cn(
              "flex items-start gap-3 rounded-md border p-3 transition",
              checked ? "border-emerald-200 bg-emerald-50/70" : "border-border-subtle bg-surface hover:border-primary/30",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(key)}
              className="mt-1 h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary-ring"
            />
            <span>
              <span className="block text-sm font-black text-foreground">{meta.label}</span>
              <span className="mt-1 block text-xs font-semibold leading-5 text-muted-foreground">{meta.detail}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function RiskFlagPanel({ riskFlags }: { riskFlags: RiskFlag[] }) {
  const activeFlags = riskFlags.filter((flag) => flag.active);

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Risk flags</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Admin risk model</h2>
        </div>
        <ShieldAlert className={cn("h-5 w-5", activeFlags.length ? "text-warning" : "text-success")} aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3">
        {riskFlags.map((flag) => (
          <article
            key={flag.id}
            className={cn(
              "rounded-md border p-3",
              flag.active ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800",
            )}
          >
            <div className="flex items-start gap-3">
              {flag.active ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
              <div>
                <p className="text-sm font-black">{flag.label}</p>
                <p className="mt-1 text-xs font-semibold opacity-80">{flag.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function AdminReviewQueue({
  queue,
  onDecision,
}: {
  queue: QueueVendor[];
  onDecision: (id: string, decision: ReviewDecision) => void;
}) {
  return (
    <Card variant="glass" className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border-subtle p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Admin review queue</p>
          <h2 className="mt-1 text-lg font-black text-foreground">Vendor onboarding decisions</h2>
        </div>
        <Badge tone="primary">{queue.length} applications</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <caption className="sr-only">Admin review queue for vendor onboarding applications</caption>
          <thead className="bg-table-header text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {["Vendor", "Coverage", "Trust", "Risk Flags", "Next Step", "State", "Actions"].map((header) => (
                <th key={header} scope="col" className="px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-table-border">
            {queue.map((vendor) => (
              <tr key={vendor.id} className="bg-table-row transition hover:bg-table-row-hover">
                <td className="px-4 py-4">
                  <p className="font-mono text-[11px] font-black text-muted-foreground">{vendor.id}</p>
                  <p className="mt-1 text-sm font-black text-foreground">{vendor.firm}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{vendor.owner}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-black text-foreground">{vendor.city}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{vendor.categories}</p>
                </td>
                <td className="px-4 py-4">
                  <VerificationBadge level={vendor.trustScore >= 86 ? "verified" : vendor.trustScore >= 70 ? "review" : "risk"} score={vendor.trustScore} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.flags.map((flag) => (
                      <span key={flag} className="rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-[11px] font-black text-muted-foreground">
                        {flag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-bold text-muted-foreground">{vendor.nextStep}</td>
                <td className="px-4 py-4">
                  <StatusChip decision={vendor.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onDecision(vendor.id, "approved")} className="rounded-md bg-success px-3 py-1.5 text-xs font-black text-white">
                      Approve
                    </button>
                    <button type="button" onClick={() => onDecision(vendor.id, "review")} className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
                      Review
                    </button>
                    <button type="button" onClick={() => onDecision(vendor.id, "rejected")} className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function VendorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<VendorFormState>(initialFormState);
  const [documents, setDocuments] = useState<Record<DocumentKey, boolean>>(initialDocuments);
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>("review");
  const [queue, setQueue] = useState<QueueVendor[]>(demoQueue);

  const riskFlags = useMemo<RiskFlag[]>(
    () => [
      {
        id: "fake-photos",
        label: "Fake photos",
        detail: "Past project photos are missing or not yet verified against site context.",
        active: !documents.pastWorkPhotos,
      },
      {
        id: "legal-docs",
        label: "No legal docs",
        detail: "GST/PAN and owner KYC must both be present for marketplace activation.",
        active: !documents.gstPan || !documents.ownerKyc || !form.gstPan.trim(),
      },
      {
        id: "past-work",
        label: "No past work",
        detail: "Past projects are required to validate category fit and brand experience.",
        active: !form.pastProjects.trim(),
      },
      {
        id: "manpower",
        label: "Unclear manpower",
        detail: "Team size and manpower document must be clear for city-level SLA promises.",
        active: !form.teamSize.trim() || !documents.teamList,
      },
      {
        id: "service-area",
        label: "No service area clarity",
        detail: "City coverage must be explicit before leads are routed to the vendor.",
        active: form.cityCoverage.length === 0,
      },
      {
        id: "low-pricing",
        label: "Too low pricing with no proof",
        detail: "Admin review requires a rate card, sample quote, or BOQ proof.",
        active: !documents.pricingProof,
      },
    ],
    [documents, form.cityCoverage.length, form.gstPan, form.pastProjects, form.teamSize],
  );

  const activeRiskFlags = riskFlags.filter((flag) => flag.active);
  const completedDocuments = Object.values(documents).filter(Boolean).length;
  const trustScore = Math.max(
    42,
    Math.min(
      98,
      46 +
        completedDocuments * 5 +
        form.cityCoverage.length * 3 +
        form.categoriesHandled.length * 3 +
        (form.teamSize.trim() ? 5 : 0) +
        (form.referenceOnePhone.trim() && form.referenceTwoPhone.trim() ? 6 : 0) -
        activeRiskFlags.length * 7,
    ),
  );

  const workflow = useMemo<WorkflowItem[]>(
    () => [
      {
        label: "Document check",
        description: `${completedDocuments} of ${Object.keys(documents).length} required documents reviewed.`,
        status: completedDocuments >= 6 ? "complete" : "current",
        icon: FileCheck2,
      },
      {
        label: "Call verification",
        description: "Owner call validates company identity, cities, and response ownership.",
        status: completedDocuments >= 6 ? "current" : "upcoming",
        icon: PhoneCall,
      },
      {
        label: "Technical interview",
        description: "Category lead checks tools, manpower, past work, and execution process.",
        status: trustScore >= 78 ? "current" : "upcoming",
        icon: Wrench,
      },
      {
        label: "Reference check",
        description: "Client references are contacted before sample project routing.",
        status: documents.referenceLetters ? "current" : "upcoming",
        icon: UserCheck,
      },
      {
        label: "Sample project / first job",
        description: "Low-risk first job validates site behavior, pricing, and proof quality.",
        status: trustScore >= 86 && !activeRiskFlags.length ? "current" : "upcoming",
        icon: ClipboardCheck,
      },
      {
        label: "Rating-based activation",
        description: "Activation follows first-job rating, QA pass, and payout discipline.",
        status: reviewDecision === "approved" ? "complete" : reviewDecision === "rejected" ? "error" : "upcoming",
        icon: Star,
      },
    ],
    [activeRiskFlags.length, completedDocuments, documents, reviewDecision, trustScore],
  );

  const stepperSteps = stepOrder.map((stepId) => ({
    label: stepLabels[stepId],
    description: stepId === "review" ? "Admin decision" : "Vendor input",
    status: formatStepStatus(stepId, currentStep),
  }));

  const currentQueueVendor: QueueVendor = {
    id: "VON-DRAFT",
    firm: form.companyName || "Draft vendor",
    owner: form.ownerName || "Owner pending",
    city: form.cityCoverage.join(", ") || "Coverage pending",
    categories: form.categoriesHandled.join(", ") || "Categories pending",
    trustScore,
    status: reviewDecision,
    flags: activeRiskFlags.length ? activeRiskFlags.map((flag) => flag.label) : ["No active risk"],
    nextStep: reviewDecision === "approved" ? "Sample project" : reviewDecision === "rejected" ? "Rejected" : "Call verification",
  };

  const visibleQueue = [currentQueueVendor, ...queue];

  function updateField<K extends keyof VendorFormState>(key: K, value: VendorFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateInputField<K extends keyof VendorFormState>(key: K) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      updateField(key, event.target.value as VendorFormState[K]);
    };
  }

  function toggleDocument(key: DocumentKey) {
    setDocuments((current) => ({ ...current, [key]: !current[key] }));
  }

  function setQueueDecision(id: string, decision: ReviewDecision) {
    if (id === "VON-DRAFT") {
      setReviewDecision(decision);
      return;
    }

    setQueue((current) => current.map((vendor) => (vendor.id === id ? { ...vendor, status: decision } : vendor)));
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-elv-base via-white to-primary-subtle text-foreground">
      <section className="border-b border-border-subtle bg-white/80 px-4 py-6 shadow-sm backdrop-blur-2xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge level="kyc" label="Vendor onboarding" />
              <VerificationBadge level={trustScore >= 86 ? "verified" : "review"} score={trustScore} />
              <StatusChip decision={reviewDecision} />
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-5xl">ELV vendor onboarding workflow</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted-foreground">
              Collect legal, operational, technical, payment, and reference proof before a vendor is routed to client work.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/vendor" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-black text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary-subtle">
              Vendor dashboard
            </Link>
            <Button type="button" onClick={() => setCurrentStep(4)} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Send for Review
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-6">
          <Stepper steps={stepperSteps} progress={Math.round(((currentStep + 1) / stepOrder.length) * 100)} />

          <Card variant="glass" className="p-5">
            <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Step {currentStep + 1} of {stepOrder.length}</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">{stepLabels[stepOrder[currentStep]]}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}>
                  Previous
                </Button>
                <Button type="button" disabled={currentStep === stepOrder.length - 1} onClick={() => setCurrentStep((step) => Math.min(step + 1, stepOrder.length - 1))}>
                  Next
                </Button>
              </div>
            </div>

            <div className="mt-6">
              {stepOrder[currentStep] === "company" ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Company / firm name" value={form.companyName} onChange={updateInputField("companyName")} required />
                    <Input label="Owner name" value={form.ownerName} onChange={updateInputField("ownerName")} required />
                    <Input label="GST / PAN" value={form.gstPan} onChange={updateInputField("gstPan")} required />
                    <Input label="Team size" value={form.teamSize} onChange={updateInputField("teamSize")} inputMode="numeric" required />
                  </div>
                  <MultiToggleGroup label="City coverage" options={cities} selected={form.cityCoverage} onChange={(next) => updateField("cityCoverage", next)} />
                  <MultiToggleGroup label="Categories handled" options={categories} selected={form.categoriesHandled} onChange={(next) => updateField("categoriesHandled", next)} />
                  <Select
                    label="Emergency response time"
                    value={form.emergencyResponseTime}
                    onChange={updateInputField("emergencyResponseTime")}
                    options={[
                      { label: "30 minutes", value: "30 minutes" },
                      { label: "45 minutes", value: "45 minutes" },
                      { label: "2 hours", value: "2 hours" },
                      { label: "Same day", value: "Same day" },
                      { label: "Next business day", value: "Next business day" },
                    ]}
                  />
                </div>
              ) : null}

              {stepOrder[currentStep] === "capability" ? (
                <div className="grid gap-4">
                  <Textarea label="Certifications" value={form.certifications} onChange={updateInputField("certifications")} required />
                  <Textarea label="Past projects" value={form.pastProjects} onChange={updateInputField("pastProjects")} required />
                  <Textarea label="Brand experience" value={form.brandExperience} onChange={updateInputField("brandExperience")} required />
                  <Textarea label="Tools / equipment" value={form.toolsEquipment} onChange={updateInputField("toolsEquipment")} required />
                </div>
              ) : null}

              {stepOrder[currentStep] === "banking" ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Bank name" value={form.bankName} onChange={updateInputField("bankName")} leftIcon={<Landmark className="h-4 w-4" />} required />
                    <Input label="Account holder" value={form.accountHolder} onChange={updateInputField("accountHolder")} required />
                    <Input label="Account number" value={form.accountNumber} onChange={updateInputField("accountNumber")} inputMode="numeric" required />
                    <Input label="IFSC" value={form.ifsc} onChange={updateInputField("ifsc")} required />
                    <Input label="UPI ID" value={form.upiId} onChange={updateInputField("upiId")} leftIcon={<Banknote className="h-4 w-4" />} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Reference contact 1" value={form.referenceOneName} onChange={updateInputField("referenceOneName")} required />
                    <Input label="Reference phone 1" value={form.referenceOnePhone} onChange={updateInputField("referenceOnePhone")} required />
                    <Input label="Reference contact 2" value={form.referenceTwoName} onChange={updateInputField("referenceTwoName")} required />
                    <Input label="Reference phone 2" value={form.referenceTwoPhone} onChange={updateInputField("referenceTwoPhone")} required />
                  </div>
                </div>
              ) : null}

              {stepOrder[currentStep] === "documents" ? (
                <RequiredDocumentChecklist documents={documents} onToggle={toggleDocument} />
              ) : null}

              {stepOrder[currentStep] === "review" ? (
                <div className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card variant="panel" className="p-4">
                      <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                      <p className="mt-3 text-sm font-black text-foreground">{form.companyName}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">{form.ownerName}</p>
                    </Card>
                    <Card variant="panel" className="p-4">
                      <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                      <p className="mt-3 text-sm font-black text-foreground">{form.cityCoverage.join(", ") || "Coverage pending"}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">City coverage</p>
                    </Card>
                    <Card variant="panel" className="p-4">
                      <UsersRound className="h-5 w-5 text-primary" aria-hidden="true" />
                      <p className="mt-3 text-sm font-black text-foreground">{form.teamSize || "0"} people</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">{form.emergencyResponseTime} emergency SLA</p>
                    </Card>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Admin decision</p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">Approve, reject, or keep this vendor in review without changing backend data.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="success" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setReviewDecision("approved")}>
                          Approve
                        </Button>
                        <Button type="button" variant="secondary" leftIcon={<Clock3 className="h-4 w-4" />} onClick={() => setReviewDecision("review")}>
                          Review
                        </Button>
                        <Button type="button" variant="danger" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setReviewDecision("rejected")}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <AdminReviewQueue queue={visibleQueue} onDecision={setQueueDecision} />
        </section>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <TrustScoreCard score={trustScore} activeRiskCount={activeRiskFlags.length} />
          <WorkflowPanel workflow={workflow} />
          <RiskFlagPanel riskFlags={riskFlags} />
        </aside>
      </div>
    </main>
  );
}

export default VendorOnboardingPage;
