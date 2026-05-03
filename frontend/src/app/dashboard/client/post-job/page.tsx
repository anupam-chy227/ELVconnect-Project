"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  DoorOpen,
  FileUp,
  Flame,
  IndianRupee,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button, Card, FileUpload } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import { toast } from "@/lib/toast";

type StepId = 0 | 1 | 2 | 3 | 4;
type ServiceCategory = "CCTV" | "Fire" | "Access" | "Network";
type Urgency = "Normal" | "Urgent" | "Emergency";
type SiteType = "Residential" | "Commercial" | "Industrial" | "Government";
type ComplianceLevel = "Standard" | "High" | "Critical";
type Duration = "1 day" | "1 week" | "2 weeks" | "1 month" | "Custom";
type PaymentPreference = "Full upfront" | "Milestone" | "50-50";

type FormData = {
  title: string;
  category: ServiceCategory | "";
  urgency: Urgency;
  description: string;
  city: string;
  area: string;
  siteType: SiteType | "";
  floors: string;
  squareFootage: string;
  hasExistingSystems: boolean;
  existingSystemDetails: string;
  complianceLevel: ComplianceLevel;
  certifications: string[];
  materialsProvided: boolean;
  specialRequirements: string;
  files: File[];
  budgetMin: number;
  budgetMax: number;
  startDate: string;
  duration: Duration;
  customDuration: string;
  paymentPreference: PaymentPreference;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const steps = [
  "Project Basics",
  "Site Details",
  "Requirements",
  "Budget & Timeline",
  "Review & Submit",
] as const;

const categories: Array<{ value: ServiceCategory; icon: React.ComponentType<{ className?: string }>; detail: string }> = [
  { value: "CCTV", icon: Camera, detail: "Surveillance, NVR, analytics" },
  { value: "Fire", icon: Flame, detail: "Alarms, panels, NOC support" },
  { value: "Access", icon: DoorOpen, detail: "Biometric, RFID, barriers" },
  { value: "Network", icon: Network, detail: "Cabling, fiber, racks" },
];

const urgencyOptions: Array<{ value: Urgency; detail: string }> = [
  { value: "Normal", detail: "Planned work with flexible site window" },
  { value: "Urgent", detail: "Needs engineer response within 24 hours" },
  { value: "Emergency", detail: "Critical uptime, safety, or security issue" },
];

const indianCities = [
  "Ahmedabad",
  "Bengaluru",
  "Bhopal",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Delhi NCR",
  "Faridabad",
  "Ghaziabad",
  "Gurugram",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Mumbai",
  "Nagpur",
  "Nashik",
  "Noida",
  "Patna",
  "Pune",
  "Rajkot",
  "Surat",
  "Thane",
  "Vadodara",
  "Visakhapatnam",
] as const;

const siteTypes: SiteType[] = ["Residential", "Commercial", "Industrial", "Government"];
const certifications = ["Fire NOC", "BIS", "STQC", "OEM Authorization", "ISO 9001", "Electrical License"];
const durations: Duration[] = ["1 day", "1 week", "2 weeks", "1 month", "Custom"];
const paymentPreferences: PaymentPreference[] = ["Full upfront", "Milestone", "50-50"];

const today = new Date().toISOString().slice(0, 10);

const initialFormData: FormData = {
  title: "",
  category: "",
  urgency: "Normal",
  description: "",
  city: "",
  area: "",
  siteType: "",
  floors: "",
  squareFootage: "",
  hasExistingSystems: false,
  existingSystemDetails: "",
  complianceLevel: "Standard",
  certifications: [],
  materialsProvided: false,
  specialRequirements: "",
  files: [],
  budgetMin: 50000,
  budgetMax: 200000,
  startDate: today,
  duration: "1 week",
  customDuration: "",
  paymentPreference: "Milestone",
};

const fullSchema = z
  .object({
    title: z.string().min(5, "Add at least 5 characters").max(60, "Keep title under 60 characters"),
    category: z.string().refine((value): value is ServiceCategory => ["CCTV", "Fire", "Access", "Network"].includes(value), {
      message: "Select a service category",
    }),
    urgency: z.enum(["Normal", "Urgent", "Emergency"]),
    description: z.string().min(20, "Add at least 20 characters").max(500, "Keep description under 500 characters"),
    city: z.string().min(1, "Select a city"),
    area: z.string().min(2, "Add area or locality"),
    siteType: z.string().refine((value): value is SiteType => ["Residential", "Commercial", "Industrial", "Government"].includes(value), {
      message: "Select a site type",
    }),
    floors: z.coerce.number().int("Enter whole floors").min(0, "Floors cannot be negative").max(200, "Check floor count"),
    squareFootage: z.coerce.number().min(100, "Minimum 100 sq ft required").max(10000000, "Check square footage"),
    hasExistingSystems: z.boolean(),
    existingSystemDetails: z.string().max(300, "Keep existing system details under 300 characters"),
    complianceLevel: z.enum(["Standard", "High", "Critical"]),
    certifications: z.array(z.string()),
    materialsProvided: z.boolean(),
    specialRequirements: z.string().max(500, "Keep special requirements under 500 characters"),
    files: z.array(z.custom<File>((file) => file instanceof File)).max(8, "Upload up to 8 files"),
    budgetMin: z.number().min(10000, "Minimum budget must be ₹10,000"),
    budgetMax: z.number().max(10000000, "Maximum budget is ₹1Cr"),
    startDate: z.string().min(1, "Select a start date"),
    duration: z.enum(["1 day", "1 week", "2 weeks", "1 month", "Custom"]),
    customDuration: z.string().max(80, "Keep custom duration concise"),
    paymentPreference: z.enum(["Full upfront", "Milestone", "50-50"]),
  })
  .superRefine((data, context) => {
    if (data.hasExistingSystems && data.existingSystemDetails.trim().length < 10) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["existingSystemDetails"],
        message: "Add details about existing systems",
      });
    }

    if (data.complianceLevel !== "Standard" && data.certifications.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["certifications"],
        message: "Select at least one certification for elevated compliance",
      });
    }

    if (data.budgetMin > data.budgetMax) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["budgetMax"],
        message: "Maximum budget must be higher than minimum budget",
      });
    }

    if (data.startDate < today) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start date cannot be in the past",
      });
    }

    if (data.duration === "Custom" && data.customDuration.trim().length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customDuration"],
        message: "Add custom duration",
      });
    }
  });

