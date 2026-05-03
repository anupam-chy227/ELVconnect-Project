"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z, ZodError } from "zod";
import { AlertCircle, ArrowRight, BriefcaseBusiness, CheckCircle2, MapPin, UserRound } from "lucide-react";
import { ApiClientError, authAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Badge, Button, Card, Input, Select, VerificationBadge } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import type { JobCategory, ServiceRadiusOption } from "@/types/api";

type RegisterRole = "customer" | "service_provider";

type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  businessName: string;
  gstNumber: string;
  yearsOfExperience: string;
  categories: JobCategory[];
  serviceRadius: ServiceRadiusOption;
};

type RegisterField = keyof RegisterFormState | "form";

const categories: Array<{ label: string; value: JobCategory }> = [
  { label: "CCTV", value: "cctv" },
  { label: "Fire Safety", value: "fire_safety" },
  { label: "Access Control", value: "access_control" },
  { label: "Data Networking", value: "data_networking" },
];

const serviceRadiusOptions = [
  { label: "10 km", value: "10" },
  { label: "25 km", value: "25" },
  { label: "50 km", value: "50" },
  { label: "Pan-city", value: "100" },
];

const initialForm: RegisterFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  businessName: "",
  gstNumber: "",
  yearsOfExperience: "",
  categories: [],
  serviceRadius: 25,
};

const baseObjectSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm your password"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  city: z.string().min(2, "City is required"),
});

