"use client";

import { useEffect, useReducer, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, IndianRupee, LocateFixed, MapPin, Send, ShieldCheck } from "lucide-react";
import { jobsAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button, Card, ErrorCard, Input, Select, SkeletonCard, Stepper, Textarea, VerificationBadge } from "@/components/ui";
import { useMyProfile } from "@/hooks/useSWRData";
import type { ComplianceLevel, CreateJobPayload, JobCategory, JobUrgency } from "@/types/api";

type FormState = {
  title: string;
  description: string;
  category: JobCategory | "";
  urgency: JobUrgency | "";
  complianceLevel: ComplianceLevel | "";
  budgetMin: string;
  budgetMax: string;
  city: string;
  area: string;
  siteType: string;
  floors: string;
  startDate: string;
  expectedDuration: string;
  paymentPreference: string;
  lat: number | null;
  lng: number | null;
};

type FormAction =
  | { type: "field"; field: keyof FormState; value: string | number | null }
  | { type: "location"; lat: number; lng: number }
  | { type: "city"; city: string };

const initialState: FormState = {
  title: "",
  description: "",
  category: "",
  urgency: "normal",
  complianceLevel: "standard",
  budgetMin: "",
  budgetMax: "",
  city: "",
  area: "",
  siteType: "",
  floors: "",
  startDate: "",
  expectedDuration: "",
  paymentPreference: "upi_milestone",
  lat: null,
  lng: null,
};

const categoryOptions = [
  { label: "CCTV", value: "cctv" },
  { label: "Fire Safety", value: "fire_safety" },
  { label: "Access Control", value: "access_control" },
  { label: "Data Networking", value: "data_networking" },
];

const urgencyOptions = [
  { label: "Normal", value: "normal" },
  { label: "Urgent", value: "urgent" },
  { label: "Emergency", value: "emergency" },
];

