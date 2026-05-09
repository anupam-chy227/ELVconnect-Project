"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z, ZodError } from "zod";
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { GoogleAuthButton } from "@/components/Auth/GoogleAuthButton";
import { ApiClientError, authAPI } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import type { JobCategory, ServiceRadiusOption } from "@/types/api";

export type RegisterRole = "customer" | "service_provider";

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

const roleConfig = {
  customer: {
    label: "Client",
    eyebrow: "Client account setup",
    title: "Create your client workspace.",
    description: "Post ELV projects, search verified vendors, and manage execution from one secure workspace.",
    googleLabel: "Continue with Google as Client",
    icon: UserRound,
  },
  service_provider: {
    label: "Vendor / Engineer",
    eyebrow: "Vendor / engineer setup",
    title: "Create your vendor / engineer workspace.",
    description: "Find verified ELV projects, manage applications, and track payout-ready work.",
    googleLabel: "Continue with Google as Vendor / Engineer",
    icon: BriefcaseBusiness,
  },
};

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

export function RegisterRoleFormPage({ role }: { role: RegisterRole }) {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const config = roleConfig[role];
  const RoleIcon = config.icon;

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
      router.push("/login");
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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(99,91,255,0.34),transparent_28rem),radial-gradient(circle_at_84%_12%,rgba(14,165,233,0.18),transparent_22rem),linear-gradient(135deg,#080b16_0%,#111827_48%,#1e1b4b_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/80 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
        <section className="rounded-md border border-white/70 bg-white/94 p-5 text-foreground shadow-2xl shadow-indigo-950/20 backdrop-blur-2xl sm:p-7 lg:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">{config.label}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Fill account details</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Continue with Google or create an account with email.
              </p>
            </div>
            <Link href="/login" className="text-sm font-black text-primary transition hover:text-secondary">
              Sign in
            </Link>
          </div>

          <GoogleAuthButton
            label={config.googleLabel}
            role={role}
            className="group flex w-full items-center justify-center gap-3 rounded-md border border-border-subtle bg-white px-4 py-3 text-sm font-black text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary-subtle hover:text-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-xs font-semibold text-muted-foreground">or create account with email</span>
            </div>
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
              Create {config.label} account
            </Button>
          </form>
        </section>

        <section className="rounded-md border border-white/12 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-2xl lg:sticky lg:top-8 lg:p-8">
          <Link href="/register" className="inline-flex items-center gap-2 text-sm font-black text-indigo-100 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to account type
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-black uppercase text-indigo-100">
            <Sparkles className="h-4 w-4 text-sky-200" aria-hidden="true" />
            {config.eyebrow}
          </div>

          <div className="mt-8 grid h-16 w-16 place-items-center rounded-md bg-white text-primary shadow-xl">
            <RoleIcon className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1
            className="mt-7 text-4xl font-black leading-tight tracking-tight"
            style={{ color: "#ffffff", textShadow: "0 2px 28px rgba(255,255,255,0.18)" }}
          >
            {config.title}
          </h1>
          <p className="mt-5 text-base font-semibold leading-7 text-indigo-100/88">
            {config.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/35 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-sky-100">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Secure registration
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Trust-first platform
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
