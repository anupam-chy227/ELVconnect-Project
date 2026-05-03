"use client";

import { type ChangeEvent, type FormEvent, type ReactNode, useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  FileUp,
  MapPin,
  Send,
  ShieldCheck,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { WorkspaceShell } from "@/components/ELVConnect/WorkspaceShell";
import { Card, Stepper, type StepperStep } from "@/components/ui";
import { cn, progressWidthClass } from "@/components/ui/utils";

type FormData = {
  customerName: string;
  phone: string;
  email: string;
  projectType: string;
  elvCategory: string;
  siteType: string;
  location: string;
  budgetRange: string;
  urgency: string;
  description: string;
  files: File[];
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type FieldName = keyof FormData;
type TextFieldName = Exclude<FieldName, "files">;
type FieldIds = {
  id: string;
  hintId: string;
  errorId: string;
  describedBy: string | undefined;
};

const initialFormData: FormData = {
  customerName: "",
  phone: "",
  email: "",
  projectType: "",
  elvCategory: "",
  siteType: "",
  location: "",
  budgetRange: "",
  urgency: "",
  description: "",
  files: [],
};

const steps = [
  {
    title: "Customer",
    description: "Contact and company details",
    fields: ["customerName", "phone", "email"] as const,
  },
  {
    title: "Project",
    description: "Scope, category, and site",
    fields: ["projectType", "elvCategory", "siteType", "location"] as const,
  },
  {
    title: "Budget",
    description: "Timeline, notes, and files",
    fields: ["budgetRange", "urgency", "description", "files"] as const,
  },
] as const;

const projectTypes = ["New Installation", "Upgrade", "AMC / Maintenance", "Repair", "Compliance Audit"] as const;
const elvCategories = ["CCTV", "Fire Safety", "Access Control", "Networking", "BMS", "PA System", "Intercom"] as const;
const siteTypes = ["Factory", "Office", "Warehouse", "Residential Tower", "Retail", "School", "Hospital", "Other"] as const;
const budgetRanges = ["Below Rs 50,000", "Rs 50,000 - Rs 1,50,000", "Rs 1,50,000 - Rs 5,00,000", "Above Rs 5,00,000", "Need Quote"] as const;
const urgencyLevels = ["Immediate", "Within 7 days", "Within 30 days", "Planning stage"] as const;

const trustCards: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: "Verified scope intake",
    text: "Structured details reduce follow-up calls before vendor matching.",
    icon: ShieldCheck,
  },
  {
    title: "Engineer-ready context",
    text: "Category, site type, and area help shortlist relevant ELV teams.",
    icon: BadgeCheck,
  },
  {
    title: "Quote signal quality",
    text: "Budget, urgency, and attachments help teams respond with cleaner estimates.",
    icon: Timer,
  },
];

const summaryItems: Array<{ label: string; field: TextFieldName }> = [
  { label: "Customer", field: "customerName" },
  { label: "Category", field: "elvCategory" },
  { label: "Site", field: "siteType" },
  { label: "Location", field: "location" },
  { label: "Budget", field: "budgetRange" },
  { label: "Urgency", field: "urgency" },
];

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value: string) {
  return /^[0-9+\-\s()]{8,16}$/.test(value);
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;

  return (
    <p id={id} role="alert" className="mt-2 flex items-center gap-1 text-xs font-bold text-danger">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {error}
    </p>
  );
}

function FieldShell({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (ids: FieldIds) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : undefined, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-black text-foreground">{label}</span>
        {hint ? (
          <span id={hintId} className="text-[11px] font-semibold text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </label>
      {children({ id, hintId, errorId, describedBy })}
      <FieldError id={errorId} error={error} />
    </div>
  );
}

function fieldClass(error?: string) {
  return cn(
    "min-h-11 w-full rounded-md border bg-surface px-3 py-2.5 text-sm font-semibold text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-60",
    error ? "border-danger focus:border-danger focus:ring-4 focus:ring-rose-500/10" : "border-border-subtle",
  );
}

function TextField({
  label,
  value,
  error,
  hint,
  type = "text",
  inputMode,
  autoComplete,
  supportingText,
  className,
  onValueChange,
}: {
  label: string;
  value: string;
  error?: string;
  hint?: string;
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "email" | "tel";
  autoComplete?: string;
  supportingText?: string;
  className?: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy }) => (
        <>
          <input
            id={id}
            type={type}
            value={value}
            inputMode={inputMode}
            autoComplete={autoComplete}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(event) => onValueChange(event.target.value)}
            className={fieldClass(error)}
          />
          {supportingText ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{supportingText}</p> : null}
        </>
      )}
    </FieldShell>
  );
}