const complianceOptions = [
  { label: "Standard", value: "standard" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const paymentOptions = [
  { label: "UPI milestone escrow", value: "upi_milestone" },
  { label: "Advance plus milestone", value: "advance_milestone" },
  { label: "Invoice after completion", value: "invoice_completion" },
];

const steps = [
  { label: "Scope", description: "Job title and category" },
  { label: "Site", description: "Location and context" },
  { label: "Budget", description: "Urgency and payment" },
  { label: "Timeline", description: "Dates and duration" },
  { label: "Review", description: "Submit to engineers" },
];

function reducer(state: FormState, action: FormAction): FormState {
  if (action.type === "field") {
    return { ...state, [action.field]: action.value };
  }

  if (action.type === "location") {
    return { ...state, lat: action.lat, lng: action.lng };
  }

  return { ...state, city: action.city };
}

function formatCurrency(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

function buildPayload(state: FormState): CreateJobPayload {
  if (!state.category || !state.urgency || !state.complianceLevel) {
    throw new Error("Select category, urgency, and compliance level.");
  }

  const budgetMin = Number(state.budgetMin);
  const budgetMax = Number(state.budgetMax);

  if (!Number.isFinite(budgetMin) || !Number.isFinite(budgetMax) || budgetMin <= 0 || budgetMax < budgetMin) {
    throw new Error("Enter a valid budget range.");
  }

  return {
    title: state.title,
    description: state.description,
    category: state.category,
    urgency: state.urgency,
    complianceLevel: state.complianceLevel,
    budgetMin,
    budgetMax,
    city: state.city,
    area: state.area,
    siteType: state.siteType,
    floors: state.floors,
    startDate: state.startDate,
    expectedDuration: state.expectedDuration,
    paymentPreference: state.paymentPreference,
    location:
      state.lng !== null && state.lat !== null
        ? {
            type: "Point",
            coordinates: [state.lng, state.lat],
          }
        : undefined,
  };
}

function validateStep(step: number, state: FormState) {
  if (step === 0 && (!state.title.trim() || !state.description.trim() || !state.category)) {
    return "Add title, description, and category.";
  }
  if (step === 1 && (!state.city.trim() || !state.area.trim() || !state.siteType.trim())) {
    return "Add city, area, and site type.";
  }
  if (step === 2 && (!state.budgetMin || !state.budgetMax || !state.urgency || !state.complianceLevel)) {
    return "Add budget, urgency, and compliance level.";
  }
  if (step === 3 && (!state.startDate.trim() || !state.expectedDuration.trim())) {
    return "Add start date and expected duration.";
  }
  return undefined;
}

export default function CustomerPostJobPage() {
  const router = useRouter();
  const { data: profile, isLoading, error, mutate } = useMyProfile();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeStep, setActiveStep] = useState(0);
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.profile.city && !state.city) {
      dispatch({ type: "city", city: profile.profile.city });
    }
  }, [profile?.profile.city, state.city]);

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category");
    const validCategory = categoryOptions.some((option) => option.value === category);

    if (category && validCategory && !state.category) {
      dispatch({ type: "field", field: "category", value: category });
    }
  }, [state.category]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch({ type: "location", lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  function updateField(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      dispatch({ type: "field", field, value: event.target.value });
      setFormError(undefined);
    };
  }

  function goNext() {
    const errorMessage = validateStep(activeStep, state);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    setFormError(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(undefined);

    try {
      const payload = buildPayload(state);
      const job = await jobsAPI.postJob(payload);
      toast.success("Job posted successfully! Engineers will apply shortly.");
      router.push(`/dashboard/customer/jobs/${job._id}`);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to post job. Please try again.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="premium-shell min-h-screen px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <SkeletonCard lines={6} />
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
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-6">
        <Card variant="glass" padding="lg">
          <button
            type="button"
            onClick={() => router.push("/dashboard/customer")}
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Customer dashboard
          </button>
          <div className="mt-5 flex flex-wrap gap-2">
            <VerificationBadge level="verified" label="Structured job post" />
            <VerificationBadge level="escrow" label="UPI-first payments" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Post a new ELV job</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create a verified work request with location, scope, compliance level, budget, and timeline.
          </p>
        </Card>

        <Stepper
          steps={steps.map((step, index) => ({
            ...step,
            status: index < activeStep ? "complete" : index === activeStep ? "current" : "upcoming",
          }))}
          progress={Math.round(((activeStep + 1) / steps.length) * 100)}
        />

        <Card variant="glass" padding="lg">
          {activeStep === 0 ? (
            <section className="grid gap-4" aria-label="Scope details">
              <Input id="title" label="Job title" value={state.title} onChange={updateField("title")} />
              <Textarea id="description" label="Description" value={state.description} onChange={updateField("description")} />
              <Select id="category" label="Category" value={state.category} onChange={updateField("category")} options={categoryOptions} placeholder="Select category" />
            </section>
          ) : null}

          {activeStep === 1 ? (
            <section className="grid gap-4 md:grid-cols-2" aria-label="Site location">
              <Input id="city" label="City" value={state.city} onChange={updateField("city")} leftIcon={<MapPin className="h-4 w-4" aria-hidden="true" />} />
              <Input id="area" label="Area" value={state.area} onChange={updateField("area")} />
              <Input id="siteType" label="Site type" value={state.siteType} onChange={updateField("siteType")} />
              <Input id="floors" label="Floors / zones" value={state.floors} onChange={updateField("floors")} />
              <div className="rounded-md border border-border-subtle bg-primary-subtle p-4 md:col-span-2">
                <p className="flex items-center gap-2 text-sm font-black text-foreground">
                  <LocateFixed className="h-4 w-4 text-primary" aria-hidden="true" />
                  {state.lat !== null && state.lng !== null ? "Browser location captured" : "Browser location unavailable - city fallback will be used"}
                </p>
              </div>
            </section>
          ) : null}

          {activeStep === 2 ? (
            <section className="grid gap-4 md:grid-cols-2" aria-label="Budget and compliance">
              <Input id="budgetMin" label="Budget min" inputMode="numeric" value={state.budgetMin} onChange={updateField("budgetMin")} leftIcon={<IndianRupee className="h-4 w-4" aria-hidden="true" />} />
              <Input id="budgetMax" label="Budget max" inputMode="numeric" value={state.budgetMax} onChange={updateField("budgetMax")} leftIcon={<IndianRupee className="h-4 w-4" aria-hidden="true" />} />
              <Select id="urgency" label="Urgency" value={state.urgency} onChange={updateField("urgency")} options={urgencyOptions} />
              <Select id="complianceLevel" label="Compliance level" value={state.complianceLevel} onChange={updateField("complianceLevel")} options={complianceOptions} />
              <Select id="paymentPreference" label="Payment preference" value={state.paymentPreference} onChange={updateField("paymentPreference")} options={paymentOptions} />
            </section>
          ) : null}

          {activeStep === 3 ? (
            <section className="grid gap-4 md:grid-cols-2" aria-label="Timeline">
              <Input id="startDate" label="Start date" type="date" value={state.startDate} onChange={updateField("startDate")} />
              <Input id="expectedDuration" label="Expected duration" value={state.expectedDuration} onChange={updateField("expectedDuration")} />
            </section>
          ) : null}

          {activeStep === 4 ? (
            <section className="grid gap-4" aria-label="Review job">
              <div className="rounded-lg border border-border-subtle bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="text-lg font-black">{state.title || "Untitled job"}</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{state.description || "No description added."}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-md bg-primary-subtle p-3">
                    <p className="text-[11px] font-black uppercase text-primary">Category</p>
                    <p className="mt-1 text-sm font-black">{state.category || "Not selected"}</p>
                  </div>
                  <div className="rounded-md bg-surface-muted p-3">
                    <p className="text-[11px] font-black uppercase text-muted-foreground">Budget</p>
                    <p className="mt-1 text-sm font-black">{formatCurrency(state.budgetMin)} - {formatCurrency(state.budgetMax)}</p>
                  </div>
                  <div className="rounded-md bg-surface-muted p-3">
                    <p className="text-[11px] font-black uppercase text-muted-foreground">Location</p>
                    <p className="mt-1 text-sm font-black">{state.city}, {state.area}</p>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {formError ? <p className="mt-5 rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-sm font-bold text-danger">{formError}</p> : null}

          <div className="mt-6 flex flex-col gap-2 border-t border-border-subtle pt-5 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" disabled={activeStep === 0 || isSubmitting} onClick={() => setActiveStep((current) => Math.max(0, current - 1))}>
              Previous
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button type="button" onClick={goNext} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
                Continue
              </Button>
            ) : (
              <Button type="submit" loading={isSubmitting} leftIcon={!isSubmitting ? <Send className="h-4 w-4" aria-hidden="true" /> : null}>
                {isSubmitting ? "Posting your job..." : "Post job"}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </main>
  );
}
