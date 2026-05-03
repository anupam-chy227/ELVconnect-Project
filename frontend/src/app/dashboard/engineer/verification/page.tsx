"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, ShieldCheck, Upload } from "lucide-react";
import { usersAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Badge, Button, Card, ErrorCard, Input, Select, SkeletonCard, Stepper, VerificationBadge } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import { useMyProfile } from "@/hooks/useSWRData";

type VerificationStep = "business" | "categories" | "documents" | "certifications";
type BusinessState = {
  businessName: string;
  gstNumber: string;
  panNumber: string;
  yearsOfExperience: string;
  companyWebsite: string;
};

type DocumentKey = "government_id" | "business_registration" | "gst_certificate" | "fire_license" | "experience_certificate" | "equipment_photos";

const steps: Array<{ id: VerificationStep; label: string; description: string }> = [
  { id: "business", label: "Business", description: "Legal details" },
  { id: "categories", label: "Categories", description: "Service coverage" },
  { id: "documents", label: "Documents", description: "Upload proof" },
  { id: "certifications", label: "Certifications", description: "Submit review" },
];

const serviceCategories = ["CCTV", "Fire Safety", "Access Control", "Data Networking", "BMS", "PA Systems"];
const certificationOptions = ["CCIE", "CCNA", "BICSI", "Hikvision Certified", "Dahua Certified", "Fire Safety License", "BIS Compliant", "NBC Compliant"];
const radiusOptions = [
  { label: "10 km", value: "10" },
  { label: "25 km", value: "25" },
  { label: "50 km", value: "50" },
  { label: "Pan-city", value: "100" },
];

const documentItems: Array<{ key: DocumentKey; label: string; required: boolean; requires?: "gst" | "fire" }> = [
  { key: "government_id", label: "Government ID (Aadhaar/PAN)", required: true },
  { key: "business_registration", label: "Business Registration Certificate", required: true },
  { key: "gst_certificate", label: "GST Certificate", required: false, requires: "gst" },
  { key: "fire_license", label: "Fire License", required: false, requires: "fire" },
  { key: "experience_certificate", label: "Experience Certificate", required: true },
  { key: "equipment_photos", label: "Tool/Equipment Photos", required: false },
];

const initialBusiness: BusinessState = {
  businessName: "",
  gstNumber: "",
  panNumber: "",
  yearsOfExperience: "",
  companyWebsite: "",
};