const customerSchema = baseObjectSchema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const providerSchema = baseObjectSchema
  .extend({
    businessName: z.string().min(2, "Business name is required"),
    gstNumber: z.string().optional(),
    yearsOfExperience: z.coerce.number().min(0, "Years of experience cannot be negative"),
    categories: z.array(z.enum(["cctv", "fire_safety", "access_control", "data_networking"])).min(1, "Select at least one category"),
    serviceRadius: z.coerce.number().refine((value) => [10, 25, 50, 100].includes(value), "Select a service radius"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="flex items-center gap-2 rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-sm font-bold text-danger">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      {message}
    </p>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-danger">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RegisterRole>("customer");
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof RegisterFormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((current) => ({
        ...current,
        [field]: field === "serviceRadius" ? (Number(value) as ServiceRadiusOption) : value,
      }));
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    };
  }

  function toggleCategory(category: JobCategory) {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
    setErrors((current) => ({ ...current, categories: undefined, form: undefined }));
  }

  function setRoleAndReset(nextRole: RegisterRole) {
    setRole(nextRole);
    setErrors({});
  }

  function applyZodErrors(error: ZodError) {
    const nextErrors: Partial<Record<RegisterField, string>> = {};
    error.errors.forEach((item) => {
      const field = item.path[0] as RegisterField | undefined;
      if (field) {
        nextErrors[field] = item.message;
      }
    });
    setErrors(nextErrors);
  }

  function applyApiErrors(error: ApiClientError) {
    if (error.validationErrors) {
      setErrors((current) => ({
        ...current,
        ...error.validationErrors,
        form: error.message,
      }));
      return;
    }

    setErrors((current) => ({ ...current, form: error.message }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (role === "customer") {
        const data = customerSchema.parse(form);
        await authAPI.registerCustomer({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          city: data.city,
        });
      } else {
        const data = providerSchema.parse(form);
        await authAPI.registerServiceProvider({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          city: data.city,
          businessName: data.businessName,
          gstNumber: data.gstNumber || undefined,
          yearsOfExperience: data.yearsOfExperience,
          categories: data.categories,
          serviceRadius: data.serviceRadius as ServiceRadiusOption,
        });
      }

      toast.success("Account created! Please log in.");
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof ZodError) {
        applyZodErrors(error);
      } else if (error instanceof ApiClientError) {
        applyApiErrors(error);
        toast.error(error.message);
      } else {
        setErrors({ form: "Cannot connect. Please try again." });
        toast.error("Cannot connect. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(109,40,217,0.16),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f7f5ff_48%,#eef2ff_100%)] px-4 py-8 text-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <section className="hidden rounded-lg border border-white/50 bg-gradient-to-br from-elv-iris to-elv-purple p-8 text-white shadow-glow lg:grid">
          <div>
            <Badge className="border-white/20 bg-white/12 text-white">Verified marketplace onboarding</Badge>
            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight">
              Join India&apos;s managed ELV execution network.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/78">
              Create a secure account for compliant CCTV, fire safety, access control, and data networking work.
            </p>
          </div>
          <div className="mt-auto grid gap-3">
            {["Role-based dashboards", "Verified engineers", "Milestone payment controls"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-white/12 bg-white/10 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-200" aria-hidden="true" />
                <span className="text-sm font-black">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <Card variant="glass" padding="lg" className="bg-white/86">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <VerificationBadge level="kyc" label="Secure registration" />
                <VerificationBadge level="escrow" label="Trust-first platform" />
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Select your role so ELV Connect can route you to the correct dashboard and workflow.
              </p>
            </div>
            <Link href="/auth/login" className="text-sm font-black text-primary transition hover:text-secondary">
              Sign in
            </Link>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="Choose account role">
            {[
              {
                id: "customer" as const,
                title: "I want to hire engineers",
                detail: "Post jobs, review applications, manage work orders, and release payments.",
                icon: UserRound,
              },
              {
                id: "service_provider" as const,
                title: "I want to find work",
                detail: "Discover jobs, apply with proof, manage milestones, and track payouts.",
                icon: BriefcaseBusiness,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = role === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRoleAndReset(item.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-ring",
                    active ? "border-primary bg-primary-subtle text-primary" : "border-border-subtle bg-surface hover:border-primary/35",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <p className="mt-3 text-sm font-black">{item.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">{item.detail}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <Input id="firstName" label="First name" value={form.firstName} onChange={updateField("firstName")} error={errors.firstName} />
              <Input id="lastName" label="Last name" value={form.lastName} onChange={updateField("lastName")} error={errors.lastName} />
              <Input id="email" label="Email" type="email" value={form.email} onChange={updateField("email")} error={errors.email} />
              <Input id="phone" label="Phone" type="tel" inputMode="numeric" value={form.phone} onChange={updateField("phone")} error={errors.phone} />
              <Input id="city" label="City" value={form.city} onChange={updateField("city")} error={errors.city} leftIcon={<MapPin className="h-4 w-4" aria-hidden="true" />} />
              <Input id="password" label="Password" type="password" value={form.password} onChange={updateField("password")} error={errors.password} />
              <Input id="confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={updateField("confirmPassword")} error={errors.confirmPassword} />
            </div>

            {role === "service_provider" ? (
              <section className="grid gap-4 rounded-lg border border-border-subtle bg-surface/70 p-4" aria-label="Service provider business details">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input id="businessName" label="Business name" value={form.businessName} onChange={updateField("businessName")} error={errors.businessName} />
                  <Input id="gstNumber" label="GST number" value={form.gstNumber} onChange={updateField("gstNumber")} error={errors.gstNumber} />
                  <Input
                    id="yearsOfExperience"
                    label="Years of experience"
                    type="number"
                    min={0}
                    value={form.yearsOfExperience}
                    onChange={updateField("yearsOfExperience")}
                    error={errors.yearsOfExperience}
                  />
                  <Select
                    id="serviceRadius"
                    label="Service radius"
                    value={String(form.serviceRadius)}
                    onChange={updateField("serviceRadius")}
                    options={serviceRadiusOptions}
                    error={errors.serviceRadius}
                  />
                </div>

                <fieldset>
                  <legend className="text-xs font-black text-foreground">Categories handled</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {categories.map((category) => {
                      const checked = form.categories.includes(category.value);

                      return (
                        <label
                          key={category.value}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-bold transition",
                            checked ? "border-primary bg-primary-subtle text-primary" : "border-border-subtle bg-surface text-foreground hover:border-primary/30",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategory(category.value)}
                            className="h-4 w-4 rounded border-border-subtle text-primary focus:ring-primary"
                          />
                          {category.label}
                        </label>
                      );
                    })}
                  </div>
                  <FieldError message={errors.categories} />
                </fieldset>
              </section>
            ) : null}

            <FormError message={errors.form} />

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
            >
              Create account
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