function SelectField({
  label,
  value,
  error,
  options,
  emptyLabel,
  onValueChange,
}: {
  label: string;
  value: string;
  error?: string;
  options: readonly string[];
  emptyLabel: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <FieldShell label={label} error={error}>
      {({ id, describedBy }) => (
        <select
          id={id}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onValueChange(event.target.value)}
          className={fieldClass(error)}
        >
          <option value="">{emptyLabel}</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-muted p-3">
      <p className="text-[10px] font-black uppercase text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-black", value ? "text-foreground" : "text-muted-foreground")}>
        {value || "Pending"}
      </p>
    </div>
  );
}

function FileUploadField({
  files,
  onFilesChange,
}: {
  files: File[];
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block cursor-pointer rounded-md border border-dashed border-primary/30 bg-primary-subtle p-5 text-center transition hover:border-primary/50 hover:bg-white focus-within:outline-none focus-within:ring-4 focus-within:ring-primary-ring dark:hover:bg-slate-900"
      >
        <span className="mb-2 flex items-center justify-between gap-3 text-left">
          <span className="text-sm font-black text-foreground">Photos or drawings</span>
          <span className="text-[11px] font-semibold text-muted-foreground">Optional</span>
        </span>
        <FileUp className="mx-auto h-7 w-7 text-primary" aria-hidden="true" />
        <span className="mt-2 block text-sm font-black text-foreground">Upload supporting files</span>
        <span id={hintId} className="mt-1 block text-xs text-muted-foreground">
          Site photos, PDFs, or drawings help engineers quote with fewer assumptions.
        </span>
        <input
          id={id}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="sr-only"
          aria-describedby={hintId}
          onChange={onFilesChange}
        />
        {files.length > 0 ? (
          <span className="mt-2 block text-xs font-black text-primary">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </span>
        ) : null}
      </label>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="border-b border-border-subtle bg-surface px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase text-primary">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black text-foreground md:text-2xl">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function PostRequirementPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedStep = steps[currentStep];
  const requiredFields = useMemo(() => selectedStep.fields, [selectedStep]);
  const completedFields = Object.entries(formData).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim().length > 0;
  }).length;
  const completionPercent = Math.round((completedFields / Object.keys(initialFormData).length) * 100);
  const workflowPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  const stepperSteps: StepperStep[] = steps.map((step, index) => {
    const hasError = step.fields.some((field) => errors[field]);
    return {
      label: step.title,
      description: step.description,
      status: hasError ? "error" : index < currentStep ? "complete" : index === currentStep ? "current" : "upcoming",
    };
  });

  const updateField = <K extends FieldName>(field: K, value: FormData[K]) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const updateTextField = (field: TextFieldName, value: string) => {
    updateField(field, value);
  };

  const validateStep = () => {
    const nextErrors: FormErrors = {};

    for (const field of requiredFields) {
      const value = formData[field];

      if (field === "files") continue;
      if (typeof value === "string" && !value.trim()) {
        nextErrors[field] = "This field is required";
      }
    }

    if (currentStep === 0) {
      if (formData.email && !validateEmail(formData.email)) nextErrors.email = "Enter a valid email";
      if (formData.phone && !validatePhone(formData.phone)) nextErrors.phone = "Enter a valid phone number";
    }

    if (currentStep === 2 && formData.description.trim().length < 20) {
      nextErrors.description = "Add at least 20 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const previousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep()) return;
    setSubmitted(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitted(false);
    setCurrentStep(0);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateField("files", Array.from(event.target.files ?? []));
  };

  return (
    <WorkspaceShell
      title="Post Requirement"
      subtitle="Capture the project scope, site context, budget, and urgency needed to match the right verified ELV engineering team."
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <Stepper steps={stepperSteps} progress={workflowPercent} />

          <form onSubmit={submitForm} noValidate aria-label="Post ELV requirement">
            <Card variant="glass" padding="none" className="overflow-hidden">
              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-subtle text-success">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-2xl font-black text-foreground">Requirement submitted</h2>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Your project details are ready for category, location, budget, and urgency-based engineer matching.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-5 rounded-md bg-gradient-to-b from-primary to-primary-container px-5 py-3 text-sm font-black text-on-primary shadow-glow transition hover:-translate-y-0.5 hover:shadow-floating focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                  >
                    Post another requirement
                  </button>
                </motion.div>
              ) : (
                <>
                  <SectionHeader
                    eyebrow={`Step ${currentStep + 1} of ${steps.length}`}
                    title={selectedStep.title}
                    description={selectedStep.description}
                    icon={currentStep === 0 ? ClipboardList : currentStep === 1 ? MapPin : FileText}
                  />

                  <div className="p-5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -18 }}
                        transition={{ duration: 0.22 }}
                      >
                        {currentStep === 0 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <TextField
                              label="Customer name"
                              value={formData.customerName}
                              error={errors.customerName}
                              autoComplete="name"
                              supportingText="Use the primary decision maker or site coordinator name."
                              onValueChange={(value) => updateTextField("customerName", value)}
                            />
                            <TextField
                              label="Phone"
                              value={formData.phone}
                              error={errors.phone}
                              hint="WhatsApp preferred"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              supportingText="Include country code when available."
                              onValueChange={(value) => updateTextField("phone", value)}
                            />
                            <TextField
                              label="Email"
                              value={formData.email}
                              error={errors.email}
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              supportingText="Quotes, drawings, and commercial follow-ups can be sent here."
                              className="md:col-span-2"
                              onValueChange={(value) => updateTextField("email", value)}
                            />
                          </div>
                        ) : null}

                        {currentStep === 1 ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <SelectField
                              label="Project type"
                              value={formData.projectType}
                              error={errors.projectType}
                              options={projectTypes}
                              emptyLabel="Choose project type"
                              onValueChange={(value) => updateTextField("projectType", value)}
                            />
                            <SelectField
                              label="ELV category"
                              value={formData.elvCategory}
                              error={errors.elvCategory}
                              options={elvCategories}
                              emptyLabel="Choose category"
                              onValueChange={(value) => updateTextField("elvCategory", value)}
                            />
                            <SelectField
                              label="Site type"
                              value={formData.siteType}
                              error={errors.siteType}
                              options={siteTypes}
                              emptyLabel="Choose site type"
                              onValueChange={(value) => updateTextField("siteType", value)}
                            />
                            <TextField
                              label="Location"
                              value={formData.location}
                              error={errors.location}
                              autoComplete="street-address"
                              supportingText="Add city, area, landmark, or sector for accurate local matching."
                              onValueChange={(value) => updateTextField("location", value)}
                            />
                            <div className="rounded-md border border-dashed border-primary/30 bg-primary-subtle p-4 md:col-span-2">
                              <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                                <div>
                                  <p className="text-sm font-black text-foreground">Location quality improves response speed</p>
                                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    A precise service area helps route the requirement to engineers who can visit, survey, and quote without delay.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {currentStep === 2 ? (
                          <div className="grid gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <SelectField
                                label="Budget range"
                                value={formData.budgetRange}
                                error={errors.budgetRange}
                                options={budgetRanges}
                                emptyLabel="Choose budget range"
                                onValueChange={(value) => updateTextField("budgetRange", value)}
                              />
                              <SelectField
                                label="Urgency"
                                value={formData.urgency}
                                error={errors.urgency}
                                options={urgencyLevels}
                                emptyLabel="Choose urgency"
                                onValueChange={(value) => updateTextField("urgency", value)}
                              />
                            </div>
                            <FieldShell label="Description" error={errors.description} hint={`${formData.description.length}/20 min`}>
                              {({ id, describedBy }) => (
                                <>
                                  <textarea
                                    id={id}
                                    value={formData.description}
                                    aria-invalid={Boolean(errors.description)}
                                    aria-describedby={describedBy}
                                    onChange={(event) => updateTextField("description", event.target.value)}
                                    className={cn(fieldClass(errors.description), "min-h-32 resize-y")}
                                  />
                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    Include device count, floor or area coverage, integration needs, installation timeline, and site access constraints.
                                  </p>
                                </>
                              )}
                            </FieldShell>
                            <FileUploadField files={formData.files} onFilesChange={handleFileChange} />
                          </div>
                        ) : null}
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 flex flex-col gap-2 border-t border-border-subtle pt-5 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onClick={previousStep}
                        disabled={currentStep === 0}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm font-black text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back
                      </button>
                      {currentStep < steps.length - 1 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-5 py-2 text-sm font-black text-on-primary shadow-glow transition hover:-translate-y-0.5 hover:shadow-floating focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-b from-primary to-primary-container px-5 py-2 text-sm font-black text-on-primary shadow-glow transition hover:-translate-y-0.5 hover:shadow-floating focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
                        >
                          <Send className="h-4 w-4" aria-hidden="true" />
                          Submit requirement
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </form>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start" aria-label="Requirement quality and summary">
          <Card variant="glass" title="Requirement summary" description="Live preview of the matching payload.">
            <div className="mb-4 flex items-center gap-3 rounded-md border border-primary/15 bg-primary-subtle p-3">
              <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-foreground">Completion</p>
                  <p className="font-mono text-xs font-black text-primary">{completionPercent}%</p>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70 dark:bg-slate-950/50"
                  role="progressbar"
                  aria-label="Requirement completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completionPercent}
                >
                  <div className={cn("h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all", progressWidthClass(completionPercent))} />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              {summaryItems.map((item) => (
                <SummaryRow key={item.field} label={item.label} value={formData[item.field]} />
              ))}
            </div>
          </Card>

          {trustCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} variant="interactive" padding="sm">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-primary-subtle text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </aside>
      </section>
    </WorkspaceShell>
  );
}