const stepFields: Record<StepId, Array<keyof FormData>> = {
  0: ["title", "category", "urgency", "description"],
  1: ["city", "area", "siteType", "floors", "squareFootage", "hasExistingSystems", "existingSystemDetails"],
  2: ["complianceLevel", "certifications", "materialsProvided", "specialRequirements", "files"],
  3: ["budgetMin", "budgetMax", "startDate", "duration", "customDuration", "paymentPreference"],
  4: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function collectErrors(error: z.ZodError, fields?: Array<keyof FormData>) {
  const allowed = fields ? new Set<string>(fields) : null;
  const nextErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0] as keyof FormData | undefined;
    if (!key || (allowed && !allowed.has(key))) continue;
    nextErrors[key] = issue.message;
  }

  return nextErrors;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-black text-danger">
      <AlertCircle className="h-3.5 w-3.5" />
      {error}
    </p>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return <FileUp className={className} />;
}

function CityCombobox({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredCities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return indianCities.slice(0, 8);
    return indianCities.filter((city) => city.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query]);

  const selectCity = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative">
      <label className="block">
        <span className="mb-2 block text-sm font-black text-foreground">City</span>
        <span className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            role="combobox"
            aria-expanded={open}
            aria-controls="city-options"
            aria-autocomplete="list"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              onChange("");
              setOpen(true);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) => Math.min(index + 1, filteredCities.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
              }
              if (event.key === "Enter" && filteredCities[activeIndex]) {
                event.preventDefault();
                selectCity(filteredCities[activeIndex]);
              }
              if (event.key === "Escape") setOpen(false);
            }}
            className={cn(
              "min-h-11 w-full rounded-md border bg-surface py-2.5 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-primary focus:shadow-focus",
              error ? "border-danger" : "border-border-subtle",
            )}
            placeholder="Search city"
          />
        </span>
      </label>
      {open ? (
        <div id="city-options" role="listbox" className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-md border border-border-subtle bg-surface p-1 shadow-lg">
          {filteredCities.map((city, index) => (
            <button
              key={city}
              type="button"
              role="option"
              aria-selected={value === city}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectCity(city)}
              className={cn(
                "w-full rounded px-3 py-2 text-left text-sm font-bold transition",
                activeIndex === index ? "bg-primary-subtle text-primary" : "text-foreground hover:bg-surface-muted",
              )}
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}
      <FieldError error={error} />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-md border border-border-subtle bg-surface px-4 py-3 text-left transition hover:border-primary/30"
    >
      <span className="text-sm font-black text-foreground">{label}</span>
      <span className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-primary" : "bg-surface-muted")}>
        <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow transition", checked ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}

function WizardPage() {
  const [step, setStep] = useState<StepId>(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const validateFields = (fields?: Array<keyof FormData>) => {
    const parsed = fullSchema.safeParse(formData);
    if (parsed.success) {
      setErrors({});
      return true;
    }

    const nextErrors = collectErrors(parsed.error, fields);
    setErrors((previous) => ({ ...previous, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const goToStep = (target: StepId) => {
    if (target > step && !validateFields(stepFields[step])) return;
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const nextStep = () => {
    if (!validateFields(stepFields[step])) return;
    setDirection(1);
    setStep((current) => Math.min(current + 1, 4) as StepId);
  };

  const previousStep = () => {
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 0) as StepId);
  };

  const submitJob = () => {
    if (!validateFields()) return;
    setSubmitted(true);
    toast.success("Job submitted for engineer matching");
  };

  const selectedCategory = categories.find((item) => item.value === formData.category);
  const SummaryIcon = selectedCategory?.icon ?? BriefcaseIcon;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1520px]">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Client workflow</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Post a new ELV job</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Capture scope, compliance needs, budget, and site context so verified engineers can respond with accurate proposals.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Post job progress">
            <Card variant="default" className="p-4">
              <ol className="space-y-2">
                {steps.map((label, index) => {
                  const active = index === step;
                  const completed = index < step;

                  return (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => goToStep(index as StepId)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                          active
                            ? "border-primary bg-primary-subtle text-primary"
                            : "border-transparent text-muted-foreground hover:border-border-subtle hover:bg-surface-muted hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-black",
                            completed
                              ? "border-success bg-success text-success-foreground"
                              : active
                                ? "border-primary bg-primary text-on-primary"
                                : "border-border-strong bg-surface",
                          )}
                        >
                          {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                        </span>
                        <span>
                          <span className="block text-[11px] font-black uppercase">Step {index + 1}</span>
                          <span className="block text-sm font-black">{label}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </aside>

          <section className="min-w-0">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitJob();
              }}
            >
              <Card variant="default" className="min-h-[640px] overflow-hidden p-0">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="p-5 sm:p-6"
                  >
                    {step === 0 ? <ProjectBasics data={formData} errors={errors} updateField={updateField} /> : null}
                    {step === 1 ? <SiteDetails data={formData} errors={errors} updateField={updateField} /> : null}
                    {step === 2 ? <Requirements data={formData} errors={errors} updateField={updateField} /> : null}
                    {step === 3 ? <BudgetTimeline data={formData} errors={errors} updateField={updateField} /> : null}
                    {step === 4 ? <ReviewSubmit data={formData} submitted={submitted} /> : null}
                  </motion.div>
                </AnimatePresence>

                <div className="flex flex-col gap-3 border-t border-border-subtle bg-surface-muted p-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="secondary" onClick={previousStep} disabled={step === 0} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {step === 4 ? (
                      <>
                        <Button type="button" variant="ghost" onClick={() => toast.info("Draft saved locally")}>
                          Save Draft
                        </Button>
                        <Button type="submit" rightIcon={<ArrowRight className="h-4 w-4" />}>
                          Submit Job
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={nextStep} rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </form>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Live job summary">
            <Card variant="default" className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-primary-subtle text-primary">
                  <SummaryIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-muted-foreground">Live summary</p>
                  <h2 className="truncate text-lg font-black text-foreground">{formData.title || "Untitled job"}</h2>
                </div>
              </div>
              <dl className="mt-5 grid gap-3">
                <SummaryRow label="Category" value={formData.category || "Not selected"} />
                <SummaryRow label="City" value={formData.city || "Not selected"} />
                <SummaryRow label="Budget" value={`${formatCurrency(formData.budgetMin)} - ${formatCurrency(formData.budgetMax)}`} />
                <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-muted px-3 py-2">
                  <dt className="text-xs font-black uppercase text-muted-foreground">Urgency</dt>
                  <dd className={cn("rounded-full border px-2 py-0.5 text-[11px] font-black", urgencyBadgeClass(formData.urgency))}>
                    {formData.urgency}
                  </dd>
                </div>
              </dl>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-muted px-3 py-2">
      <dt className="text-xs font-black uppercase text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-black text-foreground">{value}</dd>
    </div>
  );
}

function urgencyBadgeClass(urgency: Urgency) {
  if (urgency === "Emergency") return "border-rose-200 bg-rose-50 text-rose-700";
  if (urgency === "Urgent") return "border-orange-200 bg-orange-50 text-orange-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function ProjectBasics({
  data,
  errors,
  updateField,
}: {
  data: FormData;
  errors: FieldErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <SectionHeader title="Project Basics" description="Define the core scope so engineers can quickly understand the job." />
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-foreground">
            Job Title
            <span className="text-xs text-muted-foreground">{data.title.length}/60</span>
          </span>
          <input
            value={data.title}
            onChange={(event) => updateField("title", event.target.value.slice(0, 60))}
            className={cn("min-h-11 w-full rounded-md border bg-surface px-3 text-sm font-semibold outline-none focus:border-primary focus:shadow-focus", errors.title ? "border-danger" : "border-border-subtle")}
            placeholder="Factory CCTV installation and NVR handover"
          />
          <FieldError error={errors.title} />
        </label>

        <div>
          <p className="mb-3 text-sm font-black text-foreground">Service Category</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((item) => {
              const Icon = item.icon;
              const selected = data.category === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => updateField("category", item.value)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                    selected ? "border-primary bg-primary-subtle text-primary shadow-sm" : "border-border-subtle bg-surface hover:border-primary/30 hover:bg-surface-muted",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="mt-3 block text-sm font-black">{item.value}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
                </button>
              );
            })}
          </div>
          <FieldError error={errors.category} />
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-foreground">Urgency</p>
          <div className="grid gap-3 md:grid-cols-3">
            {urgencyOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => updateField("urgency", item.value)}
                className={cn(
                  "rounded-lg border p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                  data.urgency === item.value ? "border-primary bg-primary-subtle text-primary" : "border-border-subtle bg-surface hover:border-primary/30",
                )}
              >
                <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black", urgencyBadgeClass(item.value))}>{item.value}</span>
                <span className="mt-3 block text-sm leading-5 text-muted-foreground">{item.detail}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-foreground">
            Brief description
            <span className="text-xs text-muted-foreground">{data.description.length}/500</span>
          </span>
          <textarea
            value={data.description}
            onChange={(event) => updateField("description", event.target.value.slice(0, 500))}
            rows={6}
            className={cn("w-full rounded-md border bg-surface px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:shadow-focus", errors.description ? "border-danger" : "border-border-subtle")}
            placeholder="Describe system count, expected work, handover needs, and site constraints."
          />
          <FieldError error={errors.description} />
        </label>
      </div>
    </div>
  );
}

function SiteDetails({
  data,
  errors,
  updateField,
}: {
  data: FormData;
  errors: FieldErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <SectionHeader title="Site Details" description="Give engineers enough site context to estimate visits, manpower, and material movement." />
      <div className="grid gap-5">
        <CityCombobox value={data.city} error={errors.city} onChange={(value) => updateField("city", value)} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Area/Locality" value={data.area} error={errors.area} onChange={(value) => updateField("area", value)} />
          <div>
            <p className="mb-2 text-sm font-black text-foreground">Site type</p>
            <div className="flex flex-wrap gap-2">
              {siteTypes.map((item) => (
                <ChipButton key={item} selected={data.siteType === item} onClick={() => updateField("siteType", item)}>
                  {item}
                </ChipButton>
              ))}
            </div>
            <FieldError error={errors.siteType} />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Building floors" type="number" value={data.floors} error={errors.floors} onChange={(value) => updateField("floors", value)} />
          <TextField label="Square footage" type="number" value={data.squareFootage} error={errors.squareFootage} onChange={(value) => updateField("squareFootage", value)} />
        </div>
        <Toggle checked={data.hasExistingSystems} onChange={(checked) => updateField("hasExistingSystems", checked)} label="Existing systems?" />
        {data.hasExistingSystems ? (
          <label className="block">
            <span className="mb-2 block text-sm font-black text-foreground">Existing system details</span>
            <textarea
              value={data.existingSystemDetails}
              onChange={(event) => updateField("existingSystemDetails", event.target.value)}
              rows={4}
              className={cn("w-full rounded-md border bg-surface px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:shadow-focus", errors.existingSystemDetails ? "border-danger" : "border-border-subtle")}
              placeholder="Mention current brand, working condition, panel/NVR location, and known issues."
            />
            <FieldError error={errors.existingSystemDetails} />
          </label>
        ) : null}
      </div>
    </div>
  );
}

function Requirements({
  data,
  errors,
  updateField,
}: {
  data: FormData;
  errors: FieldErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  const toggleCertification = (certification: string) => {
    updateField(
      "certifications",
      data.certifications.includes(certification)
        ? data.certifications.filter((item) => item !== certification)
        : [...data.certifications, certification],
    );
  };

  return (
    <div>
      <SectionHeader title="Requirements" description="Set quality, compliance, material, and document requirements before engineers quote." />
      <div className="grid gap-5">
        <div>
          <p className="mb-2 text-sm font-black text-foreground">Compliance level required</p>
          <div className="grid gap-3 md:grid-cols-3">
            {(["Standard", "High", "Critical"] as ComplianceLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateField("complianceLevel", level)}
                className={cn("rounded-lg border p-4 text-left transition", data.complianceLevel === level ? "border-primary bg-primary-subtle text-primary" : "border-border-subtle bg-surface hover:border-primary/30")}
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="mt-3 block text-sm font-black">{level}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-black text-foreground">Certifications required</p>
          <div className="flex flex-wrap gap-2">
            {certifications.map((certification) => (
              <ChipButton key={certification} selected={data.certifications.includes(certification)} onClick={() => toggleCertification(certification)}>
                {certification}
              </ChipButton>
            ))}
          </div>
          <FieldError error={errors.certifications} />
        </div>
        <Toggle checked={data.materialsProvided} onChange={(checked) => updateField("materialsProvided", checked)} label="Materials provided by client?" />
        <label className="block">
          <span className="mb-2 block text-sm font-black text-foreground">Special requirements</span>
          <textarea
            value={data.specialRequirements}
            onChange={(event) => updateField("specialRequirements", event.target.value.slice(0, 500))}
            rows={5}
            className={cn("w-full rounded-md border bg-surface px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:shadow-focus", errors.specialRequirements ? "border-danger" : "border-border-subtle")}
            placeholder="Mention night work, height access, shutdown window, safety induction, or permit requirements."
          />
          <FieldError error={errors.specialRequirements} />
        </label>
        <FileUpload
          label="Upload drawings/plans"
          description="Accepts PDF, DWG, PNG, JPG, and WEBP files"
          files={data.files}
          accept=".pdf,.dwg,image/png,image/jpeg,image/webp"
          multiple
          onFilesChange={(files) => updateField("files", files)}
          error={errors.files}
        />
      </div>
    </div>
  );
}

function BudgetTimeline({
  data,
  errors,
  updateField,
}: {
  data: FormData;
  errors: FieldErrors;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  const setBudgetMin = (value: number) => updateField("budgetMin", Math.min(value, data.budgetMax - 10000));
  const setBudgetMax = (value: number) => updateField("budgetMax", Math.max(value, data.budgetMin + 10000));

  return (
    <div>
      <SectionHeader title="Budget & Timeline" description="Set budget expectations and delivery schedule before review." />
      <div className="grid gap-6">
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-foreground">Budget range</p>
            <p className="font-mono text-sm font-black text-primary">
              {formatCurrency(data.budgetMin)} - {formatCurrency(data.budgetMax)}
            </p>
          </div>
          <div className="mt-5 grid gap-4">
            <label>
              <span className="mb-2 block text-xs font-black uppercase text-muted-foreground">Minimum</span>
              <input type="range" min={10000} max={1000000} step={10000} value={data.budgetMin} onChange={(event) => setBudgetMin(Number(event.target.value))} className="w-full accent-primary" />
            </label>
            <label>
              <span className="mb-2 block text-xs font-black uppercase text-muted-foreground">Maximum</span>
              <input type="range" min={20000} max={1000000} step={10000} value={data.budgetMax} onChange={(event) => setBudgetMax(Number(event.target.value))} className="w-full accent-primary" />
            </label>
          </div>
          <FieldError error={errors.budgetMax || errors.budgetMin} />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-foreground">Start date</span>
            <input
              type="date"
              min={today}
              value={data.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className={cn("min-h-11 w-full rounded-md border bg-surface px-3 text-sm font-semibold outline-none focus:border-primary focus:shadow-focus", errors.startDate ? "border-danger" : "border-border-subtle")}
            />
            <FieldError error={errors.startDate} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-foreground">Expected duration</span>
            <select
              value={data.duration}
              onChange={(event) => updateField("duration", event.target.value as Duration)}
              className="min-h-11 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm font-semibold outline-none focus:border-primary focus:shadow-focus"
            >
              {durations.map((duration) => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </label>
        </div>
        {data.duration === "Custom" ? (
          <TextField label="Custom duration" value={data.customDuration} error={errors.customDuration} onChange={(value) => updateField("customDuration", value)} />
        ) : null}
        <div>
          <p className="mb-2 text-sm font-black text-foreground">Payment preference</p>
          <div className="grid gap-3 md:grid-cols-3">
            {paymentPreferences.map((preference) => (
              <button
                key={preference}
                type="button"
                onClick={() => updateField("paymentPreference", preference)}
                className={cn("rounded-lg border p-4 text-left text-sm font-black transition", data.paymentPreference === preference ? "border-primary bg-primary-subtle text-primary" : "border-border-subtle bg-surface hover:border-primary/30")}
              >
                <IndianRupee className="mb-3 h-5 w-5" />
                {preference}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSubmit({ data, submitted }: { data: FormData; submitted: boolean }) {
  const complianceNote =
    data.category === "Fire"
      ? "Fire safety work may require NOC-aligned documentation, test reports, and certified technician review."
      : data.category === "Network"
        ? "Networking work should include labeling, test reports, rack evidence, and handover documentation."
        : "Compliance quality improves when scope, site access, and evidence requirements are clear before dispatch.";

  const rows: Array<[string, string]> = [
    ["Title", data.title || "Not added"],
    ["Category", data.category || "Not selected"],
    ["Location", `${data.area || "Area not added"}, ${data.city || "City not selected"}`],
    ["Site type", data.siteType || "Not selected"],
    ["Compliance", data.complianceLevel],
    ["Certifications", data.certifications.length ? data.certifications.join(", ") : "None selected"],
    ["Budget", `${formatCurrency(data.budgetMin)} - ${formatCurrency(data.budgetMax)}`],
    ["Timeline", `${data.startDate} · ${data.duration === "Custom" ? data.customDuration || "Custom" : data.duration}`],
    ["Payment", data.paymentPreference],
  ];

  return (
    <div>
      <SectionHeader title="Review & Submit" description="Confirm the job details before publishing to verified engineers." />
      <div className="grid gap-4">
        <div className="rounded-lg border border-primary/20 bg-primary-subtle p-4">
          <p className="text-sm font-black text-primary">We found 14 engineers in your area</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Matching uses city, category, compliance level, and recent engineer availability.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-md border border-border-subtle bg-surface-muted p-3">
              <p className="text-[11px] font-black uppercase text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-black text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm font-black">Compliance note</p>
          <p className="mt-1 text-sm leading-6">{complianceNote}</p>
        </div>
        {submitted ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
            Job submitted for engineer matching.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  error,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  type?: "text" | "number";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("min-h-11 w-full rounded-md border bg-surface px-3 text-sm font-semibold outline-none focus:border-primary focus:shadow-focus", error ? "border-danger" : "border-border-subtle")}
      />
      <FieldError error={error} />
    </label>
  );
}

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
        selected ? "border-primary bg-primary text-on-primary" : "border-border-subtle bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export default function ClientPostJobPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <WizardPage />
    </ProtectedRoute>
  );
}