function DocumentUploadZone({
  item,
  uploadedFileName,
  uploading,
  onUpload,
}: {
  item: { key: DocumentKey; label: string; required: boolean };
  uploadedFileName?: string;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <label className="grid cursor-pointer gap-3 rounded-lg border border-border-subtle bg-surface p-4 shadow-sm transition hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-foreground">{item.label}</p>
          <Badge tone={item.required ? "warning" : "neutral"} className="mt-2">
            {item.required ? "Required" : "Optional"}
          </Badge>
        </div>
        {uploadedFileName ? <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" /> : <FileUp className="h-5 w-5 text-primary" aria-hidden="true" />}
      </div>
      <input
        type="file"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
      <span className="rounded-md border border-dashed border-primary/30 bg-primary-subtle px-3 py-2 text-xs font-black text-primary">
        {uploading ? "Uploading..." : uploadedFileName ?? "Choose file"}
      </span>
    </label>
  );
}

export default function EngineerVerificationPage() {
  const router = useRouter();
  const { data: profile, isLoading, error, mutate } = useMyProfile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [business, setBusiness] = useState<BusinessState>(initialBusiness);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [serviceRadius, setServiceRadius] = useState("25");
  const [uploadedDocuments, setUploadedDocuments] = useState<Partial<Record<DocumentKey, string>>>({});
  const [uploadingDocument, setUploadingDocument] = useState<DocumentKey | null>(null);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [otherCertifications, setOtherCertifications] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const activeStep = steps[activeIndex];

  const visibleDocuments = useMemo(
    () =>
      documentItems
        .map((item) => ({
          ...item,
          required: item.required || (item.requires === "gst" && Boolean(business.gstNumber)) || (item.requires === "fire" && selectedCategories.includes("Fire Safety")),
        }))
        .filter((item) => item.required || !item.requires),
    [business.gstNumber, selectedCategories],
  );

  function updateBusiness(field: keyof BusinessState) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setBusiness((current) => ({ ...current, [field]: event.target.value }));
      setFormError(undefined);
    };
  }

  function toggleCategory(category: string) {
    setSelectedCategories((current) => (current.includes(category) ? current.filter((item) => item !== category) : [...current, category]));
    setFormError(undefined);
  }

  function toggleCertification(certification: string) {
    setCertifications((current) => (current.includes(certification) ? current.filter((item) => item !== certification) : [...current, certification]));
  }

  async function submitBusinessDetails() {
    if (!business.businessName || !business.panNumber || !business.yearsOfExperience) {
      setFormError("Business name, PAN, and years of experience are required.");
      return;
    }

    await usersAPI.updateMyProfile({
      serviceProvider: {
        businessName: business.businessName,
        gstNumber: business.gstNumber || undefined,
        panNumber: business.panNumber,
        yearsOfExperience: Number(business.yearsOfExperience),
        companyWebsite: business.companyWebsite || undefined,
      },
    });
    await mutate();
    setActiveIndex(1);
  }

  async function submitCategories() {
    if (!selectedCategories.length) {
      setFormError("Select at least one service category.");
      return;
    }

    await usersAPI.updateMyProfile({
      serviceProvider: {
        categories: selectedCategories,
        serviceRadius: Number(serviceRadius),
      },
    });
    await mutate();
    setActiveIndex(2);
  }

  async function uploadDocument(documentType: DocumentKey, file: File) {
    setUploadingDocument(documentType);

    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("file", file);
      await usersAPI.uploadDocument(formData);
      setUploadedDocuments((current) => ({ ...current, [documentType]: file.name }));
      toast.success("Document uploaded.");
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Document upload failed.");
    } finally {
      setUploadingDocument(null);
    }
  }

  function validateDocuments() {
    const missing = visibleDocuments.filter((item) => item.required && !uploadedDocuments[item.key]);
    if (missing.length) {
      setFormError(`Upload required document: ${missing[0].label}`);
      return;
    }
    setActiveIndex(3);
    setFormError(undefined);
  }

  async function submitVerification() {
    setSubmitting(true);
    setFormError(undefined);

    try {
      const otherItems = otherCertifications
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await usersAPI.updateMyProfile({
        serviceProvider: {
          certifications: [...certifications, ...otherItems],
          verificationStatus: "pending",
        },
      });
      await mutate();
      toast.success("Verification submitted! Admin will review within 2 business days.");
      router.push("/dashboard/engineer");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Verification submission failed.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="premium-shell min-h-screen px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <SkeletonCard lines={8} />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="premium-shell min-h-screen px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <ErrorCard message={error?.message} onRetry={() => void mutate()} />
        </div>
      </main>
    );
  }

  return (
    <main className="premium-shell min-h-screen px-4 py-6 text-foreground">
      <div className="mx-auto grid max-w-5xl gap-6">
        <Card variant="glass" padding="lg">
          <button
            type="button"
            onClick={() => router.push("/dashboard/engineer")}
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Engineer dashboard
          </button>
          <div className="mt-5 flex flex-wrap gap-2">
            <VerificationBadge level="kyc" label="Engineer verification" />
            <VerificationBadge level="verified" label={profile.email} />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Complete engineer verification</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Submit business details, service coverage, documents, and certifications for admin approval.
          </p>
        </Card>

        <Stepper
          steps={steps.map((step, index) => ({
            label: step.label,
            description: step.description,
            status: index < activeIndex ? "complete" : index === activeIndex ? "current" : "upcoming",
          }))}
          progress={Math.round(((activeIndex + 1) / steps.length) * 100)}
        />

        <Card variant="glass" padding="lg">
          {activeStep.id === "business" ? (
            <section className="grid gap-4 md:grid-cols-2" aria-label="Business details">
              <Input label="Business name" value={business.businessName} onChange={updateBusiness("businessName")} />
              <Input label="GST number" value={business.gstNumber} onChange={updateBusiness("gstNumber")} />
              <Input label="PAN number" value={business.panNumber} onChange={updateBusiness("panNumber")} />
              <Input label="Years of experience" type="number" min={0} value={business.yearsOfExperience} onChange={updateBusiness("yearsOfExperience")} />
              <Input label="Company website" value={business.companyWebsite} onChange={updateBusiness("companyWebsite")} />
            </section>
          ) : null}

          {activeStep.id === "categories" ? (
            <section className="grid gap-5" aria-label="Service categories">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {serviceCategories.map((category) => {
                  const selected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                        selected ? "border-primary bg-primary-subtle text-primary" : "border-border-subtle bg-surface hover:border-primary/30",
                      )}
                    >
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                      <p className="mt-3 text-sm font-black">{category}</p>
                    </button>
                  );
                })}
              </div>
              <Select label="Service radius" value={serviceRadius} onChange={(event) => setServiceRadius(event.target.value)} options={radiusOptions} />
            </section>
          ) : null}

          {activeStep.id === "documents" ? (
            <section className="grid gap-4 md:grid-cols-2" aria-label="Document uploads">
              {visibleDocuments.map((item) => (
                <DocumentUploadZone
                  key={item.key}
                  item={item}
                  uploadedFileName={uploadedDocuments[item.key]}
                  uploading={uploadingDocument === item.key}
                  onUpload={(file) => void uploadDocument(item.key, file)}
                />
              ))}
            </section>
          ) : null}

          {activeStep.id === "certifications" ? (
            <section className="grid gap-5" aria-label="Certifications">
              <div className="grid gap-3 sm:grid-cols-2">
                {certificationOptions.map((certification) => {
                  const selected = certifications.includes(certification);
                  return (
                    <label
                      key={certification}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-bold transition",
                        selected ? "border-primary bg-primary-subtle text-primary" : "border-border-subtle bg-surface text-foreground hover:border-primary/30",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCertification(certification)}
                        className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary"
                      />
                      {certification}
                    </label>
                  );
                })}
              </div>
              <Input label="Other certifications" value={otherCertifications} onChange={(event) => setOtherCertifications(event.target.value)} />
            </section>
          ) : null}

          {formError ? <p className="mt-5 rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-sm font-bold text-danger">{formError}</p> : null}

          <div className="mt-6 flex flex-col gap-2 border-t border-border-subtle pt-5 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" disabled={activeIndex === 0 || submitting} onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}>
              Previous
            </Button>
            {activeStep.id === "business" ? (
              <Button type="button" onClick={() => void submitBusinessDetails()} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Next
              </Button>
            ) : null}
            {activeStep.id === "categories" ? (
              <Button type="button" onClick={() => void submitCategories()} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Next
              </Button>
            ) : null}
            {activeStep.id === "documents" ? (
              <Button type="button" onClick={validateDocuments} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Next
              </Button>
            ) : null}
            {activeStep.id === "certifications" ? (
              <Button type="button" loading={submitting} onClick={() => void submitVerification()} leftIcon={!submitting ? <Upload className="h-4 w-4" aria-hidden="true" /> : null}>
                Submit All
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </main>
  );
}
